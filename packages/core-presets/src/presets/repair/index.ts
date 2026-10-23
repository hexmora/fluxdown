import type { IRepairPlugin, PluginClass } from '@fluxdown/types';

import { AdjacentTextRepairPlugin } from '../../plugins/repair/adjacent-text';
import { DanglingFootnoteRepairPlugin } from '../../plugins/repair/dangling-footnote';
import { HtmlBoundaryLineBreakRepairPlugin } from '../../plugins/repair/html-boundary-line-break';
import { IncompleteCodeFenceRepairPlugin } from '../../plugins/repair/incomplete-code-fence';
import { IncompleteEmphasisRepairPlugin } from '../../plugins/repair/incomplete-emphasis';
import { IncompleteHtmlTagRepairPlugin } from '../../plugins/repair/incomplete-html-tag';
import { IncompleteImageRepairPlugin } from '../../plugins/repair/incomplete-image';
import { IncompleteInlineCodeRepairPlugin } from '../../plugins/repair/incomplete-inline-code';
import { IncompleteLinkRepairPlugin } from '../../plugins/repair/incomplete-link';
import { IncompleteListMarkerRepairPlugin } from '../../plugins/repair/incomplete-list-marker';
import { IncompleteStrongRepairPlugin } from '../../plugins/repair/incomplete-strong';
import { ParagraphHtmlClosureRepairPlugin } from '../../plugins/repair/paragraph-html-closure';
import { RedundantBreakBeforeHtmlRepairPlugin } from '../../plugins/repair/redundant-break-before-html';
import { RedundantTrailingBreakRepairPlugin } from '../../plugins/repair/redundant-trailing-break';
import { TrailingEmptyCodeBlockRepairPlugin } from '../../plugins/repair/trailing-empty-code-block';
import { TrailingEmptyHeadingRepairPlugin } from '../../plugins/repair/trailing-empty-heading';
import { TrailingEscapeRepairPlugin } from '../../plugins/repair/trailing-escape';

export const PRESET_REPAIR_PLUGINS: PluginClass<IRepairPlugin>[] = [
  TrailingEscapeRepairPlugin,
  TrailingEmptyCodeBlockRepairPlugin,
  IncompleteCodeFenceRepairPlugin,
  IncompleteInlineCodeRepairPlugin,
  IncompleteImageRepairPlugin,
  IncompleteLinkRepairPlugin,
  TrailingEmptyHeadingRepairPlugin,
  IncompleteHtmlTagRepairPlugin,
  IncompleteStrongRepairPlugin,
  IncompleteEmphasisRepairPlugin,
  IncompleteListMarkerRepairPlugin,
  RedundantBreakBeforeHtmlRepairPlugin,
  HtmlBoundaryLineBreakRepairPlugin,
  ParagraphHtmlClosureRepairPlugin,
  DanglingFootnoteRepairPlugin,
  RedundantTrailingBreakRepairPlugin,
  AdjacentTextRepairPlugin,
];
