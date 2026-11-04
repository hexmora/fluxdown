import type { SuffixProps } from '../../../../../base';

import { joinClassNames, useTextStyle } from '../../../../../base';
import { getInlineSuffixGeometry, getSuffixGeometry, INLINE_ADVANCE } from './utils';
import './style.scss';

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

  const custom = type !== 'cursor' && type !== 'dot';

  // iOS text attachments do not paint the children of a zero-width inline view.
  // Paint built-in markers on the attachment itself; opposing margins leave
  // only a subpixel advance while preserving the Web marker's position/size.
  if (!custom) {
    return (
      <view
        {...elementProps}
        accessibility-elements-hidden={true}
        className={joinClassNames(
          `fluxdown-suffix fluxdown-suffix-marker fluxdown-suffix-${type}`,
          className,
        )}
        style={{
          ...textStyle,
          ...getInlineSuffixGeometry(textStyle, type === 'cursor' ? 'cursor' : 'dot'),
          backgroundColor: textStyle.color,
        }}
      />
    );
  }

  const { height } = getSuffixGeometry(textStyle);

  return (
    <view
      {...elementProps}
      accessibility-elements-hidden={true}
      className={joinClassNames('fluxdown-suffix', className)}
      style={{ ...textStyle, height, marginRight: `${INLINE_ADVANCE}px` }}
    >
      <view
        className="fluxdown-suffix-marker fluxdown-suffix-nested-marker fluxdown-suffix-custom"
        style={{
          ...textStyle,
          backgroundColor: 'transparent',
          whiteSpace: 'nowrap',
          height,
        }}
      >
        <text style={{ ...textStyle, whiteSpace: 'nowrap' }}>{children}</text>
      </view>
    </view>
  );
};
