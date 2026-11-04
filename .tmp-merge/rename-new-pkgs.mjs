import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
const mapping = [
  ['@deepseek-ai/dsh-mcp-manager', '@berry-ai/harness-mcp-manager'],
  ['@deepseek-ai/dsh-fs-patch', '@berry-ai/harness-fs-patch'],
  ['@deepseek-ai/dsh-client-ui-file-actions', '@berry-ai/harness-client-ui-file-actions'],
  ['@deepseek-ai/dsh-client-ui-context-menu', '@berry-ai/harness-client-ui-context-menu'],
]
const files = execFileSync('git', ['grep', '-l', '-F', '-e', mapping[0][0], '-e', mapping[1][0], '-e', mapping[2][0], '-e', mapping[3][0]], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim().split('\n').filter(Boolean)
for (const file of files) {
  let text = readFileSync(file, 'utf8')
  for (const [from, to] of mapping) text = text.split(from).join(to)
  writeFileSync(file, text)
}
console.log('renamed', files.length, 'files')
