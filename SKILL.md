---
name: copy-web
description: 用于把目标网站的前端界面复刻成可运行的 Vue3 项目，或把文字化的 UI 描述还原为 WebUI。当用户要求复刻、克隆、仿制网站界面，扫描网页并生成界面布局描述，把界面描述整理成系统性主题设计规范，或依据主题规范生成 Vue3 与 TailwindCSS 工程时，应使用本技能。本技能以 copy-web 作为核心调度器，通过可插拔组件流水线 web-scan 到 word-theme 到 web-maker 工作，并规范化两份设计文档 webui-theme.txt 与 copy-themeUI.md。
---

# copy-web：可插拔 WebUI 复刻流水线

## 概述

以 `copy-web` 为唯一入口与核心调度器，把「观察一个网站的界面」到「生成可运行的复刻工程」拆成若干职责单一、可不断追加的功能组件。组件之间通过固定文件名与目录契约传递产物，任一组件都可单独重跑，新增组件只需追加一份规范文档并在注册表登记。

`copy-web` 本身只负责调度、契约、运行配置与质量门禁，不产出设计文档，也不生成代码；它不是一个数据产出组件。全部产物写入工作区的 `./copy-web-out/`，与技能目录隔离。

## 启动流程（执行任何组件之前必须完成）

1. 读取 `references/pipeline.md`，确认目录结构、文件契约与 `pipeline.json` 结构。
2. **一次性向使用者询问并确认以下参数，确认前不得开始任何组件执行**：
   - `targetUrl`：目标站点入口网址。
   - `authMode`：是否需要登录；需要时由使用者手工登录或提供 Cookie，禁止尝试绕过登录。
   - `projectType`：`vue3-js`（Vite + Vue3 + JavaScript）或 `vue3-ts`（Vite + Vue3 + TypeScript）。**此项必须由使用者明确选择，禁止推测、禁止使用默认值、禁止延迟到 web-maker 阶段再问。**
   - `scope`：执行全流程，或只执行指定阶段。
   - `outputDir`：默认 `./copy-web-out/`，使用者可另行指定；指定后全流水线统一使用。
3. 在 `outputDir` 下创建目录结构并写入 `pipeline.json`（字段见 `references/pipeline.md`）。
4. 按组件注册表的 `stage` 顺序执行；每个阶段开始前先完整读取该组件的规范文档，结束后执行该文档的「质量检查」与 `references/pipeline.md` 的全局质量门禁。
5. 若 `outputDir` 中已存在**本流水线此前生成**的中间产物，可询问是否复用并跳过对应阶段；不得把使用者手写或外部提供的描述文本当作 `webui-theme.txt` 直接接入流水线。

## 组件注册表

| stage | 组件 | 职责 | 输入 | 输出 | 规范文档 |
| --- | --- | --- | --- | --- | --- |
| 1 | `web-scan` | 用浏览器自动化扫描目标站点的各个 WebUI 界面，模仿人眼观察，收集并本地化静态资源，产出叙述式的初步界面描述 | `targetUrl`、`authMode`、`outputDir` | `webui-theme.txt`、`scan/**` | `references/components/web-scan.md` |
| 2 | `word-theme` | 把叙述式描述转化为系统性主题规范：设计语言、设计 Token、布局系统、组件清单、逐页规格、状态与动效、资源映射、验收清单 | `webui-theme.txt`、`scan/manifest.json` | `copy-themeUI.md` | `references/components/word-theme.md` |
| 3 | `web-maker` | 严格按主题规范与运行配置生成 Vue3 + TailwindCSS 复刻工程 | `copy-themeUI.md`、`scan/assets/**`、`pipeline.json` | `web/**` | `references/components/web-maker.md` |

新增组件时在本表追加一行，并同步更新 `references/pipeline.md` 的数据流图。

## 核心流水线

```text
目标网址
  │  web-scan（浏览器自动化：导航点击发现界面、弹窗与二级页面、静态资源本地化、登录态）
  ▼
copy-web-out/webui-theme.txt        叙述式中文界面描述（文风样例见 references/sample/）
copy-web-out/scan/**               截图、DOM/计算样式快照、静态资源、资源清单
  │  word-theme（逐条追踪，不新增需求、不丢失细节）
  ▼
copy-web-out/copy-themeUI.md       系统性 WebUI 主题规范
  │  web-maker（严格实现，按 projectType 选择 JS 或 TS 工程）
  ▼
copy-web-out/web/**               可运行的 Vue3 + TailwindCSS 工程
```

