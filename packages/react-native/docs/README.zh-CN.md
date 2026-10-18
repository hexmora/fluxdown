# Fluxdown for React Native

用于 React Native 应用的流式 Markdown 渲染组件。

`@fluxdown/react-native` 使用原生组件渲染 Markdown，内置基础样式和代码高亮，支持 GFM 表格、任务列表、删除线和自动链接。在内容生成过程中，可以平滑展示新文本、修复尚未完成的语法，并使用逐字缩放、末尾渐变、分组淡入或末尾标记。

[文档](../../../website/docs/zh/guide/react-native/quick-start.md) · [English](../README.md)

## 安装

使用 React Native 0.76 或更高版本，并搭配该版本支持的 React。

在 Expo 应用中安装：

```sh
pnpm add @fluxdown/react-native
npx expo install react-native-svg
```

在裸 React Native 应用中安装：

```sh
pnpm add @fluxdown/react-native react-native-svg
```

iOS 安装后，按应用现有的 CocoaPods 流程安装 pods，再重新构建原生应用。Android 添加原生依赖后也需要重新构建。Fluxdown 要求 `react-native-svg` 15 或更高版本；请根据应用的 React Native 版本，参考 [SVG 兼容表](https://github.com/software-mansion/react-native-svg#supported-react-native-versions)选择兼容的版本。

如果使用 Expo development build，添加原生依赖后也需要重新构建。Expo Go 已内置该原生依赖。

## 渲染消息

```tsx
import { Fluxdown } from "@fluxdown/react-native";

type MessageProps = {
  text: string;

  isStreaming: boolean;
};

export function Message({ text, isStreaming }: MessageProps) {
  return <Fluxdown text={text} streaming={isStreaming} selectable />;
}
```

将**截至目前收到的完整消息**传给 `text`；如果收到的是文本片段，先在请求处理逻辑中累积。请求完成、取消或失败时，将 `isStreaming` 设为 `false`。Fluxdown 会显示全部已收到的文本，并结束流式效果。请求、取消和错误处理由应用负责。

静态 Markdown 使用 `<Fluxdown text={text} />` 即可。在消息列表中，为每个组件使用稳定的消息 ID 作为 `key`。纵向滚动由应用负责，可以沿用消息列表，或将 Fluxdown 放入 `ScrollView`。

## 选择预设

| 入口                                | 组件           | 能力                                                               |
| ----------------------------------- | -------------- | ------------------------------------------------------------------ |
| `@fluxdown/react-native` 或 `/full` | `Fluxdown`     | 原生 Markdown、全部效果、Shiki 高亮和按需加载的 MathJax SVG 公式。 |
| `@fluxdown/react-native/lite`       | `FluxdownLite` | 原生 Markdown 和全部效果；代码和公式显示源码。                     |
| `@fluxdown/react-native/raw`        | `FluxdownRaw`  | 原生根节点和主题；自行传入必填的 `plugins` 列表。                  |

Lite 不加载 Shiki、MathJax 或 SVG，可以不安装 `react-native-svg`。通过 `@fluxdown/react-native-presets/plugins/<名称>` 按需添加能力。完整插件列表和示例见[减少打包体积](../../../website/docs/zh/guide/react-native/bundle-size.md)。

## 按需定制

| 选项         | 用途                                                     |
| ------------ | -------------------------------------------------------- |
| `streaming`  | 启用或配置尾部语法修复、平滑输出和尾部淡入。             |
| `theme`      | 使用浅色或深色预设，或覆盖颜色与语法高亮。               |
| `styles`     | 定制文本、标题、代码块、表格等 Markdown 元素的原生样式。 |
| `build`      | 启用公式、脚注等语法。                                   |
| `plugins`    | 定制解析、渲染、语义化插槽和交互。                       |
| `style`      | 设置根 `View` 的布局和样式，支持注册样式与样式数组。     |
| `selectable` | 启用原生文本选择。                                       |

`streaming={true}` 开启语法修复、平滑输出和默认的 `scale` 效果。通过 `streaming.effect` 选择 `shad`、`scale`、`chunk`、`suffix` 或组合。例如，保留修复和平滑输出，同时关闭视觉效果：

```tsx
<Fluxdown
  text={text}
  streaming={isStreaming && { repairEnding: true, smooth: true, effect: false }}
/>
```

## 文档

- [快速上手](../../../website/docs/zh/guide/react-native/quick-start.md)
- [流式效果与 React Native Web 对比](../../../website/docs/zh/guide/react-native/streaming.mdx)
- [Full、Lite 与 Raw](../../../website/docs/zh/guide/react-native/bundle-size.md)
- [样式定制](../../../website/docs/zh/guide/react-native/customization.md)
- [配置](../../../website/docs/zh/guide/react-native/configuration.md)
- [使用与编写插件](../../../website/docs/zh/guide/react-native/plugins.md)

Web 应用请参阅 [`fluxdown` React 组件](../../react/docs/README.zh-CN.md)。接入其他 React 渲染平台时，请参阅 [`@fluxdown/react-base`](../../react-base)。

## 参与贡献与许可证

贡献指南见 [CONTRIBUTING.md](../../../CONTRIBUTING.md)。本项目采用 [MIT](../../../LICENSE) 许可证。
