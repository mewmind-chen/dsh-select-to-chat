# dsh-select-to-chat

给 DeepSeek Harness（DSH）Web GUI 加上 Codex 风格的「**划词 → 添加到对话**」批注功能。
划选任意文本、写一条评论、点个角标，所有批注随下一条消息一起发给 AI——
评审 AI 输出、核对长文档、逐条提修改意见时特别顺手。

纯客户端插件，无构建步骤，无服务端依赖。

## 功能

- **划词即批注**：在对话区（或页面任意非输入区域）选中一段文本，原地弹出评论框；
  **弹窗不抢焦点**——原生选区保留，划词后照常 Ctrl+C / 右键复制；点入评论框才进入
  输入模式（此时由插件自绘高亮保持视觉）。
- **编号角标**：每条批注在选区右上角生成蓝色编号角标（1、2、3…），数量不限，
  随滚动跟随文本位置；点角标直接跳到清单对应行。
- **批注清单**：输入框上方显示「N 条注释」面板，每条含「所选文本 / 用户评论」，
  支持 ✎ 编辑评论、🗑 删除整条、✕ 清空全部（二次确认）。
- **随消息发送**：添加批注时同步把引用块追加到输入框末尾：

  ```markdown
  > 【注1】所选文本：
  > 本轮未新增 D 编号；D-201～D-206 已存在
  > 用户评论：这句要拆成两句
  ```

  正常发送即可，AI 能精确对应到每段原文和你的意见。
- 多行选区、连续添加、发送后自动清理（转录区重渲染时角标随之消失）。

## 安装

> 前提：你的 dsh web 需要支持客户端插件（bundles 机制）。本插件开发于
> dsh `0.1.5-rc.2`，容器/服务器部署时 `install.sh` 必须在 **DSH 所在环境内**
> 执行（`$HOME/.dsh` 要指向真实的 profile 目录）。

### 方式一：dsh CLI（推荐）

```bash
dsh plugin --profile web add github:mewmind-chen/dsh-select-to-chat
# 然后重启 dsh web（也可以在 dshmarket 设置页点「重启」）
```

命令会把包装进 profile 并自动登记 `dsh.profile.bundles`。需要本机有 `pnpm`。

### 方式二：dshmarket 市场页

打开 **Settings → Plugin Market**，用「从 GitHub 安装」填入本仓库地址即可；
若本插件已进入市场目录，直接搜索 `select-to-chat` 一键安装。

### 方式三：手动

```bash
git clone https://github.com/mewmind-chen/dsh-select-to-chat.git
cd dsh-select-to-chat && bash install.sh
# install.sh 会把包放进 ~/.dsh/profiles/web/node_modules 并登记 bundles
# 重启 dsh web 生效
```

## 升级与卸载

```bash
# 升级：拉最新代码后重跑安装脚本，再重启 dsh
git pull && bash install.sh

# 卸载：删包 + 从 profile package.json 的 dsh.profile.bundles 移除本包名，重启
```

## 使用

1. **划选**一段文本 → 弹出评论框，输入评论（**可留空**）；
2. **Enter** 或点 **✓** 添加：生成编号角标 + 进入清单 + 引用块落入输入框；
3. 可以继续划选添加更多条（这就是它和"复制粘贴"的差别——多段意见一次带走）；
4. 正常发送消息。

键盘：`Enter` 添加 · `Esc` 关闭。

复制：划词后只要不点进评论框，选区就是原生选区，`Ctrl+C` / 右键复制照常可用；
点进评论框后按 `Ctrl+C` 也会自动复制划词原文（v0.1.1 起）。

## 工作原理

- 数据模型：`annotation = { 编号, 所选文本, 用户评论, 选区 Range }`；
- 写入输入框：合成 `paste` 事件为主、`execCommand` 逐行兜底（Lexical 编辑器友好）；
- 编辑/删除：按「【注N】」标记在编辑器虚拟文本中定位块范围；
- 一体化纯前端：照 DSH 社区插件的手写 `__ModuleLoader__` bundle 范式实现，
  `lib/client.js` 即全部运行时代码，无构建、无第三方依赖。

## 已知边界

- 手动改动输入框里的引用块内部文字后，✎/🗑 可能找不到原块（会提示降级，
  删掉重划即可）；
- `patchReload: live` 对 bundles 路线不生效，改动后需要重启 dsh 生效；
- 无头/自动化浏览器里双击选词可能不触发弹窗，正常鼠标拖选不受影响。

## English

A DeepSeek Harness web plugin that brings Codex-style "select text → add to
conversation" annotations: select any text, attach an optional comment,
collect numbered highlights in a list above the composer, and send them all
with your next message. Pure client plugin, no build step. See 安装 above —
`dsh plugin --profile web add github:mewmind-chen/dsh-select-to-chat` then restart.

## License

[MIT](LICENSE)
