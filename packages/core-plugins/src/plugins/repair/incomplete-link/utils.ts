import type { Paragraph, Parent, PhrasingContent, RootContent } from 'mdast';

import { decodeString } from 'micromark-util-decode-string';

import {
  getRepairInlineSource,
  isEscaped,
  isRepairNodeType,
  isRepairPhrasingParent,
  isRepairSourceTail,
  sliceRanges,
  withoutRepairSource,
} from '../../../utils';
import {
  getResourceBrackets,
  getResourceScanSource,
  hasLinkDescendant,
  isResourcePrefix,
} from '../utils';

/** Keep a confirmed autolink stable while its angle closer or punctuation is pending. */
export const getIncompleteAutolinkChildren = (
  node: Parent,
  parents: Parent[],
): PhrasingContent[] | undefined => {
  const tail = node.children.at(-1);

  const previous = node.children.at(-2);

  const linkSource = previous?.data?.source ?? '';

  const beforeLink = node.children.at(-3);

  const pendingAngle =
    beforeLink?.type === 'text' && /(^|[^\\])(?:\\\\)*<$/.test(beforeLink.data?.source ?? '');

  if (
    !pendingAngle &&
    tail?.type === 'text' &&
    tail.data?.source === tail.value &&
    /^[.,:;!?)]+$/.test(tail.value) &&
    previous?.type === 'link' &&
    /^(?:https?:\/\/|www\.|[^\s<>]+@)/i.test(linkSource) &&
    !isEscaped(linkSource, linkSource.length) &&
    !(
      tail.value.startsWith(';') && /&(?:#[xX]?[\da-fA-F]+|[a-zA-Z][\da-zA-Z]*)$/.test(linkSource)
    ) &&
    isRepairSourceTail(tail, [node, ...parents])
  ) {
    return node.children.slice(0, -1) as PhrasingContent[];
  }

  if (!node.children.some((child) => child.type === 'text' && child.data?.source?.includes('<'))) {
    return;
  }

  const raw = getRepairInlineSource(node);

  if (!raw) {
    return;
  }

  const match = /<([^\s<>]*)$/.exec(raw.source);

  if (!match || isEscaped(raw.source, match.index)) {
    return;
  }

  const range = raw.ranges.find((item) => item.start <= match.index && item.end > match.index);

  if (range?.node.type !== 'text') {
    return;
  }

  const address = match[1] ?? '';

  const email = /^[a-zA-Z\d.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z\d.-]*$/.test(address);

  if (!email && !/^https?:\/\/[^\s<>]*$/i.test(address)) {
    return;
  }

  const prefix = sliceRanges(raw.ranges, 0, match.index);

  if (!prefix) {
    return;
  }

  if (/^https?:\/\/$/i.test(address)) {
    return prefix;
  }

  return [
    ...prefix,
    {
      type: 'link',
      url: email ? `mailto:${address}` : address,
      children: [{ type: 'text', value: address }],
    },
  ];
};

const normalizeRepairReference = (value: string): string => {
  return value
    .replace(/[\t\n\r ]+/g, ' ')
    .replace(/^ | $/g, '')
    .toLowerCase()
    .toUpperCase();
};
const normalizeReferenceContainerSource = (source: string, parents: Parent[]): string => {
  const depth = parents.filter((parent) => parent.type === 'blockquote').length;

  return source.replace(
    /(\r\n|\r|\n)([^\r\n]*)/g,
    (_match, newline: string, continuation: string) => {
      let line = continuation;

      for (let index = 0; index < depth; index += 1) {
        line = line.replace(/^ {0,3}>[ \t]?/, '');
      }

      return newline + line;
    },
  );
};

const normalizeReferenceLineSpacing = (value: string): string => {
  return value.replace(/[ \t]*(?:\r\n|\r|\n)[ \t]*/g, '\n');
};

