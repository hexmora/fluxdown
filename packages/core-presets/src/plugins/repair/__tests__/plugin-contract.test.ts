import { expectTypeOf } from 'expect-type';

import type {
  ApplyRepairsRemarkPlugin,
  ApplyRepairsRemarkPluginConfig,
} from '../../remark/apply-repairs';
import type { AdjacentTextRepairPlugin } from '../adjacent-text';
import type { DanglingFootnoteRepairPlugin } from '../dangling-footnote';
import type { HtmlBoundaryLineBreakRepairPlugin } from '../html-boundary-line-break';
import type { IncompleteCodeFenceRepairPlugin } from '../incomplete-code-fence';
import type { IncompleteEmphasisRepairPlugin } from '../incomplete-emphasis';
import type { IncompleteHtmlTagRepairPlugin } from '../incomplete-html-tag';
import type {
  IncompleteImageRepairPlugin,
  IncompleteImageRepairPluginConfig,
} from '../incomplete-image';
import type { IncompleteInlineCodeRepairPlugin } from '../incomplete-inline-code';
import type { IncompleteLinkRepairPlugin } from '../incomplete-link';
import type { IncompleteListMarkerRepairPlugin } from '../incomplete-list-marker';
import type { IncompleteStrongRepairPlugin } from '../incomplete-strong';
import type { ParagraphHtmlClosureRepairPlugin } from '../paragraph-html-closure';
import type { RedundantBreakBeforeHtmlRepairPlugin } from '../redundant-break-before-html';
import type { RedundantTrailingBreakRepairPlugin } from '../redundant-trailing-break';
import type { TrailingEmptyCodeBlockRepairPlugin } from '../trailing-empty-code-block';
import type { TrailingEmptyHeadingRepairPlugin } from '../trailing-empty-heading';
import type { TrailingEscapeRepairPlugin } from '../trailing-escape';

type ParameterlessRepairPluginClass =
  | typeof AdjacentTextRepairPlugin
  | typeof DanglingFootnoteRepairPlugin
  | typeof HtmlBoundaryLineBreakRepairPlugin
  | typeof IncompleteCodeFenceRepairPlugin
  | typeof IncompleteEmphasisRepairPlugin
  | typeof IncompleteHtmlTagRepairPlugin
  | typeof IncompleteInlineCodeRepairPlugin
  | typeof IncompleteLinkRepairPlugin
  | typeof IncompleteListMarkerRepairPlugin
  | typeof IncompleteStrongRepairPlugin
  | typeof ParagraphHtmlClosureRepairPlugin
  | typeof RedundantBreakBeforeHtmlRepairPlugin
  | typeof RedundantTrailingBreakRepairPlugin
  | typeof TrailingEmptyCodeBlockRepairPlugin
  | typeof TrailingEmptyHeadingRepairPlugin
  | typeof TrailingEscapeRepairPlugin;

type ConstructorConfig<T extends abstract new (...args: never[]) => unknown> =
  ConstructorParameters<T>[0];

describe('repair plugin config contracts', () => {
  test('keeps parameterless repairs free of meaningless constructor config', () => {
    expectTypeOf<ConstructorParameters<ParameterlessRepairPluginClass>>().toEqualTypeOf<[]>();
  });

  test('publishes constructor config only for incomplete-image behavior', () => {
    expectTypeOf<ConstructorConfig<typeof IncompleteImageRepairPlugin>>().toEqualTypeOf<
      IncompleteImageRepairPluginConfig | undefined
    >();
  });

  test('publishes a matching named config for the remark repair orchestrator', () => {
    expectTypeOf<ConstructorConfig<typeof ApplyRepairsRemarkPlugin>>().toEqualTypeOf<
      ApplyRepairsRemarkPluginConfig | undefined
    >();
  });
});
