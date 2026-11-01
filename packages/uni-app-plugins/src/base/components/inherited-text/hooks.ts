import type { ComputedRef, CSSProperties, InjectionKey } from 'vue';

import { computed, inject, provide } from 'vue';

import { useTheme } from '../../theme';

interface TextContext {
  style: CSSProperties;

  attributes: Record<string, unknown>;
}

const TextStyleContext: InjectionKey<ComputedRef<TextContext>> =
  /*#__PURE__*/ Symbol('FluxdownTextStyle');

export const useTextStyle = (
  source: () => CSSProperties | undefined,
  attributes: () => Record<string, unknown>,
) => {
  const parent = inject(TextStyleContext, null);

  const theme = useTheme();

  const context = computed<TextContext>(() => {
    const { colors, typography } = theme.value.tokens;

    const inherited = parent?.value;

    const own = attributes();

    return {
      style: {
        color: colors.fg,
        ...(typography.fontSans ? { fontFamily: typography.fontSans } : {}),
        fontSize: `${typography.fontSize.md}px`,
        fontWeight: typography.fontWeight.normal,
        lineHeight: `${typography.fontSize.md * typography.lineHeight.md}px`,
        letterSpacing: '0px',
        ...inherited?.style,
        ...source(),
      },
      attributes: {
        ...inherited?.attributes,
        ...own,
        class: [inherited?.attributes.class, own.class],
      },
    };
  });

  provide(TextStyleContext, context);

  return context;
};
