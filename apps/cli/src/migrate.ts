/**
 * Migration tool for importing legacy DeepSeek Harness user data to Berry AI Harness.
 *
 * @module @deepseek-ai/dsh/migrate
 */

import { existsSync } from 'node:fs'
import { cp, mkdir, readdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { resolveBerryHome, resolveDshHome } from '@deepseek-ai/dsh-home-paths'

export interface MigrateOptions {
  from?: string | undefined
  to?: string | undefined
}

export interface MigrateResult {
  migrated: boolean
  from: string
  to: string
  items: string[]
}

/**
 * Migrate legacy user data into Berry home.
 * Validates that the destination directory has no collision before staging/copying.
 *
 * @param options - Custom source and destination paths.
 * @returns Details of the migration execution.
 */
export async function migrateLegacyData(options: MigrateOptions = {}): Promise<MigrateResult> {
  const fromDir = resolve(options.from ?? resolveDshHome())
  const toDir = resolve(options.to ?? resolveBerryHome())

  if (!existsSync(fromDir)) {
    throw new Error(`Migration source directory does not exist: ${fromDir}`)
  }

  if (existsSync(toDir)) {
    const toEntries = await readdir(toDir)
    if (toEntries.length > 0) {
      throw new Error(`Migration destination is not empty; refusing destination collision at: ${toDir}`)
    }
  } else {
    await mkdir(toDir, { recursive: true })
  }

  const itemsToCopy = ['sessions', 'workspaces', 'settings', 'credentials', 'profiles']
  const copiedItems: string[] = []

  for (const item of itemsToCopy) {
    const sourceItem = join(fromDir, item)
    const destItem = join(toDir, item)
    if (existsSync(sourceItem)) {
      await cp(sourceItem, destItem, { recursive: true })
      copiedItems.push(item)
    }
  }

  return {
    migrated: true,
    from: fromDir,
    to: toDir,
    items: copiedItems,
  }
}
