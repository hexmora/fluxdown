import type { BlockContentInputs } from '../../../../../hast/block-compiler/states';
import type { DocumentPlugins } from '../../../document-plugins';

export type DocumentBlockContentInputs = BlockContentInputs & { plugins: DocumentPlugins };
