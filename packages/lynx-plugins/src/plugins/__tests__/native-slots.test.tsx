import type { ReactNode } from '@lynx-js/react';
import type { Element, ElementContent, Parent, Root } from 'hast';

import { Fragment } from '@lynx-js/react';
import { cleanup, fireEvent, render, waitFor } from '@lynx-js/react/testing-library';
import { afterEach, expect, test } from '@rstest/core';
import { MutableState } from 'stative';

import type { ElementProps, LynxRenderParams } from '../../base';

import { BaseSlotPlugin, resolveTheme, SlotProvider, ThemeProvider } from '../../base';
import { createTypeOfSlot, getLynxProps } from '../../base';
import { CodeHeaderRenderer } from '../code/slot/code-header/renderer';
import { EmphasisRenderPlugin, EmphasisSlotPlugin } from '../emphasis';
import { ElementSlotPlugin, FallbackRenderPlugin } from '../fallback';
import { ElementRenderer } from '../fallback/slot/element/renderer';
import { HeadingSlotPlugin } from '../heading';
import { ImageRenderer } from '../image/slot/image/renderer';
import { LinkRenderer } from '../link/slot/link/renderer';
import { ListRenderPlugin, ListSlotPlugin } from '../list';
import { ParagraphRenderPlugin, ParagraphSlotPlugin } from '../paragraph';
import { ParagraphRenderer } from '../paragraph/slot/paragraph/renderer';
import { StrongRenderPlugin, StrongSlotPlugin } from '../strong';
import {
  TableCellRenderPlugin,
  TableCellSlotPlugin,
  TableRenderPlugin,
  TableSlotPlugin,
} from '../table';

afterEach(cleanup);

const element = (tagName: string, text = ''): Element => ({
  type: 'element',
  tagName,
  properties: {},
  children: text ? [{ type: 'text', value: text }] : [],
});

const current = element('p');

const nodeProps = { current, parents: [], render: () => null };

test('nested lists reuse rendered children once while preserving loose blocks and inline nulls', () => {
  const bold = element('strong', 'bold');

  const emphasis = element('em', 'italic');

  const first = {
    ...element('p'),
    children: [{ type: 'text', value: 'Alpha ' }, bold, { type: 'text', value: ' omega' }],
  } satisfies Element;

  const child = {
    ...element('li'),
    children: [
      { type: 'text', value: 'Child ' },
      { type: 'comment', value: 'ignored' },
      emphasis,
      { type: 'text', value: ' tail' },
    ],
  } satisfies Element;

  const nested = { ...element('ul'), children: [child] };

  const after = element('p', 'After nested');

  const loose = {
    ...element('li'),
    children: [
      { type: 'text', value: '\n' },
      first,
      { type: 'text', value: '\n' },
      nested,
      { type: 'text', value: '\n' },
      after,
      { type: 'text', value: '\n' },
    ],
  } satisfies Element;

  const lastBold = element('strong', 'strong');

  const tight = {
    ...element('li'),
    children: [{ type: 'text', value: 'Tight ' }, lastBold, { type: 'text', value: ' end' }],
  } satisfies Element;

  const list = { ...element('ul'), children: [loose, tight] };

  const root: Root = { type: 'root', children: [list] };

  const calls = new Map<Element, number>();

  const slotChildren = new Map<ElementContent, ReactNode>();

  class InspectElementSlot extends BaseSlotPlugin<'Element'> {
    static readonly key = 'inspect-list-children';

    readonly type = 'Element';

    readonly Component = ({ Raw, ...props }: ElementProps) => {
      slotChildren.set(props.current, props.children);

      return Raw ? <Raw {...props} /> : null;
    };
  }

  const plugins = [
    new ParagraphRenderPlugin(),
    new ListRenderPlugin(),
    new StrongRenderPlugin(),
    new EmphasisRenderPlugin(),
    new FallbackRenderPlugin(),
  ];

  const patches = new MutableState({ initial: [] }) satisfies LynxRenderParams['patches'];

  const renderNode = (node: ElementContent, parents: Parent[]): ReactNode => {
    const plugin = plugins.find((item) => item.match({ node, parents }))!;

    const renderChildren = (parent: Parent = node as Parent): ReactNode =>
      parent.children.map((descendant) =>
        renderNode(descendant as ElementContent, [...parents, parent]),
      );

    return plugin.render({
      node,
      parents,
      patches,
      renderChildren,
      render: (descendant) => renderNode(descendant, [...parents, node as Parent]),
      getProps: (target) => {
        const targetElement = target ?? (node.type === 'element' ? node : undefined);

        if (targetElement) {
          calls.set(targetElement, (calls.get(targetElement) ?? 0) + 1);
        }

        return {};
      },
    });
  };

  const view = render(
    <SlotProvider
      plugins={[
        ElementSlotPlugin,
        InspectElementSlot,
        ParagraphSlotPlugin,
        ListSlotPlugin,
        StrongSlotPlugin,
        EmphasisSlotPlugin,
      ]}
    >
      {renderNode(list, [root])}
    </SlotProvider>,
  );

  expect(view.container.textContent).toBe(
    '•Alpha bold omega◦Child italic tailAfter nested•Tight strong end',
  );

  expect(view.container.querySelectorAll('.fluxdown-list-item')).toHaveLength(3);

  expect(slotChildren.get(loose)).toHaveLength(loose.children.length);

  expect(slotChildren.get(child)).toHaveLength(child.children.length);

  expect((slotChildren.get(child) as ReactNode[])[1]).toBeNull();

  const elements = [list, loose, first, bold, nested, child, emphasis, after, tight, lastBold];

  expect(calls.size).toBe(elements.length);

  for (const node of elements) {
    expect(calls.get(node)).toBe(1);
  }

  patches.destroy();

  for (const plugin of plugins) {
    plugin.destroy();
  }
});

