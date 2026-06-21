import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const port = Number(process.env.COWART_SMOKE_PORT ?? 43219)
const baseUrl = 'http://127.0.0.1:' + port
const projectDir = await mkdtemp(join(tmpdir(), 'cowart-smoke-'))
const canvasDir = join(projectDir, 'canvas')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchJson(path, options) {
  const response = await fetch(baseUrl + path, options)
  const text = await response.text()
  if (!response.ok) {
    throw new Error(path + ' returned ' + response.status + ': ' + text.slice(0, 300))
  }
  return text ? JSON.parse(text) : null
}

async function waitForServer() {
  const deadline = Date.now() + 30000
  let lastError

  while (Date.now() < deadline) {
    try {
      return await fetchJson('/api/selection')
    } catch (error) {
      lastError = error
      await sleep(500)
    }
  }

  throw new Error('Cowart smoke server did not become ready: ' + (lastError?.message ?? 'unknown error'))
}

const child = spawn(
  'npm',
  ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
  {
    cwd: new URL('..', import.meta.url),
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      COWART_PROJECT_DIR: projectDir,
      COWART_CANVAS_DIR: canvasDir
    }
  }
)

let output = ''
child.stdout.on('data', (chunk) => { output += chunk.toString() })
child.stderr.on('data', (chunk) => { output += chunk.toString() })

try {
  await waitForServer()

  const health = await fetchJson('/api/health')
  if (health.ok !== true || health.name !== 'cowart-canvas') {
    throw new Error('health endpoint did not return a healthy Cowart payload')
  }

  const selection = await fetchJson('/api/selection')
  if (!Array.isArray(selection.selection?.selectedShapes)) {
    throw new Error('selection endpoint did not return selectedShapes')
  }

  const canvas = await fetchJson('/api/canvas')
  if (!canvas || typeof canvas.storage !== 'string') {
    throw new Error('canvas endpoint did not return storage metadata')
  }

  await fetchJson('/api/view-state', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      version: 1,
      currentPageId: null,
      camera: { x: 0, y: 0, z: 1 },
      updatedAt: new Date().toISOString()
    })
  })

  console.log('Cowart smoke server passed at ' + baseUrl)
} catch (error) {
  console.error(output.trim())
  console.error(error.message)
  process.exitCode = 1
} finally {
  try {
    process.kill(-child.pid)
  } catch {
    child.kill('SIGTERM')
  }
  await rm(projectDir, { recursive: true, force: true })
}
