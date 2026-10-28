import { render } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';

import TexKatexRenderer from '../renderer/components/katex-tex';

describe('KaTeX renderer', () => {
  test('reacts to formula and display mode changes and falls back for invalid TeX', () => {
    const [tex, setTex] = createSignal('x^2');

    const [mode, setMode] = createSignal<'inline' | 'display'>('inline');

    const wrapper = render(() => {
      return (
        <TexKatexRenderer
          Raw={null}
          tex={tex()}
          mode={mode()}
          current={{ type: 'text', value: '' }}
          parents={[]}
          render={() => null}
        />
      );
    });

    expect(wrapper.container.firstElementChild?.tagName).toBe('SPAN');

    expect(wrapper.container.querySelector('.katex')).not.toBeNull();

    setTex(String.raw`\frac{a}{b}`);

    expect(wrapper.container.querySelector('[data-tex]')?.getAttribute('data-tex')).toBe(
      String.raw`\frac{a}{b}`,
    );

    setMode('display');

    expect(wrapper.container.firstElementChild?.tagName).toBe('DIV');

    expect(wrapper.container.querySelector('.katex-display')).not.toBeNull();

    setTex(String.raw`\definitelyUnknown`);

    expect(wrapper.container.querySelector('.katex')).toBeNull();

    expect(wrapper.container.textContent).toContain(String.raw`\definitelyUnknown`);

    wrapper.unmount();
  });
});