const getReferenceParagraphSource = (node: Paragraph, parents: Parent[]): string | undefined => {
  const source = node.data?.source;

  if (source === undefined) {
    return;
  }

  let content = '';

  for (const child of node.children) {
    const raw = child.data?.source;

    if (
      raw === undefined ||
      (child.type === 'text' &&
        normalizeReferenceLineSpacing(
          decodeString(normalizeReferenceContainerSource(raw, parents)),
        ) !== normalizeReferenceLineSpacing(child.value))
    ) {
      return;
    }

    content += raw;
  }

  return content.trim() === source.trim()
    ? normalizeReferenceContainerSource(source, parents)
    : undefined;
};

interface PendingReferenceDefinition {
  identifier: string;
  url: string;
}

const getPendingReferenceDefinition = (
  node: RootContent | undefined,
  parents: Parent[],
): PendingReferenceDefinition | undefined => {
  if (node?.type !== 'paragraph' || node.data?.source === undefined) {
    return;
  }

  const source = getReferenceParagraphSource(node, parents);

  if (source === undefined) {
    return;
  }

  const match = /^ {0,3}\[((?:\\.|[^[\]\\]){1,999})\]:[ \t]*([\s\S]*)$/.exec(source);

  if (
    !match ||
    match[1]?.startsWith('^') ||
    !normalizeRepairReference(match[1] ?? '') ||
    /\n[ \t]*\n/.test((match[1] ?? '').replace(/\r\n?/g, '\n')) ||
    !isResourcePrefix('(' + (match[2] ?? ''))
  ) {
    return;
  }

  const body = (match[2] ?? '').trimStart();

  const destination = body.startsWith('<')
    ? /^<([^<>\r\n]*)>/.exec(body)?.[1]
    : body.split(/\s/)[0];

  return {
    identifier: normalizeRepairReference(match[1] ?? ''),
    url: destination ? decodeString(destination) : '#',
  };
};

interface CompletedReferenceChildren {
  children: PhrasingContent[];
  identifiers: string[];
}

const getCompletedReferenceChildren = (
  node: Parent,
  definitions: Map<string, string>,
): CompletedReferenceChildren | undefined => {
  if (
    (!isRepairPhrasingParent(node) && !isRepairNodeType(node, 'tableCell')) ||
    node.type === 'link' ||
    node.type === 'linkReference'
  ) {
    return;
  }

  if (!node.children.some((child) => child.data?.source?.includes(']['))) {
    return;
  }

  const raw = getRepairInlineSource(node);

  if (!raw) {
    return;
  }

  let scanned = '';

  for (const child of node.children) {
    const source = getResourceScanSource(child);

    if (source === undefined) {
      return;
    }

    scanned += source;
  }

  const brackets = getResourceBrackets(scanned, raw.ranges);

  const byStart = new Map(brackets.map((bracket) => [bracket.opener, bracket]));

  const children: PhrasingContent[] = [];

  const identifiers: string[] = [];

  let consumed = 0;

  for (const bracket of brackets) {
    const { opener, close, range } = bracket;

    const reference = byStart.get(close + 1);

    if (
      opener < consumed ||
      bracket.image ||
      bracket.insideImage ||
      range.node.type !== 'text' ||
      raw.source[opener + 1] === '^' ||
      raw.source[opener - 1] === '!' ||
      !reference ||
      reference.close === raw.source.length
    ) {
      continue;
    }

    const identifier = raw.source.slice(reference.opener + 1, reference.close);

    if (identifier.length > 999 || /(^|[^\\])[[\]]/.test(identifier)) {
      continue;
    }

    const prefix = sliceRanges(raw.ranges, consumed, opener);

    const label = sliceRanges(raw.ranges, opener + 1, close);

    if (!prefix || !label || label.length === 0 || hasLinkDescendant(label)) {
      continue;
    }

    const key = normalizeRepairReference(identifier || raw.source.slice(opener + 1, close));

    if (!key) {
      continue;
    }

    identifiers.push(key);

    children.push(...prefix, {
      type: 'link',
      url: definitions.get(key) ?? '#',
      title: null,
      children: label.map((child) => (child.type === 'text' ? withoutRepairSource(child) : child)),
    });

    consumed = reference.close + 1;
  }

  if (consumed === 0) {
    return;
  }

  const suffix = sliceRanges(raw.ranges, consumed, raw.source.length);

  return suffix ? { children: [...children, ...suffix], identifiers } : undefined;
};

