import type { CSSProperties, ReactNode } from 'react';

import { getReactProps } from '@fluxdown/react-plugins/base';
import { createElement, useEffect, useMemo, useRef, useState } from 'react';

import type {
  BlockSnapshot,
  Change,
  RenderSnapshot,
  TextPart,
  TextSnapshot,
  TreeSnapshot,
} from './type';

import { useBottomScroll } from '../../../bottom-scroll';
import { useListDiff, useTextDiff, useTreeDiff } from './diff-hooks';
import styles from './index.module.scss';

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const STRUCTURAL_ELEMENTS = new Set([
  'ul',
  'ol',
  'blockquote',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
]);

const changeStyle = (change?: Change): CSSProperties | undefined =>
  change ? { animationDelay: `${-Math.max(0, Date.now() - change.time)}ms` } : undefined;

const Removed = ({ change, children }: { change: Change; children: ReactNode }) => {
  const [visible, setVisible] = useState(() => Date.now() - change.time < 1600);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setVisible(false),
      Math.max(0, change.time + 1600 - Date.now()),
    );
    return () => window.clearTimeout(timeout);
  }, [change]);

  return visible ? children : null;
};

const HighlightPart = ({ part, removed }: { part: TextPart; removed: boolean }) => {
  const style = useMemo(() => changeStyle(part.change), [part.change]);
  if (part.change?.kind === 'removed') {
    return removed ? (
      <Removed change={part.change}>
        <del className={styles.removed} data-diff="removed" style={style}>
          {part.value}
        </del>
      </Removed>
    ) : null;
  }
  return part.change ? (
    <mark className={styles.added} data-diff="added" style={style}>
      {part.value}
    </mark>
  ) : (
    part.value
  );
};

const HighlightText = ({
  snapshot,
  removed = true,
}: {
  snapshot: TextSnapshot;
  removed?: boolean;
}) => {
  let position = 0;
  return (
    <>
      {snapshot.parts.map((part) => {
        const start = position;
        if (part.change?.kind !== 'removed') {
          position += part.value.length;
        }
        return (
          <HighlightPart
            part={part}
            removed={removed}
            key={`${part.change?.id ?? 'plain'}:${start}`}
          />
        );
      })}
    </>
  );
};

export const SourceEditor = ({
  text,
  onChange,
  label,
  reducedMotion,
}: {
  text: string;
  onChange(text: string): void;
  label: string;
  reducedMotion: boolean;
}) => {
  const snapshot = useTextDiff(text, false);
  const highlight = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const syncHighlight = (viewport: HTMLTextAreaElement) => {
    if (highlight.current) {
      highlight.current.scrollTop = viewport.scrollTop;
      highlight.current.scrollLeft = viewport.scrollLeft;
    }
  };
  const { viewportRef, contentRef } = useBottomScroll<HTMLTextAreaElement>(
    reducedMotion,
    editing ? 'static' : 'active',
    undefined,
    syncHighlight,
  );
  const removed = snapshot.parts.filter((part) => part.change?.kind === 'removed');

  return (
    <>
      <div className={styles.editor}>
        <div aria-hidden="true" className={styles.highlight} ref={highlight}>
          <div ref={contentRef}>
            <pre className={styles.sourceText}>
              <HighlightText snapshot={snapshot} removed={false} />
              {'\n'}
            </pre>
          </div>
        </div>
        <textarea
          aria-label={label}
          autoCapitalize="off"
          autoComplete="off"
          className={styles.input}
          onBlur={() => setEditing(false)}
          onChange={(event) => onChange(event.currentTarget.value)}
          onFocus={() => setEditing(true)}
          onScroll={(event) => syncHighlight(event.currentTarget)}
          spellCheck={false}
          ref={viewportRef}
          value={text}
        />
      </div>
      {removed.length > 0 && (
        <div aria-hidden="true" className={styles.deletedText}>
          <HighlightText snapshot={{ value: '', parts: removed }} />
        </div>
      )}
    </>
  );
};

const TreeNode = ({ snapshot }: { snapshot: TreeSnapshot }) => {
  const { node } = snapshot;
  const structural =
    node.type === 'root' || (node.type === 'element' && STRUCTURAL_ELEMENTS.has(node.tagName));
  const children = [...snapshot.children, ...snapshot.removed].filter(
    ({ node: child }) =>
      !(structural && child.type === 'text' && child.value.includes('\n') && !child.value.trim()),
  );

  const content = (
    <li
      className={snapshot.change?.kind === 'removed' ? styles.removedNode : undefined}
      data-node={node.type}
      data-diff={snapshot.change?.kind}
    >
      {node.type === 'text' ? (
        <span className={styles.treeText}>
          “<HighlightText snapshot={snapshot.text} />”
        </span>
      ) : (
        <span className={styles.nodeLabel}>
          <HighlightText snapshot={snapshot.label} />
        </span>
      )}
      {children.length > 0 && (
        <ul>
          {children.map((child) => (
            <TreeNode snapshot={child} key={child.key} />
          ))}
        </ul>
      )}
    </li>
  );

  return snapshot.change?.kind === 'removed' ? (
    <Removed change={snapshot.change}>{content}</Removed>
  ) : (
    content
  );
};

