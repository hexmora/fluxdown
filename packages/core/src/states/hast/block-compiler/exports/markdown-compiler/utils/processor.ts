import type { IRehypePlugin, IRemarkPlugin } from '@fluxdown/types';

import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { type Processor, unified } from 'unified';

import type { HastRoot, MdastRoot } from '../../../../../../typings';
import type { MarkdownCompilerInputs } from '../type';

import { getFootnotePrefix, namespaceFootnoteLabel } from './footnote';

type HastProcessor = Processor<MdastRoot, MdastRoot, HastRoot, undefined, undefined>;

type ProcessorPlugin = IRemarkPlugin | IRehypePlugin;

export interface ProcessorSnapshot {
  remarks: object[];

  rehypes: object[];

  idPrefix?: string;

  processor: HastProcessor;
}

const getHastProcessor = ({
  remarks = [],
  rehypes = [],
  idPrefix,
}: Omit<MarkdownCompilerInputs, 'text'>) => {
  const markdown = unified().use(remarkParse);

  for (const remark of remarks) {
    markdown.use(remark.plugin);
  }

  const prefix = getFootnotePrefix(idPrefix);

  const processor = markdown.use(remarkRehype, {
    allowDangerousHtml: true,
    // The sanitizer applies the safety prefix once, including ARIA ID references.
    clobberPrefix: prefix,
  });

  if (prefix) {
    processor.use(namespaceFootnoteLabel, prefix);
  }

  for (const rehype of rehypes) {
    processor.use(rehype.plugin);
  }

  return processor;
};

const getAttacher = ({ plugin }: ProcessorPlugin): object => plugin;

const isAttachersEqual = (snapshots: object[], plugins: ProcessorPlugin[]): boolean =>
  snapshots.length === plugins.length &&
  plugins.every(({ plugin }, index) => plugin === snapshots[index]);

export const isProcessorEqual = (
  snapshot: ProcessorSnapshot,
  { remarks = [], rehypes = [], idPrefix }: MarkdownCompilerInputs,
): boolean =>
  snapshot.idPrefix === idPrefix &&
  isAttachersEqual(snapshot.remarks, remarks) &&
  isAttachersEqual(snapshot.rehypes, rehypes);

export const createProcessorSnapshot = ({
  remarks = [],
  rehypes = [],
  idPrefix,
}: MarkdownCompilerInputs): ProcessorSnapshot => ({
  remarks: remarks.map(getAttacher),
  rehypes: rehypes.map(getAttacher),
  idPrefix,
  processor: getHastProcessor({ remarks, rehypes, idPrefix }).freeze(),
});
