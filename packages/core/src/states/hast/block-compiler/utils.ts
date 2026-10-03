import type { IRehypePlugin, IRemarkPlugin } from '@fluxdown/types';

import { isEqual } from 'lodash-es';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { Processor, unified } from 'unified';

import type { BlockCompilerItem } from './type';

import { HastRoot, MdastRoot } from '../../../typings';
import { isSectionEqual } from '../../base/text-chunker/utils';
import { getFootnotePrefix, namespaceFootnoteLabel } from './footnote';

export const isItemEqual = (item: BlockCompilerItem, other: BlockCompilerItem): boolean => {
  return (
    item === other ||
    (item.isLast === other.isLast &&
      isEqual(item.meta, other.meta) &&
      isSectionEqual(item.section, other.section))
  );
};

type AstProcessor = Processor<MdastRoot, undefined, undefined, undefined, undefined>;

type HastProcessor = Processor<MdastRoot, MdastRoot, HastRoot, undefined, undefined>;

export interface GetAstProcessorByPluginsParams {
  remarks?: IRemarkPlugin[];
}

export const getAstProcessorByPlugins = ({ remarks = [] }: GetAstProcessorByPluginsParams) => {
  let processor: AstProcessor = unified().use(remarkParse);

  for (const remark of remarks) {
    processor = processor.use(remark.plugin) as unknown as AstProcessor;
  }

  return processor;
};

interface GetHastProcessorParams {
  remarks?: IRemarkPlugin[];

  rehypes?: IRehypePlugin[];

  idPrefix?: string;
}

const getHastProcessor = ({ remarks = [], rehypes = [], idPrefix }: GetHastProcessorParams) => {
  let processor: AstProcessor | HastProcessor = getAstProcessorByPlugins({
    remarks,
  });

  const prefix = getFootnotePrefix(idPrefix);

  processor = processor.use(remarkRehype, {
    allowDangerousHtml: true,
    // The sanitizer applies the safety prefix once, including ARIA ID references.
    clobberPrefix: prefix,
  });

  if (prefix) {
    processor = processor.use(namespaceFootnoteLabel, prefix);
  }

  for (const rehype of rehypes) {
    processor = processor.use(rehype.plugin);
  }

  return processor;
};

export type MarkdownToHastParams = {
  text: string;

  remarks?: IRemarkPlugin[];

  rehypes?: IRehypePlugin[];

  idPrefix?: string;
};

export const markdownToHast = ({
  text,
  remarks,
  rehypes,
  idPrefix,
}: MarkdownToHastParams): HastRoot => {
  const processor = getHastProcessor({ remarks, rehypes, idPrefix });

  const mdast = processor.parse(text);

  return processor.runSync(mdast, text);
};
