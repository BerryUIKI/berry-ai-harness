import { readFileSync, writeFileSync } from 'node:fs'
const path = 'tsconfig.base.json'
let lines = readFileSync(path, 'utf8').split('\n')
const stale = /experimental-(client-ui-agent-team|agent-team|agent-team-profile|tool-agent-team)/
const before = lines.length
lines = lines.filter(line => !stale.test(line))
console.log('removed', before - lines.length)
const anchor = '      "@berry-ai/harness-util-file-drag": ["./packages/util/file-drag/src"],'
const index = lines.indexOf(anchor)
if (index === -1) throw new Error('anchor missing')
const additions = [
  '      "@berry-ai/harness-agent-team": ["./packages/team/agent-team/src"],',
  '      "@berry-ai/harness-agent-team/client": ["./packages/team/agent-team/src/client.ts"],',
  '      "@berry-ai/harness-tool-agent-team": ["./packages/team/tool-agent-team/src"],',
  '      "@berry-ai/harness-client-ui-agent-team": ["./packages/client/ui-agent-team/src"],',
  '      "@berry-ai/harness-client-ui-agent-team/client": ["./packages/client/ui-agent-team/src/client/index.ts"],',
]
for (const line of additions) if (!lines.includes(line)) lines.splice(index + 1, 0, line)
writeFileSync(path, lines.join('\n'))
