# 组件：web-scan

| 元信息 | 值 |
| --- | --- |
| 组件名 | `web-scan` |
| stage | 1 |
| 版本 | 1.0.0 |
| 依赖 | 无（浏览器自动化技能由运行时加载） |
| 输入 | `targetUrl`、`authMode`、`outputDir` |
| 输出 | `webui-theme.txt`、`scan/**` |

## 职责

用浏览器自动化打开目标站点，模仿人眼观察其各个 WebUI 界面：点击导航与按钮逐个发现功能界面（含弹窗与二级页面），记录布局、控件、文案、状态分支与交互，收集并本地化静态资源，最终写出一份中文叙述式的初步界面描述 `webui-theme.txt`，风格与详略程度对齐 `references/sample/achen-theme-description.txt`。

## 输入契约

| 字段 | 来源 | 说明 |
| --- | --- | --- |
| `targetUrl` | `pipeline.json` | 站点入口网址 |
| `authMode` | `pipeline.json` | `none` / `manual-login` / `cookie`；需登录时保持同一浏览器会话 |
| `outputDir` | `pipeline.json` | 默认 `./copy-web-out/` |
| 界面补充清单 | 使用者 | 可选，指定必须覆盖的界面或 URL |

## 输出契约

```text
<outputDir>/webui-theme.txt          叙述式界面描述（本组件主产物）
<outputDir>/scan/manifest.json       界面清单、资源清单与观察缺口
<outputDir>/scan/screenshots/<页面标识>/   每个界面的截图
<outputDir>/scan/dom/<页面标识>.json       DOM 结构与关键计算样式快照
<outputDir>/scan/assets/**                本地化的 CSS/JS/图片/字体/图标等静态资源
```

`webui-theme.txt` 为纯文本中文叙述，不使用表格、代码块或 Markdown 标记；`scan/` 中的路径一律使用相对路径，供 `word-theme` 与 `web-maker` 直接引用。

## 前置条件

1. 已按 `SKILL.md` 完成启动询问并写好 `pipeline.json`。
2. 已加载浏览器自动化技能：`use_skill` 加载 `agent-browser` 或 `playwright-cli`，并遵循 `references/browser-automation.md`。
3. 目标站点可访问；需登录站点已完成登录或已导入使用者提供的 Cookie。

## 执行流程

1. **建立会话**：打开 `targetUrl`，按 `authMode` 完成登录，后续所有界面复用同一浏览器上下文，禁止为每次观察新建无状态请求。
2. **整体观察**：记录第一屏的整体风格（配色倾向、卡片形态、留白、光效、字体气质）、画布与背景、全局框架（标题导航栏、常驻公告栏、头像菜单、语言与主题切换等），以及这些元素在页面中的位置关系（最左侧、右侧近邻、图标下发弹出等）。
3. **发现界面**：从导航栏与页面内按钮出发，逐个点击切换功能界面，记录界面名称与 URL/路由；继续点击界面内的按钮，覆盖弹窗、购买页、订单详情、工单弹窗等二级页面与弹层。把发现结果整理成界面清单，写入 `manifest.json` 的 `pages`。
4. **逐界面观察**：对每个界面按「分区 → 小块 → 字段 → 状态分支 → 交互」的顺序描述。分区用方位表达（左上、左下、右、上下布局、横向排布）；字段保留界面原文案与数值；状态分支记录空态、有数据态、异常态与不同用户权限下的差异；交互记录点击后的跳转、弹窗、刷新、复制、下载等行为。
5. **截图存档**：每个界面至少保存一张桌面视口截图（默认 1440×900），命名为 `scan/screenshots/<页面标识>/<状态标识>.png`。当前版本不强制桌面与移动端双尺寸扫描；仅当目标站存在明显响应式差异且使用者要求时，追加移动端截图并在描述中说明差异。
6. **读取样式线索**：通过 DOM 与 `getComputedStyle` 记录关键元素的主色、背景、字体栈与字重、圆角、间距、阴影、模糊、定位方式与过渡曲线，写入 `scan/dom/<页面标识>.json`；同时对网络请求中的 CSS、JS、图片、字体、图标 URL 建立资源清单。
7. **本地化静态资源**：把资源清单整理为 `scripts/fetch-assets.mjs` 可读取的 JSON，执行脚本下载到 `scan/assets/`，并在 `manifest.json` 的 `assets` 中记录「原始 URL → 本地路径 → 使用界面」。下载失败的资源保留原始 URL 并记入 `gaps`。
8. **观察状态分支**：对存在数据依赖的界面，分别记录「无数据」「有数据」「异常/维修」等状态的文案与图标差异；无法触达的状态在描述中明确写「未观察到」，禁止推测。
9. **记录细节与修复项**：把细小但影响还原度的要求（图标来源、背景图 URL 缺省处理、进度条颜色分级、协议提示文案、浏览器标签页 logo 等）单独归入 `webui-theme.txt` 末尾的「细节与修复项」章节。
10. **写主产物**：按 `assets/templates/webui-theme.template.txt` 的章节顺序写 `webui-theme.txt`，删除模板中的提示行，替换全部占位符；文风遵循 `references/writing-style.md`，必要时重读 `references/sample/achen-theme-description.txt` 校准详略。
11. **写清单并自检**：补齐 `scan/manifest.json`，逐条执行本文件「质量检查」，未通过则回到对应步骤修正。

