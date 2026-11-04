/** The package names the plugin manager protects, hides, orders, or marks experimental. */

/**
 * Plugin packages the plugin manager refuses to disable or remove, because management itself needs them; a bundle that
 * contains one is read-only as well. Removing a name drops only this `management-required` refusal; the manager's own
 * entry, installation-carried bundles, and unaddressable rows stay protected by their own rules.
 */
export const PROTECTED_PLUGINS: ReadonlySet<string> = new Set([
  '@berry-ai/harness-plugin-manager', '@deepseek-ai/cordis-plugin-loader',
  '@deepseek-ai/cordis-plugin-include', '@berry-ai/harness-api-gateway',
  '@berry-ai/harness-host-webserver', '@berry-ai/harness-client-modules',
  '@berry-ai/harness-client-ui-settings-plugin-inventory', '@berry-ai/harness-client-ui-plugin-manager',
  '@berry-ai/harness-host-plugin-inventory', '@berry-ai/harness-typert-registry',
  '@berry-ai/harness-api-remotes', '@berry-ai/harness-api-remote-access',
  '@deepseek-ai/cordis-plugin-timer', '@berry-ai/harness-client-connection',
  '@berry-ai/harness-host-frontend-static', '@berry-ai/harness-tools',
  '@berry-ai/harness-hmr',
])

/**
 * Built-in profile bundles and persistent terminals, which have no plugin manager page.
 * Their Host availability and activation stay intact.
 */
export const HIDDEN_BUNDLES: ReadonlySet<string> = new Set([
  '@berry-ai/harness-base',
  '@berry-ai/harness-web-app',
  '@berry-ai/harness-headless',
  '@berry-ai/harness-sdk-app',
  '@berry-ai/harness-acp-app',
  '@berry-ai/harness-sdk-minimal',
  '@berry-ai/harness-experimental-terminal-bundle',
])

/**
 * The optional bundles the plugin manager's main and More lists rank first, in this order. {@link MORE_BUNDLES}, not
 * this list, decides whether a bundle appears on the main list.
 */
export const EXTENSION_BUNDLES: readonly string[] = [
  '@berry-ai/harness-experimental-agent-team-profile',
  '@berry-ai/harness-experimental-voice-input-bundle',
  '@berry-ai/harness-experimental-plugin-market-bundle',
  '@berry-ai/harness-experimental-auto-review',
]

/**
 * The optional bundles the plugin manager's main list leaves out until the profile enables them; its More list,
 * which includes every eligible bundle, ranks them last in this order.
 */
export const MORE_BUNDLES: readonly string[] = [
  '@berry-ai/harness-personalized-recommendations',
  '@berry-ai/harness-experimental-inspector-profile',
  '@berry-ai/harness-cua-bundle',
  '@berry-ai/harness-experimental-tool-worktree',
  '@berry-ai/harness-experimental-cot-translation-bundle',
  '@berry-ai/harness-experimental-session-search',
  '@berry-ai/harness-experimental-session-titles-bundle',
  '@berry-ai/harness-experimental-badge-skill-bundle',
  '@berry-ai/harness-experimental-ralph-bundle',
  '@berry-ai/harness-subagent-codex',
  '@berry-ai/harness-subagent-claude-code',
]

/** Official bundles the plugin manager marks with the Experimental badge. */
export const EXPERIMENTAL_BUNDLES: ReadonlySet<string> = new Set([
  '@berry-ai/harness-personalized-recommendations',
  '@berry-ai/harness-cua-bundle',
  '@berry-ai/harness-experimental-agent-team-profile',
  '@berry-ai/harness-experimental-voice-input-bundle',
  '@berry-ai/harness-experimental-auto-review',
  '@berry-ai/harness-experimental-inspector-profile',
  '@berry-ai/harness-experimental-forge-bundle',
  '@berry-ai/harness-experimental-tool-worktree',
  '@berry-ai/harness-experimental-cot-translation-bundle',
  '@berry-ai/harness-experimental-session-search',
  '@berry-ai/harness-experimental-session-titles-bundle',
  '@berry-ai/harness-experimental-badge-skill-bundle',
  '@berry-ai/harness-experimental-ralph-bundle',
  '@berry-ai/harness-experimental-plugin-market-bundle',
  '@berry-ai/harness-experimental-liveshare',
])
