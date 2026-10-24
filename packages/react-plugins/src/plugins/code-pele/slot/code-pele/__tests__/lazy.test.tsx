import { render, waitFor } from '@testing-library/react';

import type { CodeBlockProps } from '../../../../../base';

import { CodePeleRenderer } from '../renderer';

const loadRenderer = jest.fn();

const Raw = ({ code }: { code: string }) => <pre data-original>{code}</pre>;

jest.mock('../renderer/components/pele', () => {
  loadRenderer();

  return {
    __esModule: true,
    default: ({ Raw: Fallback, ...props }: CodeBlockProps) => (
      <div data-loaded>{Fallback && <Fallback {...props} />}</div>
    ),
  };
});

test('loads one renderer for both diagram languages and passes Raw through', async () => {
  const { container, rerender } = render(
    <CodePeleRenderer Raw={Raw} code="const value = 1" language="js" />,
  );

  expect(container.querySelector('[data-original]')).toHaveTextContent('const value = 1');
  expect(loadRenderer).not.toHaveBeenCalled();

  rerender(<CodePeleRenderer Raw={null} code="const value = 1" language="js" />);

  expect(container).toBeEmptyDOMElement();

  rerender(<CodePeleRenderer Raw={Raw} code="flowchart LR; A-->B" language="mermaid" />);

  expect(container.querySelector('[data-original]')).toHaveTextContent('flowchart LR; A-->B');

  await waitFor(() => expect(container.querySelector('[data-loaded]')).not.toBeNull());

  expect(container.querySelector('[data-loaded] [data-original]')).toHaveTextContent(
    'flowchart LR; A-->B',
  );

  rerender(<CodePeleRenderer Raw={Raw} code="mindmap\n  Project\n    Plan" language="mindmap" />);

  expect(container.querySelector('[data-loaded] [data-original]')).toHaveTextContent('Project');
  expect(loadRenderer).toHaveBeenCalledTimes(1);
});
