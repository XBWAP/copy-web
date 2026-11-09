# 流水线契约（copy-web）

| 元信息 | 值 |
| --- | --- |
| 契约版本 | 1.0.0 |
| 默认输出目录 | 当前工作区下的 `./copy-web-out/` |
| 组件数量 | 3（`web-scan`、`word-theme`、`web-maker`） |
| 文档风格 | `webui-theme.txt` 叙述式纯文本；`copy-themeUI.md` 结构化 Markdown |

## 目录结构

```text
copy-web-out/
├── pipeline.json                运行配置与阶段状态
├── webui-theme.txt              web-scan 主产物：叙述式界面描述
├── copy-themeUI.md              word-theme 主产物：系统性主题规范
├── scan/                        web-scan 证据与资源
│   ├── manifest.json            界面清单、资源清单、观察缺口
│   ├── assets-manifest.json     静态资源下载清单（脚本输入）
│   ├── fetch-result.json        静态资源下载结果（脚本输出）
│   ├── screenshots/<页面标识>/  各界面与状态的截图
│   ├── dom/<页面标识>.json      DOM 结构与关键计算样式
│   └── assets/**                本地化的图片、字体、图标、CSS、JS
└── web/                         web-maker 产物：Vue3 + TailwindCSS 工程
    ├── public/assets/**         从 scan/assets/ 复制的静态资源
    ├── src/
    │   ├── router/              路由与界面映射
    │   ├── components/          规范中的可复用组件
    │   ├── views/               逐页规格对应的页面
    │   ├── mock/                mock 数据与状态切换
    │   └── styles/              全局样式与 CSS 变量
    └── README.md                运行方式、页面清单、已知差异
```

输出目录与技能目录相互隔离；技能目录内不写入任何运行产物。

## 文件契约

| 文件 | 生产者 | 消费者 | 覆盖规则 | 禁止事项 |
| --- | --- | --- | --- | --- |
| `pipeline.json` | 核心调度器 | 全部组件 | 只在启动与阶段状态变化时更新 | 组件不得改写 `projectType` |
| `webui-theme.txt` | `web-scan` | `word-theme` | 重跑 `web-scan` 时整体覆盖 | 禁止表格、代码块、Markdown 标记、占位符 |
| `scan/manifest.json` | `web-scan` | `word-theme`、`web-maker` | 增量追加界面与资源 | 禁止绝对路径 |
| `scan/assets/**` | `web-scan` | `web-maker` | 同名覆盖 | 禁止写入与站点无关的文件 |
| `copy-themeUI.md` | `word-theme` | `web-maker` | 重跑时整体覆盖 | 禁止含 Vue 代码与工程依赖清单 |
| `web/**` | `web-maker` | 后续扩展组件 | 按规范增量实现 | 禁止修改其他阶段产物 |

## pipeline.json 结构

```json
{
  "contractVersion": "1.0.0",
  "targetUrl": "https://example.com",
  "authMode": "none",
  "projectType": "vue3-js",
  "outputDir": "./copy-web-out/",
  "scope": ["web-scan", "word-theme", "web-maker"],
  "createdAt": "2026-11-09T00:00:00+08:00",
  "stages": {
    "web-scan": { "status": "pending", "output": "webui-theme.txt" },
    "word-theme": { "status": "pending", "output": "copy-themeUI.md" },
    "web-maker": { "status": "pending", "output": "web/" }
  }
}
```

字段约定：

- `authMode`：`none` / `manual-login` / `cookie`。
- `projectType`：`vue3-js` / `vue3-ts`。**启动阶段由使用者明确选择后写入，不得默认、不得推测、不得留空。**
- `scope`：本次执行的组件名数组，缺省为全部组件。
- `stages.<组件>.status`：`pending` / `running` / `done` / `failed`；每个组件开始与结束时由核心调度器更新。
- `createdAt`：本地时间 ISO 字符串。

## 数据流

```text
targetUrl + authMode
  → web-scan → webui-theme.txt + scan/**
  → word-theme → copy-themeUI.md（含 D-xxx 追踪矩阵与验收清单）
  → web-maker + projectType → web/**
```

约束：

1. 需求只能沿数据流向下传递，禁止在下游补写上游需求。
2. `webui-theme.txt` 是 `word-theme` 的唯一需求来源；`scan/**` 只提供证据、资源路径与界面清单。
3. `copy-themeUI.md` 是 `web-maker` 的唯一需求来源；工程形态只由 `projectType` 决定。
4. 新增组件必须声明其 `stage`、输入文件与输出文件，并在此处补一条数据流边。

## 阶段复用规则

- 允许复用**本流水线此前生成**且状态为 `done` 的中间产物，跳过对应阶段。
- 复用前核对 `contractVersion`、`outputDir` 与产物完整性；任一不符则从最早的失效阶段重跑。
- 使用者手写或外部提供的网站文字描述不得直接当作 `webui-theme.txt` 接入；案例文本仅作为文风样例与模板来源。

## 全局质量门禁

| 阶段结束 | 门禁条件 |
| --- | --- |
| `web-scan` | 组件质量检查全部通过；`manifest.json.pages` 与 `webui-theme.txt` 的界面集合一致 |
| `word-theme` | 追踪矩阵覆盖全部 `D-xxx`；模板章节齐全；「待确认」表无未答复的阻塞项 |
| `web-maker` | 依赖安装与构建成功；验收清单逐条通过；`web/README.md` 已生成 |
| 全流程 | 三份产物齐备，`pipeline.json` 中所有 `scope` 内阶段状态为 `done` |

任一门禁未通过时，禁止进入下一阶段，也不得标记为 `done`。

## 新增组件时的同步清单

1. `SKILL.md` 的组件注册表追加一行。
2. `references/components/<组件名>.md` 新建规范文档。
3. 本文件的目录结构、文件契约表与数据流图同步更新。
4. 若新增产物文件名或改变既有文件名，提升 `contractVersion` 并更新全部组件文档。
5. 需要复制进产物的骨架放 `assets/templates/`，确定性逻辑放 `scripts/`。

## 术语表

| 术语 | 含义 |
| --- | --- |
| 组件 | 流水线中职责单一、通过约定文件交换数据的功能单元，不是独立 skill |
| 核心调度器 | `copy-web` 的 `SKILL.md`，负责启动询问、注册表、配置与质量门禁 |
| 界面 | 站点中通过导航或按钮切换到的一个功能页面，含其弹窗与二级页面 |
| 状态分支 | 同一界面在无数据、有数据、异常、不同权限下的不同呈现 |
| 描述编号 | `word-theme` 为 `webui-theme.txt` 每条描述生成的 `D-xxx` 稳定编号 |
| 需求追踪矩阵 | 「描述编号 → 规范章节 → 验收项」的映射表 |
| `projectType` | 使用者选择的工程形态：`vue3-js` 或 `vue3-ts` |
