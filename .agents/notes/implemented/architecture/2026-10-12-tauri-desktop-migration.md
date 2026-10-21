# Agent Note: Tauri Desktop Migration and Architecture

Status: implemented

English | [中文](2026-10-12-tauri-desktop-migration.zh.md)

## Problem

DeepSeek Harness previously maintained an Electron-based desktop application shell. Electron added a large memory and bundle footprint and did not provide native webview integration on Windows (WebView2), macOS (WKWebView), and Linux (WebKitGTK).

## Decision

1. **Rust / Tauri Shell**: `apps/desktop/src-tauri` hosts the desktop application shell.
2. **Private Sidecar Architecture**: The Node backend runs as a private sidecar process, started through the shared profile runner.
3. **Loopback Host Protocol v5**: Inter-process communication between Rust and the Node backend is handled via a private authenticated WebSocket loopback on an OS-assigned port.
4. **Child Webview Leasing**: External browser guests and isolated web views are managed via native child webviews leased through `ChildWebviewState`.
5. **Brand Identity**: The product identity is rebranded as Berry AI Harness with monogram `B` vector branding and home directory `~/.berry`.

## Alternatives considered

- **Keep Electron.** Rejected: it cannot meet the memory, bundle-size, or native-webview goals, and the migration preserves the existing React client and Cordis backend inside a native shell instead.
- **Rewrite the client in a native UI toolkit.** Rejected: the React client, plugin composition, and Web application already ship the product behavior; duplicating them would split the UI ownership.
- **Ship a Node-only launcher.** Rejected: a Node process cannot own native windows, menus, tray behavior, child webviews, or installer handoff.

## Consequences

- Rust/Tauri owns native windows, webviews, OS integration, menus, tray behavior, and installer handoff; the TypeScript/Cordis backend and React client remain the application.
- The Node backend runs as a private sidecar. Boot injections, readiness, fatal errors, account state, task inspection, mutation controls, and acknowledged shutdown travel over the authenticated loopback Host protocol v5 rather than Electron IPC.
- Packaged assets load immediately and wait for boot injections; embedded browser guests are leased native child webviews with account-scoped storage.
- Electron dependencies and IPC remain transitional until retirement. Packaging uses Tauri resources (NSIS, DMG, AppImage, `.deb`) and signed Tauri updater artifacts.
- The product home is `~/.berry`, overridden by `BERRY_HOME`; legacy data enters only through `berry migrate --from <legacy-home>`.