test('inline code resolves theme references and relative box lengths for native text', () => {
  const theme = resolveTheme({
    tokens: {
      typography: { fontSize: { md: '20px' }, fontMono: 'monospace' },
      colors: { border: '#123456', surfaceMuted: '#ffeecc' },
      radius: { sm: '6px' },
    },
  });

  const view = render(
    <ThemeProvider value={theme}>
      <ElementRenderer Raw={null} {...nodeProps} tagName="code">
        inline code
      </ElementRenderer>
    </ThemeProvider>,
  );

  const code = view.container.querySelector('.fluxdown-inline-code');
  const fragments = code?.querySelectorAll('view');

  expect(code?.textContent).toBe('inline code');
  expect(fragments).toHaveLength(2);
  expect(fragments?.[0].style).toMatchObject({
    fontSize: '17.5px',
    fontFamily: 'monospace',
    background: 'rgb(255, 238, 204)',
    borderTop: '1px solid rgb(18, 52, 86)',
    borderLeftWidth: '1px',
    borderRightStyle: 'none',
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '0px',
    marginBottom: '-3.125px',
    paddingLeft: '6.125px',
    paddingRight: '0px',
    paddingTop: '2.625px',
    paddingBottom: '2.625px',
  });
});

test('Web inline code retains spaces in one inline text box without native attachments', () => {
  const runtimes = [
    globalThis.lynxTestingEnv.mainThread,
    globalThis.lynxTestingEnv.backgroundThread,
  ];
  const originalSystemInfo = runtimes.map((runtime) => runtime['SystemInfo']);

  for (const runtime of runtimes) {
    runtime['SystemInfo'] = { platform: 'web' };
  }

  try {
    const theme = resolveTheme({
      tokens: { typography: { fontSize: { md: '20px' }, fontMono: 'monospace' } },
    });

    const view = render(
      <ThemeProvider value={theme}>
        <ElementRenderer Raw={null} {...nodeProps} tagName="code">
          inline code
        </ElementRenderer>
      </ThemeProvider>,
    );

    const code = view.container.querySelector('.fluxdown-inline-code');

    expect(code?.textContent).toBe('inline code');
    expect(code?.querySelectorAll('view')).toHaveLength(0);
    expect((code as HTMLElement).style).toMatchObject({
      fontSize: '17.5px',
      fontFamily: 'monospace',
      padding: '2.625px 6.125px',
      whiteSpace: 'normal',
    });
  } finally {
    runtimes.forEach((runtime, index) => {
      runtime['SystemInfo'] = originalSystemInfo[index];
    });
  }
});

