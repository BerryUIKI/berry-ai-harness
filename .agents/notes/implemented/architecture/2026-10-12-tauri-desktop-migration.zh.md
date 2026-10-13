---
description: "使用 Tauri 2.x 和原生 Webview 替代 Electron 桌面壳的架构决策。"
kind: "architecture"
date: "2026-10-12"
---

# 2026-10-12 Tauri 桌面端迁移架构决策

[English](2026-10-12-tauri-desktop-migration.md) | 中文

## 背景

DeepSeek Harness 原先维护基于 Electron 的桌面客户端。为了大幅降低内存占用和安装包体积，并在 Windows (WebView2)、macOS (WKWebView) 与 Linux (WebKitGTK) 上提供原生 Webview 支持，桌面壳全面迁移至 Tauri 2.x。

## 决策

1. **Rust / Tauri 桌面壳**：由 `apps/desktop/src-tauri` 托管原生桌面壳。
2. **私有 Sidecar 架构**：Node 后端作为私有 sidecar 运行，通过统一 profile runner 启动。
3. **Loopback 协议 v5**：Rust 壳与 Node 后端通过本地回环鉴权 WebSocket 通信。
4. **子 Webview 租约**：隔离浏览器页面与嵌入视图通过 `ChildWebviewState` 由原生系统租借管理。
5. **品牌标识**：产品重命名为 Berry AI Harness，采用单色矢量 B 字母标识与 `~/.berry` 配置目录。
