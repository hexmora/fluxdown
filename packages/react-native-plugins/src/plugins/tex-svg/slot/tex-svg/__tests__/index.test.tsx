import type { Element } from 'hast';

import { render } from '@testing-library/react';
import { Text } from 'react-native';

import SvgRenderer from '../renderer/components/svg';

const current: Element = { type: 'element', tagName: 'span', properties: {}, children: [] };

const props = { current, parents: [], render: () => null };

const Raw = ({ tex }: { tex: string }) => <Text>{tex}</Text>;

describe('native SVG formula rendering', () => {
  test('renders inline math through the real native SVG web renderer', () => {
    const { container } = render(
      <Text>
        Formula: <SvgRenderer {...props} Raw={null} tex={String.raw`\frac{1}{2}`} />
      </Text>,
    );

    const svg = container.querySelector('svg');

    expect(svg?.querySelector('path')).not.toBeNull();

    expect(Number(svg?.getAttribute('width'))).toBeGreaterThan(0);

    expect(Number(svg?.getAttribute('height'))).toBeGreaterThan(0);

    expect(container.querySelector('mjx-container, foreignObject')).toBeNull();
  });

  test('shows source while an expression is incomplete, then renders the completed formula', () => {
    const { container, rerender } = render(
      <SvgRenderer {...props} Raw={Raw} tex={String.raw`\frac{`} />,
    );

    expect(container).toHaveTextContent(String.raw`\frac{`);

    expect(container.querySelector('svg')).toBeNull();

    rerender(<SvgRenderer {...props} Raw={Raw} tex={String.raw`\frac{1}{2}`} />);

    expect(container.querySelector('svg path')).not.toBeNull();
  });

  test('renders the complete inline equation in a single SVG', () => {
    const { container } = render(
      <Text>
        Formula: <SvgRenderer {...props} Raw={null} tex="E=mc^2" />
      </Text>,
    );

    expect(container.querySelectorAll('svg')).toHaveLength(1);

    expect(container.querySelectorAll('svg path')).toHaveLength(5);
  });
});
