import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
const root = process.cwd()
const files = process.argv.slice(2)
const upgrade = t => t
  .replace(/@deepseek-ai\/dsh-/gu, '@berry-ai/harness-')
  .replace(/@deepseek-ai\/dsh(?![-\w])/gu, '@berry-ai/harness')
  .replace(/deepseek-aidsh-/gu, 'berry-aiharness-')
  .replace(/#deepseek-aidsh(?![-\w])/gu, '#berry-aiharness')
for (const path of files) {
  const theirs = execFileSync('git', ['show', `:3:${path}`], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 })
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), upgrade(theirs))
  execFileSync('git', ['add', path])
  console.log('took theirs', path)
}
