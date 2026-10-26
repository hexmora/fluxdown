import type { BlockquoteProps } from '../../../../../base';

import {
  joinClassNames,
  TextStyleProvider,
  useBlockStyle,
  useTextStyle,
  useTheme,
} from '../../../../../base';

export const BlockquoteRenderer = ({
  Raw: _Raw,
  children,
  className,
  current,
  parents,
  render: _render,
  style,
  ...elementProps
}: BlockquoteProps) => {
  const { tokens } = useTheme();

  const blockStyle = useBlockStyle(current, parents);

  const textStyle = useTextStyle({ color: tokens.colors.fgMuted });

  return (
    <TextStyleProvider value={textStyle}>
      <view
        {...elementProps}
        className={joinClassNames('fluxdown-blockquote', className)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          ...blockStyle,
          padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
          borderLeft: `3px solid ${tokens.colors.borderEmphasis}`,
          borderRadius: `0 ${tokens.radius.md} ${tokens.radius.md} 0`,
          backgroundColor: tokens.colors.surfaceSubtle,
          ...style,
        }}
      >
        {children}
      </view>
    </TextStyleProvider>
  );
};
