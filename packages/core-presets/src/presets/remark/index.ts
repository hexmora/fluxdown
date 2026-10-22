import type { IRemarkPlugin, PluginClass } from '@fluxdown/types';

import { ApplyRepairsRemarkPlugin } from '../../plugins/remark/apply-repairs';
import { CodeMetaRemarkPlugin } from '../../plugins/remark/code-meta';
import { PatchesRemarkPlugin } from '../../plugins/remark/patches';
import { SyntaxAutolinkRemarkPlugin } from '../../plugins/remark/syntax-autolink';
import { SyntaxFootnoteRemarkPlugin } from '../../plugins/remark/syntax-footnote';
import { SyntaxHtmlAllowedRemarkPlugin } from '../../plugins/remark/syntax-html-allowed';
import { SyntaxMathRemarkPlugin } from '../../plugins/remark/syntax-math';
import { SyntaxPolicyRemarkPlugin } from '../../plugins/remark/syntax-policy';
import { SyntaxSoftEndlineRemarkPlugin } from '../../plugins/remark/syntax-soft-endline';
import { SyntaxStrikethroughRemarkPlugin } from '../../plugins/remark/syntax-strikethrough';
import { SyntaxTableRemarkPlugin } from '../../plugins/remark/syntax-table';
import { SyntaxTaskListRemarkPlugin } from '../../plugins/remark/syntax-task-list';
import { TableNoralizerRemarkPlugin } from '../../plugins/remark/table-noralizer';

export const PRESET_REMARK_PLUGINS: PluginClass<IRemarkPlugin>[] = [
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
