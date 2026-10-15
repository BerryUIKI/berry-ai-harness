/** Experimental package identities, publication policy, and retained npm names. */

/** Existing npm names retained by capabilities now housed under experimental/. */
export const EXPERIMENTAL_PACKAGE_NAME_EXCEPTIONS: Readonly<Record<string, string>> = {
  'packages/experimental/tool-session-query': '@berry-ai/harness-tool-session-query',
  'packages/experimental/session-title-all-prompts-llm': '@berry-ai/harness-session-title-all-prompts-llm',
  'packages/experimental/tool-terminal': '@berry-ai/harness-tool-terminal',
  'packages/experimental/tool-ralph': '@berry-ai/harness-tool-ralph',
  'packages/experimental/skill-badge': '@berry-ai/harness-skill-badge',
  'packages/experimental/hook-protocol': '@berry-ai/harness-hook-protocol',
  'packages/experimental/hooks-claude-code': '@berry-ai/harness-hooks-claude-code',
  'packages/experimental/hooks-codex': '@berry-ai/harness-hooks-codex',
  'packages/experimental/webhook': '@berry-ai/harness-webhook',
  'packages/experimental/webhook-github': '@berry-ai/harness-webhook-github',
} satisfies Record<`packages/experimental/${string}`, `@berry-ai/harness-${string}`>

/** npm namespace for experimental packages without retained-name exceptions. */
export const EXPERIMENTAL_PACKAGE_NAME_PREFIX = '@berry-ai/harness-experimental-'
const retainedNames = new Set(Object.values(EXPERIMENTAL_PACKAGE_NAME_EXCEPTIONS))

/**
 * Identify an experimental npm package independently of its installed directory.
 * @param name - complete npm package name, without a version or subpath.
 * @returns Whether the name uses the experimental prefix or a retained name.
 */
export function isExperimentalPackageName(name: string): boolean {
  return name.startsWith(EXPERIMENTAL_PACKAGE_NAME_PREFIX) || retainedNames.has(name)
}

/**
 * Find experimental identities in module ids, paths, subpaths, or npm alias specifications.
 * @param reference - package reference or bundler/runtime module identifier.
 * @returns Whether a delimited package name identifies an experimental capability.
 */
export function hasExperimentalPackageReference(reference: string): boolean {
  const normalized = reference.replaceAll('\\', '/')
  return [...normalized.matchAll(/(?:^|[/:\u0000])(@(?:berry-ai\/harness|deepseek-ai\/dsh)[^/@?#:\s]+)(?=$|[/@?#:])/g)]
    .some(([, name]) => name !== undefined && isExperimentalPackageName(name))
}

/**
 * Derive the package-owned plugin record namespace without changing persisted names.
 * @param name - complete experimental npm package name.
 * @returns Capability suffix, or undefined for a non-experimental name.
 */
export function experimentalPackageRecordNamespace(name: string): string | undefined {
  if (!isExperimentalPackageName(name)) return undefined
  return name.slice(name.startsWith(EXPERIMENTAL_PACKAGE_NAME_PREFIX) ? EXPERIMENTAL_PACKAGE_NAME_PREFIX.length : '@berry-ai/harness-'.length)
}

/** Experimental packages excluded from public releases and npm baselines. */
export const PRIVATE_EXPERIMENTAL_PACKAGE_DIRECTORIES: readonly string[] = []

/**
 * Whether an experimental package publishes under the default-public policy.
 * @param directory - repository-relative package directory.
 * @param privateDirectories - experimental directories excluded from publication.
 * @returns Whether the package publishes with the dsh family.
 */
export function isPublicExperimentalPackageDirectory(
  directory: string,
  privateDirectories: readonly string[] = PRIVATE_EXPERIMENTAL_PACKAGE_DIRECTORIES,
): boolean {
  return /^packages\/experimental\/[^/]+$/.test(directory)
    && !privateDirectories.includes(directory)
}
