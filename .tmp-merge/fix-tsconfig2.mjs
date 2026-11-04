import { readFileSync, writeFileSync } from 'node:fs'
const path = 'tsconfig.base.json'
const lines = readFileSync(path, 'utf8').split('\n')
const anchor = '      "@berry-ai/harness-agent-team/client": ["./packages/team/agent-team/src/client.ts"],'
const index = lines.indexOf(anchor)
if (index === -1) throw new Error('anchor missing')
const additions = [
  '      "@berry-ai/harness-client-ui-file-actions": ["./packages/client/ui-file-actions/src"],',
  '      "@berry-ai/harness-client-ui-file-actions/client": ["./packages/client/ui-file-actions/src/client/index.ts"],',
  '      "@berry-ai/harness-client-ui-file-actions/types": ["./packages/client/ui-file-actions/src/types.ts"],',
  '      "@berry-ai/harness-client-ui-context-menu": ["./packages/client/ui-context-menu/src"],',
  '      "@berry-ai/harness-client-ui-context-menu/client": ["./packages/client/ui-context-menu/src/client/index.ts"],',
]
for (const line of additions) if (!lines.includes(line)) lines.splice(index + 1, 0, line)
writeFileSync(path, lines.join('\n'))
