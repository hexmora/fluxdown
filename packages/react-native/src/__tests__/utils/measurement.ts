import { fireEvent, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

export const getPrefixMeasurement = (text: string) => {
  for (const node of screen.getAllByText(text, { includeHiddenElements: true })) {
    for (let parent = node; parent; parent = parent.parent!) {
      if (
        typeof parent.props.onLayout === 'function' &&
        StyleSheet.flatten(parent.props.style)?.opacity === 0
      ) {
        return parent;
      }
    }
  }

  throw new Error('Missing shaded prefix measurement');
};

export const getMeasurement = (text: ReturnType<typeof screen.getByText>) => {
  for (let parent = text; parent; parent = parent.parent!) {
    const measured = parent.queryAll(
      (node) => node.type === 'Text' && typeof node.props.onLayout === 'function',
    );

    if (measured[0] && measured[1] && measured[0].parent === measured[1].parent) {
      return measured[0];
    }
  }

  throw new Error('Missing independent text measurement');
};

export const measureText = async (
  text: ReturnType<typeof screen.getByText>,
  layout: { width: number; height: number },
  baseline = layout.height - 6,
  advance = 0,
) => {
  const measured = getMeasurement(text);

  const anchored = measured.parent!.queryAll(
    (node) => node.type === 'Text' && typeof node.props.onLayout === 'function',
  )[1]!;

  const probe = measured.parent!.queryAll(
    (node) => node.type === 'View' && typeof node.props.onLayout === 'function',
  )[0];

  expect(probe).toBeDefined();

  await fireEvent.layout(measured, layout);

  await fireEvent.layout(anchored, { ...layout, width: layout.width + advance });

  await fireEvent.layout(probe!, { x: layout.width, y: baseline - 1, width: 1, height: 1 });
};
