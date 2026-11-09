# 组件：web-maker

| 元信息 | 值 |
| --- | --- |
| 组件名 | `web-maker` |
| stage | 3 |
| 版本 | 1.0.0 |
| 依赖 | `word-theme` 的 `copy-themeUI.md`、`web-scan` 的 `scan/assets/**`、`pipeline.json` |
| 输入 | `copy-themeUI.md`、`scan/assets/**`、`pipeline.json.projectType` |
| 输出 | `web/**`（可运行的 Vue3 + TailwindCSS 工程） |

## 职责

严格按照 `copy-themeUI.md` 复刻网站前端，生成可运行的 Vue3 + TailwindCSS 工程：各功能界面独立路由、mock 数据、弹窗与切换等交互、主题与语言切换、桌面与移动端响应式，并把扫描到的静态资源接入工程。工程形态由使用者在启动阶段选择的 `projectType` 决定。

## 输入契约

| 输入 | 作用 |
| --- | --- |
| `copy-themeUI.md` | 唯一需求来源与验收依据 |
| `scan/assets/**` | 复制到工程的 logo、背景图、图标、字体等 |
| `pipeline.json.projectType` | `vue3-js` 或 `vue3-ts`，决定工程结构 |
| `references/web-maker-js.md` / `references/web-maker-ts.md` | 对应工程形态的结构、依赖与命令 |

## 输出契约

```text
<outputDir>/web/           完整 Vite 工程根目录
<outputDir>/web/README.md  运行方式、页面清单、mock 数据位置、已知差异
```

工程必须满足：在 `web/` 目录执行 `npm install` 后，`npm run build` 与 `npm run dev` 均可成功，无需使用者手工补文件。

## 前置条件

1. `copy-themeUI.md` 已通过 `word-theme` 的质量检查，「待确认」表无阻塞项。
2. `pipeline.json.projectType` 存在且为 `vue3-js` 或 `vue3-ts`。**若缺失或取值非法，立即停下询问使用者选择完整 web JS 版或完整 web TS 版，禁止自行默认。**
3. 已完整读取 `copy-themeUI.md` 与对应工程形态的参考文档。

## 执行流程

1. **选择工程形态**：读取 `projectType`，加载 `references/web-maker-js.md`（JS 版）或 `references/web-maker-ts.md`（TS 版）；把选择结果记录在 `web/README.md`。
2. **建立追踪**：把 `copy-themeUI.md` 的章节、组件清单、页面规格与验收清单转成「规范条目 → 目标文件」清单，实现过程中逐项销账。
3. **初始化工程**：按参考文档创建 Vite + Vue3 + Vue Router + TailwindCSS 工程，写入 `package.json`、构建配置、Tailwind 与 PostCSS 配置、入口文件、全局样式与目录结构。
4. **落地设计 Token**：把规范中的色彩、字体、圆角、间距、阴影、模糊、缓动写入 Tailwind 配置与 CSS 变量；禁止在组件里散写未经规范定义的色值。
5. **接入静态资源**：把 `scan/assets/**` 复制到 `web/public/assets/`，按资源映射表引用；缺失资源按规范中的缺省策略处理（默认图标、默认背景、占位图），并在 `README.md` 记录。
6. **实现全局框架**：导航栏与 logo、常驻公告栏及多公告轮询弹窗、背景平铺、语言切换、明暗主题切换、头像下拉菜单，以及规范定义的所有响应式降级行为。
7. **实现可复用组件**：按组件清单逐一实现（按钮分级、输入框聚焦光晕、毛玻璃卡片、进度条分级与脉冲、状态图标、弹窗、分页、表格、下拉菜单等），状态与交互严格对齐规范。
8. **实现各功能界面**：为每个页面建立路由与视图组件，按逐页规格实现分区、字段、文案与状态分支；空态、有数据态、异常态全部可用 mock 数据切换查看。
9. **实现交互链路**：按状态机清单接通跳转、弹窗、表单校验、刷新、复制、下载、取消订单、购买流程、提现、兑换等操作；不接后端，统一使用 `src/mock/` 下的数据。
10. **响应式与动效**：实现断点布局、Hover 反馈、fade-in-up 入场序列等规范中定义的动效；未定义动效的界面保持静态，禁止自行添加。
11. **验证可运行**：在 `web/` 执行依赖安装与构建，修复全部编译与 lint 错误；必要时启动开发服务做一次冒烟检查。
12. **写 README 并验收**：生成 `web/README.md`（安装/运行命令、页面与路由清单、mock 数据位置、静态资源来源、已知差异），逐条勾选 `copy-themeUI.md` 的验收清单，未通过项回到对应实现步骤修复。

## 严格性规则

- `copy-themeUI.md` 未定义的功能、页面、字段、色值、组件或动效一律不得新增；工程性必需内容与规范差异写入 `web/README.md` 的「已知差异」。
- 界面文案、单位、默认值、状态色分级、按钮层级与跳转关系必须与规范一致。
- 禁止修改上游产物（`webui-theme.txt`、`copy-themeUI.md`、`scan/**`）；发现规范缺漏时停止实现，回到 `word-theme` 补写后再继续。
- 不编写真实后端请求、不引入规范之外的 UI 组件库；TailwindCSS 承担样式实现。
- 生成代码时保持标识符英文、注释与说明中文。

## 质量检查

- [ ] `web/package.json` 脚本与依赖完整，`npm install` 与 `npm run build` 均成功。
- [ ] 工程形态与 `projectType` 一致（JS 版无 `.ts` 文件；TS 版类型检查通过）。
- [ ] 规范中的设计 Token 全部落在配置或全局样式中，组件内无硬编码的未定义色值。
- [ ] 逐页规格的每个页面都有路由与视图，状态分支可通过 mock 数据切换查看。
- [ ] 组件清单中的每个组件都已实现，含规定的状态与交互。
- [ ] 静态资源引用路径有效，缺省策略已实现。
- [ ] 验收清单逐条通过，`web/README.md` 记录了运行方式、页面清单与已知差异。

## 失败与降级

| 情况 | 处理 |
| --- | --- |
| `projectType` 缺失 | 停下询问使用者选择 JS 版或 TS 版，确认后写入 `pipeline.json` 再继续 |
| 规范条目含糊 | 停止实现并回到 `word-theme` 澄清，禁止自行解释 |
| 静态资源缺失 | 按规范缺省策略实现并记录，不阻断工程 |
| 构建失败 | 修复后重新构建；禁止以「使用者自行处理」为由交付不可运行工程 |
| 规范与截图冲突 | 以 `copy-themeUI.md` 为准，差异记入 `README.md` |

## 与其他组件的边界

- 不重新扫描、不改写设计文档、不做需求补充。
- 只输出 `web/**`，不修改 `copy-web-out/` 下其他产物。
- 若后续新增部署、测试、截图比对等组件，以 `web/**` 作为其输入，不改变本组件的输出契约。

## 扩展点

后续可追加的独立能力：视觉回归截图比对、组件单元测试生成、国际化词条抽取、静态部署、性能优化。以新组件或新版工程形态文档登记。
