# 工程形态：vue3-js（完整 web JS 版）

适用条件：`pipeline.json.projectType = "vue3-js"`。由 `web-maker` 严格按 `copy-themeUI.md` 生成。

## 技术栈与依赖

| 项 | 约定 |
| --- | --- |
| 运行时 | Node.js >= 20 |
| 构建 | Vite `^5.4.0` + `@vitejs/plugin-vue` `^5.1.0` |
| 框架 | Vue `^3.5.0`，`vue-router` `^4.4.0` |
| 样式 | TailwindCSS `^3.4.0` + PostCSS `^8.4.0` + Autoprefixer `^10.4.0`，使用经典 `tailwind.config.js` 配置 |
| 语言 | JavaScript，组件使用 `<script setup>`，不使用 TypeScript、不生成 `.ts` 文件 |
| 脚本 | `dev`: `vite`；`build`: `vite build`；`preview`: `vite preview` |

依赖版本按上表最低可用范围写入 `package.json`；如需升级，须保证 `npm install` 与 `npm run build` 仍可成功。

## 目录结构

```text
web/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/assets/**         从 scan/assets/ 复制的静态资源
├── README.md
└── src/
    ├── main.js
    ├── App.vue               全局框架：导航、公告、背景、右侧工具区
    ├── router/index.js       逐页规格的路由表
    ├── styles/main.css       Tailwind 指令、CSS 变量、光球与毛玻璃等全局样式
    ├── components/          组件清单中的可复用组件
    ├── views/               每个功能界面一个视图
    ├── composables/         主题切换、语言切换、弹窗状态等复用逻辑
    └── mock/                 mock 数据与状态切换开关
```

## 实现约定

1. `tailwind.config.js` 的 `theme.extend` 承载 `copy-themeUI.md` 的设计 Token；自定义颜色、圆角、阴影、字体、缓动全部命名后引用，组件内不散写未定义色值。
2. 路由路径与界面名对应，使用小写连字符；每个界面在 `views/` 下有独立文件，弹窗作为 `components/` 中的受控组件。
3. `src/mock/` 集中管理数据，提供状态切换（空态/有数据/异常）以便查看所有状态分支；禁止在视图内硬编码业务数据。
4. 主题切换与语言切换作为全局状态，作用于 `App.vue` 与全部视图；切换后的样式必须仍符合规范定义。
5. 响应式通过 Tailwind 断点类实现，断点集合以 `copy-themeUI.md` 的布局系统章节为准。
6. 静态资源用 `/assets/...` 引用，缺失时按规范的缺省策略回退。
7. 组件不加规范之外的 props 与交互；不引入 UI 组件库，不发起真实网络请求。

## 验证命令

```bash
cd <outputDir>/web
npm install
npm run build
npm run dev
```

构建必须无错误；开发服务启动后做一次首页与各路由的冒烟检查。结果写入 `web/README.md`。
