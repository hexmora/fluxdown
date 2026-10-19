import type { Locale } from '../../../type';

export type EditorEffect = 'none' | 'shad' | 'scale' | 'chunk' | 'suffix-cursor' | 'suffix-dot';

export type EditorProps = {
  lang: Locale;
};
