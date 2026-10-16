# Fluxdown 文档站

使用 Rspress 2，提供 Fluxdown、Stative 的中英文指南和可编辑的 Playground。

[在线文档](https://hexmora.github.io/fluxdown/zh/) | [English](https://hexmora.github.io/fluxdown/) | [在线体验](https://hexmora.github.io/fluxdown/zh/playground.html)

## 本地开发

在仓库根目录使用 `.node-version` 指定的 Node.js 和 `package.json` 指定的 pnpm：

```sh
pnpm install --frozen-lockfile
pnpm dev:website
```

开发和生产构建共用 `/fluxdown/` 基础路径，请打开命令输出中的 `/fluxdown/` 地址。从仓库根目录构建、预览：

```sh
pnpm build:website   # 生成 website/doc_build
pnpm preview:website # 预览已构建的站点
```

也可以在 `website` 目录运行 `pnpm dev`、`pnpm build`、`pnpm preview`，或运行 `pnpm check` 完成类型检查、代码检查和生产构建。

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
│   │   ├── guide/
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

Fluxdown 指南放在 `guide/`，避免页面路径与 GitHub Pages 的 `/fluxdown/` 基础路径重名，导致 Rspress 误判链接已包含基础路径。

两种语言保持相同路径，方便右上角的语言菜单切换到对应页面。站点使用 Rspress 的 `localeRedirect: 'auto'`，首次访问匹配浏览器语言；已访问过的浏览器不会再次自动跳转，手动选择后刷新仍保留当前语言。新增页面时同步维护中英文版本。

新增页面时，在 frontmatter 中填写简短的 `title` 和 `description`，再将文件加入对应 `_meta.json`。示例从用户正在解决的问题出发，优先给出可直接使用的最小写法；仅介绍主要能力，完整类型以包导出为准。

组件以目录组织，`index.tsx` 承载组件，`index.module.scss` 使用嵌套样式。工具方法、常量、hooks 和类型按需放在 `utils.ts`、`consts.ts`、`hooks.ts` 和 `type.ts`；子组件放在 `components/` 下，每个 `components/` 目录通过 `index.ts` 的 `export *` 统一导出。

代码沿用仓库的 TypeScript、Oxlint 和 Oxfmt 规则。提交前在 `website` 目录运行 `pnpm check`，并在仓库根目录运行 `pnpm format:check`。

## 静态部署

站点部署到 GitHub Pages，固定地址为 <https://hexmora.github.io/fluxdown/>，中文入口为 <https://hexmora.github.io/fluxdown/zh/>。Rspress 生成完整的静态站点，发布目录为 `website/doc_build`；`rspress.config.ts` 中的 `base: '/fluxdown/'` 与仓库的 Pages 路径保持一致。站点使用 `cleanUrls: false`，文档和 Playground 链接保留 `.html` 后缀，GitHub Pages 可以直接提供页面，无需配置 URL 重写。

[`deploy-website.yml`](../.github/workflows/deploy-website.yml) 负责构建和部署：

- 每次推送到 `main` 都重新构建并部署，不按文件路径筛选，库源码、配置和文档的变更都会触发。
- Pull Request 只构建并验证站点，不部署到公开地址。
- 可在 Actions 页面手动运行工作流（`workflow_dispatch`）；选择 `main` 才会部署。

仓库的 **Settings → Pages → Build and deployment → Source** 使用 **GitHub Actions**。`github-pages` 环境的部署分支限制为 `main`，与工作流的部署条件保持一致。

首次上线需要先将工作流合并到 `main`；该次推送完成部署后，公开地址才会提供页面。后续部署可在 Actions 和 `github-pages` 环境查看状态。发布后检查英文、中文首页与 Playground，并直接访问和刷新一篇内层文档，确认静态资源和路由正常。
