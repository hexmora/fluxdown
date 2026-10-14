# Rehype 插件

Rehype 插件处理 Markdown 转换后的 HTML 语法树 HAST。适合在渲染之前调整元素属性，或整理 HTML 结构。

## 声明插件

下面把图片说明同时用作悬停时显示的标题：

```sh
pnpm add @fluxdown/core-presets
pnpm add -D @types/hast unified
```

```ts
import type { Root, RootContent } from 'hast';
import type { Plugin } from 'unified';

import { BaseRehypePlugin } from '@fluxdown/core-presets/rehype';

class ImageTitlesPlugin extends BaseRehypePlugin {
  static readonly key = 'rehype-image-titles';

  readonly plugin: Plugin<[], Root> = () => (tree) => {
    function visit(node: Root | RootContent) {
      if (node.type === 'element' && node.tagName === 'img') {
        const { alt, title } = node.properties;

        if (typeof alt === 'string' && !title) {
          node.properties.title = alt;
        }
      }

      if ('children' in node) {
        node.children.forEach(visit);
      }
    }

    visit(tree);
  };
}

const rehypes = [ImageTitlesPlugin];
```

在[快速开始](../quick-start.md)的 Core 输入中加入 `rehypes` 即可。内容块重新编译时，会再次执行这个转换。

> 默认清理器仍会处理输出。插件增加的属性与标签需要在它的 schema 中被允许。

## 允许额外 HTML 标签

嵌入的 HTML 依次经过语法过滤和 HAST 清理。增加一个允许的标签时，需要同时配置这两步。例如允许 `mark`：

```ts
import { toClosure } from 'stative';

const remarks = toClosure<RemarkConfigs>({
  'remark-syntax-html-allowed': {
    enabledTags: ['mark'],
  },
});

const rehypes = toClosure<RehypeConfigs>({
  'rehype-sanitizer': {
    allowedTags: ['mark'],
  },
});
```

`toClosure` 将配置对象转为 Core 的可读输入，将 `remarks` 和 `rehypes` 一起传入即可。这些选项会扩展已有的允许列表；需要额外属性时，可以使用清理器的 `fallback` schema。

### 通过插件类传入参数

也可以用 `[插件类, 参数]` 声明同样的配置。Core 会将参数交给构造函数，并管理插件实例：

```ts
import type { IPluggable, IRehypePlugin, IRemarkPlugin } from '@fluxdown/types';

import { SanitizerRehypePlugin } from '@fluxdown/core-presets/rehype';
import { SyntaxHtmlAllowedRemarkPlugin } from '@fluxdown/core-presets/remark';

type RemarkPlugin = IPluggable<IRemarkPlugin, unknown>;
type RehypePlugin = IPluggable<IRehypePlugin, unknown>;

const remarks: RemarkPlugin[] = [
  [SyntaxHtmlAllowedRemarkPlugin, { enabledTags: ['mark'] }],
];

const rehypes: RehypePlugin[] = [
  [SanitizerRehypePlugin, { allowedTags: ['mark'] }],
];
```

两种写法可以按需要选择：按名称配置适合集中调整内置插件；类元组适合同时注册插件和设置参数。传入类即可，无需手动创建实例。

## 内置插件

Core 默认包含以下插件，无需手动注册。

`PRESET_REHYPE_PLUGINS`，从 `@fluxdown/core-presets/rehype` 导入。

| 插件                    | 作用                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| `RawParserRehypePlugin` | 把允许的原始 HTML 解析为 HAST 节点，与 Markdown 生成的内容一起处理。 |
| `SanitizerRehypePlugin` | 按允许的标签、属性和协议清理 HTML 输出。                             |

这两个步骤共同处理 Markdown 中嵌入的 HTML。扩展允许列表的示例见[允许额外 HTML 标签](#允许额外-html-标签)。
