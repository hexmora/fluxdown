export const COPY = {
  zh: {
    label: '从文本到 React DOM 界面的架构演示',
    caption: '跟着一段新文字，走到浏览器',
    play: '播放过程',
    pause: '暂停',
    next: '下一步',
    reset: '重新开始',
    reduced: '已启用减少动态效果，可点选步骤查看。',
    note: '按步骤展示职责；实际更新由依赖关系驱动，不按动画间隔执行。',
    input: '收到的新文本',
    output: '浏览器中的内容',
    retained: '前一块 · 复用',
    changed: '末尾块 · 更新',
    waiting: '等待下游更新',
    source: '开场已经写好。\n\n接着看 **新的内容',
    original: '开场已经写好。\n\n接着看',
    steps: [
      {
        name: '输入',
        code: 'text',
        title: '新内容进入同一个状态',
        description:
          'React Base 将完整的 text 接到状态。文本更新后，已有状态流继续工作，后面的计算沿着依赖关系收到变化。',
      },
      {
        name: '分块',
        code: 'TextChunker',
        title: '找出哪些段落发生了变化',
        description: '这个例子只追加了末尾段落。前一块内容相同，可以复用；末尾块继续交给编译层。',
      },
      {
        name: '编译',
        code: 'BlockCompiler',
        title: '把 Markdown 变成内容树',
        description:
          '末尾的加粗标记尚未闭合。启用修复后，编译结果已经能展示加粗；输入文本保持原样。',
      },
      {
        name: '映射',
        code: 'MapperComposer',
        title: '决定内容如何逐步出现',
        description:
          '平滑化控制当前可见的范围，特效补充呈现所需的信息。这个步骤示意它们在处理链中的位置。',
      },
      {
        name: '界面',
        code: 'ReactRenderer',
        title: '从共享的 React 层，到浏览器界面',
        description:
          'React Base 的块组件订阅自己的内容，再由浏览器插槽生成页面元素。末尾块显示新文字，前面的段落仍可复用。',
      },
    ],
  },
  en: {
    label: 'Architecture demo: text to a React DOM interface',
    caption: 'Follow new text to the browser',
    play: 'Play the flow',
    pause: 'Pause',
    next: 'Next step',
    reset: 'Start again',
    reduced: 'Reduced motion is on. Select a step to explore.',
    note: 'A guided illustration. Real updates follow dependencies, not the animation intervals.',
    input: 'Incoming text',
    output: 'In the browser',
    retained: 'Earlier block · reused',
    changed: 'Final block · updated',
    waiting: 'Waiting for downstream updates',
    source: 'The opening is ready.\n\nHere comes **something new',
    original: 'The opening is ready.\n\nHere comes',
    steps: [
      {
        name: 'Input',
        code: 'text',
        title: 'New content enters the same state',
        description:
          'React Base connects the full text to state. Text updates keep the existing flow in place, and dependent computations receive the change.',
      },
      {
        name: 'Split',
        code: 'TextChunker',
        title: 'Find the sections that changed',
        description:
          'This example only extends the final paragraph. The earlier section is unchanged and can be reused; the final one moves on to compilation.',
      },
      {
        name: 'Compile',
        code: 'BlockCompiler',
        title: 'Turn Markdown into a content tree',
        description:
          'The final bold marker is still open. With repair enabled, the compiled content can already appear in bold. The input text stays intact.',
      },
      {
        name: 'Map',
        code: 'MapperComposer',
        title: 'Decide how content appears over time',
        description:
          'Smoothing controls the visible range; effects add presentation information. This step shows where they sit in the processing flow.',
      },
      {
        name: 'Render',
        code: 'ReactRenderer',
        title: 'From the shared React layer to the browser',
        description:
          'React Base block components subscribe to their content. Browser slots produce the page elements; the final block updates while the earlier paragraph can be reused.',
      },
    ],
  },
};
