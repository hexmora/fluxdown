import type { CSSProperties } from '@lynx-js/types';

import type { StrongProps } from '../../../../../base';

import { joinClassNames, TextStyleProvider, useTextStyle, useTheme } from '../../../../../base';

export const StrongRenderer = ({
  Raw: _Raw,
  children,
  className,
  current: _current,
  parents: _parents,
  render: _render,
  style,
  ...elementProps
}: StrongProps) => {
  const { tokens } = useTheme();

  const textStyle = useTextStyle({
    fontWeight: String(tokens.typography.fontWeight.bold) as CSSProperties['fontWeight'],
    ...style,
  });

  return (
    <TextStyleProvider value={textStyle}>
      <text
        {...elementProps}
        className={joinClassNames('fluxdown-strong', className)}
        style={textStyle}
      >
        {children}
      </text>
    </TextStyleProvider>
  );
};
