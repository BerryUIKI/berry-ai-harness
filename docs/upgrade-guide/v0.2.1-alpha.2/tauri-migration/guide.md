---
title: "Berry AI Harness Tauri Migration and Complete Rename"
version: "v0.2.1-alpha.2"
date: "2026-10-12"
---

# Berry AI Harness Tauri Migration and Complete Rename

English | [中文](guide.zh.md)

## Summary

In release `v0.2.1-alpha.2`, DeepSeek Harness migrates to Berry AI Harness (`berry`). Electron is replaced with Tauri 2.x native desktop shells across Windows, macOS, and Linux.

## Key Changes

1. **Branding & Identifiers**:
   - CLI command: `berry`
   - Home directory: `~/.berry` (overridden by `BERRY_HOME`)
   - Package scope: `@berry-ai/harness-*`
   - App identifier: `io.github.berryuiki.berry-ai-harness`

2. **Data Migration**:
   - Run `berry migrate --from ~/.dsh` to copy legacy sessions, workspaces, and configurations without collision.
