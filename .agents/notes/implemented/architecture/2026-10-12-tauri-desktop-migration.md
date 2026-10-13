---
description: "Durable architectural decision replacing the legacy Electron desktop shell with Tauri 2.x and native webviews."
kind: "architecture"
date: "2026-10-12"
---

# 2026-10-12 Tauri Desktop Migration and Architecture

English | [中文](2026-10-12-tauri-desktop-migration.zh.md)

## Context

DeepSeek Harness previously maintained an Electron-based desktop application shell. To significantly reduce memory footprint, eliminate bundle weight, and provide native webview integration on Windows (WebView2), macOS (WKWebView), and Linux (WebKitGTK), the shell is migrated to Tauri 2.x.

## Decision

1. **Rust / Tauri Shell**: `apps/desktop/src-tauri` hosts the desktop application shell.
2. **Private Sidecar Architecture**: The Node backend runs as a private sidecar process, started through the shared profile runner.
3. **Loopback Host Protocol v5**: Inter-process communication between Rust and the Node backend is handled via a private authenticated WebSocket loopback on an OS-assigned port.
4. **Child Webview Leasing**: External browser guests and isolated web views are managed via native child webviews leased through `ChildWebviewState`.
5. **Brand Identity**: The product identity is rebranded as Berry AI Harness with monogram `B` vector branding and home directory `~/.berry`.
