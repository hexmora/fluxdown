import { useMemo } from '@lynx-js/react';

import type { TexProps } from '../../../../../base';

import { joinClassNames, useBlockStyle, useTextStyle } from '../../../../../base';
import { renderFormula } from './utils';

export const TexSvgRenderer = ({ Raw, ...props }: TexProps) => {
  const {
    className,
    current,
    mode = 'inline',
    parents,
    render: _render,
    style,
    tex,
    ...elementProps
  } = props;

  const textStyle = useTextStyle();

  const blockStyle = useBlockStyle(current, parents);

  const color = String(style?.color ?? textStyle.color);

  const formula = useMemo(() => renderFormula(tex, mode, color), [tex, mode, color]);

  if (!formula) {
    return Raw && <Raw {...props} />;
  }

  const rendered = (
    <svg
      {...elementProps}
      accessibility-label={tex}
      className={joinClassNames('fluxdown-tex-svg', className)}
      content={formula.svg}
      style={{
        fontSize: textStyle.fontSize,
        width: `${formula.width}em`,
        height: `${formula.height}em`,
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
    />
  );

  return mode === 'display' ? (
    <scroll-view scroll-x style={{ ...blockStyle, width: '100%' }}>
      <view style={{ display: 'flex', justifyContent: 'center', minWidth: '100%' }}>
        {rendered}
      </view>
    </scroll-view>
  ) : (
    rendered
  );
};
