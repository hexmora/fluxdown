import type { TableCellProps } from '../../../../../base';

import {
  isHastElement,
  joinClassNames,
  TextStyleProvider,
  useTextStyle,
  useTheme,
} from '../../../../../base';

export const TableCellRenderer = ({
  Raw: _Raw,
  align,
  children,
  className,
  current,
  parents,
  render: _render,
  style,
  tagName,
  ...elementProps
}: TableCellProps) => {
  const { tokens } = useTheme();

  const row = parents.at(-1);

  const properties = row && isHastElement(row) ? row.properties : {};

  const cells = parents.at(-1)?.children.filter((child) => child.type === 'element') ?? [];

  const index = cells.findIndex((node) => node === current);

  const textStyle = useTextStyle({
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tagName === 'th' ? '600' : '400',
    textAlign: align === 'center' || align === 'right' ? align : 'left',
  });

  return (
    <TextStyleProvider value={textStyle}>
      <view
        {...elementProps}
        className={joinClassNames('fluxdown-table-cell', className)}
        style={{
          padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
          borderBottom: properties.dataFluxdownLastRow
            ? undefined
            : `1px solid ${tokens.colors.border}`,
          borderRight: index < cells.length - 1 ? `1px solid ${tokens.colors.border}` : undefined,
          backgroundColor:
            tagName === 'th'
              ? tokens.colors.surfaceMuted
              : properties.dataFluxdownStripe
                ? tokens.colors.surfaceSubtle
                : undefined,
          ...style,
        }}
      >
        <text style={textStyle}>{children}</text>
      </view>
    </TextStyleProvider>
  );
};
