import type { LinkProps } from '@rspress/core/theme-original';

import { Link as _Link } from '@rspress/core/theme-original';
import { forwardRef } from 'react';

import { localeKey } from './consts';

export const Link = /*#__PURE__*/ forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => (
  <_Link
    {...props}
    ref={ref}
    onClick={(event) => {
      props.onClick?.(event);

      if (props.rel !== 'alternate' || (props.hrefLang !== 'en' && props.hrefLang !== 'zh')) {
        return;
      }

      try {
        sessionStorage.setItem(localeKey, props.hrefLang);
      } catch {
        // Navigation still works when browser storage is unavailable.
      }
    }}
  />
));
