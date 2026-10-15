import type { Element } from 'hast';

import { render, screen, waitFor } from '@testing-library/react-native';

import { NativeThemeProvider } from '../../../base';
import { TexRenderer } from '../renderer';
import { getSvg } from '../renderer/components/mathjax-tex/utils';

const current: Element = { type: 'element', tagName: 'span', properties: {}, children: [] };

const nodeProps = { Raw: null, current, parents: [], render: () => null };

describe('native math rendering', () => {
  test('loads a native SVG with only React Native navigator metadata', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { product: 'ReactNative' },
    });

    try {
      const view = render(
        <NativeThemeProvider theme="dark">
          <TexRenderer {...nodeProps} tex="x^2" testID="equation" />
        </NativeThemeProvider>,
      );

      await waitFor(() => expect(screen.getByRole('image', { name: 'x^2' })).toBeOnTheScreen(), {
        timeout: 10_000,
      });

      expect(globalThis.navigator).toMatchObject({
        product: 'ReactNative',
        appVersion: '',
        userAgent: '',
      });

      const formula = screen.getByTestId('equation');

      expect(formula.props.width).toBeGreaterThan(0);

      expect(formula.props.height).toBeGreaterThan(0);

      expect(formula.props.color).toBe('#ececf1');

      expect(view.toJSON()).toMatchObject({
        type: 'View',
        props: {
          collapsable: false,
          style: { width: formula.props.width, height: formula.props.height },
        },
      });
    } finally {
      if (descriptor) {
        Object.defineProperty(globalThis, 'navigator', descriptor);
      }
    }
  }, 15_000);

  test('keeps invalid TeX readable', async () => {
    render(<TexRenderer {...nodeProps} tex={'\\notARealCommand{x}'} />);

    await waitFor(() => expect(screen.getByText('\\notARealCommand{x}')).toBeOnTheScreen());

    expect(screen.queryByRole('image')).toBeNull();
  });

  test('extracts MathJax SVG dimensions and rejects missing or invalid SVG', () => {
    expect(
      getSvg('<mjx-container><svg width="2ex" height="3.5ex"><g /></svg></mjx-container>'),
    ).toEqual({ xml: '<svg width="2ex" height="3.5ex"><g /></svg>', width: 16, height: 28 });

    expect(getSvg(null)).toBeNull();

    expect(getSvg('<svg width="0ex" height="1ex"></svg>')).toBeNull();

    expect(getSvg('<svg width="NaNex" height="1ex"></svg>')).toBeNull();
  });
});
