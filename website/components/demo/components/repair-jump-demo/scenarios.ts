import type { JumpScenario } from './type';

export const SCENARIOS: JumpScenario[] = [
  {
    test: {
      id: 'demo-mixed',
      category: '混合文档',
      source:
        '## rocket 🚀 ready\n\n- [ ] review [docs](https://example.test?a=1)\n\n> **Note**\n\n| Key | Value | Note |\n|:--|--:|:--:|\n| rocket 🚀 ready | `a * b` | \\| literal |',
      segments: [
        {
          raw: '## ',
          kind: 'syntax',
        },
        {
          raw: 'rocket 🚀 ready',
          kind: 'content',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: '- [ ] ',
          kind: 'syntax',
        },
        {
          raw: 'review ',
          kind: 'content',
        },
        {
          raw: '[',
          kind: 'syntax',
        },
        {
          raw: 'docs',
          kind: 'content',
        },
        {
          raw: '](https://example.test?a=1)',
          kind: 'syntax',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: '> ',
          kind: 'syntax',
        },
        {
          raw: '**',
          kind: 'syntax',
        },
        {
          raw: 'Note',
          kind: 'content',
        },
        {
          raw: '**',
          kind: 'syntax',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: '| ',
          kind: 'syntax',
        },
        {
          raw: 'Key',
          kind: 'content',
        },
        {
          raw: ' | ',
          kind: 'syntax',
        },
        {
          raw: 'Value',
          kind: 'content',
        },
        {
          raw: ' | ',
          kind: 'syntax',
        },
        {
          raw: 'Note',
          kind: 'content',
        },
        {
          raw: ' |\n|:--|--:|:--:|\n| ',
          kind: 'syntax',
        },
        {
          raw: 'rocket 🚀 ready',
          kind: 'content',
        },
        {
          raw: ' | `',
          kind: 'syntax',
        },
        {
          raw: 'a * b',
          kind: 'content',
        },
        {
          raw: '` | ',
          kind: 'syntax',
        },
        {
          raw: '\\|',
          kind: 'encoded',
          text: '|',
        },
        {
          raw: ' literal',
          kind: 'content',
        },
        {
          raw: ' |',
          kind: 'syntax',
        },
      ],
    },
    label: {
      zh: '综合示例',
      en: 'Mixed document',
    },
  },
  {
    test: {
      id: 'demo-inline',
      category: '嵌套行内',
      source:
        'Lead **café🚀** tail\n\nLead *中文状态* tail\n\nLead ~~alpha~~ tail\n\nLead `café🚀` tail\n\nLead **A *alpha* Z** tail',
      segments: [
        {
          raw: 'Lead ',
          kind: 'content',
        },
        {
          raw: '**',
          kind: 'syntax',
        },
        {
          raw: 'café🚀',
          kind: 'content',
        },
        {
          raw: '**',
          kind: 'syntax',
        },
        {
          raw: ' tail',
          kind: 'content',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: 'Lead ',
          kind: 'content',
        },
        {
          raw: '*',
          kind: 'syntax',
        },
        {
          raw: '中文状态',
          kind: 'content',
        },
        {
          raw: '*',
          kind: 'syntax',
        },
        {
          raw: ' tail',
          kind: 'content',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: 'Lead ',
          kind: 'content',
        },
        {
          raw: '~~',
          kind: 'syntax',
        },
        {
          raw: 'alpha',
          kind: 'content',
        },
        {
          raw: '~~',
          kind: 'syntax',
        },
        {
          raw: ' tail',
          kind: 'content',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: 'Lead ',
          kind: 'content',
        },
        {
          raw: '`',
          kind: 'syntax',
        },
        {
          raw: 'café🚀',
          kind: 'content',
        },
        {
          raw: '`',
          kind: 'syntax',
        },
        {
          raw: ' tail',
          kind: 'content',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: 'Lead ',
          kind: 'content',
        },
        {
          raw: '**',
          kind: 'syntax',
        },
        {
          raw: 'A ',
          kind: 'content',
        },
        {
          raw: '*',
          kind: 'syntax',
        },
        {
          raw: 'alpha',
          kind: 'content',
        },
        {
          raw: '*',
          kind: 'syntax',
        },
        {
          raw: ' Z',
          kind: 'content',
        },
        {
          raw: '**',
          kind: 'syntax',
        },
        {
          raw: ' tail',
          kind: 'content',
        },
      ],
    },
    label: {
      zh: '行内样式',
      en: 'Inline styles',
    },
  },
  {
    test: {
      id: 'demo-lists',
      category: '列表与任务',
      source:
        '1. ***item***\n1. next\n\n- [ ] alpha beta\n- [ ] next task\n\n- parent\n  - [X] rocket 🚀 ready\n\n- [x] 中文内容测试\n- [ ] next task',
      segments: [
        {
          raw: '1. ',
          kind: 'syntax',
        },
        {
          raw: '***',
          kind: 'syntax',
        },
        {
          raw: 'item',
          kind: 'content',
        },
        {
          raw: '***',
          kind: 'syntax',
        },
        {
          raw: '\n',
          kind: 'content',
        },
        {
          raw: '1. ',
          kind: 'syntax',
        },
        {
          raw: 'next',
          kind: 'content',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: '- [ ] ',
          kind: 'syntax',
        },
        {
          raw: 'alpha beta',
          kind: 'content',
        },
        {
          raw: '\n',
          kind: 'content',
        },
        {
          raw: '- [ ] ',
          kind: 'syntax',
        },
        {
          raw: 'next task',
          kind: 'content',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: '- ',
          kind: 'syntax',
        },
        {
          raw: 'parent',
          kind: 'content',
        },
        {
          raw: '\n',
          kind: 'content',
        },
        {
          raw: '  - [X] ',
          kind: 'syntax',
        },
        {
          raw: 'rocket 🚀 ready',
          kind: 'content',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: '- [x] ',
          kind: 'syntax',
        },
        {
          raw: '中文内容测试',
          kind: 'content',
        },
        {
          raw: '\n',
          kind: 'content',
        },
        {
          raw: '- [ ] ',
          kind: 'syntax',
        },
        {
          raw: 'next task',
          kind: 'content',
        },
      ],
    },
    label: {
      zh: '列表与任务',
      en: 'Lists & tasks',
    },
  },
  {
    test: {
      id: 'demo-headings',
      category: '标题与引用',
      source:
        '## alpha beta\n\n> ### rocket 🚀 ready\n> \n> ***detail***\n\n> café naïve\n> **continued**\n\n> > *alpha beta*',
      segments: [
        {
          raw: '## ',
          kind: 'syntax',
        },
        {
          raw: 'alpha beta',
          kind: 'content',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: '> ',
          kind: 'syntax',
        },
        {
          raw: '### ',
          kind: 'syntax',
        },
        {
          raw: 'rocket 🚀 ready',
          kind: 'content',
        },
        {
          raw: '\n',
          kind: 'content',
        },
        {
          raw: '> ',
          kind: 'syntax',
        },
        {
          raw: '\n',
          kind: 'content',
        },
        {
          raw: '> ',
          kind: 'syntax',
        },
        {
          raw: '***',
          kind: 'syntax',
        },
        {
          raw: 'detail',
          kind: 'content',
        },
        {
          raw: '***',
          kind: 'syntax',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: '> ',
          kind: 'syntax',
        },
        {
          raw: 'café naïve',
          kind: 'content',
        },
        {
          raw: '\n',
          kind: 'content',
        },
        {
          raw: '> ',
          kind: 'syntax',
        },
        {
          raw: '**',
          kind: 'syntax',
        },
        {
          raw: 'continued',
          kind: 'content',
        },
        {
          raw: '**',
          kind: 'syntax',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: '> ',
          kind: 'syntax',
        },
        {
          raw: '> ',
          kind: 'syntax',
        },
        {
          raw: '*',
          kind: 'syntax',
        },
        {
          raw: 'alpha beta',
          kind: 'content',
        },
        {
          raw: '*',
          kind: 'syntax',
        },
      ],
    },
    label: {
      zh: '标题与引用',
      en: 'Headings & quotes',
    },
  },
  {
    test: {
      id: 'demo-code',
      category: '围栏代码',
      source:
        '```text\nalpha beta\n| literal |\n**not bold**\n[link](raw)\n```\n\n`````json\n{"text":"rocket 🚀 ready","literal":"***"}\n```\n`````',
      segments: [
        {
          raw: '```text\n',
          kind: 'syntax',
        },
        {
          raw: 'alpha beta\n| literal |\n**not bold**\n[link](raw)',
          kind: 'content',
        },
        {
          raw: '\n```',
          kind: 'syntax',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: '`````json\n',
          kind: 'syntax',
        },
        {
          raw: '{"text":"rocket 🚀 ready","literal":"***"}\n```\n',
          kind: 'content',
        },
        {
          raw: '`````',
          kind: 'syntax',
        },
      ],
    },
    label: {
      zh: '代码围栏',
      en: 'Fenced code',
    },
  },
  {
    test: {
      id: 'demo-links',
      category: '链接与图片',
      source:
        'Open [rocket 🚀 ready](https://docs.example.test/guide?a=1&b=2#part).\n\n[outer [inner] naïve café](https://example.test/x)\n\n![rocket 🚀 ready](/demo-mark.svg "caption")',
      segments: [
        {
          raw: 'Open ',
          kind: 'content',
        },
        {
          raw: '[',
          kind: 'syntax',
        },
        {
          raw: 'rocket 🚀 ready',
          kind: 'content',
        },
        {
          raw: '](https://docs.example.test/guide?a=1&b=2#part)',
          kind: 'syntax',
        },
        {
          raw: '.',
          kind: 'content',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: '[',
          kind: 'syntax',
        },
        {
          raw: 'outer [inner] naïve café',
          kind: 'content',
        },
        {
          raw: '](https://example.test/x)',
          kind: 'syntax',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: '![',
          kind: 'syntax',
        },
        {
          raw: 'rocket 🚀 ready',
          kind: 'content',
        },
        {
          raw: '](/demo-mark.svg "caption")',
          kind: 'syntax',
        },
      ],
    },
    label: {
      zh: '链接与图片',
      en: 'Links & images',
    },
  },
  {
    test: {
      id: 'demo-tables',
      category: '表格',
      source:
        '| Key | Value | Note |\n|:--|--:|:--:|\n| rocket 🚀 ready | `a * b` | \\| literal |\n\n> > | Key | Value | Note |\n> > |:--|--:|:--:|\n> > | 状态已验证 | `a * b` | \\| literal |',
      segments: [
        {
          raw: '| ',
          kind: 'syntax',
        },
        {
          raw: 'Key',
          kind: 'content',
        },
        {
          raw: ' | ',
          kind: 'syntax',
        },
        {
          raw: 'Value',
          kind: 'content',
        },
        {
          raw: ' | ',
          kind: 'syntax',
        },
        {
          raw: 'Note',
          kind: 'content',
        },
        {
          raw: ' |\n|:--|--:|:--:|\n| ',
          kind: 'syntax',
        },
        {
          raw: 'rocket 🚀 ready',
          kind: 'content',
        },
        {
          raw: ' | `',
          kind: 'syntax',
        },
        {
          raw: 'a * b',
          kind: 'content',
        },
        {
          raw: '` | ',
          kind: 'syntax',
        },
        {
          raw: '\\|',
          kind: 'encoded',
          text: '|',
        },
        {
          raw: ' literal',
          kind: 'content',
        },
        {
          raw: ' |',
          kind: 'syntax',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: '> ',
          kind: 'syntax',
        },
        {
          raw: '> ',
          kind: 'syntax',
        },
        {
          raw: '| ',
          kind: 'syntax',
        },
        {
          raw: 'Key',
          kind: 'content',
        },
        {
          raw: ' | ',
          kind: 'syntax',
        },
        {
          raw: 'Value',
          kind: 'content',
        },
        {
          raw: ' | ',
          kind: 'syntax',
        },
        {
          raw: 'Note',
          kind: 'content',
        },
        {
          raw: ' |',
          kind: 'syntax',
        },
        {
          raw: '\n',
          kind: 'content',
        },
        {
          raw: '> ',
          kind: 'syntax',
        },
        {
          raw: '> ',
          kind: 'syntax',
        },
        {
          raw: '|:--|--:|:--:|',
          kind: 'syntax',
        },
        {
          raw: '\n',
          kind: 'content',
        },
        {
          raw: '> ',
          kind: 'syntax',
        },
        {
          raw: '> ',
          kind: 'syntax',
        },
        {
          raw: '| ',
          kind: 'syntax',
        },
        {
          raw: '状态已验证',
          kind: 'content',
        },
        {
          raw: ' | `',
          kind: 'syntax',
        },
        {
          raw: 'a * b',
          kind: 'content',
        },
        {
          raw: '` | ',
          kind: 'syntax',
        },
        {
          raw: '\\|',
          kind: 'encoded',
          text: '|',
        },
        {
          raw: ' literal',
          kind: 'content',
        },
        {
          raw: ' |',
          kind: 'syntax',
        },
      ],
    },
    label: {
      zh: '表格',
      en: 'Tables',
    },
  },
  {
    test: {
      id: 'demo-escaped',
      category: '转义与实体',
      source:
        'Before &CounterClockwiseContourIntegral; after\n\nprefix &#124; literal text\n\nprefix &#42; literal text\n\n[not a link] words',
      segments: [
        {
          raw: 'Before ',
          kind: 'content',
        },
        {
          raw: '&CounterClockwiseContourIntegral;',
          kind: 'encoded',
          text: '∳',
        },
        {
          raw: ' after',
          kind: 'content',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: 'prefix ',
          kind: 'content',
        },
        {
          raw: '&#124;',
          kind: 'encoded',
          text: '|',
        },
        {
          raw: ' literal text',
          kind: 'content',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: 'prefix ',
          kind: 'content',
        },
        {
          raw: '&#42;',
          kind: 'encoded',
          text: '*',
        },
        {
          raw: ' literal text',
          kind: 'content',
        },
        {
          raw: '\n\n',
          kind: 'content',
        },
        {
          raw: '[not a link] words',
          kind: 'content',
        },
      ],
    },
    label: {
      zh: '转义与实体',
      en: 'Escapes & entities',
    },
  },
];