const isPendingReferenceLabel = (
  node: RootContent | undefined,
  parents: Parent[],
  identifiers: Set<string>,
): boolean => {
  if (node?.type !== 'paragraph' || identifiers.size === 0 || node.data?.source === undefined) {
    return false;
  }

  let source = getReferenceParagraphSource(node, parents);

  if (source === undefined) {
    return false;
  }

  if (!isRepairSourceTail(node, parents)) {
    const trailing = /(?:\r\n|\r|\n)[^\r\n]*$/.exec(parents.at(-1)?.data?.source ?? '')?.[0];

    const whitespace = trailing && normalizeReferenceContainerSource(trailing, parents);

    if (
      !trailing ||
      !whitespace ||
      !/^(?:\r\n|\r|\n)[ \t]*$/.test(whitespace) ||
      !parents.every(
        (parent) =>
          parent.data?.source?.endsWith(node.data?.source ?? '') ||
          parent.data?.source?.endsWith(node.data?.source + trailing),
      )
    ) {
      return false;
    }

    source += whitespace;
  }

  const match = /^ {0,3}\[((?:\\.|[^[\]\\]){0,999})(\\|\]?)$/.exec(source);

  if (!match || /\n[ \t]*\n/.test(source.replace(/\r\n?/g, '\n'))) {
    return false;
  }

  const identifier = normalizeRepairReference(match[1] ?? '');

  return match[2] === ']'
    ? identifiers.has(identifier)
    : [...identifiers].some((label) => label.startsWith(identifier));
};

/** Explicit references remain labels while a later definition or its title is arriving. */
export const getPendingReferenceTree = (root: Parent): RootContent[] | undefined => {
  if (
    root.type !== 'root' ||
    (root.data?.source !== undefined && !root.data.source.includes(']['))
  ) {
    return;
  }

  let tail = root.children.at(-1);

  const tailParents = [root];

  while (tail && ['blockquote', 'list', 'listItem'].includes(tail.type) && 'children' in tail) {
    tailParents.unshift(tail);

    tail = tail.children.at(-1);
  }

  const pending = getPendingReferenceDefinition(tail, tailParents);

  const definitions = new Map<string, string>();

  const collectDefinitions = (node: Parent | RootContent): void => {
    if (isRepairNodeType(node, 'definition')) {
      const key = normalizeRepairReference(node.identifier);

      if (!definitions.has(key)) {
        definitions.set(key, node.url);
      }
    }

    if ('children' in node) {
      node.children.forEach(collectDefinitions);
    }
  };

  collectDefinitions(root);

  if (pending && !definitions.has(pending.identifier)) {
    definitions.set(pending.identifier, pending.url);
  }

  const unresolved = new Set<string>();

  const visit = (node: RootContent): RootContent[] => {
    if (node === tail && (pending || isPendingReferenceLabel(node, tailParents, unresolved))) {
      return [];
    }

    if (!('children' in node) || node.type === 'link' || node.type === 'linkReference') {
      return [node];
    }

    const repaired = getCompletedReferenceChildren(node, definitions);

    for (const identifier of repaired?.identifiers ?? []) {
      if (!definitions.has(identifier)) {
        unresolved.add(identifier);
      }
    }

    const children = (repaired?.children ?? node.children).flatMap(visit);

    if (
      !repaired &&
      children.length === node.children.length &&
      children.every((child, index) => child === node.children[index])
    ) {
      return [node];
    }

    return [withoutRepairSource({ ...node, children } as RootContent)];
  };

  const children = root.children.flatMap(visit);

  return children.length !== root.children.length ||
    children.some((child, index) => child !== root.children[index])
    ? children
    : undefined;
};
