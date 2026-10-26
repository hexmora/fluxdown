import type { SuffixProps } from '../../../../../base';

import { joinClassNames, useTextStyle } from '../../../../../base';
import { getSuffixGeometry } from './utils';
import './style.css';

export type SuffixRendererProps = Omit<SuffixProps, 'Raw'> & { Raw?: SuffixProps['Raw'] };

export const SuffixRenderer = ({
  Raw: _Raw,
  children,
  type,
  className,
  style,
  ...elementProps
}: SuffixRendererProps) => {
  const textStyle = useTextStyle(style);

  const { height, cursorWidth } = getSuffixGeometry(textStyle);

  const custom = type !== 'cursor' && type !== 'dot';

  return (
    <view
      {...elementProps}
      accessibility-elements-hidden={true}
      className={joinClassNames('fluxdown-suffix', className)}
      style={{ ...textStyle, height }}
    >
      <view
        className={`fluxdown-suffix-marker fluxdown-suffix-${custom ? 'custom' : type}`}
        style={{
          ...textStyle,
          backgroundColor: custom ? 'transparent' : textStyle.color,
          ...(type === 'cursor' ? { width: cursorWidth } : {}),
          ...(custom ? { height } : {}),
        }}
      >
        {custom ? <text style={textStyle}>{children}</text> : null}
      </view>
    </view>
  );
};
