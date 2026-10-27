# 快速开始

React Native 版把 Markdown 渲染成 `Text`、`View` 等原生组件，沿用 React 版的解析、流式修复和插件机制。iOS、Android 与 React Native Web 使用同一份组件代码。

## 安装

```sh
pnpm add @fluxdown/react-native react-native-svg
```

项目需要 React 19 和 React Native 0.83 或更新版本。已有 Expo 或 React Native 项目可以直接接入。

Full 和 Lite 的流式效果使用 `react-native-svg` 15.16 或更新版本，Full 还用它显示公式和图表。Expo 项目用 `npx expo install react-native-svg` 安装，并确认版本满足要求；原生 iOS 项目安装后运行 `pod install`。组件规格见[插件矩阵](./plugins/matrix.mdx)。

## 显示第一段内容

```tsx
import { Fluxdown } from '@fluxdown/react-native';
import { ScrollView } from 'react-native';

const markdown = `# 你好，Fluxdown

让正在生成的内容，也能**轻松阅读**。`;

export default function App() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Fluxdown text={markdown} />
    </ScrollView>
  );
}
```

组件负责内容排版，外层页面负责滚动。放进聊天列表时，直接作为消息内容使用即可。

## 接入流式文本

```tsx
<Fluxdown streaming={isStreaming} text={text} />
```

`text` 始终传入截至目前收到的完整内容。请求结束时，将 `streaming` 设为 `false`。

## 下一步

- [流式内容](./streaming.md)：控制平滑输出与末尾效果。
- [样式指南](./customization.md)：调整原生颜色、字体和布局。
- [插件矩阵](./plugins/matrix.mdx)：选择 Full、Lite 或自己组装。
- [对比 React](./comparison.mdx)：比较 React 和 React Native 的静态与流式表现。
