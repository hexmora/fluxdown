# Fluxdown 文档站

包含 React、React Native、Core 和 Stative 的中英文指南。Playground 使用 Web 组件；[原生流式指南](./docs/zh/guide/react-native/streaming.mdx)通过 React Native Web 并排展示 React 与原生组件，支持 Full/Lite/Raw、四种 effect、代码和公式。设备预览使用仓库内的 [React Native Storybook](../CONTRIBUTING.md#react-native)。

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

原生浏览器预览在挂载后按需加载。Rspack 将 `react-native` 映射到 `react-native-web`，优先解析 `.web` 效果实现，并让所有 workspace 组件共享文档站的 React，保持静态预渲染与现有页面一致。
