# 使用与编写插件

插件包和排序规则与 React 版本相同。修改原生组件和交互，从 slot 开始；需要改变 HAST 节点对应的插槽，再使用 render。解析与流式转换则交给 Core 插件。

## 声明与使用 Slot 插件

下面隐藏代码工具栏并调整容器，同时保留原生高亮、滚动和主题样式：

```tsx
import type { CodeBlockProps } from '@fluxdown/react-native-presets/base';

import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';
import { Fluxdown } from '@fluxdown/react-native';

function CompactCodeBlock({ Raw, style, ...props }: CodeBlockProps) {
  return Raw ? (
    <Raw {...props} showHeader={false} style={[style, { borderRadius: 8 }]} />
  ) : null;
}

class CompactCodeBlockPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'compact-code-block';

  readonly type = 'CodeBlock';

  readonly Component = CompactCodeBlock;
}

const plugins = { slots: [CompactCodeBlockPlugin] };

export function Message({ text }: { text: string }) {
  return <Fluxdown plugins={plugins} text={text} />;
}
```

> 这个例子需要 `pnpm add @fluxdown/react-base-presets @fluxdown/react-native-presets`。

`Raw` 是同一插槽的前一个组件，也可能为 `null`。调用它可以保留原生默认行为，以及链路中已有插件的定制。后面的 slot 插件包裹前面的组件；完全替换插槽时，返回自己的原生组件即可。

可以复用的插件类和插件包，尽量放在渲染函数外。组合插件包与应用 `config` 的方式见[共享插件指南](../react/plugins.md)。

## 选择导入入口

| 入口                                            | 内容                                                                                      |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `@fluxdown/react-base-presets/base`             | 共享的 `BaseSlotPlugin`、`BaseReactRenderPlugin`、`createTypeOfSlot` 和 render 参数类型。 |
| `@fluxdown/react-base-presets/plugins/<名称>`   | 不包含平台组件的单个共享 render 插件。                                                    |
| `@fluxdown/react-native-presets/base`           | 原生 slot 属性类型、主题类型和 `useNativeTheme`。                                         |
| `@fluxdown/react-native-presets/plugins/<名称>` | 组合共享 render 与原生 slot 的插件包。                                                    |
| `@fluxdown/react-native-presets/lite` / `/full` | `PRESET_LIGHT_PLUGINS` / `PRESET_FULL_PLUGINS`。                                          |
| `@fluxdown/core-presets/*`                      | Core 语法、修复、mapper 等内容处理插件。                                                  |

`LinkProps`、`CodeBlockProps`、`StrongProps` 等原生属性类型从 native presets 包导入，不要用 DOM 插槽组件或 Web 属性类型替代。

## 模块化插件包

原生预设采用与 React 相同的聚合插件结构。每个 `plugins/<名称>` 入口导出包含 render 和 slot 实现的插件包。可以把它们加入 Lite，也可以作为 Raw 必填的插件列表。自定义 slot 和 render 插件同样使用 `slots`、`renders` 和 `config` 字段。

```tsx
import { FluxdownLite } from '@fluxdown/react-native/lite';
import { CodeShikiPlugin } from '@fluxdown/react-native-presets/plugins/code-shiki';

const plugins = [CodeShikiPlugin];

<FluxdownLite plugins={plugins} text={text} />;
```

所有插件包及入口见[预设指南](./bundle-size.md)。平台无关的 render 插件来自 `@fluxdown/react-base-presets/plugins/<名称>`；同时需要原生组件时，选择 native 的聚合插件包。

## Render 插件与 getProps

[Render 插件指南](../react/plugins/render.md)介绍了 HAST 节点匹配、优先级与递归渲染。相同的共享 render 插件可以与原生 slot 配合使用。

把 HAST 元素交给插槽时，也要传递映射后的属性。例如，把以“提示：”开头的段落交给引用块插槽：

```tsx
import type {
  ReactRenderMatchParams,
  ReactRenderParams,
} from '@fluxdown/react-base-presets/base';

import {
  BaseReactRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/react-base-presets/base';

const Blockquote = createTypeOfSlot('Blockquote');

const Paragraph = createTypeOfSlot('Paragraph');

export class NoteRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-note';

  readonly config = { priority: -1 };

  match({ node }: ReactRenderMatchParams) {
    if (!isElementWithTag(node, 'p')) {
      return false;
    }

    const first = node.children[0];

    return first?.type === 'text' && first.value.startsWith('提示：');
  }

  render({
    getProps,
    node,
    parents,
    render,
    renderChildren,
  }: ReactRenderParams) {
    if (!isElementWithTag(node, 'p')) {
      return null;
    }

    return (
      <Blockquote
        {...getProps(node)}
        current={node}
        parents={parents}
        render={render}
      >
        <Paragraph current={node} parents={parents} render={render}>
          {renderChildren(node)}
        </Paragraph>
      </Blockquote>
    );
  }
}
```

通过 `plugins={{ renders: [NoteRenderPlugin] }}` 添加这个类。`Paragraph` 插槽在引用块的视图内提供原生文字容器，保留行内排版。映射后的元数据只传给外层插槽，避免重复 native ID。

`getProps()` 映射当前元素，`getProps(element)` 映射指定元素。原生映射把 `id` 转成 `nativeID`，把 `ariaLabel` / `aria-label` 转成 `accessibilityLabel`，并将有效图片尺寸转换为数字 `width` 和 `height`。非元素节点返回空对象，不传递 HTML class、CSS 或 DOM 事件。

`renderChildren` 和 `render` 会为嵌套节点保留相同的映射。普通 slot 接收已经映射好的属性；兜底 `Node` 插槽还会收到 `getProps`，用于自身的节点渲染。

## 原生组件与交互

- **行内内容：** 返回原生 `Text` 或可以放在其中的内容。行内 slot、render 替换和 patch 都遵循这个规则；块级 slot 可以使用 `View`，不要返回 DOM 标签。
- **链接：** 默认插槽通过 React Native `Linking` 打开 HTTP(S)、`mailto:` 和 `tel:` 地址。相对地址需要先解析成允许的绝对地址再传给 `Raw`；应用路由或片段跳转也可以由自己的原生组件处理。只给 `Raw` 加 `onPress`，不会启用原本不支持的地址。
- **代码复制：** 在 CodeBlock 或 CodeHeader 插槽中向 `Raw` 传入 `onCopy`。回调接收 `{ code, language, meta }`，应用自行接入剪贴板；默认工具栏只有在存在该回调时才显示 Copy 操作。
- **HTML：** Core 过滤和清理 HTML，再由原生 slot 处理支持的节点。允许一个标签，不代表自动具备浏览器布局、CSS 或 DOM 事件行为。
- **主题：** 调用 `Raw` 可以保留内置主题处理。完全自定义的组件可以通过 `useNativeTheme` 读取 `colors`、`syntax`、`styles` 和 `selectable`。

Core 插件约定保持一致，语法与内容处理见 [Core 插件](../core/plugins.md)。
