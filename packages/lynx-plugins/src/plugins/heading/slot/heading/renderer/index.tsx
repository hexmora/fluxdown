import type { CSSProperties } from '@lynx-js/types';

import type { HeadingProps } from '../../../../../base';

import {
  AnimatedText,
  joinClassNames,
  TextStyleProvider,
  useBlockStyle,
  useTextStyle,
  useTheme,
} from '../../../../../base';

export const HeadingRenderer = ({
  Raw: _Raw,
  children,
  className,
  current,
  level,
  parents,
  render: _render,
  style,
  ...elementProps
}: HeadingProps) => {
  const { tokens } = useTheme();

  const blockStyle = useBlockStyle(current, parents);

  const safeLevel = Number.isInteger(level) && level >= 1 && level <= 6 ? level : 1;

  const heading = tokens.heading[`h${safeLevel}` as keyof typeof tokens.heading];

  const textStyle = useTextStyle({
    color: safeLevel >= 5 ? tokens.colors.fgMuted : tokens.colors.fg,
    fontSize: heading.fontSize,
    fontWeight: String(heading.fontWeight) as CSSProperties['fontWeight'],
    lineHeight: heading.lineHeight,
    letterSpacing: safeLevel <= 2 ? '-0.025em' : '0px',
    ...style,
  });

  return (
    <TextStyleProvider value={textStyle}>
      <AnimatedText
        {...elementProps}
        className={joinClassNames('fluxdown-heading', `fluxdown-heading-h${safeLevel}`, className)}
        style={{ ...blockStyle, ...textStyle }}
      >
        {children}
      </AnimatedText>
    </TextStyleProvider>
  );
};