test('theme overrides reach inline code, dividers and footnote text', () => {
  const theme = resolveTheme({
    tokens: {
      inlineCode: {
        fontSize: '18px',
        fontFamily: 'monospace',
        background: '#ffeecc',
        border: '2px solid #123456',
        borderRadius: '6px',
        whiteSpace: 'nowrap',
      },
      divider: {
        marginBlock: '30px',
        marginInline: '3px',
        background: '#aabbcc',
        borderBlockEnd: '2px solid #123456',
      },
      footnotes: {
        marginTop: '28px',
        paddingTop: '10px',
        borderTop: '1px solid #123456',
        color: '#654321',
        fontSize: '17px',
      },
    },
  });

  const divider = element('hr');

  const footnotes = { ...element('section'), properties: { dataFootnotes: true } };

  const root: Root = { type: 'root', children: [current, divider, footnotes] };

  const view = render(
    <ThemeProvider value={theme}>
      <ElementRenderer Raw={null} {...nodeProps} tagName="code">
        inline
      </ElementRenderer>
      <ElementRenderer Raw={null} {...nodeProps} current={divider} parents={[root]} tagName="hr" />
      <ElementRenderer
        Raw={null}
        {...nodeProps}
        current={footnotes}
        parents={[root]}
        tagName="section"
        className="footnotes"
      >
        <ParagraphRenderer Raw={null} {...nodeProps}>
          note
        </ParagraphRenderer>
      </ElementRenderer>
    </ThemeProvider>,
  );

  expect(view.getByText('inline').closest('view')?.style).toMatchObject({
    fontSize: '18px',
    fontFamily: 'monospace',
    background: 'rgb(255, 238, 204)',
    borderTop: '2px solid rgb(18, 52, 86)',
    borderTopLeftRadius: '6px',
    whiteSpace: 'nowrap',
  });

  expect(view.container.querySelector<HTMLElement>('.fluxdown-divider')?.style).toMatchObject({
    marginTop: '14px',
    marginBottom: '30px',
    marginLeft: '3px',
    background: 'rgb(170, 187, 204)',
    borderBottom: '2px solid rgb(18, 52, 86)',
  });

  expect(view.container.querySelector<HTMLElement>('.footnotes')?.style).toMatchObject({
    paddingTop: '10px',
    borderTop: '1px solid rgb(18, 52, 86)',
  });

  expect(view.getByText('note').style).toMatchObject({
    fontSize: '17px',
    color: 'rgb(101, 67, 33)',
  });
});

test('native IDs, data and host events survive the render and slot boundary', () => {
  const paragraph = {
    ...element('p', 'anchor'),
    properties: { id: 'footnote-1', dataSource: 'markdown' },
  };

  const patches = new MutableState({ initial: [] }) satisfies LynxRenderParams['patches'];

  let taps = 0;

  const content = new ParagraphRenderPlugin().render({
    node: paragraph,
    parents: [{ type: 'root', children: [paragraph] }],
    patches,
    getProps: (node) => ({
      ...getLynxProps(node),
      bindtap: () => {
        taps += 1;
      },
    }),
    render: () => null,
    renderChildren: () => 'anchor',
  });

  const view = render(<SlotProvider plugins={[ParagraphSlotPlugin]}>{content}</SlotProvider>);

  const anchor = view.getByText('anchor');

  expect(anchor.id).toBe('footnote-1');

  expect(anchor.getAttribute('data-source')).toBe('markdown');

  expect(anchor.getAttribute('current')).toBeNull();

  fireEvent.tap(anchor);

  expect(taps).toBe(1);

  const Heading = createTypeOfSlot('Heading');

  view.rerender(
    <SlotProvider plugins={[HeadingSlotPlugin]}>
      <Heading {...nodeProps} id="title" level={2}>
        title
      </Heading>
    </SlotProvider>,
  );

  expect(view.getByText('title').id).toBe('title');

  patches.destroy();
});

