import type { Element, Nodes } from 'hast';

import { render, waitFor } from '@testing-library/react';

import type { ReactRenderParams } from '../../../../../../../react-base-plugins/src/base';

import { TexMathjaxKatexSlotPlugin } from '../../..';
import { ApplyRepairsRemarkPlugin } from '../../../../../../../core-plugins/src/plugins/remark/apply-repairs';
import { SyntaxMathRemarkPlugin } from '../../../../../../../core-plugins/src/plugins/remark/syntax-math';
import { PRESET_REHYPE_PLUGINS } from '../../../../../../../core-plugins/src/presets/rehype';
import { PRESET_REPAIR_PLUGINS } from '../../../../../../../core-plugins/src/presets/repair';
import { MarkdownCompiler } from '../../../../../../../core/src/states/hast/block-compiler/exports';
import { SlotProvider } from '../../../../../../../react-base-plugins/src/base';
import { TexRenderPlugin } from '../../../../../../../react-base-plugins/src/plugins/tex/render/tex';
import { getTex } from '../../../../../../../react-base-plugins/src/plugins/tex/render/tex/utils';

const findMath = (node: Nodes): Element | undefined => {
  if (
    node.type === 'element' &&
    ['inline-math', 'block-math'].includes(String(node.properties.dataType))
  ) {
    return node;
  }

  return 'children' in node ? node.children.map(findMath).find(Boolean) : undefined;
};

const buildTree = (source: string) =>
  MarkdownCompiler.build({
    text: source,
    remarks: [
      new SyntaxMathRemarkPlugin(),
      new ApplyRepairsRemarkPlugin({
        plugins: PRESET_REPAIR_PLUGINS.map((Plugin) => new Plugin()),
        ending: true,
      }),
    ],
    rehypes: PRESET_REHYPE_PLUGINS.map((Plugin) => new Plugin()),
  });

const buildMath = (source: string): Element => {
  const tree = buildTree(source);

  const node = findMath(tree);

  if (!node) {
    throw new Error('The actual Markdown pipeline did not produce a formula.');
  }

  return node;
};

const renderMath = (source: string) => {
  const node = buildMath(source);
  const plugin = new TexRenderPlugin();
  const result = plugin.render({
    node,
    parents: [],
    getProps: () => ({}),
    render: () => null,
  } as unknown as ReactRenderParams);

  return <SlotProvider plugins={[TexMathjaxKatexSlotPlugin]}>{result}</SlotProvider>;
};

test.each(['$\\alpha ', '$x+\\sinh ', '$$\n\\alpha\n'])(
  'preserves a control-word boundary through Markdown, raw HTML, and slot extraction: %s',
  (source) => {
    const node = buildMath(source);
    const tex = getTex({ node, parents: [] });

    expect(tex).toMatch(/\\(?:alpha|sinh)[ \n]$/);
    expect(node.children.some((child) => child.data?.repairEnding === true)).toBe(true);
  },
);

test('renders a confirmed control word as soon as its space arrives, before the dollar closer', async () => {
  const view = render(renderMath('$\\alpha'));

  expect(view.container.textContent).not.toContain('alpha');

  view.rerender(renderMath('$\\alpha '));

  await waitFor(
    () => {
      expect(view.container.querySelector('.katex, mjx-container')).not.toBeNull();
      expect(view.container.querySelector('[data-tex]')?.getAttribute('data-tex')).toBe('\\alpha ');
    },
    { timeout: 10_000 },
  );

  view.rerender(renderMath('$\\alpha x$'));

  expect(view.container.querySelector('[data-tex]')?.getAttribute('data-tex')).toBe('\\alpha x');
  expect(view.container.querySelector('.katex, mjx-container')).not.toBeNull();
}, 15_000);

test.each([String.raw`$x\notin A$`, String.raw`$x\in A$`])(
  'keeps rendered math present at every embedded-control-word prefix: %s',
  async (source) => {
    const view = render(renderMath(source.slice(0, 2)));

    for (let length = 2; length <= source.length; length += 1) {
      view.rerender(renderMath(source.slice(0, length)));

      // eslint-disable-next-line no-await-in-loop -- Observe each prefix before providing the next.
      await waitFor(() => {
        expect(view.container.querySelector('.katex')).not.toBeNull();

        expect(view.container.querySelector('mjx-container')).toBeNull();

        expect(view.container.querySelector('[data-formula-error="true"]')).toBeNull();
      });
    }

    expect(view.container.querySelector('[data-tex]')?.getAttribute('data-tex')).toBe(
      source.slice(1, -1),
    );
  },
);

test.each(['$x+1$2。', '$ x+1$。', '$x+1 $。'])(
  'does not pass a rejected closer or its following prose to the TeX renderer: %s',
  (source) => {
    const rejectedAt = source.indexOf('$', 1) + (source.includes('$2') ? 2 : 1);

    for (let length = rejectedAt; length <= source.length; length += 1) {
      expect(findMath(buildTree(source.slice(0, length)))).toBeUndefined();
    }
  },
);

test('renders chemistry arrow paths at the first valid prefix and after closing Markdown', async () => {
  const source = String.raw`$\ce{H2 + O2 -> H2O}`;

  const view = render(renderMath(source));

  await waitFor(
    () => {
      expect(view.container.querySelector('mjx-container path[data-c="E429"]')).not.toBeNull();
    },
    { timeout: 10_000 },
  );

  expect(view.container.querySelector('svg text')).toBeNull();

  expect(view.container.querySelector('[data-tex]')?.getAttribute('data-tex')).toBe(
    source.slice(1),
  );

  view.rerender(renderMath(source + '$'));

  await waitFor(() => {
    expect(view.container.querySelector('mjx-container path[data-c="E429"]')).not.toBeNull();
  });

  expect(view.container.querySelector('svg text')).toBeNull();

  expect(view.container.querySelector('[data-formula-error="true"]')).toBeNull();
}, 15_000);

test.each(['$u+1$$', '$u+1$$v', '$u+1$$v-', '$u+1$$v-1', '$u+1$$v-1$'])(
  'keeps the first adjacent dollar formula on KaTeX: %s',
  async (source) => {
    expect(getTex({ node: buildMath(source), parents: [] })).toBe('u+1');

    const view = render(renderMath(source));

    await waitFor(() => {
      expect(view.container.querySelector('.katex')).not.toBeNull();

      expect(view.container.querySelector('mjx-container')).toBeNull();

      expect(view.container.querySelector('[data-tex]')?.getAttribute('data-tex')).toBe('u+1');
    });
  },
);

test.each([
  ['before $$F=ma$', 'F=ma', 'F=ma'],
  ['before $$W=Fd\\cos\\theta$', 'W=Fd\\cos', 'W=Fd\\cos\\theta'],
  ['$$\n\\alpha\n$', '\\alpha\n', '\\alpha'],
])(
  'keeps a partial double-dollar closer out of the rendered formula: %s',
  async (source, pendingTex, closedTex) => {
    const view = render(renderMath(source));

    await waitFor(() => {
      expect(view.container.querySelector('.katex')).not.toBeNull();

      expect(view.container.querySelector('mjx-container')).toBeNull();

      expect(view.container.querySelector('[data-tex]')?.getAttribute('data-tex')).toBe(pendingTex);
    });

    view.rerender(renderMath(source + '$'));

    await waitFor(() => {
      expect(view.container.querySelector('.katex')).not.toBeNull();

      expect(view.container.querySelector('mjx-container')).toBeNull();

      expect(view.container.querySelector('[data-tex]')?.getAttribute('data-tex')).toBe(closedTex);
    });
  },
);
