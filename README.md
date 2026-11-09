# copy-web 项目说明

**简体中文** | [English](./README.en.md)

| 项 | 值 |
| --- | --- |
| 项目名 | `copy-web` |
| 版本 | `v1.0.0`（稳定版） |
| 流水线契约版本 | `1.0.0` |
| 类型 | CodeBuddy Skill（单 skill + 可插拔组件） |
| 当前状态 | 已生成、未安装、未打包 |
| 目录位置 | `c:\Users\HP\Desktop\test\copy-web\` |
| 主要语言 | 文档提供简体中文与英文双语说明；生成代码的标识符使用英文 |

## 一、项目定位

`copy-web` 把「观察一个网站的界面」到「生成可运行的复刻工程」拆成一条可插拔流水线：先用浏览器自动化扫描站点并写出人眼视角的界面描述，再把描述整理成系统性主题规范，最后严格按规范生成 Vue3 + TailwindCSS 工程。

`copy-web` 本身是**核心调度器**，只负责启动询问、组件注册表、运行配置与质量门禁，不产出设计文档、不生成代码。功能由组件承担，组件通过固定文件名与目录契约交换数据，可不断追加。

初始三个组件：

| stage | 组件 | 输入 | 输出 |
| --- | --- | --- | --- |
| 1 | `web-scan` | 目标网址、登录方式、输出目录 | `webui-theme.txt`、`scan/**` |
| 2 | `word-theme` | `webui-theme.txt`、`scan/manifest.json` | `copy-themeUI.md` |
| 3 | `web-maker` | `copy-themeUI.md`、`scan/assets/**`、`pipeline.json` | `web/**` |

数据流：`目标网址 → webui-theme.txt → copy-themeUI.md → web/**`。需求只沿数据流向下传递，下游不得补写上游需求。

## 二、目录结构

```text
copy-web/
├── README.md                          中文说明（v1.0.0 稳定版）
├── README.en.md                       英文说明（v1.0.0 稳定版）
├── SKILL.md                           技能入口：核心调度器、启动流程、组件注册表、扩展规范
├── references/
│   ├── pipeline.md                    目录契约、文件契约、pipeline.json 结构、全局质量门禁、术语表
│   ├── writing-style.md               webui-theme.txt 的文风规则与观察顺序
│   ├── browser-automation.md          浏览器自动化技能的操作指引
│   ├── web-maker-js.md                vue3-js 工程形态：依赖、结构、命令
│   ├── web-maker-ts.md                vue3-ts 工程形态：依赖、结构、命令
│   ├── components/
│   │   ├── web-scan.md                组件规范：输入/输出契约、执行流程、质量检查、失败处理
│   │   ├── word-theme.md              同上
│   │   └── web-maker.md               同上
│   └── sample/
│       └── achen-theme-description.txt  用户提供的文字化 UI 描述案例（原文，10764 字节）
├── assets/templates/
│   ├── webui-theme.template.txt       叙述式界面描述模板
│   ├── copy-themeUI.template.md       系统性主题规范模板
│   └── component.template.md          新增组件文档模板
└── scripts/
    └── fetch-assets.mjs               静态资源本地化脚本（Node 内置模块，无外部依赖）
```

## 三、快速开始

### 1. 安装（二选一）

```text
用户级（跨项目）： C:\Users\HP\.codebuddy\skills\copy-web\
项目级（团队共享）：<项目根>\.codebuddy\skills\copy-web\
```

把整个 `copy-web` 目录复制过去即可；无需构建、无需安装依赖。当前目录仅为生成产物，尚未安装。

### 2. 触发

用类似以下指令触发技能：

```text
复刻 https://example.com 的前端界面
扫描这个网站并生成界面描述，再做成 Vue3 项目
按 copy-themeUI.md 生成 TS 版复刻工程
```

### 3. 启动询问（强制）

技能在执行任何组件之前必须一次性确认以下参数，确认前不得开始：

| 参数 | 说明 |
| --- | --- |
| `targetUrl` | 目标站点入口网址 |
| `authMode` | `none` / `manual-login` / `cookie`；需登录时由使用者手工登录或提供 Cookie，禁止绕过登录 |
| `projectType` | `vue3-js`（Vite + Vue3 + JavaScript）或 `vue3-ts`（Vite + Vue3 + TypeScript）。**必须由使用者明确选择，禁止默认、禁止推测、禁止延后到 web-maker 阶段再问** |
| `scope` | 执行全流程，或只执行指定阶段 |
| `outputDir` | 默认 `./copy-web-out/`，可由使用者另行指定 |

确认后写入 `pipeline.json`，按 `stage` 顺序执行组件；每阶段结束执行该组件的质量检查与全局质量门禁，未通过不得进入下一阶段。

### 4. 产物位置

```text
copy-web-out/
├── pipeline.json                运行配置与阶段状态
├── webui-theme.txt              叙述式中文界面描述（纯文本，无表格/代码块/Markdown 标记）
├── copy-themeUI.md              系统性主题规范（设计 Token、组件清单、逐页规格、验收清单）
├── scan/                        截图、DOM/计算样式快照、静态资源、清单与下载结果
└── web/                         Vue3 + TailwindCSS 工程（含 README.md）
```

产物与技能目录隔离；技能目录内不写入运行产物。

## 四、组件说明

### web-scan（stage 1）

加载 `agent-browser` 或 `playwright-cli` 技能，复用同一浏览器会话：整体观察 → 点击导航与按钮逐个发现功能界面（含弹窗、二级页面）→ 逐界面记录分区、字段、文案、状态分支与交互 → 桌面视口截图 → 读取 DOM 与计算样式 → 收集并本地化静态资源 → 按案例文风写出 `webui-theme.txt`。

已启用能力：导航点击发现界面、静态资源本地化、登录态支持。当前版本不强制桌面 + 移动端双尺寸截图，仅在站点存在明显响应式差异且使用者要求时追加。

### word-theme（stage 2）

把 `webui-theme.txt` 的每条描述编号 `D-xxx`，按模板转写为设计语言、设计 Token、布局系统、组件清单、逐页规格、交互状态机、资源与缺省策略、实现约束、追踪矩阵与验收清单。规则：不新增需求、不丢失细节、参数必须具体到数值；证据不足的条目进入「待确认」表并向使用者确认，禁止凭空编造。

### web-maker（stage 3）

读取 `pipeline.json.projectType`，加载对应工程形态文档，严格按 `copy-themeUI.md` 生成工程：设计 Token 落地到 `tailwind.config.js` 与 CSS 变量、全局框架、可复用组件、逐页路由与视图、交互链路、mock 数据、响应式与动效、静态资源接入。最后执行依赖安装与构建验证，生成 `web/README.md` 并逐条勾选验收清单。

| 形态 | 关键约定 |
| --- | --- |
| `vue3-js` | Vite `^5.4.0`、Vue `^3.5.0`、Vue Router `^4.4.0`、TailwindCSS `^3.4.0`（经典 `tailwind.config.js`），`<script setup>`，不生成 `.ts` 文件 |
| `vue3-ts` | 同上并加入 TypeScript `~5.6.0`、`vue-tsc` `^2.1.0`，`<script setup lang="ts">`、类型定义与 `npm run typecheck` |

两者均要求 Node.js ≥ 20，且 `npm install`、`npm run build`、`npm run dev` 可成功。

### 资源本地化脚本

```bash
node scripts/fetch-assets.mjs ./copy-web-out/scan/assets-manifest.json
```

清单中 `outputDir` 指向输出目录，`assets[].path` 相对于 `scan/assets/`。脚本把资源下载到 `scan/assets/`，结果写入 `scan/fetch-result.json`；存在失败项时退出码为 1，失败项需记入 `scan/manifest.json` 的 `gaps`。兼容 Windows 下带 UTF-8 BOM 的清单文件。

## 五、案例与文档规范

`references/sample/achen-theme-description.txt` 是使用者提供的 Apple 风格 Bento Grid 多功能面板文字描述案例，用途有二：

1. 作为 `webui-theme.txt` 的**文风与详略样例**：整体风格 → 网站布局 → 各功能界面逐一描述 → 细节与修复项，中文自然语言叙述。
2. 作为**模板提炼来源**：`assets/templates/` 下两份模板的章节与字段由该案例归纳。

该案例不作为流水线输入，也不作为独立验收用例。手写或外部提供的描述文本不得直接当作 `webui-theme.txt` 接入流水线；仅允许复用本流水线此前生成且状态为 `done` 的中间产物。

## 六、扩展组件

1. 复制 `assets/templates/component.template.md` 到 `references/components/<组件名>.md`，组件名使用小写连字符。
2. 填写元信息表、输入/输出契约、执行流程、质量检查、失败处理、组件边界与扩展点。
3. 在 `SKILL.md` 的组件注册表追加一行，并同步 `references/pipeline.md` 的目录结构、文件契约与数据流图。
4. 确定性逻辑放 `scripts/`，产物骨架放 `assets/templates/`，长文档放 `references/`。
5. 组件只通过约定文件交换数据；新增产物文件不提升契约版本，改变既有文件名时必须提升 `contractVersion` 并更新全部组件文档。

后续可追加的方向：移动端双尺寸扫描、暗色主题扫描、视觉回归比对、组件单元测试、国际化词条抽取、静态部署。

## 七、约束与已知边界

- 只复刻可见界面，禁止臆造未观察到的功能、字段或数据；无法触达的内容记录到 `gaps`。
- 不接后端、不引入规范之外的 UI 组件库、不发起真实订单或支付请求。
- 浏览器页面内脚本只做读取，不改站点数据；登录失败即停止并报告。
- 技能本身不含自动执行程序，运行时由 CodeBuddy 按 `SKILL.md` 与各组件文档调度；浏览器自动化能力依赖 `agent-browser` / `playwright-cli` 技能。
- 本机当前无可用 Python，因此未运行 skill-creator 的 `init_skill.py`、`package_skill.py`；目录按规范手工创建。安装或分发时可直接复制目录，或自行打包为 zip。
- 工程规范默认锁定 TailwindCSS v3 经典配置；如需 Tailwind v4，应新增一份工程形态文档，不改动既有契约。

## 八、验证记录（v1.0.0）

| 校验项 | 结果 |
| --- | --- |
| `SKILL.md` frontmatter | 通过：`name: copy-web` 合规，description 无尖括号 |
| 契约文件齐备 | 通过：14 个核心文件全部存在（不含本说明） |
| `fetch-assets.mjs` 语法 | 通过：`node --check` 无错误 |
| `fetch-assets.mjs` 功能 | 通过：data URL 自测下载成功、结果文件正确、BOM 兼容、退出码 0 |
| Lint 诊断 | 通过：0 条 |
| 中英说明文档 | 通过：`README.md`（中文）与 `README.en.md`（英文）内容同步 |
| 临时测试文件 | 已清理 |

## 九、版本规则

- `v1.0.0` 为当前稳定版，流水线契约版本 `1.0.0`。
- 新增组件、追加文档、修正表述属于向后兼容变更，不提升契约版本。
- 修改既有产物文件名、目录结构或 `pipeline.json` 字段，属于破坏性变更，必须提升契约版本并同步全部组件文档与模板。
