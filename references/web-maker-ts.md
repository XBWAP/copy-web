# 工程形态：vue3-ts（完整 web TS 版）

适用条件：`pipeline.json.projectType = "vue3-ts"`。由 `web-maker` 严格按 `copy-themeUI.md` 生成。

## 技术栈与依赖

| 项 | 约定 |
| --- | --- |
| 运行时 | Node.js >= 20 |
| 构建 | Vite `^5.4.0` + `@vitejs/plugin-vue` `^5.1.0` |
| 框架 | Vue `^3.5.0`，`vue-router` `^4.4.0` |
| 样式 | TailwindCSS `^3.4.0` + PostCSS `^8.4.0` + Autoprefixer `^10.4.0`，使用经典 `tailwind.config.js` 配置 |
| 语言 | TypeScript `~5.6.0`，组件使用 `<script setup lang="ts">`，`vue-tsc` `^2.1.0` 做类型检查 |
| 脚本 | `dev`: `vite`；`build`: `vue-tsc --noEmit && vite build`；`typecheck`: `vue-tsc --noEmit`；`preview`: `vite preview` |

## 目录结构

```text
web/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── env.d.ts
├── public/assets/**         从 scan/assets/ 复制的静态资源
├── README.md
└── src/
    ├── main.ts
    ├── App.vue               全局框架：导航、公告、背景、右侧工具区
    ├── router/index.ts       逐页规格的路由表
    ├── types/index.ts        界面数据、状态、组件 props 的类型定义
    ├── styles/main.css       Tailwind 指令、CSS 变量、光球与毛玻璃等全局样式
    ├── components/          组件清单中的可复用组件
    ├── views/               每个功能界面一个视图
    ├── composables/         主题切换、语言切换、弹窗状态等复用逻辑
    └── mock/                 带类型的 mock 数据与状态切换开关
```

## 实现约定

1. `types/index.ts` 定义逐页规格中的数据结构与状态枚举；`src/mock/` 中的数据必须满足这些类型，禁止使用 `any` 绕过类型检查。
2. 组件 props、emits、composable 返回值均显式标注类型；路由使用具名路由，路径为小写连字符。
3. `tailwind.config.js` 的 `theme.extend` 承载 `copy-themeUI.md` 的设计 Token；组件内不散写未定义色值。
4. 主题切换、语言切换、弹窗状态放在 `composables/`，作用于 `App.vue` 与全部视图。
5. 响应式通过 Tailwind 断点类实现，断点集合以 `copy-themeUI.md` 的布局系统章节为准。
6. 静态资源用 `/assets/...` 引用，缺失时按规范的缺省策略回退；不引入 UI 组件库，不发起真实网络请求。
7. 类型定义属于工程必需内容，不得借此新增规范之外的业务字段。

## 验证命令

```bash
cd <outputDir>/web
npm install
npm run typecheck
npm run build
npm run dev
```

类型检查与构建必须无错误；开发服务启动后做一次首页与各路由的冒烟检查。结果写入 `web/README.md`。
