# 流式内容

流式接入只需要两个信息：当前已经收到的完整文本，以及内容是否仍在生成。Fluxdown 接管呈现节奏，你可以继续使用熟悉的数据请求方式。

## 传入累积文本

如果请求工具已经返回累积文本，直接使用[快速开始中的 Message](./quick-start.md#接入已有的流式文本)。如果拿到的是一个个片段，先把它们累积起来：

```ts
type TextListener = (text: string) => void;

async function readMarkdown(
  chunks: AsyncIterable<string>,
  onText: TextListener,
) {
  let text = '';

  for await (const chunk of chunks) {
    text += chunk;
    onText(text);
  }
}
```

在你的请求处理函数中调用 `await readMarkdown(chunks, setText)`，把状态 `text` 传给 `Fluxdown`。请求开始时将 `isStreaming` 设为 `true`，并在完成、取消或失败时将其设为 `false`。网络请求的取消与错误提示继续由应用负责。

## 开启流式效果

`streaming={true}` 会同时开启三项能力：

| 选项           | 读者看到的效果                                   |
| -------------- | ------------------------------------------------ |
| `repairEnding` | 正在生成的末尾语法先以可读的形式呈现。           |
| `smooth`       | 一次到达的一大段文本逐步显示，减轻跳动感。       |
| `shad`         | 新出现的末尾文字带有轻微渐变，让出现过程更柔和。 |

也可以分别设置。比如保留语法修复和平滑输出，关闭渐变：

```tsx
<Fluxdown
  streaming={{ repairEnding: true, smooth: true, shad: false }}
  text={text}
/>
```

对象中没有填写的选项默认为 `true`。如果只需要语法修复，可以把另外两项设为 `false`：

```tsx
<Fluxdown
  streaming={{ repairEnding: true, smooth: false, shad: false }}
  text={text}
/>
```

## 调整末尾渐变

```tsx
<Fluxdown
  streaming={{
    shad: { enabled: true, length: 3, maskWidth: 18 },
  }}
  text={text}
/>
```

`length` 是参与渐变的末尾字符数，`maskWidth` 是渐变遮罩的宽度，单位为像素。默认效果通常已足够；只在需要配合字体或整体动效时调整。

## 完成与替换

正常接收时，持续追加到同一个 `text`。开始一条新的回复时，清空文本；在消息列表里，用稳定的消息 ID 作为组件的 `key`，让各条回复拥有独立状态。

生成结束时设为 `streaming={false}`。这会立即显示已收到的完整文本，并停止末尾修复和渐变。语法修复只影响展示，不会改写你保存的原始 Markdown。
