import type { IPluginItem } from '@fluxdown/react-base-plugins/typings';

import { CjkPlugin } from '@fluxdown/react-base-plugins/plugins/cjk';
import { EmojiPlugin } from '@fluxdown/react-base-plugins/plugins/emoji';
import { PatchPlugin } from '@fluxdown/react-base-plugins/plugins/patch';

import { BlockquotePlugin } from '../../plugins/blockquote';
import { BreakLinePlugin } from '../../plugins/break-line';
import { CodePelePlugin } from '../../plugins/code-pele';
import { CodeShikiPlugin } from '../../plugins/code-shiki';
import { EffectChunkPlugin } from '../../plugins/effect-chunk';
import { EffectScalePlugin } from '../../plugins/effect-scale';
import { EffectShadPlugin } from '../../plugins/effect-shad';
import { EffectSuffixPlugin } from '../../plugins/effect-suffix';
import { EmphasisPlugin } from '../../plugins/emphasis';
import { FallbackPlugin } from '../../plugins/fallback';
import { HeadingPlugin } from '../../plugins/heading';
import { ImagePlugin } from '../../plugins/image';
import { LinkPlugin } from '../../plugins/link';
import { ListPlugin } from '../../plugins/list';
import { ParagraphPlugin } from '../../plugins/paragraph';
import { StrongPlugin } from '../../plugins/strong';
import { TablePlugin } from '../../plugins/table';
import { TexMathjaxKatexPlugin } from '../../plugins/tex-mathjax-katex';

export const PRESET_FULL_PLUGINS: IPluginItem[] = [
  PatchPlugin,
  EffectShadPlugin,
  EffectScalePlugin,
  EffectChunkPlugin,
  EffectSuffixPlugin,
  CodeShikiPlugin,
  CodePelePlugin,
  CjkPlugin,
  EmojiPlugin,
  EmphasisPlugin,
  ImagePlugin,
  LinkPlugin,
  ListPlugin,
  ParagraphPlugin,
  StrongPlugin,
  TablePlugin,
  TexMathjaxKatexPlugin,
  HeadingPlugin,
  BreakLinePlugin,
  BlockquotePlugin,
  FallbackPlugin,
];
