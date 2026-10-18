import type { Element } from 'hast';

import { createTypeOfSlot, SlotProvider } from '@fluxdown/react-base-presets/base';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Linking, Image as NativeImage, StyleSheet, Text, View } from 'react-native';

import type { SlotInputProps } from '../../base';

import { PRESET_SLOT_PLUGINS } from '..';
import { getReactNativeProps, NativeThemeProvider } from '../../base';

const current: Element = { type: 'element', tagName: 'p', properties: {}, children: [] };

const nodeProps = {
  current,
  parents: [],
  render: () => null,
  getProps: getReactNativeProps,
};

const Link = createTypeOfSlot<'Link', SlotInputProps<'Link'>>('Link');

const Image = createTypeOfSlot<'Image', SlotInputProps<'Image'>>('Image');

const CodeBlock = createTypeOfSlot<'CodeBlock', SlotInputProps<'CodeBlock'>>('CodeBlock');

const Tex = createTypeOfSlot<'Tex', SlotInputProps<'Tex'>>('Tex');

const Paragraph = createTypeOfSlot<'Paragraph', SlotInputProps<'Paragraph'>>('Paragraph');

const BreakLine = createTypeOfSlot<'BreakLine', SlotInputProps<'BreakLine'>>('BreakLine');

const Table = createTypeOfSlot<'Table', SlotInputProps<'Table'>>('Table');

const TableCell = createTypeOfSlot<'TableCell', SlotInputProps<'TableCell'>>('TableCell');

const Node = createTypeOfSlot<'Node', SlotInputProps<'Node'>>('Node');

const provider = ({ children }: { children: React.ReactNode }) => (
  <NativeThemeProvider>
    <SlotProvider plugins={PRESET_SLOT_PLUGINS}>{children}</SlotProvider>
  </NativeThemeProvider>
);

const withMetadata = (tagName: string): Element => ({
  type: 'element',
  tagName,
  children: [],
  properties: { id: `native-${tagName}`, ariaLabel: `label-${tagName}` },
});

