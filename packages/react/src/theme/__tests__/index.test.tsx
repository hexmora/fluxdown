import { PREFIX } from '@fluxdown/react-presets/base';
import { render, renderHook } from '@testing-library/react';
import { expectTypeOf } from 'expect-type';
import { createRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type { FluxdownRef, PartialThemeConfig, Theme, ThemeConfig } from '../..';

import { useThemeStyles } from '..';
import { Fluxdown } from '../..';
import { PRESET_THEME_MAP } from '../presets';
import { mapTokensToStyles, resolveTheme } from '../utils';

const token = (name: string) => `--${PREFIX}-${name}`;

const presentationMarkdown = 'Inline `code` and a note[^note].\n\n---\n\n[^note]: Details.';

describe('themes', () => {
  test('accepts strict deep partial configurations and mutable preset tuples', () => {
    const partial = {
      tokens: { heading: { h1: { fontSize: '2.25rem' } } },
    } satisfies PartialThemeConfig;
    const tuple = ['dark', partial] satisfies Theme;

    expectTypeOf<ThemeConfig>().toExtend<Theme>();
    expectTypeOf<typeof tuple>().toExtend<['dark', PartialThemeConfig]>();
    expectTypeOf<{ tokens: { typo: string } }>().not.toExtend<PartialThemeConfig>();
    expectTypeOf<{
      tokens: { typography: { fontWeight: { normal: string; medium: string; bold: string } } };
    }>().toExtend<PartialThemeConfig>();
    expectTypeOf<{
      tokens: { inlineCode: { paddingInline: number } };
    }>().not.toExtend<PartialThemeConfig>();
    expectTypeOf<{
      tokens: { heading: { h1: { fontWeight: string } } };
    }>().not.toExtend<PartialThemeConfig>();
    expect(resolveTheme(tuple).tokens.heading.h1.fontSize).toBe('2.25rem');
  });

  test('merges individual leaves into light without modifying either preset or input', () => {
    const before = structuredClone(PRESET_THEME_MAP);
    const overrides = { tokens: { heading: { h2: { fontWeight: 800 } } } };
    const resolved = resolveTheme(overrides);

    expect(resolved.tokens.heading.h2).toEqual({
      ...PRESET_THEME_MAP.light.tokens.heading.h2,
      fontWeight: 800,
    });
    expect(resolved.tokens.colors).toEqual(PRESET_THEME_MAP.light.tokens.colors);
    expect(PRESET_THEME_MAP).toEqual(before);
    expect(overrides).toEqual({ tokens: { heading: { h2: { fontWeight: 800 } } } });
    resolved.tokens.heading.h1.fontSize = '10rem';
    expect(PRESET_THEME_MAP).toEqual(before);
  });

  test('merges tuple overrides into dark and keeps omitted siblings', () => {
    const resolved = resolveTheme(['dark', { tokens: { colors: { accent: '#c4b5fd' } } }]);

    expect(resolved.tokens.colors).toEqual({
      ...PRESET_THEME_MAP.dark.tokens.colors,
      accent: '#c4b5fd',
    });
    expect(resolveTheme().tokens).toEqual(PRESET_THEME_MAP.light.tokens);
  });

  test('uses the SCSS prefix and converts nested numeric leaves to CSS tokens', () => {
    const styles = mapTokensToStyles(PRESET_THEME_MAP.light.tokens);

    expect(PREFIX).toBe('fluxdown');
    expect(styles).toMatchObject({
      [token('heading-h1-font-weight')]: '650',
      [token('heading-h1-line-height')]: '1.25',
      [token('typography-font-size-md')]: '1rem',
    });
    expect(Object.keys(styles).every((key) => key.startsWith(`--${PREFIX}-`))).toBe(true);
  });

  test('reuses the style object across equivalent inline configs and unrelated streaming renders', () => {
    const first: Theme = { tokens: { heading: { h1: { fontSize: '3rem' } } } };
    const { result, rerender } = renderHook(
      ({ theme }: { theme: Theme }) => useThemeStyles(theme),
      {
        initialProps: { theme: first as Theme },
      },
    );
    const styles = result.current;

    rerender({ theme: structuredClone(first) });
    expect(result.current).toBe(styles);

    rerender({ theme: 'dark' });
    expect(result.current).not.toBe(styles);
    expect(result.current).toMatchObject({ [token('colors-bg')]: '#212121' });
  });

  test('updates tokens without remounting blocks or rebuilding the core', () => {
    const ref = createRef<FluxdownRef>();
    const view = render(<Fluxdown ref={ref} text="# Heading" />);
    const root = view.container.firstElementChild as HTMLElement;
    const heading = root.firstElementChild;
    const core = ref.current;

    expect(root.style.getPropertyValue(token('colors-bg'))).toBe('#ffffff');
    view.rerender(
      <Fluxdown
        ref={ref}
        text="# Heading"
        theme={['dark', { tokens: { heading: { h1: { fontSize: '3rem' } } } }]}
      />,
    );
    expect(root.style.getPropertyValue(token('colors-bg'))).toBe('#212121');
    expect(root.style.getPropertyValue(token('heading-h1-font-size'))).toBe('3rem');
    expect(root.firstElementChild).toBe(heading);
    expect(ref.current).toBe(core);

    view.rerender(<Fluxdown ref={ref} text="# Heading" theme="light" />);
    expect(root.style.getPropertyValue(token('heading-h1-font-size'))).toBe('2rem');
  });

  test('isolates themes per root and preserves consumer styles', () => {
    const view = render(
      <>
        <Fluxdown style={{ color: 'red' }} text="Light" />
        <Fluxdown text="Dark" theme="dark" />
      </>,
    );
    const [light, dark] = Array.from(view.container.children) as HTMLElement[];

    expect(light.style.color).toBe('red');
    expect(light.style.getPropertyValue(token('colors-bg'))).toBe('#ffffff');
    expect(dark.style.getPropertyValue(token('colors-bg'))).toBe('#212121');
  });

  test('includes preset tokens during server rendering', () => {
    const markup = renderToStaticMarkup(<Fluxdown text="# Server" theme="dark" />);

    expect(markup).toContain(`${token('colors-bg')}:#212121`);
    expect(markup).toContain(`${token('heading-h1-font-size')}:2rem`);
  });

  test.each(['light', 'dark'] as const)(
    'keeps presentation tokens connected to %s colors and shared spacing',
    (preset) => {
      const ref = createRef<FluxdownRef>();
      const view = render(
        <Fluxdown
          ref={ref}
          build={{ footnote: true }}
          text={presentationMarkdown}
          theme={preset}
        />,
      );
      const root = view.container.firstElementChild as HTMLElement;
      const code = root.querySelector('code');
      const core = ref.current;

      expect(code).toHaveTextContent('code');
      expect(root.querySelector('hr')).not.toBeNull();
      expect(root.querySelector('.footnotes')).toHaveTextContent('Details.');
      expect(root.style.getPropertyValue(token('colors-border'))).toBe(
        PRESET_THEME_MAP[preset].tokens.colors.border,
      );
      expect(root.style.getPropertyValue(token('colors-surface-muted'))).toBe(
        PRESET_THEME_MAP[preset].tokens.colors.surfaceMuted,
      );
      expect(root.style.getPropertyValue(token('inline-code-padding-block'))).toBe('0.15em');
      expect(root.style.getPropertyValue(token('inline-code-padding-inline'))).toBe('0.35em');
      expect(root.style.getPropertyValue(token('divider-height'))).toBe('1px');

      view.rerender(
        <Fluxdown
          ref={ref}
          build={{ footnote: true }}
          text={presentationMarkdown}
          theme={[
            preset,
            {
              tokens: {
                colors: { border: '#123456', surfaceMuted: '#234567', fgMuted: '#345678' },
                spacing: { xl: '3rem', lg: '2rem' },
              },
            },
          ]}
        />,
      );

      expect(root.style.getPropertyValue(token('colors-border'))).toBe('#123456');
      expect(root.style.getPropertyValue(token('colors-surface-muted'))).toBe('#234567');
      expect(root.style.getPropertyValue(token('colors-fg-muted'))).toBe('#345678');
      expect(root.style.getPropertyValue(token('spacing-xl'))).toBe('3rem');
      expect(root.style.getPropertyValue(token('spacing-lg'))).toBe('2rem');
      expect(root.style.getPropertyValue(token('inline-code-background'))).toBe(
        `var(${token('colors-surface-muted')})`,
      );
      expect(root.style.getPropertyValue(token('divider-margin-block'))).toBe(
        `var(${token('spacing-xl')})`,
      );
      expect(root.style.getPropertyValue(token('footnotes-padding-top'))).toBe(
        `var(${token('spacing-lg')})`,
      );
      expect(root.style.getPropertyValue(token('footnotes-color'))).toBe(
        `var(${token('colors-fg-muted')})`,
      );
      expect(root.querySelector('code')).toBe(code);
      expect(ref.current).toBe(core);
    },
  );

  test('keeps the end border when only the divider border is customized', () => {
    const view = render(
      <Fluxdown text="---" theme={{ tokens: { divider: { border: '2px solid red' } } }} />,
    );
    const root = view.container.firstElementChild as HTMLElement;

    expect(root.querySelector('hr')).not.toBeNull();
    expect(root.style.getPropertyValue(token('divider-border'))).toBe('2px solid red');
    expect(root.style.getPropertyValue(token('divider-border-block-end'))).toBe(
      `var(${token('divider-border')})`,
    );
  });

  test('isolates local presentation and host font-weight overrides from omitted defaults', () => {
    const before = structuredClone(PRESET_THEME_MAP);
    const overrides = {
      tokens: {
        typography: { fontWeight: { normal: 'var(--host-font-weight)' }, fontSmoothing: 'auto' },
        inlineCode: { paddingInline: '6px', border: '0' },
        divider: { marginBlock: '0', borderBlockEnd: '1px solid currentColor' },
        footnotes: { borderTop: '0', color: 'inherit' },
      },
    } satisfies PartialThemeConfig;
    const original = structuredClone(overrides);
    const view = render(
      <>
        <Fluxdown
          build={{ footnote: true }}
          text={presentationMarkdown}
          theme={['dark', overrides]}
        />
        <Fluxdown build={{ footnote: true }} text={presentationMarkdown} />
      </>,
    );
    const [custom, defaults] = Array.from(view.container.children) as HTMLElement[];

    expect(custom.style.getPropertyValue(token('typography-font-weight-normal'))).toBe(
      'var(--host-font-weight)',
    );
    expect(custom.style.getPropertyValue(token('typography-font-smoothing'))).toBe('auto');
    expect(custom.style.getPropertyValue(token('typography-font-weight-medium'))).toBe('600');
    expect(custom.style.getPropertyValue(token('typography-font-weight-bold'))).toBe('650');
    expect(custom.style.getPropertyValue(token('inline-code-padding-inline'))).toBe('6px');
    expect(custom.style.getPropertyValue(token('inline-code-border'))).toBe('0');
    expect(custom.style.getPropertyValue(token('divider-margin-block'))).toBe('0');
    expect(custom.style.getPropertyValue(token('divider-border-block-end'))).toBe(
      '1px solid currentColor',
    );
    expect(custom.style.getPropertyValue(token('footnotes-border-top'))).toBe('0');
    expect(custom.style.getPropertyValue(token('footnotes-color'))).toBe('inherit');
    expect(custom.style.getPropertyValue(token('inline-code-padding-block'))).toBe('0.15em');
    expect(custom.style.getPropertyValue(token('footnotes-padding-top'))).toBe(
      `var(${token('spacing-lg')})`,
    );
    expect(custom.style.getPropertyValue(token('colors-bg'))).toBe('#212121');
    expect(defaults.style.getPropertyValue(token('typography-font-weight-normal'))).toBe('400');
    expect(defaults.style.getPropertyValue(token('typography-font-smoothing'))).toBe('antialiased');
    expect(defaults.style.getPropertyValue(token('inline-code-padding-inline'))).toBe('0.35em');
    expect(defaults.style.getPropertyValue(token('divider-margin-block'))).toBe(
      `var(${token('spacing-xl')})`,
    );
    expect(defaults.style.getPropertyValue(token('footnotes-border-top'))).toBe(
      `1px solid var(${token('colors-border')})`,
    );
    expect(PRESET_THEME_MAP).toEqual(before);
    expect(overrides).toEqual(original);
  });

  test('includes custom presentation tokens and host font weight during server rendering', () => {
    const markup = renderToStaticMarkup(
      <Fluxdown
        build={{ footnote: true }}
        text={presentationMarkdown}
        theme={[
          'dark',
          {
            tokens: {
              typography: {
                fontWeight: { normal: 'var(--host-font-weight)' },
                fontSmoothing: 'var(--host-font-smoothing)',
              },
              inlineCode: { background: '#102030' },
              divider: { height: '0', borderBlockEnd: '2px dotted currentColor' },
              footnotes: { paddingTop: '4px', fontSize: 'inherit' },
            },
          },
        ]}
      />,
    );

    expect(markup).toContain(`${token('typography-font-weight-normal')}:var(--host-font-weight)`);
    expect(markup).toContain(`${token('typography-font-smoothing')}:var(--host-font-smoothing)`);
    expect(markup).toContain(`${token('inline-code-background')}:#102030`);
    expect(markup).toContain(`${token('divider-height')}:0`);
    expect(markup).toContain(`${token('divider-border-block-end')}:2px dotted currentColor`);
    expect(markup).toContain(`${token('footnotes-padding-top')}:4px`);
    expect(markup).toContain(`${token('footnotes-font-size')}:inherit`);
    expect(markup).toContain(`${token('colors-bg')}:#212121`);
    expect(markup).toContain('Details.');
  });
});
