import { isSuffixNode, SUFFIX_DATA_ATTR } from '@fluxdown/core-presets/plugins/mapper/suffix';
import { SanitizerRehypePlugin } from '@fluxdown/core-presets/plugins/rehype/sanitizer';
import { SyntaxHtmlAllowedRemarkPlugin } from '@fluxdown/core-presets/plugins/remark/syntax-html-allowed';
import {
  BaseReactRenderPlugin,
  type ReactRenderMatchParams,
  type ReactRenderParams,
} from '@fluxdown/react-presets/base';
import { act, cleanup, render, waitFor } from '@testing-library/react';

import { Fluxdown, type IPluginItem } from '../packs/full';
import { createManualDriver, createStepInterpolator } from './utils/smooth';

afterEach(async () => {
  cleanup();
  await act(async () => {});
});

const selector = '[data-fluxdown-suffix]';

class CustomSuffix extends BaseReactRenderPlugin {
  static readonly key = 'custom-suffix-test';

  readonly config = { priority: -1 };

  match({ node }: ReactRenderMatchParams) {
    return isSuffixNode(node) && node.properties[SUFFIX_DATA_ATTR] === 'custom';
  }

  render({ node, parents }: ReactRenderParams) {
    return isSuffixNode(node) ? (
      <span
        data-custom-suffix={node.properties[SUFFIX_DATA_ATTR]}
        data-code-context={parents.some(
          (parent) => 'tagName' in parent && parent.tagName === 'code',
        )}
      >
        ✦
      </span>
    ) : null;
  }
}

