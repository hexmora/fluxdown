export const INSTALL_COMMAND = 'pnpm install fluxdown';

export const UPCOMING_FRAMEWORKS = ['Svelte'];

export const COPY = {
  zh: {
    description: '为 AI 流式输出而生的 Markdown 渲染器。',
    qualities: '高性能，高度可定制，跨平台，开箱即用。',
    install: '复制安装命令',
    featuresTitle: '从第一段文字，到完整体验。',
    featuresDescription: '平滑每一段输出，照顾尚未闭合的语法。',
    features: [
      {
        title: '更少重复，更快呈现',
        description:
          '以内容块为单位缓存解析结果，复用稳定的部分，把计算留给正在变化的内容。长回答也能从容展开。',
        link: '了解分块与更新',
        path: '/guide/core/streaming',
      },
      {
        title: '熟悉的 Markdown',
        description:
          '支持 GFM 表格、任务列表、删除线与自动链接。写下你熟悉的语法，得到读者期待的样子。',
        link: '查看 Markdown 支持',
        path: '/guide/react/customization',
      },
      {
        title: '能力，按需组合',
        description:
          '从解析到呈现，以插件组合能力。接入 remark、rehype 生态，也可以为自己的内容写一个小插件。',
        link: '探索插件体系',
        path: '/guide/react/plugins',
      },
      {
        title: '做成你的风格',
        description:
          '用语义化插槽、HTML 渲染与主题调整外观，继续定制平滑算法和动效。每个细节，都可以贴合你的产品。',
        link: '开始定制',
        path: '/guide/react/customization',
      },
      {
        title: '不被框架限制',
        description:
          '框架无关的 Core 管理解析与响应式更新。直接构建自己的渲染方式，或从开箱即用的 React、React Native、Lynx 与 Vue 组件开始。',
        link: '认识 Fluxdown Core',
        path: '/guide/core/quick-start',
      },
      {
        title: '不止于文字',
        description:
          '公式渲染、代码高亮、HTML 过滤与链接安全检查，一起照顾真实内容。公式与高亮按需加载，减轻首次加载的负担。',
        link: '浏览预设能力',
        path: '/guide/react/plugins',
      },
    ],
    quickTitle: '几行代码，就能开始。',
    quickDescription: '把收到的文字交给 Fluxdown。以下以 React 版组件为例。',
    codeComment: '// text 是截至目前收到的完整消息',
    quickLink: '阅读接入指南',
    organizationsTitle: '他们也在用',
    organizationsNote: '你的组织也在使用 Fluxdown？',
    organizationsLink: '联系维护者，加入这里。',
    architectureTitle: '一个核心，更多可能。',
    architectureDescription: '从响应式状态到流畅的界面，每一层都专注自己的工作。',
    foundation: '响应式状态与组合',
    core: '框架无关的 Markdown 引擎',
    react: '开箱即用',
    soon: '即将推出',
    finalTitle: '让下一个答案，自然展开。',
    finalButton: '开始使用 Fluxdown',
    footer: '一切皆响应式。',
  },
  en: {
    description: 'A Markdown renderer built for AI streaming.',
    qualities: 'Fast, customizable, cross-platform. Ready to go.',
    install: 'Copy install command',
    featuresTitle: 'From the first word to the whole experience.',
    featuresDescription: 'Smooth each arrival. Keep unfinished Markdown readable.',
    features: [
      {
        title: 'Less work. More flow.',
        description:
          'Block-level caching reuses stable content and focuses processing on what is changing. Give long answers room to grow.',
        link: 'Explore blocks and updates',
        path: '/guide/core/streaming',
      },
      {
        title: 'Markdown you know',
        description:
          'GFM tables, task lists, strikethrough, and autolinks. Write familiar syntax and get the result your readers expect.',
        link: 'See Markdown support',
        path: '/guide/react/customization',
      },
      {
        title: 'Compose what you need',
        description:
          'Plugins connect every stage, from parsing to presentation. Bring in remark and rehype, or write a small plugin of your own.',
        link: 'Explore the plugin system',
        path: '/guide/react/plugins',
      },
      {
        title: 'Make it yours',
        description:
          'Shape the experience with semantic slots, HTML rendering, themes, smoothing algorithms, and animations. Let every detail fit your product.',
        link: 'Start customizing',
        path: '/guide/react/customization',
      },
      {
        title: 'Free to choose a framework',
        description:
          'A framework-independent Core handles parsing and reactive updates. Build your own renderer, or get started with the ready-made React, React Native, Lynx and Vue components.',
        link: 'Meet Fluxdown Core',
        path: '/guide/core/quick-start',
      },
      {
        title: 'Beyond plain text',
        description:
          'Math, code highlighting, HTML filtering, and link safety checks take care of real content. Math and highlighting load on demand to keep the initial load small.',
        link: 'Explore built-in plugins',
        path: '/guide/react/plugins',
      },
    ],
    quickTitle: 'A few lines. A good beginning.',
    quickDescription:
      'Give Fluxdown the words as they arrive. This example uses the React component.',
    codeComment: '// text is the full message received so far',
    quickLink: 'Read the quick start',
    organizationsTitle: 'In good company',
    organizationsNote: 'Using Fluxdown at your organization?',
    organizationsLink: 'Get in touch to add your logo.',
    architectureTitle: 'One core. More possibilities.',
    architectureDescription:
      'From reactive state to a fluid interface, each layer has a clear purpose.',
    foundation: 'Reactive state and composition',
    core: 'A framework-independent Markdown engine',
    react: 'Ready to use',
    soon: 'Coming soon',
    finalTitle: 'Give your next answer room to unfold.',
    finalButton: 'Get started with Fluxdown',
    footer: 'Everything is reactive.',
  },
};
