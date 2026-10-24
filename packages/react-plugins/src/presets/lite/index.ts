import type { IPluginItem } from '@fluxdown/react-base-plugins/typings';

import { PatchPlugin } from '@fluxdown/react-base-plugins/plugins/patch';

import { BlockquotePlugin } from '../../plugins/blockquote';
import { BreakLinePlugin } from '../../plugins/break-line';
import { CodePlugin } from '../../plugins/code';
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
import { TexPlugin } from '../../plugins/tex';

export const PRESET_LIGHT_PLUGINS: IPluginItem[] = [
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
