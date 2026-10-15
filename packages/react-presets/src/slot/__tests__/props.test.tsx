import type { Element } from 'hast';

import { BaseSlotPlugin, SlotProvider } from '@fluxdown/react-base-presets/base';
import { fireEvent, render, screen } from '@testing-library/react';

import { BreakLineRenderer } from '../break-line/renderer';
import { CodeBlockRenderer } from '../code-block/renderer';
import { ImageRenderer } from '../image/renderer';
import { LinkRenderer } from '../link/renderer';
import { NodeRenderer } from '../node/renderer';
import { ParagraphRenderer } from '../paragraph/renderer';
import { TableRenderer } from '../table/renderer';

const node = (tagName: string, properties: Element['properties']): Element => ({
  type: 'element',
  tagName,
  properties,
  children: [],
});

const nodeProps = { Raw: null, parents: [], render: () => null };

class PlainCode extends BaseSlotPlugin<'CodeHighlighter'> {
  static readonly key = 'props-plain-code';

  readonly type = 'CodeHighlighter';

  readonly Component = () => null;
}

describe('platform slot properties', () => {
  test('reads HAST attributes and lets explicit props override style and class names', () => {
    const current = node('p', {
      id: 'paragraph',
      className: ['from-hast'],
      style: 'color: red',
      dataSource: 'hast',
      ariaLabel: 'paragraph label',
    });

    const view = render(
      <ParagraphRenderer {...nodeProps} current={current}>
        content
      </ParagraphRenderer>,
    );

    const paragraph = screen.getByLabelText('paragraph label');

    expect(paragraph).toHaveAttribute('id', 'paragraph');

    expect(paragraph).toHaveAttribute('data-source', 'hast');

    expect(paragraph).toHaveClass('from-hast');

    expect(paragraph).toHaveStyle({ color: 'rgb(255, 0, 0)' });

    expect(paragraph).not.toHaveAttribute('current');

    view.rerender(
      <ParagraphRenderer
        {...nodeProps}
        current={current}
        className="from-plugin"
        style={{ color: 'blue' }}
        data-source="plugin"
      >
        content
      </ParagraphRenderer>,
    );

    expect(paragraph).toHaveClass('from-plugin');

    expect(paragraph).not.toHaveClass('from-hast');

    expect(paragraph).toHaveStyle({ color: 'rgb(0, 0, 255)' });

    expect(paragraph).toHaveAttribute('data-source', 'plugin');
  });

  test('keeps semantic link and image props ahead of their HAST attributes', () => {
    const onClick = jest.fn();

    render(
      <>
        <LinkRenderer
          {...nodeProps}
          current={node('a', { href: 'javascript:invalid', dataSource: 'link' })}
          href="https://example.com"
          onClick={onClick}
        >
          link
        </LinkRenderer>
        <ImageRenderer
          {...nodeProps}
          current={node('img', { src: 'javascript:invalid', width: 40, height: 30 })}
          src="https://example.com/image.png"
          alt="image"
          width={120}
        />
      </>,
    );

    const link = screen.getByRole('link');

    const image = screen.getByRole('img');

    expect(link).toHaveAttribute('href', 'https://example.com');

    expect(link).toHaveAttribute('data-source', 'link');

    fireEvent.click(link);

    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ event: expect.anything() }));

    expect(image).toHaveAttribute('src', 'https://example.com/image.png');

    expect(image).toHaveAttribute('width', '120');

    expect(image).toHaveAttribute('height', '30');
  });

  test('keeps metadata on structural and code slots without leaking parser props', () => {
    render(
      <SlotProvider plugins={[PlainCode]}>
        <BreakLineRenderer Raw={null} current={node('br', { id: 'break' })} />
        <TableRenderer Raw={null} current={node('table', { id: 'table' })} />
        <CodeBlockRenderer
          Raw={null}
          current={node('pre', { id: 'code', dataMeta: 'private metadata', ariaLabel: 'code' })}
          code="code"
          showHeader={false}
        />
        <NodeRenderer
          {...nodeProps}
          current={node('span', { id: 'raw', className: ['from-hast'] })}
          renderChildren={() => 'raw'}
          className="from-plugin"
        />
      </SlotProvider>,
    );

    for (const id of ['break', 'table', 'code', 'raw']) {
      expect(document.getElementById(id)).not.toHaveAttribute('current');
    }

    expect(screen.getByLabelText('code')).not.toHaveAttribute('data-meta');

    expect(document.getElementById('raw')).toHaveClass('from-plugin');

    expect(document.getElementById('raw')).not.toHaveClass('from-hast');
  });
});
