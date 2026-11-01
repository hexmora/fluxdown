import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { BlockquotePlugin } from '@fluxdown/angular-plugins/plugins/blockquote';
import { BreakLinePlugin } from '@fluxdown/angular-plugins/plugins/break-line';
import { CodePlugin } from '@fluxdown/angular-plugins/plugins/code';
import { EffectChunkPlugin } from '@fluxdown/angular-plugins/plugins/effect-chunk';
import { EffectScalePlugin } from '@fluxdown/angular-plugins/plugins/effect-scale';
import { EffectShadPlugin } from '@fluxdown/angular-plugins/plugins/effect-shad';
import { EffectSuffixPlugin } from '@fluxdown/angular-plugins/plugins/effect-suffix';
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
import { TexPlugin } from '@fluxdown/angular-plugins/plugins/tex';

export const PRESET_LITE_PLUGINS: IPluginItem[] = [
  PatchPlugin,
  EffectShadPlugin,
  EffectScalePlugin,
  EffectChunkPlugin,
  EffectSuffixPlugin,
  CodePlugin,
  EmphasisPlugin,
  ImagePlugin,
  LinkPlugin,
  ListPlugin,
  ParagraphPlugin,
  StrongPlugin,
  TablePlugin,
  TexPlugin,
  HeadingPlugin,
  BreakLinePlugin,
  BlockquotePlugin,
  FallbackPlugin,
];
