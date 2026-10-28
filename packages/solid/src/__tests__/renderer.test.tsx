import type { SolidRenderMatchParams, SolidRenderParams } from '@fluxdown/solid-plugins/base';
import type { Text } from 'hast';

import { BaseSolidRenderPlugin } from '@fluxdown/solid-plugins/base';
import { render } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { expectTypeOf } from 'vitest';

import type { FluxdownRef } from '../packs/raw';

import { useRender } from '../context';
import { FluxdownRaw } from '../packs/raw';

class TextRenderer extends BaseSolidRenderPlugin {
  static readonly key = 'test-text';

  match({ node }: SolidRenderMatchParams) {
    return node.type === 'text';
  }

  render(props: SolidRenderParams) {
    return <>{(props.node as Text).value}</>;
  }
}

class ParagraphRenderer extends BaseSolidRenderPlugin {
  static readonly key = 'test-paragraph';

  match({ node }: SolidRenderMatchParams) {
    return node.type === 'element' && node.tagName === 'p';
  }

  render(props: SolidRenderParams) {
    return <p>{props.renderChildren()}</p>;
  }
}

describe('Solid renderer', () => {
  test('keeps internal renderer blocks opaque in the public ref', () => {
    expectTypeOf<FluxdownRef['value']['value']>().toEqualTypeOf<unknown[]>();
  });

  test('keeps renderer props reactive without recreating retained elements', () => {
    const [text, setText] = createSignal('first');

    const { container } = render(() => (
      <FluxdownRaw text={text()} plugins={{ renders: [ParagraphRenderer, TextRenderer] }} />
    ));

    const paragraph = container.querySelector('p');

    expect(paragraph?.textContent).toBe('first');

    setText('first appended');

    expect(container.querySelector('p')).toBe(paragraph);

    expect(paragraph?.textContent).toBe('first appended');

    setText('');

    expect(container.textContent).toBe('');
  });

  test('prefers lower priority and the later renderer at equal priority', () => {
    class First extends BaseSolidRenderPlugin {
      static readonly key = 'test-first';

      readonly config = { priority: 0 };

      match() {
        return true;
      }

      render() {
        return <i>first</i>;
      }
    }

    class Last extends BaseSolidRenderPlugin {
      static readonly key = 'test-last';

      readonly config = { priority: 0 };

      match() {
        return true;
      }

      render() {
        return <i>last</i>;
      }
    }

    const { container } = render(() => (
      <FluxdownRaw text="source" plugins={{ renders: [First, Last, ParagraphRenderer] }} />
    ));

    expect(container.textContent).toBe('last');
  });

  test('reports a missing render provider', () => {
    expect(() =>
      render(() => {
        useRender();

        return null;
      }),
    ).toThrow('[Fluxdown] A render context is required.');
  });
});
