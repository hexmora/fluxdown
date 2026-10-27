import { cleanup, render } from '@testing-library/svelte';
import { afterEach, expect, test, vi } from 'vitest';

import { BaseSlotPlugin, createTypeOfSlot } from '..';
import { ParagraphSlotPlugin } from '../../../plugins/paragraph';
import { createElement } from '../../render';
import { Failing } from './fixtures/failing';
import { Fallback } from './fixtures/fallback';
import { Host } from './fixtures/host';
import { Wrapped } from './fixtures/wrapped';

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

class WrappedPlugin extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'slot-test-wrapped';

  readonly Component = Wrapped;

  readonly type = 'Paragraph';
}

const node = createElement(
  Paragraph,
  {
    current: { type: 'element', tagName: 'p', properties: {}, children: [] },
    parents: [],
    render: () => null,
  },
  'content',
);

afterEach(cleanup);

test('composes Raw in declaration order without leaking internal props', () => {
  const view = render(Host, { plugins: [ParagraphSlotPlugin, WrappedPlugin], node });

  expect(view.container.querySelector('section > p')?.textContent).toBe('content');

  expect(view.container.querySelector('p')?.getAttribute('current')).toBeNull();

  expect(view.container.querySelector('p')?.getAttribute('render')).toBeNull();
});

test('updates per-instance plugins and releases retired instances exactly once', async () => {
  const destroy = vi.fn();

  class RetiredPlugin extends WrappedPlugin {
    destroy() {
      destroy();
    }
  }

  const view = render(Host, { plugins: [ParagraphSlotPlugin, RetiredPlugin], node });

  const sibling = render(Host, { plugins: [ParagraphSlotPlugin], node });

  expect(sibling.container.querySelector('section')).toBeNull();

  await view.rerender({ plugins: [ParagraphSlotPlugin] });

  expect(view.container.querySelector('section')).toBeNull();

  expect(destroy).toHaveBeenCalledTimes(1);

  view.unmount();

  expect(destroy).toHaveBeenCalledTimes(1);
});

test('renders an absent slot as empty content', () => {
  const view = render(Host, { plugins: [], node });

  expect(view.container.textContent).toBe('');
});

test('skips slot plugins without a component instead of hiding earlier layers', () => {
  class EmptyPlugin extends BaseSlotPlugin<'Paragraph'> {
    static readonly key = 'slot-test-empty';

    readonly Component = null;

    readonly type = 'Paragraph';
  }

  const view = render(Host, { plugins: [ParagraphSlotPlugin, EmptyPlugin], node });

  expect(view.container.querySelector('p')?.textContent).toBe('content');
});

test('recovers a failed slot after its input changes', async () => {
  class FailingPlugin extends BaseSlotPlugin<'Paragraph'> {
    static readonly key = 'slot-test-failing';

    readonly Component = Failing;

    readonly type = 'Paragraph';
  }

  class FallbackPlugin extends BaseSlotPlugin<'Fallback'> {
    static readonly key = 'slot-test-fallback';

    readonly Component = Fallback;

    readonly type = 'Fallback';
  }

  const view = render(Host, {
    plugins: [FailingPlugin, FallbackPlugin],
    node: createElement(Paragraph, { ...node.props, title: 'fail' }, 'content'),
  });

  expect(view.container.querySelector('[data-fallback]')?.textContent).toBe('Render failed');

  await view.rerender({
    node: createElement(Paragraph, { ...node.props, title: 'ready' }, 'content'),
  });

  expect(view.container.querySelector('[data-fallback]')).toBeNull();

  expect(view.container.querySelector('p')?.textContent).toBe('content');
});