describe('Fluxdown suffix streaming', () => {
  test.each([
    ['paragraph', 'text', 'p'],
    ['strong', '**text**', 'p'],
    ['inline code', '`text`', 'p'],
    ['heading', '## text', 'h2'],
    ['list item', '- text', 'li'],
    ['code block', '```text\nconst text = 1;\n```', 'pre code'],
  ])('places one marker at the end of a %s', (_name, text, parent) => {
    const view = render(<Fluxdown streaming={{ smooth: false, effect: 'suffix' }} text={text} />);
    const marker = view.container.querySelector(selector);

    expect(marker).toHaveAttribute('data-fluxdown-suffix', 'cursor');
    expect(marker?.parentElement).toBe(view.container.querySelector(parent));
    expect(marker?.nextSibling).toBeNull();
    expect(view.container.querySelectorAll(selector)).toHaveLength(1);
    expect(marker).toHaveAttribute('aria-hidden', 'true');
  });

  test('moves to the last block, changes type live, and removes the marker when streaming stops', () => {
    const view = render(<Fluxdown streaming={{ smooth: false, effect: 'suffix' }} text="first" />);
    const first = view.container.querySelector('p');

    view.rerender(
      <Fluxdown
        streaming={{ smooth: false, effect: ['suffix', { type: 'dot' }] }}
        text={'first\n\nsecond'}
      />,
    );

    expect(view.container.querySelector('p')).toBe(first);
    expect(first?.querySelector(selector)).toBeNull();
    expect(view.container.querySelector(selector)).toHaveAttribute('data-fluxdown-suffix', 'dot');
    expect(view.container.querySelector(selector)?.parentElement?.textContent).toBe('second');

    view.rerender(<Fluxdown streaming={false} text={'first\n\nsecond'} />);
    expect(view.container.querySelector(selector)).toBeNull();
  });

  test('follows the visible Smooth endpoint through text and fenced code', () => {
    const driver = createManualDriver();
    const smooth = {
      enabled: true,
      driver: driver.Driver,
      interpolation: createStepInterpolator(2),
    };
    const view = render(<Fluxdown streaming={{ smooth, effect: 'suffix' }} text="first" />);

    view.rerender(
      <Fluxdown
        streaming={{ smooth, effect: 'suffix' }}
        text={'first\n\n```text\nconst x = 1;\n```'}
      />,
    );
    expect(view.container.querySelector(selector)?.parentElement?.tagName).toBe('P');

    act(() => driver.current().tick(16));
    expect(view.container.querySelector(selector)?.parentElement?.tagName).toBe('CODE');
    expect(view.container.querySelector('code')?.textContent).toBe('co');
    expect(view.container.querySelectorAll(selector)).toHaveLength(1);

    act(() => driver.current().tick(32));
    expect(view.container.querySelector('code')?.textContent).toBe('cons');
    expect(view.container.querySelectorAll(selector)).toHaveLength(1);
  });

  test.each(['suffix-first', 'suffix-last'] as const)(
    'composes with other effects in %s order',
    (order) => {
      const effects =
        order === 'suffix-first'
          ? (['suffix', 'shad', 'scale'] as const)
          : (['scale', 'shad', 'suffix'] as const);
      const view = render(
        <Fluxdown streaming={{ smooth: false, effect: [...effects] }} text="a" />,
      );
      view.rerender(<Fluxdown streaming={{ smooth: false, effect: [...effects] }} text="abc" />);

      expect(view.container.textContent).toBe('abc');
      expect(view.container.querySelectorAll(selector)).toHaveLength(1);
      expect(view.container.querySelector(selector)?.parentElement?.tagName).toBe('P');
    },
  );

  test.each([
    ['chunk', 'suffix', false],
    ['suffix', 'chunk', false],
    ['chunk', 'suffix', true],
    ['suffix', 'chunk', true],
  ] as const)('composes %s → %s with Smooth=%s', (first, second, smoothing) => {
    const driver = createManualDriver();
    const smooth = smoothing
      ? { enabled: true, driver: driver.Driver, interpolation: createStepInterpolator(2) }
      : false;
    const effect = [first, second];
    const view = render(<Fluxdown streaming={{ smooth, effect }} text="first" />);

    view.rerender(<Fluxdown streaming={{ smooth, effect }} text={'first\n\n**second**'} />);
    if (smoothing) {
      act(() => driver.current().tick(16));
    }

    expect(view.container.querySelector('[data-fluxdown-chunk]')).toHaveTextContent(
      smoothing ? 'se' : 'second',
    );
    expect(view.container.querySelectorAll(selector)).toHaveLength(1);
    expect(view.container.querySelector(selector)?.parentElement?.tagName).toBe('P');
    expect(
      view.container.querySelector('[data-fluxdown-chunk]')?.querySelector(selector),
    ).toBeNull();

    // Stop with content still queued in Smooth: full text must be visible, and
    // neither a cursor nor an unfinished opacity wrapper may survive.
    view.rerender(<Fluxdown streaming={false} text={'first\n\n**second**'} />);
    expect(view.container.textContent).toBe('firstsecond');
    expect(view.container.querySelector(selector)).toBeNull();
    expect(view.container.querySelector('[data-fluxdown-chunk]')).toBeNull();

    view.rerender(<Fluxdown streaming={{ smooth, effect }} text={'```text\nx = 1;\n```'} />);
    expect(view.container.querySelector('code')).toHaveTextContent('x = 1;');
    expect(view.container.querySelector(selector)?.parentElement?.tagName).toBe('CODE');
    expect(view.container.querySelector('code')?.querySelector('[data-fluxdown-chunk]')).toBeNull();

    view.rerender(<Fluxdown streaming={{ smooth, effect }} text="" />);
    expect(view.container.querySelector(selector)).toBeNull();
    expect(view.container.querySelector('[data-fluxdown-chunk]')).toBeNull();
  });

  test.each(['paragraph', 'code'])(
    'hides unknown %s suffixes by default and exposes them to custom plugins',
    (kind) => {
      const text = kind === 'code' ? '```text\nconst x = 1;\n```' : 'hello';
      const streaming = {
        smooth: false,
        effect: ['suffix', { type: 'custom' }] as ['suffix', { type: string }],
      };
      const view = render(<Fluxdown streaming={streaming} text={text} />);
      expect(view.container.querySelector(selector)).toBeNull();
      expect(view.container.querySelector('[data-custom-suffix]')).toBeNull();

      view.rerender(
        <Fluxdown plugins={{ renders: [CustomSuffix] }} streaming={streaming} text={text} />,
      );
      expect(view.container.querySelector('[data-custom-suffix]')).toHaveTextContent('✦');
      expect(view.container.querySelector('[data-custom-suffix]')).toHaveAttribute(
        'data-code-context',
        String(kind === 'code'),
      );
      expect(view.container.querySelector('[data-custom-suffix]')?.parentElement?.tagName).toBe(
        kind === 'code' ? 'CODE' : 'P',
      );
    },
  );

  test('preserves the suffix after asynchronous syntax highlighting without changing copied code', async () => {
    const view = render(
      <Fluxdown
        streaming={{ smooth: false, effect: ['suffix', { type: 'dot' }] }}
        text={'```js\nconst answer = 42;\n```'}
      />,
    );
    const code = view.container.querySelector('pre code');

    await waitFor(() => expect(code?.querySelector('span[style]')).not.toBeNull());
    expect(code?.textContent).toBe('const answer = 42;');
    expect(code?.lastElementChild).toHaveAttribute('data-fluxdown-suffix', 'dot');
    expect(view.container.querySelectorAll(selector)).toHaveLength(1);
  });

  test('keeps a suffix inside allowed HTML blocks across streamed block updates', () => {
    const plugins: IPluginItem = {
      remarks: [[SyntaxHtmlAllowedRemarkPlugin, { enabledTags: ['section'] }]],
      rehypes: [[SanitizerRehypePlugin, { allowedTags: ['section'] }]],
    };
    const streaming = { smooth: false, effect: 'suffix' as const };
    const view = render(
      <Fluxdown plugins={plugins} streaming={streaming} text="<section>first</section>" />,
    );
    expect(view.container.querySelector(selector)?.parentElement?.tagName).toBe('SECTION');
    view.rerender(
      <Fluxdown
        plugins={plugins}
        streaming={streaming}
        text={'<section>first</section>\n\n<section>last</section>'}
      />,
    );
    expect(view.container.querySelectorAll(selector)).toHaveLength(1);
    expect(view.container.querySelector(selector)?.parentElement?.tagName).toBe('SECTION');
    expect(view.container.querySelector(selector)?.parentElement?.textContent).toBe('last');
    expect(view.container.querySelector('section')?.querySelector(selector)).toBeNull();
  });

  test('leaves empty documents empty', () => {
    const view = render(<Fluxdown streaming={{ effect: 'suffix' }} text="" />);
    expect(view.container.querySelector(selector)).toBeNull();
  });
});
