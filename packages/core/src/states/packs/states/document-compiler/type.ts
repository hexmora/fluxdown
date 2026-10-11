import type { BlockCompilerInputs } from '../../../hast';
import type { DocumentPlugins } from '../document-plugins';

export type DocumentCompilerInputs = Pick<BlockCompilerInputs, 'sections' | 'config'> & {
  plugins: DocumentPlugins;
};