## manifest.json 结构

```json
{
  "targetUrl": "https://example.com",
  "authMode": "manual-login",
  "capturedAt": "2026-11-09T00:00:00+08:00",
  "viewport": { "desktop": "1440x900" },
  "pages": [
    {
      "id": "dashboard",
      "name": "仪表盘",
      "url": "https://example.com/dashboard",
      "entry": "点击顶部导航「仪表盘」",
      "screenshots": ["scan/screenshots/dashboard/default.png"],
      "domSnapshot": "scan/dom/dashboard.json",
      "states": ["无套餐", "有套餐"],
      "dialogs": ["一键导入", "流量明细说明"]
    }
  ],
  "assets": [
    { "url": "https://example.com/logo.png", "path": "scan/assets/logo.png", "usedBy": ["global"], "type": "image" }
  ],
  "gaps": ["订单详情页需支付态，当前账号无法触达"]
}
```

## 观察清单

- 全局：主题风格一句话、画布与背景（是否自定义图片、是否平铺、是否覆盖标题栏）、字体气质、卡片材质与圆角、光效与动画、发丝线等细节。
- 框架：导航栏各入口及其顺序、常驻公告栏、右侧工具区、头像下拉菜单项、多端适配表现。
- 每界面：分区方式、每个分区内的小块、字段名与文案、数据单位与默认值、状态图标颜色、按钮层级与位置、空态文案、跳转目标。
- 弹层：标题、字段、按钮、触发条件、关闭方式。
- 资源：logo、favicon、背景图、支付图标、客户端图标、字体文件的来源与缺省处理。

## 质量检查

- [ ] `webui-theme.txt` 覆盖 `manifest.json` 中全部 `pages`，每个界面至少一段，且包含分区、字段、状态分支与交互。
- [ ] 全文为纯文本中文叙述，无表格、代码块、Markdown 标记、模板占位符与提示行。
- [ ] 界面原文案、数值、单位、颜色语义（如绿色正常、红色维修）按观察结果原样保留。
- [ ] 未观察到的内容标注「未观察到」，没有推测性描述。
- [ ] 「细节与修复项」章节存在，且条目均可追溯到截图或资源清单。
- [ ] `scan/assets/` 中的资源在 `manifest.json` 中有对应记录，路径为相对路径。
- [ ] `scan/manifest.json` 的 `gaps` 已记录所有无法触达的界面与状态。

## 失败与降级

| 情况 | 处理 |
| --- | --- |
| 站点需登录且无法完成登录 | 停止扫描，向使用者说明并请求手工登录或 Cookie，禁止绕过登录 |
| 某界面点击后报错或空白 | 保留 URL 与截图，记入 `gaps`，在描述中写「未观察到有效内容」 |
| 静态资源下载失败 | 保留原始 URL 与使用界面，记入 `gaps`，不阻断主产物 |
| 界面数量过多 | 按导航栏分组分批扫描，每批完成即追加描述，禁止合并省略 |
| 浏览器技能不可用 | 停止执行并向使用者报告，禁止改用纯 HTTP 抓取冒充「人眼观察」结果 |

## 与其他组件的边界

- 只描述「看到什么」，不编写设计 Token、组件 API、色值规范或实现方案；这些属于 `word-theme`。
- 不生成任何 Vue 代码；资源文件只做本地化归档，不做重命名以外的加工。
- `webui-theme.txt` 是 `word-theme` 的唯一需求来源；`scan/` 只提供证据与资源路径。

## 扩展点

后续可追加的独立能力：移动端双尺寸扫描、暗色主题扫描、动效录屏记录、无障碍树采集、多语言界面扫描。新增能力以新组件或本组件的新版规范文档形式登记，不改变既有文件名契约。
