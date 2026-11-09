# 浏览器自动化操作指引（web-scan）

`web-scan` 通过浏览器自动化技能观察站点，不使用纯 HTTP 抓取冒充人眼观察结果。

## 技能选择

1. 用 `use_skill` 加载 `agent-browser` 或 `playwright-cli` 之一，遵循该技能的 CLI 用法与参数说明。
2. 优先选择能保持会话、可执行页面内脚本、可读取网络请求与计算样式的技能。
3. 同一轮扫描只使用一种技能，避免会话状态分裂。

## 会话与登录

- 打开 `targetUrl` 后复用同一浏览器上下文完成全部界面的观察。
- `authMode = manual-login`：打开登录页，提示使用者手工完成登录，确认进入主界面后再继续。
- `authMode = cookie`：导入使用者提供的 Cookie，刷新后确认会话有效再继续。
- 禁止使用任何绕过登录、破解校验或批量抓取凭据的方式；登录失败即停止并报告。

## 每个界面的标准动作

1. 打开界面 URL，或按界面清单点击导航项/按钮进入；等待页面网络空闲与主要元素渲染完成。
2. 截图到 `scan/screenshots/<页面标识>/<状态标识>.png`，默认桌面视口 1440×900。
3. 读取 DOM 结构：全局框架、分区容器、卡片、字段标签、按钮文本、表格列名、弹层结构。
4. 采集关键元素的计算样式，字段至少包含：`color`、`background-color`、`font-family`、`font-size`、`font-weight`、`letter-spacing`、`border-radius`、`padding`、`margin`、`gap`、`box-shadow`、`backdrop-filter`、`position`、`transition`、`opacity`。
5. 记录可见文案与数据（含单位、默认值、空态文案）及状态图标语义。
6. 点击界面内按钮，覆盖弹窗、购买页、订单详情、工单弹窗等二级界面；每个弹窗单独截图并在描述中列出字段与按钮。
7. 切换可触达的状态分支（无数据/有数据/异常、不同权限），分别截图；无法触达的记入 `gaps`。
8. 收集网络请求中的静态资源 URL：CSS、JS、图片、字体、图标、favicon、背景图、第三方支付或客户端图标。

## 截图与标识命名

- 页面标识使用小写连字符，如 `dashboard`、`shop-cycle`、`order-detail`、`promotion`、`profile`。
- 状态标识如 `default`、`empty`、`paid`、`dialog-import`、`mobile`。
- 二级界面用独立页面标识，同时在 `manifest.json` 的 `entry` 字段写明触发路径。

## 静态资源本地化

1. 把收集到的资源 URL 整理为 `scan/assets-manifest.json`：

```json
{
  "outputDir": "./copy-web-out",
  "assets": [
    { "url": "https://example.com/logo.png", "path": "logo.png", "type": "image" },
    { "url": "https://example.com/theme.css", "path": "css/theme.css", "type": "css" }
  ]
}
```

2. 在技能目录执行：`node scripts/fetch-assets.mjs ./copy-web-out/scan/assets-manifest.json`。脚本按清单下载到 `scan/assets/`，并把成功与失败明细写入 `scan/fetch-result.json`；存在失败项时退出码为 1。
3. 把「原始 URL → 本地路径 → 使用界面」写入 `scan/manifest.json` 的 `assets`；对照 `scan/fetch-result.json`，把下载失败项保留原始 URL 并写入 `gaps`。
4. 无法下载或涉及版权、鉴权的资源不要伪造本地副本，按 `copy-themeUI.md` 的缺省策略处理。

## 注意事项

- 计算样式与截图只是证据，不能替代文字描述；最终产物必须是 `webui-theme.txt` 的叙述式内容。
- 当前版本不强制桌面与移动端双尺寸截图；仅当站点有明显响应式差异且使用者要求时追加移动端视图。
- 页面内脚本只做读取，不修改站点数据、不提交真实订单、不触发真实支付。
- 观察过程中不臆造字段；所有未触达内容记录到 `gaps`。
