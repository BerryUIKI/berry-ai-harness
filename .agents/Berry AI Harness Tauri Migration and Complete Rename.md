# Berry AI Harness: Tauri Migration and Complete Rename

## Summary

Replace Electron with Tauri while preserving the TypeScript/Cordis backend, React client, and current desktop workflows. Support Windows x64, macOS arm64/x64, and Linux x64.

Use native OS webviews, GitHub Releases for updates, opt-in legacy data import, and a vector Berry “B” monogram. Preserve the current UI layout and themes.

## Public identifiers and branding

| Surface | New identity |
|---|---|
| Product | Berry AI Harness |
| CLI and deep links | `berry`, `berry://open` |
| npm | `@berry-ai/harness`, `@berry-ai/harness-*` |
| Python | `berry-ai-harness-sdk`, module `berry_ai_harness`, class `BerryAIHarness` |
| Python runtime | `berry-ai-harness-runtime-bin`, module `berry_ai_harness_runtime` |
| Product environment variables | `BERRY_*` |
| Default harness home | `~/.berry` |
| Package manifest metadata | `berry`, replacing `dsh` |
| Desktop application identifier | `io.github.berryuiki.berry-ai-harness` |

- Update every owned consumer: imports, public exports, configuration, launcher scripts, SDKs, browser globals, release tooling, documentation, and generated catalogs.
- Rescope owned Cordis/native distributions through their maintained tooling. Preserve upstream pins, licenses, copyright, and frozen historical records.
- Retain DeepSeek provider names, credentials such as `DEEPSEEK_API_KEY`, and externally required API routes, headers, and page bridges.
- Normal operation accepts Berry identifiers only. Legacy identifiers are recognized exclusively by the importer.
- Replace whale artwork with a monochrome vector B using the existing brand typography and palette; generate desktop, tray, and favicon assets from that source.

## Desktop implementation

- Add the Rust/Tauri application under `apps/desktop/src-tauri`. Pin Tauri 2.12.3 and compatible dependencies; enable its required `unstable` child-webview feature. Use platform adapters for WebView2, WKWebView, and WebKitGTK. [Tauri webview API](https://docs.rs/tauri/latest/tauri/webview/struct.WebviewBuilder.html)
- Launch the repository’s bundled standalone Node as a private sidecar. Continue starting the desktop backend through the shared profile runner. Keep profile persistence and package operations in Node; Rust owns native windows, webviews, OS integration, and installer handoff.
- Replace Node IPC with a versioned, authenticated loopback control WebSocket, separate from stdout/stderr. Preserve readiness, fatal errors, account state, task inspection, mutation controls, and acknowledged shutdown; advance the private Host protocol from version 4 to 5.
- Provide a typed `berryDesktop` bridge. Serve packaged application assets immediately, await backend boot injections, and proxy authenticated HTTP and streaming through Rust. Backend credentials remain outside the application renderer. Scope native commands to explicitly owned webviews.
- Preserve onboarding, account flows, directory selection, shortcuts, menus, window controls, notifications, background tasks, optional CLI registration, and update dialogs. Replace Electron file-path lookup with native picker, drag/drop, and clipboard paths; pasted bytes retain their upload behavior.
- Replace browser guests with leased native child webviews. Preserve navigation, history, titles, workspace isolation, and account-scoped preferences. Coordinate their visibility and focus with application overlays and menus; await destruction and storage cleanup.
- Apply the accepted compatibility change: private deployment headers remain available for Host API calls and are removed from embedded-page requests. Preserve account-page token/locale initialization and origin restrictions.
- Default qualification targets: Windows 10/11, macOS 14+, and Ubuntu 24.04 LTS x64. Linux hides to tray when a tray host is available; otherwise closing invokes quit confirmation.

## Data migration, packaging, and documentation

- Offer import before initializing the new desktop profile when legacy data exists and the Berry destination is empty. Add the equivalent `berry migrate --from <legacy-home>` command.
- Require legacy processes to be stopped. Stage and validate copied sessions, workspaces, settings, credentials, and user configuration before committing. Preserve source data and Session generations byte-for-byte; refuse destination collisions.
- Apply an explicit identifier map to copied configuration, rebuild owned profiles and dependencies, and report incompatible external plugins before activation. Runtime caches, lockfiles, and Chromium storage start fresh.
- Replace Electron/ASAR packaging with Tauri resources: Windows NSIS, macOS DMG/application bundles, and Linux AppImage/`.deb`.
- Use signed Tauri update artifacts and manifests hosted in `BerryUIKI/berry-ai-harness` GitHub Releases. Preserve separate download/install approval, task inspection, mandatory-policy support, and refusal to install after unclean teardown. AppImage uses the Tauri updater; `.deb` updates use package installation. [Tauri updater](https://v2.tauri.app/plugin/updater/)
- Update bilingual documentation, repository instructions, catalogs, and release workflows. Add the current-version upgrade guide and a durable Tauri ownership decision with a scoped supersession audit. Preserve released persistence evidence; acknowledge any detected persistence-type changes.
- Implementation includes release preparation and workflows. Registry and release publication remain separate operations.

## Validation and acceptance

- Test private-channel authentication, malformed messages, startup failure, sidecar crashes, quit/update inspection, cancellation, and cleanup. Run independent instances concurrently with private directories and OS-assigned ports.
- Test import acceptance, decline, interruption, retry, corruption, collisions, configuration conversion, and incompatible plugins. Verify original files remain unchanged and imported sessions resume.
- Run native desktop scenarios across all four OS/architecture targets, covering browser isolation, account cleanup, file paths, shortcuts, overlays, tray behavior, and signed update installation. Use WebdriverIO’s embedded Tauri driver only in qualification builds. [Native test setup](https://webdriver.io/docs/desktop-testing/tauri/plugin-setup)
- Run TypeScript/Rust checks, package build and hygiene checks, documentation gates, affected expected-output tests, and keyless recorded-session replays. Exercise shipped profiles and both SDKs through built artifacts.
- Add an executed branding/dependency check that rejects stale owned identifiers and Electron runtime dependencies, with explicit historical and external-protocol exceptions.
- Verify English/Chinese and light/dark rendering. Produce the required real-server/model GIF for GUI review; report unavailable qualification evidence as pending.
