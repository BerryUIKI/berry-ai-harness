import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const root = process.cwd()
const all = execFileSync('git', ['diff', '--name-only', '--diff-filter=U'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)
const dryRun = process.argv.includes('--dry')

function show(stage, path) {
  try { return execFileSync('git', ['show', `:${stage}:${path}`], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }) }
  catch { return null }
}
const toUpstream = text => text
  .replace(/@berry-ai\/harness-/gu, '@deepseek-ai/dsh-')
  .replace(/@berry-ai\/harness(?![-\w])/gu, '@deepseek-ai/dsh')
  .replace(/@berry-ai\/(?!harness)/gu, '@deepseek-ai/')
const toBerry = text => text
  .replace(/@deepseek-ai\/dsh-/gu, '@berry-ai/harness-')
  .replace(/@deepseek-ai\/dsh(?![-\w])/gu, '@berry-ai/harness')

const work = mkdtempSync(join(tmpdir(), 'merge-file-'))
const results = { tookTheirs: 0, keptOurs: 0, merged: 0, manual: [] }

try {
  for (const path of all) {
    if (path.endsWith('.i18n.yaml') || path.endsWith('package.json') || path === 'pnpm-lock.yaml') continue
    if (path.startsWith('.agents/notes/archived/')) continue
    const base = show(1, path)
    const ours = show(2, path)
    const theirs = show(3, path)
    if (theirs === null) { results.manual.push([path, 'no-theirs']); continue }
    if (ours === null) {
      if (!dryRun) { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), theirs); execFileSync('git', ['add', path]) }
      results.tookTheirs++
      continue
    }
    const normalized = toUpstream(ours)
    if (normalized === base) {
      const upgraded = toBerry(theirs)
      if (!dryRun) { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), upgraded); execFileSync('git', ['add', path]) }
      results.tookTheirs++
      continue
    }
    if (theirs === base) { if (!dryRun) execFileSync('git', ['add', path]); results.keptOurs++; continue }
    if (base !== null && !base.includes('<<<<<<<')) {
      const a = join(work, 'a'); const b = join(work, 'b'); const c = join(work, 'c')
      writeFileSync(a, normalized); writeFileSync(b, base); writeFileSync(c, theirs)
      try {
        const merged = execFileSync('git', ['merge-file', '-p', '--diff3', a, b, c], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
        if (!merged.includes('<<<<<<<')) {
          if (!dryRun) { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), toBerry(merged)); execFileSync('git', ['add', path]) }
          results.merged++
          continue
        }
      } catch { /* falls through to manual */ }
    }
    results.manual.push([path, theirs === null ? 'no-theirs' : 'both-changed'])
  }
} finally { rmSync(work, { recursive: true, force: true }) }

writeFileSync(join(root, `.tmp-merge/manual${dryRun ? '-dry' : ''}.json`), JSON.stringify(results, null, 2))
console.log({ ...results, manual: results.manual.length, dryRun })
