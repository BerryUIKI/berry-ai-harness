import { execFileSync } from 'node:child_process'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const files = readFileSync(join(root, '.tmp-merge/conflicts.txt'), 'utf8').trim().split('\n')
  .map(line => line.trim().split(' ')[1]).filter(Boolean)

function show(stage, path) {
  try {
    return execFileSync('git', ['show', `:${stage}:${path}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  } catch { return null }
}

function write(path, text) { writeFileSync(join(root, path), text) }
function add(path) { execFileSync('git', ['add', path]) }

const report = []

// Stage 1: records, frozen archive, lockfile stay ours; archived notes stay upstream's.
for (const path of files) {
  if (path.endsWith('.i18n.yaml') || path === 'pnpm-lock.yaml') {
    execFileSync('git', ['checkout', '--ours', '--', path])
    add(path)
    report.push([path, 'ours'])
  } else if (path.startsWith('.agents/notes/archived/')) {
    execFileSync('git', ['checkout', '--theirs', '--', path])
    add(path)
    report.push([path, 'theirs'])
  }
}

// Stage 2: package manifests — take upstream's, then re-apply the Berry scope.
const SCOPE = /@deepseek-ai\/dsh(?![-\w])/gu
const SCOPED = /@deepseek-ai\/dsh-/gu
const json = []
for (const path of files) {
  if (!path.endsWith('package.json') || path === 'package.json') continue
  const oursText = show(2, path)
  const theirsText = show(3, path)
  if (theirsText === null) continue
  let theirs
  try { theirs = JSON.parse(theirsText) } catch { continue }
  const ours = oursText === null ? undefined : (() => { try { return JSON.parse(oursText) } catch { return undefined } })()
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    const section = theirs[field]
    if (section === undefined || typeof section !== 'object') continue
    const renamed = {}
    for (const [name, value] of Object.entries(section)) renamed[name.replace(SCOPED, '@berry-ai/harness-').replace(SCOPE, '@berry-ai/harness')] = value
    theirs[field] = renamed
  }
  if (typeof theirs.name === 'string') theirs.name = theirs.name.replace(SCOPED, '@berry-ai/harness-').replace(SCOPE, '@berry-ai/harness')
  if (ours?.bin?.berry !== undefined && theirs.bin?.dsh !== undefined && theirs.bin.berry === undefined) {
    theirs.bin = { berry: ours.bin.berry, ...theirs.bin }
  }
  if (ours?.berry !== undefined && theirs.berry === undefined && theirs.dsh !== undefined) theirs.berry = theirs.dsh
  write(path, `${JSON.stringify(theirs, null, 2)}\n`)
  add(path)
  json.push(path)
}
report.push(['package.json (non-root)', `theirs+rename: ${json.length}`])

writeFileSync(join(root, '.tmp-merge/report-stage12.json'), JSON.stringify(report, null, 2))
console.log('stage 1-2 done', { ours: files.filter(f => f.endsWith('.i18n.yaml') || f === 'pnpm-lock.yaml').length, archived: files.filter(f => f.startsWith('.agents/notes/archived/')).length, json: json.length })