## 组件快速指引

- **web-scan**：先加载浏览器自动化技能并阅读 `references/browser-automation.md`；按「整体 → 全局框架 → 逐个功能界面 → 控件 → 状态分支 → 交互」的顺序观察；描述文风遵循 `references/writing-style.md`，模板见 `assets/templates/webui-theme.template.txt`。
- **word-theme**：先给 `webui-theme.txt` 的每条描述编号，再按 `assets/templates/copy-themeUI.template.md` 逐章转写，建立「描述编号 → 规范章节」追踪表；`copy-themeUI.md` 是后续实现的唯一需求来源。
- **web-maker**：读取 `pipeline.json` 的 `projectType`，加载 `references/web-maker-js.md` 或 `references/web-maker-ts.md`，按其中的工程结构与依赖约定建工程；实现后执行依赖安装与构建验证。

## 案例定位

`references/sample/achen-theme-description.txt` 是使用者提供的文字化 UI 描述案例（Apple 风格 Bento Grid 的多功能面板）。它在本技能中有两个用途：

1. 作为 `webui-theme.txt` 的**文风与详略样例**：模仿其「整体风格 → 网站布局 → 各功能界面逐一描述 → 修复与优化项」的自然语言写法。
2. 作为**文档规范来源**：`assets/templates/` 下两份模板的章节与字段由该案例提炼而来。

该案例不作为流水线输入，也不作为独立的验收用例；需要复刻站点时从 `web-scan` 开始。

## 扩展组件（可不断添加功能组件）

1. 复制 `assets/templates/component.template.md` 到 `references/components/<组件名>.md`，组件名使用小写连字符命名。
2. 填写组件元信息表、输入契约、输出契约、执行流程、质量检查、失败处理、与其他组件的边界、扩展点；明确其 `stage` 与依赖的阶段产物。
3. 在本文件的「组件注册表」追加一行，并更新 `references/pipeline.md` 的数据流图与目录契约。
4. 需要确定性执行的逻辑放 `scripts/`，需要复制进产物的骨架放 `assets/templates/`，需要按需加载的长文档放 `references/`。
5. 组件只通过约定文件交换数据，禁止直接修改其他组件的内部实现；不得破坏既有文件名契约，确需变更时提升 `pipeline.md` 中的契约版本并同步更新全部组件文档。

## 资源索引

| 路径 | 用途 |
| --- | --- |
| `references/pipeline.md` | 目录契约、文件契约、`pipeline.json` 结构、全局质量门禁、术语表 |
| `references/components/` | 各组件规范文档，每个组件一份 |
| `references/writing-style.md` | `webui-theme.txt` 的文风规则与观察顺序 |
| `references/browser-automation.md` | 浏览器自动化技能的具体操作指引 |
| `references/web-maker-js.md` / `references/web-maker-ts.md` | 两种工程形态的结构、依赖与命令 |
| `references/sample/achen-theme-description.txt` | 文字化 UI 描述案例原文 |
| `assets/templates/webui-theme.template.txt` | 叙述式界面描述模板 |
| `assets/templates/copy-themeUI.template.md` | 系统性主题规范模板 |
| `assets/templates/component.template.md` | 新增组件文档模板 |
| `scripts/fetch-assets.mjs` | 按资源清单把静态资源下载到 `scan/assets/` |

## 全局约束

- 只复刻可见的界面，禁止臆造未观察到的功能、字段或数据；无法访问的部分记录到 `scan/manifest.json` 的 `gaps` 字段。
- `webui-theme.txt` 使用中文自然语言叙述，不用表格、代码块或 Markdown 标记；`copy-themeUI.md` 使用结构化 Markdown，所有视觉参数必须具体到数值。
- 三份产物按阶段逐级收敛：`webui-theme.txt` 描述「看到什么」，`copy-themeUI.md` 规定「做成什么」，`web/` 只实现规范中已规定的内容。
- 所有阶段以中文输出文档与说明；生成的代码标识符使用英文。
- 组件失败时先修复该阶段产物再进入下一阶段，禁止带着缺口继续，禁止在下游阶段悄悄补写上游需求。
