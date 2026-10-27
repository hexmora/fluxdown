import type { ListProps } from '../../../../../base';

import { joinClassNames, useBlockStyle, useTheme } from '../../../../../base';

export const ListRenderer = ({
  Raw: _Raw,
  children,
  className,
  current,
  parents,
  render: _render,
  style,
  type: _type,
  ...elementProps
}: ListProps) => {
  const { tokens } = useTheme();

  const blockStyle = useBlockStyle(current, parents);

  return (
    <view
      {...elementProps}
      className={joinClassNames('fluxdown-list', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...blockStyle,
        paddingLeft: tokens.spacing.xl,
        ...style,
      }}
    >
      {children}
    </view>
  );
};
