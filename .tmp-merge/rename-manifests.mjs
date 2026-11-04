import { globSync } from 'node:fs'
import { readFileSync, writeFileSync } from 'node:fs'
const files = globSync('{packages/*/*,apps/*,python/sdk-runtime,vendor/*}/package.json')
let changed = 0
for (const file of files) {
  if (file.startsWith('vendor/')) continue
  const text = readFileSync(file, 'utf8')
  const replaced = text
    .replaceAll('@deepseek-ai/dsh-', '@berry-ai/harness-')
    .replace(/"@deepseek-ai\/dsh"/gu, '"@berry-ai/harness"')
  if (replaced !== text) { writeFileSync(file, replaced); changed++ }
}
console.log('manifests changed', changed)
