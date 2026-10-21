---
kind: upgrade-guide
description: "Electron is replaced by Tauri, the CLI and npm scope move to Berry, and the configuration home moves to ~/.berry."
---

# Berry AI Harness Tauri Migration and Complete Rename

English | [中文](guide.zh.md)

## Change

Desktop releases now run a Tauri 2 shell with native WebView2, WKWebView, and WebKitGTK webviews. The Node backend runs as a private sidecar, and the shell communicates with it over the authenticated loopback Host protocol v5 instead of Electron IPC. The public CLI is `berry` (`dsh` remains a temporary alias), workspace packages use `@berry-ai/harness-*`, the desktop identifier is `io.github.berryuiki.berry-ai-harness`, and the configuration home is `~/.berry` (override with `BERRY_HOME`). Existing `~/.dsh` data is not read in place.

## Migration

1. Stop every running `dsh` and Desktop process.
2. Install the Berry release and run `berry --version`.
3. To keep existing sessions, workspaces, settings, and credentials, run `berry migrate --from ~/.dsh`. The importer copies and validates the data and never modifies the source directory.
4. Replace `dsh` invocations with `berry`, and replace installed plugin package names with their `@berry-ai/harness-*` equivalents.
5. Confirm the migrated sessions appear in the workspace and the desktop application opens its window. Remove `~/.dsh` only after verification.
