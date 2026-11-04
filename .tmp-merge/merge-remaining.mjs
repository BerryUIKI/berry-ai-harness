import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const root = process.cwd()
const skip = new Set(['package.json', 'tsconfig.base.json', '.gitignore'])
const files = execFileSync('git', ['diff', '--name-only', '--diff-filter=U'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)
const toUp = t => t.replace(/@berry-ai\/harness-/gu, '@deepseek-ai/dsh-').replace(/@berry-ai\/harness(?![-\w])/gu, '@deepseek-ai/dsh').replace(/@berry-ai\/(?!harness)/gu, '@deepseek-ai/')
const toBerry = t => t.replace(/@deepseek-ai\/dsh-/gu, '@berry-ai/harness-').replace(/@deepseek-ai\/dsh(?![-\w])/gu, '@berry-ai/harness')
const show = (s, p) => { try { return execFileSync('git', ['show', `:${s}:${p}`], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }) } catch { return null } }
const work = mkdtempSync(join(tmpdir(), 'mf-'))
const merged = [], failed = []
try {
  for (const path of files) {
    if (skip.has(path)) continue
    const base = show(1, path), ours = show(2, path), theirs = show(3, path)
    if (theirs === null || ours === null) { failed.push(path); continue }
    const a = join(work, 'a'), b = join(work, 'b'), c = join(work, 'c')
    writeFileSync(a, toUp(ours)); writeFileSync(b, base ?? ''); writeFileSync(c, theirs)
    try {
      const out = execFileSync('git', ['merge-file', '-p', '--diff3', a, b, c], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
      if (out.includes('<<<<<<<')) { failed.push(path); continue }
      mkdirSync(dirname(join(root, path)), { recursive: true })
      writeFileSync(join(root, path), toBerry(out))
      execFileSync('git', ['add', path])
      merged.push(path)
    } catch { failed.push(path) }
  }
} finally { rmSync(work, { recursive: true, force: true }) }
console.log('merged', merged.length, 'failed', failed.length)
for (const f of failed) console.log('MANUAL', f)
