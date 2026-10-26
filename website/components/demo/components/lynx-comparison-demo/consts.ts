import type { Theme } from 'fluxdown';

export const COPY = {
  zh: {
    title: '对比 React',
    static: '静态内容',
    streaming: '流式内容',
    effect: '动画效果',
    error: 'Lynx 预览加载失败，请刷新页面重试。',
    source: `# 让文字自然展开

从同一份 Markdown 开始，让文字在 React 和 Lynx 里保持熟悉的阅读节奏。

## 每一段，都有自己的位置

这里有 **重点**、*斜体*、~~旧想法~~，还有行内代码 \`streaming\`。

> 内容正在到来，阅读已经开始。

- 标题与段落保持清楚的层次。
- 列表让细节一目了然。
  - 层层展开，结构依然清晰。
- [x] 支持静态与流式内容
- [ ] 加入自己的样式

### 一点代码

\`\`\`typescript
const message = '你好，Fluxdown';
console.log(message);
\`\`\`

| 内容 | 状态 |
| :--- | :--- |
| 静态渲染 | 就绪 |
| 平滑输出 | 就绪 |

**现在，让下一个想法继续展开。**`,
  },
  en: {
    title: 'Compare with React',
    static: 'Static content',
    streaming: 'Streaming content',
    effect: 'Animation effect',
    error: 'The Lynx preview could not load. Refresh the page to try again.',
    source: `# Give words room to unfold

Start with the same Markdown and keep a familiar reading rhythm in React and Lynx.

## A place for every paragraph

Add **emphasis**, *a quieter note*, ~~an old idea~~, or inline code like \`streaming\`.

> The words arrive. The reading begins.

- Keep headings and paragraphs easy to follow.
- Make the details clear with a list.
  - Let the structure unfold, one level at a time.
- [x] Display static and streaming content
- [ ] Make the style your own

### A little code

\`\`\`typescript
const message = 'Hello, Fluxdown';
console.log(message);
\`\`\`

| Content | Status |
| :--- | :--- |
| Static rendering | Ready |
| Smooth streaming | Ready |

**Let the next idea unfold.**`,
  },
};

export const EFFECTS = ['scale', 'shad', 'chunk', 'suffix'] as const;

export const THEMES = {
  light: ['light', { tokens: { colors: { bg: 'transparent' } } }],
  dark: ['dark', { tokens: { colors: { bg: 'transparent' } } }],
} satisfies Record<'light' | 'dark', Theme>;
