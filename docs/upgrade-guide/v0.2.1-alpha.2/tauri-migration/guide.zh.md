---
kind: upgrade-guide
description: "Electron 桌面壳被 Tauri 取代，CLI 与 npm 作用域迁移到 Berry，配置目录改为 ~/.berry。"
---

# Berry AI Harness Tauri 迁移与完整重命名

[English](guide.md) | 中文

## 变更

桌面版本现在使用 Tauri 2 壳与原生 WebView2、WKWebView、WebKitGTK 视图。Node 后端作为私有 sidecar 运行，壳通过鉴权的回环 Host 协议 v5 与之通信，不再使用 Electron IPC。公共 CLI 为 `berry`（`dsh` 仅保留为临时别名），工作区包使用 `@berry-ai/harness-*`，桌面标识为 `io.github.berryuiki.berry-ai-harness`，配置目录为 `~/.berry`（可用 `BERRY_HOME` 覆盖）。现有 `~/.dsh` 数据不会被原地读取。

## 迁移

1. 停止所有正在运行的 `dsh` 与 Desktop 进程。
2. 安装 Berry 发行版并运行 `berry --version`。
3. 如需保留现有会话、工作区、设置与凭据，运行 `berry migrate --from ~/.dsh`。导入器只复制并校验数据，不会修改源目录。
4. 将 `dsh` 调用替换为 `berry`，并将已安装插件的包名替换为对应的 `@berry-ai/harness-*` 名称。
5. 确认工作区中出现迁移后的会话且桌面应用能打开窗口。验证完成后再删除 `~/.dsh`。