test('link taps dispatch a validated destination through the host callback', () => {
  const destinations: string[] = [];

  const view = render(
    <LinkRenderer
      Raw={null}
      {...nodeProps}
      href="https://example.com"
      onTap={({ href }) => destinations.push(href)}
    >
      open
    </LinkRenderer>,
  );

  fireEvent.tap(view.getByText('open'));

  expect(destinations).toEqual(['https://example.com']);

  view.rerender(
    <LinkRenderer
      Raw={null}
      {...nodeProps}
      href="javascript:alert(1)"
      onTap={({ href }) => destinations.push(href)}
    >
      unsafe
    </LinkRenderer>,
  );

  fireEvent.tap(view.getByText('unsafe'));

  expect(destinations).toEqual(['https://example.com']);
});

test('invalid image URLs preserve their alt text without creating a native image', () => {
  const view = render(
    <ImageRenderer Raw={null} {...nodeProps} src="javascript:alert(1)" alt="diagram" />,
  );

  expect(view.container.querySelector('image')).toBeNull();

  expect(view.getByText('diagram')).not.toBeNull();

  view.rerender(
    <ImageRenderer
      Raw={null}
      {...nodeProps}
      src="https://example.com/diagram.png"
      alt="diagram"
      width={240}
      height={120}
    />,
  );

  expect(view.container.querySelector('image')?.getAttribute('src')).toBe(
    'https://example.com/diagram.png',
  );

  expect(view.container.querySelector('image')?.getAttribute('style')).toContain('width: 240px');
});

test('task and ordered list markers preserve their semantic state without HTML inputs', () => {
  const task = element('li');

  task.children = [
    { ...element('input'), properties: { type: 'checkbox', checked: true } },
    { type: 'text', value: ' done' },
  ];

  const list = { ...element('ul'), children: [task] };

  const view = render(
    <ElementRenderer Raw={null} current={task} parents={[list]} tagName="li" render={() => null}>
      {[null, ' done']}
    </ElementRenderer>,
  );

  expect(view.container.textContent).toBe('☑ done');

  expect(view.container.querySelector('input')).toBeNull();

  const item = element('li', 'third');

  const ordered = { ...element('ol'), properties: { start: 3 }, children: [item] };

  view.rerender(
    <ElementRenderer Raw={null} current={item} parents={[ordered]} tagName="li" render={() => null}>
      third
    </ElementRenderer>,
  );

  expect(view.container.textContent).toBe('3.third');

  // Lynx's test renderer exposes the component boundary as a transparent wrapper.
  expect(view.container.querySelector('.fluxdown-list-item > wrapper > text')?.textContent).toBe(
    '3.',
  );

  view.rerender(
    <ElementRenderer
      Raw={null}
      current={item}
      parents={[ordered, { ...element('ul'), children: [item] }]}
      tagName="li"
      render={() => null}
    >
      third
    </ElementRenderer>,
  );

  expect(view.container.textContent).toBe('◦third');
});

test('loose list structure does not create empty native text lines', () => {
  const paragraph = element('p', 'paragraph');

  const nested = element('ul');

  const item: Element = {
    ...element('li'),
    children: [
      { type: 'text', value: '\n' },
      paragraph,
      { type: 'text', value: '\n' },
      nested,
      { type: 'text', value: '\n' },
    ],
  };

  const list = { ...element('ul'), children: [item] };

  const view = render(
    <ElementRenderer Raw={null} current={item} parents={[list]} tagName="li" render={() => null}>
      {item.children.map((node, index) =>
        node.type === 'text' ? (
          node.value
        ) : (
          <text key={index}>{node === paragraph ? 'paragraph' : 'nested'}</text>
        ),
      )}
    </ElementRenderer>,
  );

  expect(view.container.querySelectorAll('text')).toHaveLength(3);

  expect(view.container.textContent).toBe('•paragraphnested');
});

