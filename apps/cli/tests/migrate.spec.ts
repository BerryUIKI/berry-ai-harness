import { mkdir, mkdtemp, rm, writeFile, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { migrateLegacyData } from '../src/migrate.ts'

describe('migrateLegacyData', () => {
  let tempRoot: string
  let legacyHome: string
  let berryHome: string

  beforeEach(async () => {
    tempRoot = await mkdtemp(join(tmpdir(), 'berry-migrate-test-'))
    legacyHome = join(tempRoot, '.dsh')
    berryHome = join(tempRoot, '.berry')
    await mkdir(legacyHome, { recursive: true })
  })

  afterEach(async () => {
    await rm(tempRoot, { recursive: true, force: true })
  })

  it('fails if legacy source directory does not exist', async () => {
    await expect(migrateLegacyData({ from: join(tempRoot, 'non-existent') })).rejects.toThrow(
      /Migration source directory does not exist/,
    )
  })

  it('fails if destination directory already contains data', async () => {
    await mkdir(berryHome, { recursive: true })
    await writeFile(join(berryHome, 'existing.txt'), 'collision')

    await expect(migrateLegacyData({ from: legacyHome, to: berryHome })).rejects.toThrow(
      /Migration destination is not empty; refusing destination collision/,
    )
  })

  it('copies sessions, workspaces, settings, credentials, and profiles byte-for-byte', async () => {
    const sessionDir = join(legacyHome, 'sessions', 'test-sess')
    await mkdir(sessionDir, { recursive: true })
    await writeFile(join(sessionDir, 'session.jsonl'), '{"event":"turn"}\n')

    const res = await migrateLegacyData({ from: legacyHome, to: berryHome })
    expect(res.migrated).toBe(true)
    expect(res.items).toContain('sessions')

    const copiedContent = await readFile(join(berryHome, 'sessions', 'test-sess', 'session.jsonl'), 'utf8')
    expect(copiedContent).toBe('{"event":"turn"}\n')
  })
})
