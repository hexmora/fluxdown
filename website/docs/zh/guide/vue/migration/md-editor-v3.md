# md-editor-v3

把 `MdPreview` 换成 Fluxdown，就可以继续使用原来的 Markdown 数据。`MdEditor` 的编辑、上传和保存功能仍由编辑器负责；这里只迁移阅读区域。

<details className="agent-assistance">
<summary>使用 Agent 协助</summary>
<div className="agent-assistance-content">

把下面这段发给项目中的 Agent：

```markdown
请把项目中 md-editor-v3 的 Markdown 预览迁移到 @fluxdown/vue，直接完成代码修改。

# 参考文档

- 原库：https://imzbf.github.io/md-editor-v3/en-US/api/
- 目标：https://hexmora.github.io/fluxdown/zh/guide/vue/quick-start.html

# 迁移步骤

1. 检查依赖版本，找出 MdPreview、预览样式、目录和自定义解析配置的使用位置。
2. 将预览的 modelValue 改为 Fluxdown 的 text。保留 Markdown 数据流，以及 MdEditor 的编辑、上传和保存逻辑。
3. 根据实际用法迁移主题、代码块、公式和自定义组件。优先使用内置能力，再查阅配置与插件文档；不要直接复制 markdown-it 配置。
4. 如果有流式内容，持续传入累积文本，用请求状态控制 streaming。检查目录锚点与 HTML 的处理，不要假定原来的 DOM 结构仍然存在。
5. 运行项目现有检查，用实际文章核对样式、链接、公式和目录。仅删除已无引用的依赖与样式。

完成后简述修改、验证结果和仍需处理的差异。无法等价迁移的功能请保留原实现并说明原因。
```

</div>
</details>

## 替换预览

安装 Vue 3 版本：

```sh
pnpm add @fluxdown/vue
```

迁移前：

```vue
<script setup lang="ts">
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';

const props = defineProps<{ text: string }>();
</script>

<template>
  <MdPreview :model-value="props.text" />
</template>
```

迁移后：

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue';

const props = defineProps<{ text: string }>();
</script>

<template>
  <Fluxdown :text="props.text" />
</template>
```

浏览器入口会加载样式。使用服务端渲染时，在应用入口引入 `@fluxdown/vue/styles.css`。

## 保留文章里的功能

`theme="dark"` 可以继续使用。`previewTheme`、`codeTheme` 和原有 CSS 选择器需要按 [Fluxdown 主题](../customization.md)调整，不能直接照搬。

完整预设已有代码高亮，Mermaid 代码块由 Pele 渲染，需要核对[图表支持范围](../../react/features/diagrams.mdx)。有公式的文章还需要开启解析：

```vue
<Fluxdown :text="props.text" :build="{ tex: true, footnote: true }" />
```

`markdownItConfig` 中的扩展需要按用途迁移：语法处理用 [Remark 插件](../../core/plugins/remark.mdx)，链接、图片和代码块的组件用 [Slot 插件](../plugins/slot.md)。先核对内置能力，避免重复安装同类插件。

`MdCatalog` 依赖原库的标题与事件，不能直接绑定 Fluxdown。保留编辑区使用的目录；阅读区如需目录，需重新连接标题收集、锚点 ID 和滚动逻辑。自定义 HTML 也应对照[允许的标签与清理规则](../../core/plugins/rehype.mdx)核对。

如果项目仍然使用 `MdEditor` 或 `MdCatalog`，保留 `md-editor-v3` 及它们需要的样式。原组件配置可查阅 [md-editor-v3 文档](https://imzbf.github.io/md-editor-v3/en-US/api/)。
