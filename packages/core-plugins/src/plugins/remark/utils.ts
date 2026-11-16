import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import type { Node } from 'unist';

import { assign, isArray, isEmpty } from 'lodash-es';

/**
 * Capture provenance before transformers run; repairs never consult coordinates.
 */
export const setTextSourceByNode = <T extends Node>(node: T, source: string): T => {
  const start = node.position?.start.offset;

  const end = node.position?.end.offset;

  const data = { ...node.data };

  delete data.source;

  if (start !== undefined && end !== undefined) {
    data.source = source.slice(start, end);
  }

  const result: T = { ...node, data };

  if ('children' in node && isArray(node.children)) {
    assign(result, {
      children: node.children.map((child: Node) => setTextSourceByNode(child, source)),
    });
  }

  if (isEmpty(data)) {
    delete (result as Node).data;
  }

  return result;
};

/**
 * Shared attacher: unified installs this once before any tree transformer executes.
 */
export const setTextSource: Plugin<[], Root, Root> = function () {
  const parser = this.parser;

  if (parser) {
    this.parser = (source, file) => setTextSourceByNode(parser(source, file), source);
  }
};
