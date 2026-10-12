---
title: "Berry AI Harness Tauri 迁移与完整重命名"
version: "v0.2.1-alpha.2"
date: "2026-10-12"
---

# Berry AI Harness Tauri 迁移与完整重命名

[English](guide.md) | 中文

## 概述

在 `v0.2.1-alpha.2` 版本中，DeepSeek Harness 迁移为 Berry AI Harness (`berry`)。桌面端采用 Tauri 2.x 替换 Electron，支持 Windows、macOS 和 Linux。

## 核心变化

1. **品牌与标识符**：
   - CLI 命令：`berry`
   - 主配置目录：`~/.berry`（可通过 `BERRY_HOME` 环境变量覆盖）
   - 包作用域：`@berry-ai/harness-*`
   - 桌面端标识：`io.github.berryuiki.berry-ai-harness`

2. **数据迁移**：
   - 运行 `berry migrate --from ~/.dsh` 复制原有会话、工作区及配置数据，具备防覆盖碰撞保护。
