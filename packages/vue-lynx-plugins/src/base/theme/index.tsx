import type { CSSProperties } from '@lynx-js/types';
import type { ComputedRef, InjectionKey, Ref, VNodeChild } from 'vue';

import { computed, defineComponent, inject, provide } from 'vue';

import type { Theme, ThemeConfig } from './type';

import { useTextAnimation } from '../context';
import { LIGHT_THEME } from './presets/light';
import { resolveTheme } from './utils';

export * from './type';
export * from './presets';
export * from './utils';

const ThemeContext: InjectionKey<Ref<ThemeConfig>> = /*#__PURE__*/ Symbol('FluxdownTheme');

const TextStyleContext: InjectionKey<Ref<CSSProperties | null>> =
  /*#__PURE__*/ Symbol('FluxdownTextStyle');

export const useThemeConfig = (source: () => Theme = () => 'light') =>
  computed(() => resolveTheme(source()));

export const useTheme = (): ThemeConfig => inject(ThemeContext, null)?.value ?? LIGHT_THEME;

export const getTextStyle = ({ tokens }: ThemeConfig): CSSProperties => ({
  color: tokens.colors.fg,
  fontFamily: tokens.typography.fontSans,
  fontSize: tokens.typography.fontSize.md,
  fontWeight: String(tokens.typography.fontWeight.normal) as CSSProperties['fontWeight'],
  fontStyle: 'normal',
  lineHeight: tokens.typography.lineHeight.md,
});

export const useTextStyle = (override?: CSSProperties): CSSProperties => {
  const inherited = inject(TextStyleContext, null)?.value;

  const animation = useTextAnimation();

  const theme = useTheme();

  const resolved = { ...(inherited ?? getTextStyle(theme)), ...override };

  return animation && !('arrival' in animation)
    ? ({ ...resolved, ...animation, '--fluxdown-text-color': resolved.color } as CSSProperties)
    : resolved;
};

export const TextStyleProvider = /*#__PURE__*/ defineComponent(
  (props: { value: CSSProperties; children?: VNodeChild }, { slots }) => {
    provide(
      TextStyleContext,
      computed(() => props.value),
    );

    return () => slots.default?.() ?? props.children;
  },
  { name: 'FluxdownTextStyleProvider', props: ['value', 'children'], inheritAttrs: false },
);

export const ThemeProvider = /*#__PURE__*/ defineComponent(
  (props: { value: ThemeConfig; children?: VNodeChild }, { slots }) => {
    provide(
      ThemeContext,
      computed(() => props.value),
    );

    provide(
      TextStyleContext,
      computed(() => getTextStyle(props.value)),
    );

    return () => slots.default?.() ?? props.children;
  },
  { name: 'FluxdownThemeProvider', props: ['value', 'children'], inheritAttrs: false },
);

export const useTextStyleSource = (
  override: () => CSSProperties | undefined = () => undefined,
): ComputedRef<CSSProperties> => {
  const inherited = inject(TextStyleContext, null);

  const theme = inject(ThemeContext, null);

  return computed(() => ({
    ...(inherited?.value ?? getTextStyle(theme?.value ?? LIGHT_THEME)),
    ...override(),
  }));
};
