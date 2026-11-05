/** The bundle package names the dsh installation selects, offers, installs on demand, or retires. */

/** Installation-owned defaults used when a shipped profile is first opened. */
export interface ProfileTemplate {
  /** Ordered bundle layer list. */
  bundles: readonly string[]
}

/** The shipped profile templates auto-initialized on first use, by name. */
export const PROFILE_TEMPLATES: Record<string, ProfileTemplate> = {
  acp: {
    bundles: ['@berry-ai/harness-base', '@berry-ai/harness-acp-app'],
  },
  web: {
    bundles: ['@berry-ai/harness-base', '@berry-ai/harness-web-app'],
  },
  headless: {
    bundles: ['@berry-ai/harness-base', '@berry-ai/harness-headless'],
  },
  sdk: {
    bundles: ['@berry-ai/harness-base', '@berry-ai/harness-sdk-app'],
  },
  'sdk-minimal': {
    bundles: ['@berry-ai/harness-sdk-minimal'],
  },
}

/**
 * Installation-owned bundle tuples that an earlier release wrote into a shipped profile; app-boot replaces an exact
 * match with the {@link PROFILE_TEMPLATES} entry of the same name and leaves every other list untouched.
 */
export const INSTALLATION_OWNED_PROFILE_TUPLES: Readonly<Record<string, readonly string[]>> = {
  headless: ['@berry-ai/harness-base', '@berry-ai/harness-web-app', '@berry-ai/harness-headless'],
}

/** Bundles an earlier release shipped and the installation no longer carries; app-boot removes them from profiles. */
export const RETIRED_BUNDLES: ReadonlySet<string> = new Set([
  // The Web composition mounts Schedule itself
  // ([upgrade guide](../../../../docs/upgrade-guide/v0.2.0-rc.2/schedule-bundle-retired/guide.md)).
  '@berry-ai/harness-experimental-schedule-bundle',
  '@berry-ai/harness-experimental-agent-team-profile',
])

/** The bundle list a `dsh plugin` init uses for a name with no shipped template. */
export const DEFAULT_PROFILE_BUNDLES: readonly string[] = ['@berry-ai/harness-base']

/**
 * The bundles the dsh installation ships for a person to switch on: each a
 * runtime dependency of the installation that declares `dsh.bundle.patch`,
 * an `icon`, and `./locale/*.json` display metadata, selected by no shipped
 * template, and offered switched off by the plugin manager except persistent
 * terminals, which have no page switch
 * ([rationale](../../../../.agents/notes/implemented/process/2026-09-15-shipped-optional-bundles.md),
 * [admission](../../../../.agents/notes/implemented/architecture/2026-09-21-experimental-capabilities-as-optional-bundles.md)).
 */
export const OPTIONAL_BUNDLES: readonly string[] = [
  '@berry-ai/harness-personalized-recommendations',
  '@berry-ai/harness-cua-bundle',
  '@berry-ai/harness-experimental-session-search',
  '@berry-ai/harness-experimental-ralph-bundle',
  '@berry-ai/harness-experimental-terminal-bundle',
  '@berry-ai/harness-experimental-badge-skill-bundle',
  '@berry-ai/harness-experimental-session-titles-bundle',
  '@berry-ai/harness-experimental-voice-input-bundle',
  '@berry-ai/harness-experimental-cot-translation-bundle',
  '@berry-ai/harness-experimental-auto-review',
  '@berry-ai/harness-experimental-inspector-profile',
  '@berry-ai/harness-experimental-liveshare',
  '@berry-ai/harness-experimental-plugin-market-bundle',
  '@berry-ai/harness-experimental-tool-worktree',
  '@berry-ai/harness-experimental-forge-bundle',
]

/** Public DSH release members available through the ordinary on-demand bundle installer. */
export const ON_DEMAND_BUNDLES: readonly string[] = [
  '@berry-ai/harness-subagent-claude-code',
  '@berry-ai/harness-subagent-codex',
]
