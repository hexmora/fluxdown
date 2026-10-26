import type { LinkProps } from '../../../../../base';

import {
  joinClassNames,
  normalizePublicUrl,
  TextStyleProvider,
  useTextStyle,
  useTheme,
} from '../../../../../base';

export const LinkRenderer = ({
  Raw: _Raw,
  children,
  className,
  current: _current,
  href,
  onTap,
  parents: _parents,
  render: _render,
  style,
  title: _title,
  ...elementProps
}: LinkProps) => {
  const { tokens } = useTheme();

  const textStyle = useTextStyle({
    color: tokens.colors.accent,
    textDecoration: 'underline',
    ...style,
  });

  const safeHref = normalizePublicUrl(href, { allowHash: true, allowMailto: true });

  return (
    <TextStyleProvider value={textStyle}>
      <text
        {...elementProps}
        className={joinClassNames('fluxdown-link', className)}
        style={textStyle}
        bindtap={
          safeHref && onTap ? (event) => onTap({ event, href: safeHref }) : elementProps.bindtap
        }
      >
        {children}
      </text>
    </TextStyleProvider>
  );
};
