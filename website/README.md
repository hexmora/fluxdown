# Fluxdown 文档站

使用 Rspress 2，提供 Fluxdown、Stative 的中英文指南和可编辑的 Playground。

## 本地开发

在仓库根目录使用 `.node-version` 指定的 Node.js 和 `package.json` 指定的 pnpm：

```sh
pnpm install --frozen-lockfile
cd website
pnpm dev
```

```sh
pnpm check   # 类型检查、代码检查和生产构建
pnpm build   # 生成 doc_build
pnpm preview # 预览已构建的站点
```

首页演示直接使用工作区中的 Fluxdown 包。Rspress 编译包的源码和样式，修改库源码也会更新演示，无需预先构建或发布包。

## 目录约定

```text
website/
├── docs/               # Markdown / MDX 页面，对应站点路由
│   ├── public/         # 直接复制的静态资源
│   ├── en/             # 默认语言，路由不带 /en 前缀
│   │   ├── _nav.json   # React / Core / Playground / Stative
│   │   ├── index.mdx
│   │   ├── playground.mdx
│   │   ├── fluxdown/
│   │   └── stative/
│   └── zh/             # 相同文档结构，路由前缀为 /zh
├── components/         # 页面组件，index.ts 统一导出
│   └── home/
│       ├── index.tsx
│       ├── index.module.scss
│       ├── consts.ts
│       └── components/ # 子组件按同样方式组织，index.ts 统一导出
├── theme/              # 默认主题扩展，使用 :global 覆盖主题样式
└── rspress.config.ts
```

遵循 [Rspress 目录约定](https://rspress.rs/guide/basic/conventional-route)，组件放在 `docs` 外，避免成为页面。导航使用 [自动生成方式](https://rspress.rs/guide/basic/auto-nav-sidebar)：各语言目录的 `_nav.json` 控制顶部导航，文档目录的 `_meta.json` 控制侧栏顺序和分组。

两种语言保持相同路径，方便右上角的语言菜单切换到对应页面。站点使用 Rspress 的 `localeRedirect: 'auto'`，首次访问匹配浏览器语言；已访问过的浏览器不会再次自动跳转，手动选择后刷新仍保留当前语言。新增页面时同步维护中英文版本。

新增页面时，在 frontmatter 中填写简短的 `title` 和 `description`，再将文件加入对应 `_meta.json`。示例从用户正在解决的问题出发，优先给出可直接使用的最小写法；仅介绍主要能力，完整类型以包导出为准。

组件以目录组织，`index.tsx` 承载组件，`index.module.scss` 使用嵌套样式。工具方法、常量、hooks 和类型按需放在 `utils.ts`、`consts.ts`、`hooks.ts` 和 `type.ts`；子组件放在 `components/` 下，每个 `components/` 目录通过 `index.ts` 的 `export *` 统一导出。

代码沿用仓库的 TypeScript、Oxlint 和 Oxfmt 规则。提交前在 `website` 目录运行 `pnpm check`，并在仓库根目录运行 `pnpm format:check`。

## 静态部署

在 `website` 目录运行 `pnpm build`，发布目录为 `website/doc_build`。站点启用了 [简洁 URL](https://rspress.rs/api/config/config-basic#routecleanurls)：托管服务需将 `/fluxdown/react/quick-start` 映射到对应的 `.html` 文件，并将 `/stative/` 映射到 `stative/index.html`。开启托管平台的 clean URLs，或配置等价的文件重写；不存在的页面应返回 `404.html`，不要将所有路径回退到首页。

如果部署到域名子路径，在 `rspress.config.ts` 中设置对应的 `base`。部署后直接访问并刷新一篇内层文档，确认静态文件映射正确。
