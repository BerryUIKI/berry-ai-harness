# Agent Note: Tauri 桌面端迁移架构决策

Status: implemented

[English](2026-10-12-tauri-desktop-migration.md) | 中文

## 问题

DeepSeek Harness 原先维护基于 Electron 的桌面客户端。Electron 带来较大的内存与安装包体积，并且没有在 Windows (WebView2)、macOS (WKWebView) 与 Linux (WebKitGTK) 上提供原生 Webview 集成。

## 决策

1. **Rust / Tauri 桌面壳**：由 `apps/desktop/src-tauri` 托管原生桌面壳。
2. **私有 Sidecar 架构**：Node 后端作为私有 sidecar 运行，通过统一 profile runner 启动。
3. **Loopback 协议 v5**：Rust 壳与 Node 后端通过本地回环鉴权 WebSocket 通信。
4. **子 Webview 租约**：隔离浏览器页面与嵌入视图通过 `ChildWebviewState` 由原生系统租借管理。
5. **品牌标识**：产品重命名为 Berry AI Harness，采用单色矢量 B 字母标识与 `~/.berry` 配置目录。

## 考虑过的替代方案

- **继续使用 Electron。** 否决：无法满足内存、包体积与原生 Webview 目标；本次迁移保留现有 React 客户端与 Cordis 后端，仅替换原生外壳。
- **用原生 UI 工具包重写客户端。** 否决：React 客户端、插件组合与 Web 应用已经承载产品行为，重写会造成 UI 所有权分裂。
- **只提供 Node 启动器。** 否决：Node 进程无法拥有原生窗口、菜单、托盘、子 Webview 或安装器交接。

## 后果

- Rust/Tauri 负责原生窗口、Webview、操作系统集成、菜单、托盘与安装器交接；TypeScript/Cordis 后端与 React 客户端仍是应用主体。
- Node 后端作为私有 sidecar 运行。启动注入、就绪、致命错误、账号状态、任务检查、变更控制与确认关闭通过鉴权的回环 Host 协议 v5 传输，不再使用 Electron IPC。
- 打包资源立即加载并等待启动注入；嵌入浏览器页面是由原生系统租借、按账号隔离存储的子 Webview。
- Electron 依赖与 IPC 在退役前保持过渡状态。打包使用 Tauri 资源（NSIS、DMG、AppImage、`.deb`）与签名的 Tauri 更新产物。
- 产品配置目录为 `~/.berry`，可用 `BERRY_HOME` 覆盖；旧数据只能通过 `berry migrate --from <legacy-home>` 导入。
