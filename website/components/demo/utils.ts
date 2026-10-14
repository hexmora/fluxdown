import type { Theme } from 'fluxdown';

import { withBase } from '@rspress/core/runtime';

import type { Locale } from '../type';

import { DEMO_THEMES, STREAM_SAMPLES } from './consts';

export const getDemoTheme = (isDark: boolean): Theme => DEMO_THEMES[isDark ? 'dark' : 'light'];

export const getStreamSample = (lang: Locale) =>
  STREAM_SAMPLES[lang].replace('{LOGO}', withBase('/demo-mark.svg'));
