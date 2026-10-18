export const COPY = {
  en: {
    label: 'React and React Native',
    caption: 'One Markdown stream, two renderers',
    effect: 'Effect',
    pack: 'Preset',
    sample: 'Content',
    smooth: 'Smooth output',
    streaming: 'Streaming',
    position: 'Received text',
    loading: 'Loading the native preview…',
    error: 'The native preview could not load. Reload the page to try again.',
    effects: {
      none: 'None',
      shad: 'Trailing fade',
      scale: 'Character scale',
      chunk: 'Chunk fade',
      cursor: 'Cursor',
      dot: 'Dot',
      combined: 'Scale + dot',
    },
    samples: {
      paragraph: {
        label: 'Paragraph',
        source:
          'The words arrive. The reading begins.\n\nA good answer is worth reading before its final word. Earlier sentences stay where the reader found them. New words join them at a pace the eye can follow. 中文与 English 自然衔接。',
      },
      formatting: {
        label: 'Markdown',
        source:
          '# A familiar heading\n\nKeep **bold text**, *emphasis*, ~~an old idea~~, and `inline code` readable.\n\n> Give language room to breathe.\n\n- [x] Receive a message\n- [ ] Read the next thought\n\n| Content | State |\n| :--- | ---: |\n| Markdown | Ready |\n| Streaming | Active |',
      },
      code: {
        label: 'Code',
        source:
          'A small component:\n\n```tsx\nexport function Message({ text }) {\n  return <Fluxdown text={text} />;\n}\n```',
      },
      math: {
        label: 'Formulas',
        source: 'Keep math close: $E = mc^2$.\n\n$$\n\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}\n$$',
      },
    },
  },
  zh: {
    label: 'React 与 React Native',
    caption: '同一份 Markdown 流，两种渲染组件',
    effect: '效果',
    pack: '预设',
    sample: '内容',
    smooth: '平滑输出',
    streaming: '流式模式',
    position: '已接收文本',
    loading: '正在加载原生预览…',
    error: '原生预览加载失败，请刷新页面重试。',
    effects: {
      none: '无',
      shad: '末尾渐变',
      scale: '逐字缩放',
      chunk: '分组淡入',
      cursor: '光标',
      dot: '圆点',
      combined: '缩放 + 圆点',
    },
    samples: {
      paragraph: {
        label: '段落',
        source:
          '文字正在到来，阅读已经开始。\n\n一个好答案，不必等到最后一个字才值得阅读。已经读过的句子留在原处，新的内容自然地接在后面，让视线有时间跟上。中文与 English 自然衔接。',
      },
      formatting: {
        label: 'Markdown',
        source:
          '# 熟悉的标题\n\n让 **重点**、*斜体*、~~旧想法~~ 和 `行内代码` 保持清晰。\n\n> 语言有自己的节奏。\n\n- [x] 收到一条消息\n- [ ] 阅读下一段想法\n\n| 内容 | 状态 |\n| :--- | ---: |\n| Markdown | 就绪 |\n| 流式输出 | 进行中 |',
      },
      code: {
        label: '代码',
        source:
          '一个简单的组件：\n\n```tsx\nexport function Message({ text }) {\n  return <Fluxdown text={text} />;\n}\n```',
      },
      math: {
        label: '公式',
        source: '让数学回到文字里：$E = mc^2$。\n\n$$\n\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}\n$$',
      },
    },
  },
};

export const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
