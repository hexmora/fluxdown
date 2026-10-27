# 样式指南

外部布局交给 `style`，内容内部的颜色与排版交给 `theme`。

## 页面布局

`style` 接受 `StyleProp<ViewStyle>`，可以使用普通对象、`StyleSheet.create` 或样式数组：

```tsx
import { Fluxdown } from '@fluxdown/react-native';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  message: { padding: 16, maxWidth: 720 },
});

<Fluxdown style={styles.message} text={text} />;
```

## 浅色与深色

```tsx
import { useColorScheme } from 'react-native';

const theme = useColorScheme() === 'dark' ? 'dark' : 'light';

<Fluxdown theme={theme} text={text} />;
```

## 覆盖主题

主题支持预设名称、局部覆盖，以及 `[预设名称, 局部覆盖]`。尺寸使用 React Native 的数值单位，字体名称使用应用已安装或加载的字体：

```tsx
<Fluxdown
  theme={[
    'dark',
    {
      tokens: {
        colors: { accent: '#82d8cf' },
        typography: { fontSize: { md: 16 } },
        paragraph: { marginBottom: 16 },
      },
    },
  ]}
  text={text}
/>
```

> `Theme`、`ThemeTokens` 与 `PartialThemeConfig` 从 `@fluxdown/react-native-plugins/typings` 导入。

颜色、标题、段落、代码、圆角和间距按组配置；无需复制完整主题。

要替换链接导航、代码工具栏或图片组件，使用 [Slot 插件](./plugins/slot.md)。补丁的 `render` 同样返回 React Native 组件；插入段落中的文字应使用 `Text`。

默认链接通过 React Native `Linking` 打开。应用内路由、脚注定位等交互可以交给自己的 `Link` 插槽，与应用导航保持一致。
