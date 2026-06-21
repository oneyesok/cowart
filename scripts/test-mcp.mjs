import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const projectDir = await mkdtemp(join(tmpdir(), 'cowart-mcp-'))
const canvasDir = join(projectDir, 'canvas')

const child = spawn('node', ['mcp/server.mjs'], {
  cwd: new URL('..', import.meta.url),
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    COWART_PROJECT_DIR: projectDir,
    COWART_CANVAS_DIR: canvasDir
  }
})

let buffer = ''
let stderr = ''
const pending = new Map()

child.stdout.setEncoding('utf8')
child.stdout.on('data', (chunk) => {
  buffer += chunk
  let newlineIndex
  while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, newlineIndex).trim()
    buffer = buffer.slice(newlineIndex + 1)
    if (!line) continue
    const message = JSON.parse(line)
    const resolver = pending.get(message.id)
    if (resolver) {
      pending.delete(message.id)
      resolver(message)
    }
  }
})
child.stderr.setEncoding('utf8')
child.stderr.on('data', (chunk) => { stderr += chunk })

let nextId = 1

function request(method, params) {
  const id = nextId++
  const payload = { jsonrpc: '2.0', id, method }
  if (params !== undefined) payload.params = params

  const response = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(id)
      reject(new Error('Timed out waiting for MCP response to ' + method + '. stderr: ' + stderr.trim()))
    }, 5000)

    pending.set(id, (message) => {
      clearTimeout(timeout)
      resolve(message)
    })
  })

  child.stdin.write(JSON.stringify(payload) + '\n')
  return response
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

try {
  const initialized = await request('initialize', { protocolVersion: '2025-11-25' })
  assert(initialized.result?.serverInfo?.name === 'Cowart MCP', 'initialize should return Cowart MCP server info')

  const ping = await request('ping')
  assert(ping.result && !ping.error, 'ping should return an empty result')

  const listed = await request('tools/list')
  const tools = listed.result?.tools ?? []
  const names = tools.map((tool) => tool.name)
  assert(names.includes('get_cowart_selection'), 'tools/list should include get_cowart_selection')
  assert(names.includes('insert_cowart_image'), 'tools/list should include insert_cowart_image')

  const selection = await request('tools/call', {
    name: 'get_cowart_selection',
    arguments: { projectDir }
  })
  assert(selection.result?.structuredContent?.selection?.selectedShapes?.length === 0, 'empty project should return no selected shapes')

  console.log('Cowart MCP test passed')
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  child.kill('SIGTERM')
  await rm(projectDir, { recursive: true, force: true })
}
