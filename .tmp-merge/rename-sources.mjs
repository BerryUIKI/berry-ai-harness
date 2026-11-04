import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
const files = execFileSync('git', ['grep', '-l', '-F', '@deepseek-ai/dsh', '--', '*.ts', '*.tsx', '*.mjs', '*.js', '*.py', ':!vendor', ':!.agents/notes/archived'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim().split('\n').filter(Boolean)
let changed = 0
for (const file of files) {
  const text = readFileSync(file, 'utf8')
  const replaced = text
    .replaceAll('@deepseek-ai/dsh-', '@berry-ai/harness-')
    .replace(/@deepseek-ai\/dsh(?![-a-zA-Z0-9_])/gu, '@berry-ai/harness')
  if (replaced !== text) { writeFileSync(file, replaced); changed++ }
}
console.log('sources changed', changed, 'of', files.length)
