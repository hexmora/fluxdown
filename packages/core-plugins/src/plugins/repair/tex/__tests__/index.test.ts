import type { InlineMath, Math } from 'mdast-util-math';

import { renderToString } from 'katex';

import { TexRepairPlugin } from '..';
import { PRESET_REPAIR_PLUGINS } from '../../../../presets/repair';
import { processRepairByPlugins } from '../../../../utils';

test('includes TeX validation in the built-in repair preset', () => {
  expect(PRESET_REPAIR_PLUGINS).toContain(TexRepairPlugin);
});

test('repairs with the injected renderer, updates HAST content, and invalidates source', () => {
  const render = jest.fn((source: string) => (source === 'x+1' ? source : null));
  const plugin = new TexRepairPlugin({ render });
  const node: InlineMath = {
    type: 'inlineMath',
    value: 'x+1?',
    data: { repairEnding: true, source: '$x+1?' },
  };

  processRepairByPlugins({ node, plugins: [plugin], ending: true });

  expect(node.value).toBe('x+1');
  expect(node.data?.source).toBeUndefined();
  expect(node.data?.hChildren).toEqual([
    { type: 'text', value: 'x+1', data: { repairEnding: true } },
  ]);
  expect(render).toHaveBeenCalledWith('x+1?', 'inline');
  expect(render).toHaveBeenCalledWith('x+1', 'inline');

  plugin.destroy();
});

test.each([false, true])('leaves final formulas unchanged when ending is %s', (ending) => {
  const render = jest.fn(() => null);
  const plugin = new TexRepairPlugin({ render });
  const node: Math = { type: 'math', value: 'x+1?' };

  processRepairByPlugins({ node, plugins: [plugin], ending });

  expect(node.value).toBe('x+1?');
  expect(render).not.toHaveBeenCalled();

  plugin.destroy();
});

test('does not change unclosed formulas when ending repair is disabled', () => {
  const render = jest.fn(() => null);
  const node: Math = { type: 'math', value: 'x+1?', data: { repairEnding: true } };
  const configured = new TexRepairPlugin({ render });

  processRepairByPlugins({ node, plugins: [configured], ending: false });

  expect(node.value).toBe('x+1?');
  expect(render).not.toHaveBeenCalled();

  configured.destroy();
});

test.each(['inlineMath', 'math'] as const)(
  'uses KaTeX by default to retain the last valid %s prefix',
  (type) => {
    const plugin = new TexRepairPlugin();
    const node: InlineMath | Math = {
      type,
      value: String.raw`x+\frac{1}{`,
      data: { repairEnding: true },
    };

    processRepairByPlugins({ node, plugins: [plugin], ending: true });

    expect(node.value).toBe('x+');

    plugin.destroy();
  },
);

test.each([
  String.raw`x+\frac{1}{\sqrt{y}}`,
  String.raw`\left(\sum_{i=1}^{n}x_i\right)`,
  String.raw`\begin{pmatrix}a&b\\c&d\end{pmatrix}`,
  String.raw`\newcommand{\value}[1]{#1^2}\value{x}`,
])('keeps every default-repaired streaming prefix renderable: %s', (source) => {
  const plugin = new TexRepairPlugin();

  for (let end = 1; end <= source.length; end += 1) {
    const node: InlineMath = {
      type: 'inlineMath',
      value: source.slice(0, end),
      data: { repairEnding: true },
    };

    processRepairByPlugins({ node, plugins: [plugin], ending: true });

    expect(source.startsWith(node.value)).toBe(true);
    expect(() => renderToString(node.value, { throwOnError: true, strict: true })).not.toThrow();

    if (end === source.length) {
      expect(node.value).toBe(source);
    }
  }

  plugin.destroy();
});

test('keeps renderer caches instance-local and releases checkpoints on destruction', () => {
  const render = jest.fn((source: string) => source);
  const plugin = new TexRepairPlugin({ render });
  const node: InlineMath = { type: 'inlineMath', value: 'x', data: { repairEnding: true } };

  processRepairByPlugins({ node, plugins: [plugin], ending: true });
  processRepairByPlugins({ node, plugins: [plugin], ending: true });

  expect(render).toHaveBeenCalledTimes(1);

  plugin.destroy();

  const next = new TexRepairPlugin({ render });

  processRepairByPlugins({ node, plugins: [next], ending: true });

  expect(render).toHaveBeenCalledTimes(2);

  next.destroy();
});
