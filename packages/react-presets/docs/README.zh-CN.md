# @fluxdown/react-presets

Fluxdown 的 React DOM 插件包与样式。

[文档](../../../website/docs/zh/guide/react/plugins.md) · [English](../README.md)

直接使用组件时，从 [`fluxdown`](../../react) 开始。需要选择单个插件、替换 DOM slot 或定制主题时使用此包。

`/base` 导出 DOM slot 属性类型、属性映射和共享插件契约；`/plugins/<名称>` 导出包含 render 和 slot 实现的聚合插件包。`/lite` 不含高亮和公式引擎，`/full` 加入 Shiki 与 KaTeX / MathJax；`/styles.css` 提供样式。

共享 render 契约和平台无关插件来自 [`@fluxdown/react-base-presets`](../../react-base-presets)，原生组件使用 [`@fluxdown/react-native-presets`](../../react-native-presets) 中对应的插件包。

完整插件列表与轻量选择见[减少打包体积](../../../website/docs/zh/guide/react/bundle-size.mdx)。
