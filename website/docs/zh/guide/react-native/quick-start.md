# 快速开始

在 React Native 应用中使用 Fluxdown，传入 Markdown 就可以开始渲染。常用语法、代码高亮和原生基础样式已经准备好。组件使用原生视图和文字，不要求使用 Expo。

## 安装

### Expo

```sh
pnpm add @fluxdown/react-native
npx expo install react-native-svg
```

Expo Go 已包含 SVG 的原生实现，`expo install` 会为当前 SDK 选择匹配的包版本。如果使用开发构建，加入原生依赖后需要重新构建应用。详见 [Expo SVG 指南](https://docs.expo.dev/versions/latest/sdk/svg/)。

### 不使用 Expo 的 React Native 项目

```sh
pnpm add @fluxdown/react-native react-native-svg
```

iOS 项目还需要按照项目现有方式安装 CocoaPods 依赖，例如：

```sh
cd ios
bundle exec pod install
```

安装原生依赖后重新构建 iOS 或 Android 应用。选择与项目 React Native 版本兼容的 `react-native-svg`，具体见[安装指南](https://github.com/software-mansion/react-native-svg#installation)和[兼容性表格](https://github.com/software-mansion/react-native-svg#supported-react-native-versions)。

> Fluxdown 的 peer 范围为 React `^18.2.0 || ^19.0.0`、React Native `>=0.76.0` 和 react-native-svg `>=15.0.0`。请使用当前 React Native 版本要求的 React，并在这些范围内选择兼容的 SVG 版本。

## 显示第一段内容

```tsx
import { Fluxdown } from '@fluxdown/react-native';
import { ScrollView } from 'react-native';

const markdown = `# 你好，Fluxdown

让正在生成的内容，也能**轻松阅读**。`;

export default function App() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Fluxdown text={markdown} />
    </ScrollView>
  );
}
```

Fluxdown 不创建纵向滚动容器。把它放进应用的 `ScrollView`、消息列表或其他布局中，由应用控制滚动。原生样式已经包含在内，无需导入 CSS。

## 接入已有的流式文本

如果请求工具已经提供了累积文本，直接把它传给 `text`，并用请求状态控制 `streaming`：

```tsx
import { Fluxdown } from '@fluxdown/react-native';

type MessageProps = {
  text: string;

  isStreaming: boolean;
};

export function Message({ text, isStreaming }: MessageProps) {
  return <Fluxdown streaming={isStreaming} text={text} />;
}
```

`text` 始终是当前收到的完整内容。在应用中累积片段，不要只传最新片段。请求完成后把 `streaming` 设为 `false`，即可显示完整结果并结束流式效果。

[流式内容](../react/streaming.md)里的文本累积和结束流式模式的方式同样适用，只需从 `@fluxdown/react-native` 导入组件。原生末尾效果使用文字透明度，没有 Web 的 `maskWidth` 配置。

## 下一步

- [样式指南](./customization.md)：配合应用的颜色、字体和布局。
- [自定义配置](./configuration.md)：查看共享属性与原生选项。
- [使用与编写插件](./plugins.md)：定制原生组件和交互。
