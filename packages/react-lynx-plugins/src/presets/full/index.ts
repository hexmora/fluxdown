import type { IPluginItem } from '../../typings';

import { BlockquotePlugin } from '../../plugins/blockquote';
import { BreakLinePlugin } from '../../plugins/break-line';
import { CjkPlugin } from '../../plugins/cjk';
import { CodeShikiPlugin } from '../../plugins/code-shiki';
import { EffectChunkPlugin } from '../../plugins/effect-chunk';
import { EffectScalePlugin } from '../../plugins/effect-scale';
import { EffectShadPlugin } from '../../plugins/effect-shad';
import { EffectSuffixPlugin } from '../../plugins/effect-suffix';
import { EmojiPlugin } from '../../plugins/emoji';
import { EmphasisPlugin } from '../../plugins/emphasis';
import { FallbackPlugin } from '../../plugins/fallback';
import { HeadingPlugin } from '../../plugins/heading';
import { ImagePlugin } from '../../plugins/image';
import { LinkPlugin } from '../../plugins/link';
import { ListPlugin } from '../../plugins/list';
import { ParagraphPlugin } from '../../plugins/paragraph';
import { PatchPlugin } from '../../plugins/patch';
import { StrongPlugin } from '../../plugins/strong';
import { TablePlugin } from '../../plugins/table';
import { TexPlugin } from '../../plugins/tex';

export const PRESET_FULL_PLUGINS: IPluginItem[] = __BACKGROUND__
  ? [
      PatchPlugin,
      EffectShadPlugin,
      EffectScalePlugin,
      EffectChunkPlugin,
      EffectSuffixPlugin,
      CodeShikiPlugin,
      CjkPlugin,
      EmojiPlugin,
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
    ]
  : [];
