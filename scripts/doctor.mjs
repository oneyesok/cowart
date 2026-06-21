import { access, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = new URL('..', import.meta.url)

const requiredFiles = [
  '.nvmrc',
  'CONTRIBUTING.md',
  'index.html',
  'package.json',
  'vite.config.js',
  'src/App.jsx',
  'src/main.jsx',
  'mcp/server.mjs',
  '.codex-plugin/plugin.json',
  '.mcp.json',
  'scripts/start-canvas.sh',
  'scripts/smoke-server.mjs',
  'skills/cowart-open-canvas/SKILL.md',
  'skills/cowart-image-edit/SKILL.md',
  'skills/cowart-image-gen/SKILL.md'
]

const expectedSkillNames = ['cowart-open-canvas', 'cowart-image-edit', 'cowart-image-gen']

async function fileExists(relativePath) {
  await access(new URL(relativePath, root))
}

function fail(message) {
  console.error('✗ ' + message)
  process.exitCode = 1
}

function pass(message) {
  console.log('✓ ' + message)
}

for (const file of requiredFiles) {
  try {
    await fileExists(file)
    pass('found ' + file)
  } catch {
    fail('missing required file: ' + file)
  }
}

try {
  const plugin = JSON.parse(await readFile(new URL('.codex-plugin/plugin.json', root), 'utf8'))
  if (plugin.name !== 'cowart') fail('plugin.json name should be cowart')
  else pass('plugin.json name is cowart')

  if (!plugin.skills) fail('plugin.json should declare a skills path')
  else pass('plugin.json declares skills path')
} catch (error) {
  fail('could not parse .codex-plugin/plugin.json: ' + error.message)
}

for (const skillName of expectedSkillNames) {
  const skillPath = join('skills', skillName, 'SKILL.md')
  try {
    const source = await readFile(new URL(skillPath, root), 'utf8')
    if (!source.includes('name: ' + skillName)) fail(skillPath + ' should declare name: ' + skillName)
    else pass(skillPath + ' declares the expected skill name')
  } catch (error) {
    fail('could not inspect ' + skillPath + ': ' + error.message)
  }
}

try {
  const readme = await readFile(new URL('README.md', root), 'utf8')
  if (readme.includes('cowart-imgae-gen')) {
    console.warn('! README still mentions legacy typo cowart-imgae-gen for compatibility')
  }
  if (!readme.includes('cowart-image-gen')) fail('README should document the corrected cowart-image-gen skill name')
  else pass('README documents the corrected image generation skill name')
  if (!readme.includes('http://127.0.0.1:43217')) fail('README should document the default local URL')
  else pass('README documents the default local URL')
} catch (error) {
  fail('could not inspect README.md: ' + error.message)
}

if (!process.exitCode) {
  console.log('\nCowart doctor checks passed.')
}
