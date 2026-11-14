import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import type { Node } from 'unist';

import { isArray } from 'lodash-es';

/** Capture provenance before transformers run; repairs never consult coordinates. */
export const captureRepairSource = <T extends Node>(node: T, source: string): T => {
  const start = node.position?.start.offset;

  const end = node.position?.end.offset;

  const data = { ...node.data };

  delete data.source;

  if (start !== undefined && end !== undefined) {
    data.source = source.slice(start, end);
  }

  const result: T = { ...node, data };

  if ('children' in node && isArray(node.children)) {
    Object.assign(result, {
      children: node.children.map((child: Node) => captureRepairSource(child, source)),
    });
  }

  if (Object.keys(data).length === 0) {
    delete (result as Node).data;
  }

  return result;
};

/** Shared attacher: unified installs this once before any tree transformer executes. */
export const captureSource: Plugin<[], Root, Root> = function () {
  const parser = this.parser;

  if (parser) {
    this.parser = (source, file) => captureRepairSource(parser(source, file), source);
  }
};
