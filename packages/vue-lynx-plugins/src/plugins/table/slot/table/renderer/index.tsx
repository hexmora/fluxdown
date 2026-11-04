import type { TableProps } from '../../../../../base';

import { joinClassNames, useBlockStyle, useTheme } from '../../../../../base';
import './style.scss';

export const TableRenderer = ({
  Raw: _Raw,
  children,
  class: className,
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
      class={joinClassNames('fluxdown-table', className)}
      style={{
        ...blockStyle,
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: tokens.radius.lg,
        ...style,
      }}
    >
      <view class="fluxdown-table-grid" style={{ gridTemplateColumns: `repeat(${columns}, auto)` }}>
        {children}
      </view>
    </scroll-view>
  );
};

TableRenderer.inheritAttrs = false;
