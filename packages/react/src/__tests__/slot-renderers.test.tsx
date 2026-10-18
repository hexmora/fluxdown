import type { ImageProps, LinkProps, ParagraphProps } from '@fluxdown/react-presets/base';
import type { IRehypePlugin } from '@fluxdown/types';
import type { Element, ElementContent } from 'hast';

import { BaseRehypePlugin } from '@fluxdown/core-presets/rehype';
import { BaseSlotPlugin, SlotProvider } from '@fluxdown/react-base-presets/base';
import {
  CodeBlockSlotPlugin,
  HeadingSlotPlugin,
  ImageSlotPlugin,
  LinkSlotPlugin,
  PRESET_SLOT_PLUGINS,
} from '@fluxdown/react-presets/slot';
import { fireEvent, render, screen } from '@testing-library/react';

import { Fluxdown } from '..';

const CodeBlockRenderer = new CodeBlockSlotPlugin().Component;

const HeadingRenderer = new HeadingSlotPlugin().Component;

const ImageRenderer = new ImageSlotPlugin().Component;

const LinkRenderer = new LinkSlotPlugin().Component;

const node: Element = {
  type: 'element',
  tagName: 'span',
  properties: {},
  children: [],
};

const CodeBlockHarness = ({ loading }: { loading: boolean }) => {
  return (
    <SlotProvider plugins={PRESET_SLOT_PLUGINS}>
      <CodeBlockRenderer Raw={null} code="value" language="ts" loading={loading} />
    </SlotProvider>
  );
};

const createNode = (
  tagName: string,
  properties: Element['properties'],
  children: ElementContent[] = [],
): Element => ({ type: 'element', tagName, properties, children });

const withNodes = (nodes: Element[]) => {
  return class NodesRehypePlugin extends BaseRehypePlugin {
    static readonly key = 'test-slot-properties';

    readonly config = { priority: Infinity };

    plugin: IRehypePlugin['plugin'] = () => (tree) => {
      tree.children = nodes;
    };
  };
};

