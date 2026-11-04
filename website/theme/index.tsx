import '@tarojs/components-react/dist/index.css';

import type { ComponentProps } from 'react';

import { Layout as OriginalLayout } from '@rspress/core/theme-original';

import './index.module.scss';
import { SeoHead } from './seo';

export * from '@rspress/core/theme-original';

export const Layout = (props: ComponentProps<typeof OriginalLayout>) => (
  <>
    <OriginalLayout {...props} />
    <SeoHead />
  </>
);

export { useThemeState } from './appearance';
export { Link } from './locale';
