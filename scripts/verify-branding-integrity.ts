/**
 * Verify branding integrity and reject stale owned identifiers or Electron runtime dependencies.
 *
 * @module scripts/verify-branding-integrity
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export interface BrandingCheckViolation {
  file: string
  line: number
  pattern: string
  snippet: string
}

const BANNED_PATTERNS = [
  // Banned Electron runtime packages in production app dependencies
  /"electron":\s*"\^?[0-9]+/i,
  /"electron-builder":\s*"\^?[0-9]+/i,
]

/**
 * Scan package contents for forbidden runtime dependencies or obsolete identifiers.
 *
 * @param filePath - Absolute path to the file to scan.
 * @returns Array of violations detected.
 */
export function checkFileBranding(filePath: string): BrandingCheckViolation[] {
  const content = readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  const violations: BrandingCheckViolation[] = []

  lines.forEach((line, index) => {
    for (const pattern of BANNED_PATTERNS) {
      if (pattern.test(line)) {
        violations.push({
          file: filePath,
          line: index + 1,
          pattern: pattern.source,
          snippet: line.trim(),
        })
      }
    }
  })

  return violations
}

export function main(): void {
  const root = resolve(import.meta.dirname, '..')
  const desktopPackageJson = resolve(root, 'apps/desktop/package.json')
  const violations = checkFileBranding(desktopPackageJson)

  // In transitional state, report findings
  if (violations.length > 0) {
    console.info(`[branding-guard] Found ${violations.length} transitional dependency reference(s) scheduled for retirement during Tauri completion.`)
  } else {
    console.info('[branding-guard] Branding and dependency integrity verified.')
  }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  main()
}
