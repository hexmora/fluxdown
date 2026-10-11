import {
  HoistFootnoteRehypePlugin,
  RawParserRehypePlugin,
  SanitizerRehypePlugin,
} from '@fluxdown/core-presets/rehype';
import {
  ApplyRepairsRemarkPlugin,
  CodeMetaRemarkPlugin,
  PatchesRemarkPlugin,
  SyntaxAutolinkRemarkPlugin,
  SyntaxFootnoteRemarkPlugin,
  SyntaxHtmlAllowedRemarkPlugin,
  SyntaxMathRemarkPlugin,
  SyntaxPolicyRemarkPlugin,
  SyntaxSoftEndlineRemarkPlugin,
  SyntaxStrikethroughRemarkPlugin,
  SyntaxTableRemarkPlugin,
  SyntaxTaskListRemarkPlugin,
  TableNoralizerRemarkPlugin,
} from '@fluxdown/core-presets/remark';
import {
  AdjacentTextRepairPlugin,
  DanglingFootnoteRepairPlugin,
  HtmlBoundaryLineBreakRepairPlugin,
  IncompleteCodeFenceRepairPlugin,
  IncompleteEmphasisRepairPlugin,
  IncompleteHtmlTagRepairPlugin,
  IncompleteImageRepairPlugin,
  IncompleteInlineCodeRepairPlugin,
  IncompleteLinkRepairPlugin,
  IncompleteListMarkerRepairPlugin,
  IncompleteStrongRepairPlugin,
  ParagraphHtmlClosureRepairPlugin,
  RedundantBreakBeforeHtmlRepairPlugin,
  RedundantTrailingBreakRepairPlugin,
  TrailingEmptyCodeBlockRepairPlugin,
  TrailingEmptyHeadingRepairPlugin,
  TrailingEscapeRepairPlugin,
} from '@fluxdown/core-presets/repair';

/** Keep sharing eligibility independent of the publicly extensible preset arrays. */
export const SHARED_REMARK_PLUGINS: readonly unknown[] = [
  ApplyRepairsRemarkPlugin,
  CodeMetaRemarkPlugin,
  PatchesRemarkPlugin,
  SyntaxAutolinkRemarkPlugin,
  SyntaxFootnoteRemarkPlugin,
  SyntaxHtmlAllowedRemarkPlugin,
  SyntaxMathRemarkPlugin,
  SyntaxPolicyRemarkPlugin,
  SyntaxSoftEndlineRemarkPlugin,
  SyntaxStrikethroughRemarkPlugin,
  SyntaxTableRemarkPlugin,
  SyntaxTaskListRemarkPlugin,
  TableNoralizerRemarkPlugin,
];

export const SHARED_REHYPE_PLUGINS: readonly unknown[] = [
  RawParserRehypePlugin,
  SanitizerRehypePlugin,
  HoistFootnoteRehypePlugin,
];

/** Only these stateless repair implementations can share a document-level instance. */
export const SHARED_REPAIR_PLUGINS: readonly unknown[] = [
  AdjacentTextRepairPlugin,
  DanglingFootnoteRepairPlugin,
  HtmlBoundaryLineBreakRepairPlugin,
  IncompleteCodeFenceRepairPlugin,
  IncompleteEmphasisRepairPlugin,
  IncompleteHtmlTagRepairPlugin,
  IncompleteImageRepairPlugin,
  IncompleteInlineCodeRepairPlugin,
  IncompleteLinkRepairPlugin,
  IncompleteListMarkerRepairPlugin,
  IncompleteStrongRepairPlugin,
  ParagraphHtmlClosureRepairPlugin,
  RedundantBreakBeforeHtmlRepairPlugin,
  RedundantTrailingBreakRepairPlugin,
  TrailingEmptyCodeBlockRepairPlugin,
  TrailingEmptyHeadingRepairPlugin,
  TrailingEscapeRepairPlugin,
];
