import { h } from 'vue';

import type { TexProps } from '../../../../../base';

import { joinClassNames, useBlockStyle, useTextStyle } from '../../../../../base';
import { renderFormula } from './utils';

export const TexMathJaxRenderer = ({ Raw, ...props }: TexProps) => {
  const {
    class: className,
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

  const formula = renderFormula(tex, mode, color);

  if (!formula) {
    return Raw ? h(Raw, props) : null;
  }

  const rendered = (
    <svg
      {...elementProps}
      accessibility-label={tex}
      class={joinClassNames('fluxdown-tex-mathjax', className)}
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

TexMathJaxRenderer.inheritAttrs = false;