test('table cells share native intrinsic grid columns, alignment and row decoration', () => {
  const header = { ...element('tr'), children: [element('th', 'Name'), element('th', 'Count')] };

  const one = {
    ...element('tr'),
    children: [element('td', 'first'), { ...element('td', '1'), properties: { align: 'right' } }],
  };

  const two = { ...element('tr'), children: [element('td', 'second'), element('td', '2')] };

  const table = {
    ...element('table'),
    children: [
      { ...element('thead'), children: [header] },
      { ...element('tbody'), children: [one, two] },
    ],
  };

  const root: Root = { type: 'root', children: [table] };

  const patches = new MutableState({ initial: [] }) satisfies LynxRenderParams['patches'];

  const params: LynxRenderParams = {
    node: table,
    parents: [root],
    patches,
    getProps: () => ({}),
    render: () => null,
    renderChildren: () => null,
  };

  const renderer = new TableRenderPlugin();

  const cellRenderer = new TableCellRenderPlugin();

  const content = renderer.render({
    ...params,
    renderChildren: (row) =>
      row?.children.map((cell, index) =>
        cell.type === 'element' ? (
          <Fragment key={index}>
            {cellRenderer.render({
              ...params,
              node: cell,
              parents: [root, table, row],
              renderChildren: () =>
                cell.children.map((text) => (text.type === 'text' ? text.value : null)),
            })}
          </Fragment>
        ) : null,
      ),
  });

  const view = render(
    <SlotProvider plugins={[TableSlotPlugin, TableCellSlotPlugin]}>{content}</SlotProvider>,
  );

  expect(view.container.querySelectorAll('.fluxdown-table-cell').length).toBe(6);

  expect(view.container.querySelector('scroll-view > view')?.getAttribute('style')).toContain(
    'grid-template-columns: repeat(2, auto)',
  );

  expect(
    view.container
      .querySelectorAll('.fluxdown-table-cell')[3]
      ?.querySelector('text')
      ?.getAttribute('style'),
  ).toContain('text-align: right');

  expect(
    view.container.querySelectorAll('.fluxdown-table-cell')[4]?.getAttribute('style'),
  ).toContain('rgb(247, 248, 250)');

  patches.destroy();
});

test('code copy controls require a host action and await its completion', async () => {
  let copied = '';

  const view = render(<CodeHeaderRenderer Raw={null} code="const a = 1" language="js" />);

  expect(view.queryByText('Copy')).toBeNull();

  view.rerender(
    <CodeHeaderRenderer
      Raw={null}
      code="const a = 1"
      language="js"
      onCopy={async ({ code }) => {
        copied = code;
      }}
    />,
  );

  fireEvent.tap(view.getByText('Copy'));

  await waitFor(() => expect(copied).toBe('const a = 1'));
});

test('failed clipboard requests can retry without duplicate host calls', async () => {
  let attempts = 0;

  let reject!: (error: Error) => void;

  const onCopy = () => {
    attempts += 1;

    return new Promise<void>((_resolve, rejectRequest) => {
      reject = rejectRequest;
    });
  };

  const view = render(<CodeHeaderRenderer Raw={null} code="example" onCopy={onCopy} />);

  const action = view.getByText('Copy');

  fireEvent.tap(action);

  fireEvent.tap(action);

  expect(attempts).toBe(1);

  reject(new Error('clipboard denied'));

  await waitFor(() => expect(view.getByText('Copy')).not.toBeNull());

  fireEvent.tap(view.getByText('Copy'));

  expect(attempts).toBe(2);

  reject(new Error('clipboard denied'));

  await waitFor(() => expect(view.getByText('Copy')).not.toBeNull());
});