describe('minimal slot renderers', () => {
  test('preserves the starting number of an ordered Markdown list', () => {
    render(<Fluxdown text={'3. Third step\n4. Fourth step'} />);

    expect(screen.getByRole('list')).toHaveAttribute('start', '3');

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  test('forwards heading DOM attributes without exposing slot internals', () => {
    const props = {
      'aria-label': 'Review section',
      className: 'consumer-heading',
      current: node,
      'data-section': 'review',
      id: 'review-heading',
      level: 2,
      parents: [],
      Raw: () => null,
      render: () => null,
      style: { color: 'purple' },
    };

    render(<HeadingRenderer {...props}>Review</HeadingRenderer>);

    const heading = screen.getByRole('heading', { name: 'Review section' });

    expect(heading).toHaveAttribute('id', 'review-heading');

    expect(heading).toHaveAttribute('data-section', 'review');

    expect(heading).toHaveClass('consumer-heading');

    expect(heading).toHaveStyle({ color: 'rgb(128, 0, 128)' });

    expect(heading).not.toHaveAttribute('current');

    expect(heading).not.toHaveAttribute('parents');

    expect(heading).not.toHaveAttribute('render');

    expect(heading).not.toHaveAttribute('raw');
  });

  test('exposes CodeBlock loading state through native accessibility semantics', () => {
    const { container, rerender } = render(<CodeBlockHarness loading />);

    const codeBlock = container.firstElementChild;

    expect(codeBlock).toHaveAttribute('aria-busy', 'true');

    rerender(<CodeBlockHarness loading={false} />);

    expect(codeBlock).not.toHaveAttribute('aria-busy');
  });

  test('preserves safe relative links and image sources', () => {
    render(
      <>
        <LinkRenderer Raw={null} current={node} href="/docs/start" parents={[]} render={() => null}>
          Documentation
        </LinkRenderer>
        <ImageRenderer
          Raw={null}
          alt="Diagram"
          current={node}
          parents={[]}
          render={() => null}
          src="./diagram.png"
        />
      </>,
    );

    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute(
      'href',
      '/docs/start',
    );

    expect(screen.getByRole('img', { name: 'Diagram' })).toHaveAttribute('src', './diagram.png');
  });

  test('does not expose executable URL schemes', () => {
    render(
      <>
        <LinkRenderer
          Raw={null}
          current={node}
          href="javascript:alert(1)"
          parents={[]}
          render={() => null}
        >
          Unsafe link
        </LinkRenderer>
        <ImageRenderer
          Raw={null}
          alt="Unsafe image"
          current={node}
          parents={[]}
          render={() => null}
          src="data:text/html,unsafe"
        />
      </>,
    );

    expect(screen.getByText('Unsafe link').closest('a')).not.toHaveAttribute('href');

    expect(screen.getByRole('img', { name: 'Unsafe image' })).not.toHaveAttribute('src');
  });

  test('renders email autolinks without allowing email URLs as image sources', () => {
    render(
      <>
        <Fluxdown text="<hello@example.com>" />
        <ImageRenderer
          Raw={null}
          alt="Invalid source"
          current={node}
          parents={[]}
          render={() => null}
          src="mailto:hello@example.com"
        />
      </>,
    );

    expect(screen.getByRole('link', { name: 'hello@example.com' })).toHaveAttribute(
      'href',
      'mailto:hello@example.com',
    );

    expect(screen.getByRole('img')).not.toHaveAttribute('src');
  });

  test('preserves HTTP URLs and updates memoized links and images when their sources change', () => {
    const nodeProps = {
      current: node,
      parents: [],
      render: () => null,
    };

    const view = render(
      <>
        <LinkRenderer
          Raw={null}
          {...nodeProps}
          href="http://example.com/docs"
          title="Documentation"
        >
          Documentation
        </LinkRenderer>
        <ImageRenderer
          Raw={null}
          {...nodeProps}
          alt="Diagram"
          src="http://example.com/diagram.png"
        />
        <ImageRenderer
          Raw={null}
          {...nodeProps}
          alt="Relative protocol"
          src="//example.com/diagram.png"
        />
      </>,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', 'http://example.com/docs');

    expect(screen.getByRole('link')).toHaveAttribute('title', 'Documentation');

    expect(screen.getByRole('img', { name: 'Diagram' })).toHaveAttribute(
      'src',
      'http://example.com/diagram.png',
    );

    expect(screen.getByRole('img', { name: 'Relative protocol' })).toHaveAttribute(
      'src',
      '//example.com/diagram.png',
    );

    view.rerender(
      <>
        <LinkRenderer Raw={null} {...nodeProps} href="#notes">
          Documentation
        </LinkRenderer>
        <ImageRenderer Raw={null} {...nodeProps} alt="Diagram" src="javascript:alert(1)" />
      </>,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '#notes');

    expect(screen.getByRole('img')).not.toHaveAttribute('src');
  });
});

describe('rendered slot properties', () => {
  test('maps HAST attributes through Fluxdown and preserves explicit slot overrides', () => {
    const Nodes = withNodes([
      createNode(
        'p',
        {
          id: 'paragraph',
          className: ['from-hast'],
          style: 'color: red',
          dataSource: 'hast',
          ariaLabel: 'paragraph label',
        },
        [{ type: 'text', value: 'content' }],
      ),
    ]);

    class StyledParagraph extends BaseSlotPlugin<'Paragraph'> {
      static readonly key = 'test-styled-paragraph';

      readonly type = 'Paragraph';

      readonly Component = ({ Raw, ...props }: ParagraphProps) =>
        Raw ? (
          <Raw {...props} className="from-plugin" style={{ color: 'blue' }} data-source="plugin" />
        ) : null;
    }

    const view = render(<Fluxdown text="placeholder" plugins={[{ rehypes: [Nodes] }]} />);

    const paragraph = screen.getByLabelText('paragraph label');

    expect(paragraph).toHaveAttribute('id', 'paragraph');

    expect(paragraph).toHaveAttribute('data-source', 'hast');

    expect(paragraph).toHaveClass('from-hast');

    expect(paragraph).toHaveStyle({ color: 'rgb(255, 0, 0)' });

    expect(paragraph).not.toHaveAttribute('current');

    view.rerender(
      <Fluxdown text="placeholder" plugins={[{ rehypes: [Nodes], slots: [StyledParagraph] }]} />,
    );

    const updated = screen.getByLabelText('paragraph label');

    expect(updated).toHaveClass('from-plugin');

    expect(updated).not.toHaveClass('from-hast');

    expect(updated).toHaveStyle({ color: 'rgb(0, 0, 255)' });

    expect(updated).toHaveAttribute('data-source', 'plugin');
  });

  test('keeps link interaction and explicit image dimensions after HAST conversion', () => {
    const onClick = jest.fn();

    const Nodes = withNodes([
      createNode('a', { href: 'https://example.com', dataSource: 'link' }, [
        { type: 'text', value: 'link' },
      ]),
      createNode('img', {
        src: 'https://example.com/image.png',
        alt: 'image',
        width: 40,
        height: 30,
      }),
    ]);

    class ClickableLink extends BaseSlotPlugin<'Link'> {
      static readonly key = 'test-clickable-link';

      readonly type = 'Link';

      readonly Component = ({ Raw, ...props }: LinkProps) =>
        Raw ? <Raw {...props} href="https://example.com/custom" onClick={onClick} /> : null;
    }

    class SizedImage extends BaseSlotPlugin<'Image'> {
      static readonly key = 'test-sized-image';

      readonly type = 'Image';

      readonly Component = ({ Raw, ...props }: ImageProps) =>
        Raw ? <Raw {...props} width={120} /> : null;
    }

    render(
      <Fluxdown
        text="placeholder"
        plugins={[{ rehypes: [Nodes], slots: [ClickableLink, SizedImage] }]}
      />,
    );

    const link = screen.getByRole('link');

    const image = screen.getByRole('img');

    expect(link).toHaveAttribute('href', 'https://example.com/custom');

    expect(link).toHaveAttribute('data-source', 'link');

    fireEvent.click(link);

    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ event: expect.anything() }));

    expect(image).toHaveAttribute('src', 'https://example.com/image.png');

    expect(image).toHaveAttribute('width', '120');

    expect(image).toHaveAttribute('height', '30');
  });

  test('forwards structural and raw metadata without exposing parser props', () => {
    const Nodes = withNodes([
      createNode('br', { id: 'break' }),
      createNode('table', { id: 'table' }),
      createNode('pre', { id: 'code', dataMeta: 'private metadata', ariaLabel: 'code' }, [
        createNode('code', {}, [{ type: 'text', value: 'code' }]),
      ]),
      createNode('span', { id: 'raw', className: ['from-hast'] }, [{ type: 'text', value: 'raw' }]),
    ]);

    class PlainCode extends BaseSlotPlugin<'CodeHighlighter'> {
      static readonly key = 'test-plain-code';

      readonly type = 'CodeHighlighter';

      readonly Component = () => null;
    }

    render(<Fluxdown text="placeholder" plugins={[{ rehypes: [Nodes], slots: [PlainCode] }]} />);

    for (const id of ['break', 'table', 'code', 'raw']) {
      expect(document.getElementById(id)).not.toHaveAttribute('current');

      expect(document.getElementById(id)).not.toHaveAttribute('getProps');
    }

    expect(screen.getByLabelText('code')).not.toHaveAttribute('data-meta');

    expect(document.getElementById('raw')).toHaveClass('from-hast');
  });
});
