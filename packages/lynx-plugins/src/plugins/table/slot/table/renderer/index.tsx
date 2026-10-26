import type { TableProps } from '../../../../../base';

import { joinClassNames, useBlockStyle, useTheme } from '../../../../../base';

export const TableRenderer = ({
  Raw: _Raw,
  children,
  className,
  columns,
  current,
  parents,
  render: _render,
  style,
  ...elementProps
}: TableProps) => {
  const { tokens } = useTheme();

  const blockStyle = useBlockStyle(current, parents);

  return (
    <scroll-view
      {...elementProps}
      scroll-x
      className={joinClassNames('fluxdown-table', className)}
      style={{
        width: '100%',
        ...blockStyle,
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: tokens.radius.lg,
        ...style,
      }}
    >
      <view
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, auto)`,
          width: 'max-content',
          minWidth: '100%',
        }}
      >
        {children}
      </view>
    </scroll-view>
  );
};
