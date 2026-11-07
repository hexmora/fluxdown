export const COPY = {
  zh: {
    staticLabel: '把文字变成人物卡片',
    original: '原文',
    enabled: '人物卡片',
    staticSource: '这份指南由 @Ada 整理，欢迎一起补充。',
    personLabel: '查看 Ada 的资料',
    personRole: '文档维护者',
    personDetail: '负责示例整理与新手指南。',
    streamLabel: '随正文出现的来源标记',
    streamCaption: '来源跟随引用的位置出现',
    streamSource:
      '先把问题拆成几个小步骤，再逐一验证。\n\n这份回答参考了项目手册。来源标记会留在这句话旁边，后面的内容可以继续生成。\n\n读到这里，可以回头点一下标记，查看对应的资料。',
    citationAnchor: '这份回答参考了项目手册。',
    citationLabel: '查看来源 1',
    pending: '等待引用所在的句子',
    ready: '点击 [1] 查看来源',
    referenceTitle: '项目手册 · 示例资料',
    referenceDetail: '先确定要解决的问题，再用一个小例子验证。',
  },
  en: {
    staticLabel: 'Turn text into a profile',
    original: 'Source',
    enabled: 'Profile card',
    staticSource: 'This guide was prepared by @Ada. Contributions are welcome.',
    personLabel: "View Ada's profile",
    personRole: 'Documentation maintainer',
    personDetail: 'Looks after examples and getting-started guides.',
    streamLabel: 'Source markers in a streaming answer',
    streamCaption: 'A source appears beside the sentence it supports',
    streamSource:
      'Break the question into smaller steps and check each one.\n\nThis answer draws on the project handbook. The source marker stays beside this sentence while the rest of the answer continues to arrive.\n\nYou can now click the marker to read the source.',
    citationAnchor: 'This answer draws on the project handbook.',
    citationLabel: 'View source 1',
    pending: 'Waiting for the cited sentence',
    ready: 'Click [1] to read the source',
    referenceTitle: 'Project handbook · Sample source',
    referenceDetail:
      'Start with the problem you want to solve, then check it with a small example.',
  },
};

export const STREAM_TIMING = {
  chunks: [8, 16, 12, 20],
  delays: [320, 480, 360, 600],
};
