export interface StreamingRepairCase {
  name: string;

  source: string;

  forbidden: RegExp;

  completedText: string[];

  completedSelectors: string[];

  math?: boolean;
}

export interface StreamingRepairSnapshot {
  text: string;

  structure: string[];

  math: string[];
}

export const STREAMING_REPAIR_CASES: StreamingRepairCase[] = [
  {
    name: 'ordered markers and task items',
    source: '9. first\n10. next\n\n- [x] done',
    forbidden: /\d$|\[|\]/,
    completedText: ['first', 'next', 'done'],
    completedSelectors: ['ol li', 'input[type="checkbox"]'],
  },
  {
    name: 'strong and links in table cells',
    source: '| Name | Link |\n| --- | --- |\n| **bold** | [go](https://x.test) |',
    forbidden: /\||\*|\[|\]|https:/,
    completedText: ['Name', 'Link', 'bold', 'go'],
    completedSelectors: ['table td strong', 'table td a[href="https://x.test"]'],
  },
  {
    name: 'reference links with a delayed definition',
    source: '[go][id] and [id][]\n\n[id]: https://x.test "title"\n\nend',
    forbidden: /\[|\]|https:|title/,
    completedText: ['go', 'id', 'end'],
    completedSelectors: ['a[href="https://x.test"][title="title"]'],
  },
  {
    name: 'HTML attributes and tag boundaries',
    source: 'A <a href="https://x.test">go</a> Z',
    forbidden: /<|>|href|https:/,
    completedText: ['A', 'go', 'Z'],
    completedSelectors: ['a[href="https://x.test"]'],
  },
  {
    name: 'inline fractions and square roots',
    source: '$x+\\frac{1}{2}+\\sqrt{y}$',
    forbidden: /\\|\$|frac|sqrt/,
    completedText: ['x', 'y'],
    completedSelectors: ['.katex'],
    math: true,
  },
  {
    name: 'math and emphasis inside quoted lists',
    source: '> - **sum** $\\sqrt{x}+\\frac{a}{b}$\n> - end',
    forbidden: /\\|\$|\*|frac|sqrt/,
    completedText: ['sum', 'x', 'end'],
    completedSelectors: ['blockquote li strong', 'blockquote li .katex'],
    math: true,
  },
];

export const getStreamingRepairMath = (root: Element): string[] => {
  return Array.from(
    root.querySelectorAll('annotation[encoding="application/x-tex"]'),
    (node) => node.textContent ?? '',
  );
};

export const getStreamingRepairText = (root: Element): string => {
  const clone = root.cloneNode(true) as Element;

  clone.querySelectorAll('annotation, style, script').forEach((node) => node.remove());

  return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
};

export const checkStreamingRepairFrame = (
  root: Element,
  source: string,
  fixture: StreamingRepairCase,
  previousMath: string[],
): string[] => {
  const text = getStreamingRepairText(root);

  if (fixture.forbidden.test(text)) {
    throw new Error(`${fixture.name}: exposed syntax at ${JSON.stringify(source)}: ${text}`);
  }

  if (root.querySelector('.katex-error, mjx-merror, [data-mjx-error]')) {
    throw new Error(`${fixture.name}: invalid rendered formula at ${JSON.stringify(source)}`);
  }

  const math = getStreamingRepairMath(root);

  for (const [index, previous] of previousMath.entries()) {
    if (previous && !math[index]?.startsWith(previous)) {
      throw new Error(
        `${fixture.name}: formula prefix retreated from ${previous} to ${math[index]}`,
      );
    }
  }

  for (const tex of math) {
    if (tex && !source.includes(tex)) {
      throw new Error(`${fixture.name}: formula no longer matches received source: ${tex}`);
    }
  }

  return math;
};

export const getStreamingRepairSnapshot = (root: Element): StreamingRepairSnapshot => {
  const nodes = root.querySelectorAll(
    'p, h1, h2, blockquote, ul, ol, li, input, table, thead, tbody, tr, th, td, strong, em, a, code, pre',
  );

  return {
    text: getStreamingRepairText(root),
    structure: Array.from(nodes, (node) =>
      [
        node.tagName,
        node.getAttribute('href'),
        node.getAttribute('title'),
        node.getAttribute('start'),
        node.getAttribute('type'),
        node.hasAttribute('checked'),
        getStreamingRepairText(node),
      ].join(':'),
    ),
    math: getStreamingRepairMath(root),
  };
};
