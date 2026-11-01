import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { BlockquotePlugin } from '@fluxdown/angular-plugins/plugins/blockquote';
import { BreakLinePlugin } from '@fluxdown/angular-plugins/plugins/break-line';
import { CjkPlugin } from '@fluxdown/angular-plugins/plugins/cjk';
import { CodePelePlugin } from '@fluxdown/angular-plugins/plugins/code-pele';
import { CodeShikiPlugin } from '@fluxdown/angular-plugins/plugins/code-shiki';
import { EffectChunkPlugin } from '@fluxdown/angular-plugins/plugins/effect-chunk';
import { EffectScalePlugin } from '@fluxdown/angular-plugins/plugins/effect-scale';
import { EffectShadPlugin } from '@fluxdown/angular-plugins/plugins/effect-shad';
import { EffectSuffixPlugin } from '@fluxdown/angular-plugins/plugins/effect-suffix';
import { EmojiPlugin } from '@fluxdown/angular-plugins/plugins/emoji';
import { EmphasisPlugin } from '@fluxdown/angular-plugins/plugins/emphasis';
import { FallbackPlugin } from '@fluxdown/angular-plugins/plugins/fallback';
import { HeadingPlugin } from '@fluxdown/angular-plugins/plugins/heading';
import { ImagePlugin } from '@fluxdown/angular-plugins/plugins/image';
import { LinkPlugin } from '@fluxdown/angular-plugins/plugins/link';
import { ListPlugin } from '@fluxdown/angular-plugins/plugins/list';
import { ParagraphPlugin } from '@fluxdown/angular-plugins/plugins/paragraph';
import { PatchPlugin } from '@fluxdown/angular-plugins/plugins/patch';
import { StrongPlugin } from '@fluxdown/angular-plugins/plugins/strong';
import { TablePlugin } from '@fluxdown/angular-plugins/plugins/table';
import { TexMathjaxKatexPlugin } from '@fluxdown/angular-plugins/plugins/tex-mathjax-katex';

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
