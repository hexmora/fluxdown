import type { ImageProps } from '../../../../../base';

import {
  AnimatedText,
  joinClassNames,
  normalizePublicUrl,
  useTextStyle,
} from '../../../../../base';

export const ImageRenderer = ({
  Raw: _Raw,
  alt = '',
  className,
  current: _current,
  height,
  onTap,
  parents: _parents,
  render: _render,
  src,
  style,
  title: _title,
  width,
  ...elementProps
}: ImageProps) => {
  const textStyle = useTextStyle();

  const safeSrc = normalizePublicUrl(src);

  if (!safeSrc) {
    return alt ? (
      <AnimatedText {...elementProps} className={className} style={{ ...textStyle, ...style }}>
        {alt}
      </AnimatedText>
    ) : null;
  }

  return (
    <image
      {...elementProps}
      accessibility-label={alt}
      className={joinClassNames('fluxdown-image', className)}
      src={safeSrc}
      mode="aspectFit"
      auto-size={!height}
      bindtap={onTap ? (event) => onTap({ event, src: safeSrc }) : elementProps.bindtap}
      style={{
        width: typeof width === 'number' ? `${width}px` : (width ?? '100%'),
        height: typeof height === 'number' ? `${height}px` : height,
        maxWidth: '100%',
        verticalAlign: 'baseline',
        ...style,
      }}
    />
  );
};