const TreeBlock = ({ block }: { block: BlockSnapshot }) => {
  const snapshot = useTreeDiff(block.tree);
  return (
    <ul className={styles.tree}>
      <TreeNode snapshot={snapshot} />
    </ul>
  );
};

const ChunkText = ({ text }: { text: string }) => {
  const snapshot = useTextDiff(text);
  return (
    <pre className={styles.chunkText}>
      <HighlightText snapshot={snapshot} />
    </pre>
  );
};

export const ChunkList = ({ sections }: { sections: string[] }) => {
  const items = useMemo(
    () => sections.map((value, index) => ({ key: String(index), value })),
    [sections],
  );
  const snapshots = useListDiff(items);

  return (
    <div className={styles.blocks}>
      {snapshots.map((item, index) => {
        const content = (
          <div
            className={styles.block}
            data-block={item.key}
            data-diff={item.change?.kind}
            key={item.key}
            style={changeStyle(item.change)}
          >
            <span aria-hidden="true" className={styles.blockIndex}>
              {index + 1}
            </span>
            <ChunkText text={item.value} />
          </div>
        );
        return item.change?.kind === 'removed' ? (
          <Removed change={item.change} key={item.key}>
            {content}
          </Removed>
        ) : (
          content
        );
      })}
    </div>
  );
};

export const TreeList = ({ blocks }: { blocks: BlockSnapshot[] }) => {
  const items = useMemo(() => blocks.map((value) => ({ key: value.key, value })), [blocks]);
  const snapshots = useListDiff(items);

  return (
    <div className={styles.blocks}>
      {snapshots.map((item) => {
        const content = (
          <div
            className={styles.block}
            data-block={item.key}
            data-diff={item.change?.kind}
            key={item.key}
            style={changeStyle(item.change)}
          >
            <TreeBlock block={item.value} />
          </div>
        );
        return item.change?.kind === 'removed' ? (
          <Removed change={item.change} key={item.key}>
            {content}
          </Removed>
        ) : (
          content
        );
      })}
    </div>
  );
};

export const MarkdownTree = ({ snapshot }: { snapshot: TreeSnapshot }) => {
  const { node } = snapshot;
  if (node.type === 'text') {
    return node.value.trim() ? <HighlightText snapshot={snapshot.text} /> : node.value;
  }
  if (node.type !== 'root' && node.type !== 'element') {
    return null;
  }

  const children = [...snapshot.children, ...snapshot.removed].map((child) => {
    const content = <MarkdownTree key={child.key} snapshot={child} />;
    return child.change?.kind === 'removed' ? (
      <Removed change={child.change} key={child.key}>
        {content}
      </Removed>
    ) : (
      content
    );
  });
  if (node.type === 'root') {
    return <>{children}</>;
  }

  const props = getReactProps(node);
  const kind = snapshot.change?.kind;
  const className = [props.className, kind === 'removed' ? styles.removedNode : undefined]
    .filter(Boolean)
    .join(' ');
  return createElement(
    node.tagName,
    {
      ...props,
      className,
      'data-diff': kind,
      style: {
        ...(typeof props.style === 'object' && props.style !== null ? props.style : {}),
        ...changeStyle(snapshot.change),
      },
    },
    ...(VOID_ELEMENTS.has(node.tagName) ? [] : children),
  );
};

export const MarkdownList = ({ blocks }: { blocks: RenderSnapshot[] }) => {
  const items = useMemo(() => blocks.map((value) => ({ key: value.key, value })), [blocks]);
  const snapshots = useListDiff(items);

  return (
    <div className={styles.markdown}>
      {snapshots.map((item) => {
        const content = (
          <div
            data-block={item.key}
            data-diff={item.change?.kind}
            key={item.key}
            style={changeStyle(item.change)}
          >
            {item.value.content}
          </div>
        );
        return item.change?.kind === 'removed' ? (
          <Removed change={item.change} key={item.key}>
            {content}
          </Removed>
        ) : (
          content
        );
      })}
    </div>
  );
};
