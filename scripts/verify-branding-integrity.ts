/**
 * Reject stale owned identifiers and unbudgeted Electron runtime dependencies.
 *
 * The fork renamed every owned surface to the Berry identity. Code and
 * configuration must name the current one; vendored, native, and frozen
 * records keep the upstream identifiers they quote, and the still-shipped
 * Electron desktop records its runtime dependencies as a baseline the Tauri
 * migration may shrink but never grow.
 *
 * Markdown is out of scope here: package READMEs and product docs are owned by
 * the branding documentation pass, not by this gate.
 *
 * @module scripts/verify-branding-integrity
 */

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { extname, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')

/** Extensions that carry executable or configuration content. */
const SCANNED_EXTENSIONS = new Set([
  '.cjs', '.css', '.js', '.json', '.mjs', '.mts', '.ps1', '.py', '.sh', '.toml', '.ts', '.tsx', '.yaml', '.yml',
])

/**
 * Paths allowed to quote a stale identifier. Vendored and native distributions
 * keep the upstream scope; archived notes, published upgrade guides, recorded
 * snapshots, and the npm dependency catalog record text that must not change.
 */
export const EXEMPT_PREFIXES: readonly string[] = [
  'vendor/',
  'native/',
  '.agents/notes/archived/',
  'docs/upgrade-guide/',
  'snapshots/',
  'scripts/snapshots/',
  'scripts/dependency-catalog/',
  'docs/dependency-catalog.json',
  // Names the published package the README still tells users to run.
  'scripts/gen-dependency-catalog.ts',
]

/** This gate and its spec contain the rejected patterns by construction. */
const SELF_PATHS: readonly string[] = [
  'scripts/verify-branding-integrity.ts',
  'scripts/tests/verify-branding-integrity.spec.ts',
]

/** Contract fixtures and expected output quote recorded upstream identifiers. */
const FIXTURE_PATH = /\/(?:tests\/(?:fixtures|expected)|__snapshots__)\//u

/** Stale owned package scope; `@deepseek-ai/dshx` is a different package name. */
const STALE_SCOPE = /@deepseek-ai\/dsh(?![A-Za-z0-9])/u

/** Electron dependencies the shipped desktop records today. */
export const ELECTRON_BASELINE: readonly string[] = [
  '@electron/get',
  '@electron/notarize',
  'electron',
  'electron-builder',
  'electron-updater',
]

/** Manifest sections that install packages. */
const DEPENDENCY_SECTIONS: readonly string[] = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
]

/** One rejected line, or one rejected manifest dependency. */
export interface BrandingViolation {
  /** Repo-relative path with forward slashes. */
  file: string
  /** One-based source line; manifest dependency violations report the file's first line. */
  line: number
  /** What the entry violates. */
  rule: string
  /** Trimmed offending text. */
  text: string
}

/**
 * Whether a repository path is exempt from owned-identifier scanning.
 * @param file - repo-relative path with forward slashes.
 * @returns true for exempt prefixes, fixtures, and this gate's own files.
 */
export function isExemptPath(file: string): boolean {
  return EXEMPT_PREFIXES.some(prefix => file.startsWith(prefix))
    || SELF_PATHS.includes(file)
    || FIXTURE_PATH.test(file)
}

/**
 * Find stale owned identifiers in one file's text.
 * @param file - repo-relative path used in diagnostics.
 * @param text - file contents.
 * @returns one violation per matching line.
 */
export function findStaleIdentifiers(file: string, text: string): BrandingViolation[] {
  const violations: BrandingViolation[] = []
  text.split('\n').forEach((line, index) => {
    if (!STALE_SCOPE.test(line)) return
    violations.push({ file, line: index + 1, rule: 'stale owned package scope', text: line.trim() })
  })
  return violations
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Find Electron dependencies outside the recorded baseline.
 * @param manifest - `package.json` contents.
 * @returns sorted dependency names the manifest installs beyond the baseline.
 */
export function findUnbudgetedElectronDependencies(manifest: string): string[] {
  const parsed: unknown = JSON.parse(manifest)
  if (!isRecord(parsed)) throw new TypeError('package.json must be a JSON object')
  const installed = new Set<string>()
  for (const section of DEPENDENCY_SECTIONS) {
    const dependencies = parsed[section]
    if (!isRecord(dependencies)) continue
    for (const name of Object.keys(dependencies)) {
      if (/electron/iu.test(name) && !ELECTRON_BASELINE.includes(name)) installed.add(name)
    }
  }
  return [...installed].sort()
}

/**
 * Check the shipped desktop manifest against the Electron baseline.
 * @param manifest - `apps/desktop/package.json` contents.
 * @returns one violation per unbudgeted dependency.
 */
export function findElectronViolations(manifest: string): BrandingViolation[] {
  return findUnbudgetedElectronDependencies(manifest).map(name => ({
    file: 'apps/desktop/package.json',
    line: 1,
    rule: 'unbudgeted Electron runtime dependency',
    text: name,
  }))
}

/** Tracked and unignored files, forward-slash relative to the repository root. */
function repositoryFiles(): string[] {
  const output = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  return output.split('\0').filter(file => file.length > 0).map(file => file.replaceAll('\\', '/'))
}

/**
 * Collect every branding violation in the repository.
 * @returns violations in path order.
 */
export function collectViolations(): BrandingViolation[] {
  const violations: BrandingViolation[] = []
  for (const file of repositoryFiles().sort()) {
    if (isExemptPath(file) || !SCANNED_EXTENSIONS.has(extname(file))) continue
    const text = readFileSync(resolve(root, file), 'utf8')
    violations.push(...findStaleIdentifiers(file, text))
    if (file === 'apps/desktop/package.json') violations.push(...findElectronViolations(text))
  }
  return violations
}

/** Run the gate as a command. */
export function main(): void {
  const violations = collectViolations()
  if (violations.length === 0) {
    console.info('verify-branding-integrity: code and configuration name the Berry identity only.')
    return
  }
  console.error('verify-branding-integrity: stale owned identifiers or unbudgeted Electron dependencies:')
  for (const violation of violations) {
    console.error(`  ${violation.file}:${violation.line}  ${violation.rule}: ${violation.text}`)
  }
  process.exitCode = 1
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  main()
}