describe('native slot renderers', () => {
  test('forwards mapped native metadata through semantic and structural slots', () => {
    render(
      <>
        <Paragraph
          {...nodeProps}
          current={withMetadata('p')}
          {...getReactNativeProps(withMetadata('p'))}
          testID="p"
        >
          paragraph
        </Paragraph>
        <BreakLine {...getReactNativeProps(withMetadata('br'))} testID="br" />
        <Table {...getReactNativeProps(withMetadata('table'))} testID="table" />
        <CodeBlock
          {...getReactNativeProps(withMetadata('pre'))}
          testID="pre"
          code="code"
          showHeader={false}
        />
        <Node
          {...nodeProps}
          current={withMetadata('code')}
          testID="code"
          renderChildren={() => 'inline code'}
        />
      </>,
      { wrapper: provider },
    );

    for (const tag of ['p', 'br', 'table', 'pre', 'code']) {
      expect(screen.getByTestId(tag)).toHaveProp('nativeID', `native-${tag}`);

      expect(screen.getByTestId(tag)).toHaveProp('accessibilityLabel', `label-${tag}`);

      expect(screen.getByTestId(tag)).not.toHaveProp('current');
    }
  });

  test('lets explicit native image props override HAST metadata and dimensions', () => {
    const imageNode: Element = {
      type: 'element',
      tagName: 'img',
      children: [],
      properties: { id: 'from-hast', ariaLabel: 'HAST image', width: 100, height: 50 },
    };

    const view = render(
      <Image
        {...nodeProps}
        current={imageNode}
        {...getReactNativeProps(imageNode)}
        src="https://example.com/image.png"
        alt="alt"
      />,
      { wrapper: provider },
    );

    expect(screen.getByRole('image', { name: 'HAST image' })).toHaveStyle({
      width: 100,
      height: 50,
    });

    expect(screen.getByRole('image')).toHaveProp('nativeID', 'from-hast');

    view.rerender(
      <Image
        {...nodeProps}
        current={imageNode}
        {...getReactNativeProps(imageNode)}
        src="https://example.com/image.png"
        alt="alt"
        nativeID="from-plugin"
        accessibilityLabel="Plugin image"
        width={120}
        style={{ height: 80 }}
      />,
    );

    expect(screen.getByRole('image', { name: 'Plugin image' })).toHaveStyle({
      width: 120,
      height: 80,
    });

    expect(screen.getByRole('image')).toHaveProp('nativeID', 'from-plugin');
  });

  test('keeps linked images in a pressable layout outside native Text', () => {
    const onPress = jest.fn();

    const imageNode: Element = {
      type: 'element',
      tagName: 'img',
      properties: {},
      children: [],
    };

    const linkNode: Element = {
      type: 'element',
      tagName: 'a',
      properties: {},
      children: [imageNode],
    };

    const view = render(
      <Link
        {...nodeProps}
        current={linkNode}
        href="https://example.com"
        onPress={onPress}
        render={() => <Image {...nodeProps} src="https://example.com/image.png" alt="linked" />}
      />,
      { wrapper: provider },
    );

    expect(view.toJSON()).toMatchObject({ type: 'View', children: [{ type: 'Image' }] });

    fireEvent.press(screen.getByRole('link'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('opens public links through Linking and accepts native press handlers', () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);

    const onPress = jest.fn();

    try {
      const view = render(
        <Link {...nodeProps} href="https://example.com">
          safe
        </Link>,
        { wrapper: provider },
      );

      fireEvent.press(screen.getByRole('link'));

      expect(open).toHaveBeenCalledWith('https://example.com');

      view.rerender(
        <Link {...nodeProps} href="https://example.com" onPress={onPress}>
          safe
        </Link>,
      );

      const event = { nativeEvent: {} };

      fireEvent.press(screen.getByRole('link'), event);

      expect(onPress).toHaveBeenCalledWith(event);

      expect(open).toHaveBeenCalledTimes(1);
    } finally {
      open.mockRestore();
    }
  });

  test('unsafe links remain text and unsafe images use their alternative text', () => {
    render(
      <Text>
        <Link {...nodeProps} href="javascript:alert(1)">
          unsafe
        </Link>
        <Image {...nodeProps} src="data:text/html,broken" alt="alternative" />
      </Text>,
      { wrapper: provider },
    );

    expect(screen.queryByRole('link')).toBeNull();

    expect(screen.getByText('alternative')).toBeOnTheScreen();
  });

  test('images have a native source and explicit layout dimensions', () => {
    render(
      <Image
        {...nodeProps}
        src="https://example.com/image.png"
        width={120}
        height={80}
        alt="example"
      />,
      { wrapper: provider },
    );

    const image = screen.getByRole('image');

    expect(image.props.source).toEqual({ uri: 'https://example.com/image.png' });

    expect(image).toHaveStyle({ width: 120, height: 80 });
  });

  test('uses natural image dimensions and ignores a previous source size', () => {
    const callbacks: ((width: number, height: number) => void)[] = [];

    const getSize = jest.spyOn(NativeImage, 'getSize').mockImplementation((_uri, success) => {
      callbacks.push(success);
    });

    try {
      const view = render(<Image {...nodeProps} src="https://example.com/first.png" />, {
        wrapper: provider,
      });

      view.rerender(<Image {...nodeProps} src="https://example.com/second.png" />);

      act(() => callbacks[0](800, 600));

      expect(screen.getByRole('image')).toHaveStyle({ width: 240, height: 160 });

      act(() => callbacks[1](48, 32));

      expect(screen.getByRole('image')).toHaveStyle({
        width: 48,
        aspectRatio: 1.5,
        maxWidth: '100%',
      });

      view.rerender(
        <Image {...nodeProps} src="https://example.com/second.png" width={120} height={80} />,
      );

      expect(screen.getByRole('image')).toHaveStyle({ width: 120, height: 80 });

      expect(getSize).toHaveBeenCalledTimes(2);
    } finally {
      getSize.mockRestore();
    }
  });

  test('removes list formatting newlines while keeping explicit hard breaks', () => {
    const item: Element = {
      type: 'element',
      tagName: 'li',
      properties: {},
      children: [
        { type: 'text', value: 'first' },
        { type: 'element', tagName: 'br', properties: {}, children: [] },
        { type: 'text', value: 'second\n' },
        { type: 'element', tagName: 'ul', properties: {}, children: [] },
      ],
    };

    render(
      <Node
        {...nodeProps}
        current={item}
        renderChildren={(parent) => (
          <Text testID="list-body">
            {parent?.children.map((child) => (child.type === 'text' ? child.value : '\n')).join('')}
          </Text>
        )}
      />,
      { wrapper: provider },
    );

    expect(screen.getByTestId('list-body').props.children).toBe('first\nsecond');
  });

  test('keeps long cells in equal columns and reserves scrolling width for wide tables', () => {
    const cells: Element[] = [
      'short',
      'long content in the same column',
      'three',
      'four',
      'five',
    ].map((value) => ({
      type: 'element',
      tagName: 'td',
      properties: {},
      children: [{ type: 'text', value }],
    }));

    const row: Element = { type: 'element', tagName: 'tr', properties: {}, children: cells };

    const table: Element = { type: 'element', tagName: 'table', properties: {}, children: [row] };

    const view = render(
      <Table current={table}>
        <View style={{ flexDirection: 'row' }}>
          {cells.map((cell, index) => (
            <TableCell
              key={index}
              {...nodeProps}
              current={cell}
              parents={[table, row]}
              testID={`cell-${index}`}
              renderChildren={() => <Text>{index}</Text>}
            />
          ))}
        </View>
      </Table>,
      { wrapper: provider },
    );

    for (let index = 0; index < cells.length; index += 1) {
      expect(screen.getByTestId(`cell-${index}`)).toHaveStyle({ width: '20%', minWidth: 96 });
    }

    const frame = view
      .UNSAFE_getAllByType(View)
      .find((element) => StyleSheet.flatten(element.props.style)?.borderWidth === 1);

    expect(StyleSheet.flatten(frame?.props.style)).toMatchObject({ minWidth: 482 });
  });

  test('code and math render native selectable text fallbacks', () => {
    render(
      <>
        <CodeBlock code="const answer = 42" language="typescript" />
        <Tex {...nodeProps} mode="display" tex="x^2" />
      </>,
      { wrapper: provider },
    );

    expect(screen.getByText('const answer = 42')).toBeOnTheScreen();

    expect(screen.getByText('typescript')).toBeOnTheScreen();

    expect(screen.getByText('x^2')).toBeOnTheScreen();

    expect(screen.queryByRole('button', { name: 'Copy code' })).toBeNull();
  });

  test('code copy actions use the supplied native clipboard handler', () => {
    const onCopy = jest.fn();

    render(<CodeBlock code="code" language="text" meta="sample" onCopy={onCopy} />, {
      wrapper: provider,
    });

    fireEvent.press(screen.getByRole('button', { name: 'Copy code' }));

    expect(onCopy).toHaveBeenCalledWith({ code: 'code', language: 'text', meta: 'sample' });
  });
});
