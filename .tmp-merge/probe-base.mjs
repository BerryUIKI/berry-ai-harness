import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const files = readFileSync('./.tmp-merge/conflicts.txt', 'utf8').trim().split('\n').map(l => l.trim().split(' ')[1])
let withMarkers = 0, missing = 0, plain = 0
for (const f of files) {
  let base = ''
  try { base = execFileSync('git', ['show', `:1:${f}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }) }
  catch { missing++; continue }
  if (base.includes('<<<<<<<')) withMarkers++
  else plain++
}
console.log({ total: files.length, plain, withMarkers, missing })
