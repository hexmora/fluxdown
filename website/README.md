# Fluxdown 文档站

包含 React、React Native、Core 和 Stative 的中英文指南。Playground 使用 Web 组件；原生预览使用仓库内的 [React Native Storybook](../CONTRIBUTING.md#react-native)。

[文档站](https://hexmora.github.io/fluxdown/zh/) | [Playground](https://hexmora.github.io/fluxdown/zh/playground.html)

先在仓库根目录运行 `pnpm install --frozen-lockfile`，再进入 `website/` 执行：

```sh
pnpm dev     # 本地开发
pnpm build   # 构建静态站点
pnpm preview # 预览构建结果
pnpm check   # 类型检查、代码检查和构建
```

`main` 更新后自动部署到 GitHub Pages。

新增指南时，同时更新对应语言的导航和目录，并检查首页与快速上手入口。构建后可在仓库根目录运行 `pnpm exec tsx scripts/check-website.ts` 检查静态页面和本地链接。
