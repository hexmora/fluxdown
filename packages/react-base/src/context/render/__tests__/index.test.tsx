import { render } from '@testing-library/react';
import { memo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { RenderProvider, useRender } from '..';

const ReadRenderContext = () => {
  useRender();

  return null;
};

test('requires a render context instead of falling back to an empty configuration', () => {
  expect(() => renderToStaticMarkup(<ReadRenderContext />)).toThrow(
    '[Fluxdown] RenderContext is required',
  );

  expect(() =>
    renderToStaticMarkup(
      <RenderProvider value={null}>
        <ReadRenderContext />
      </RenderProvider>,
    ),
  ).toThrow('[Fluxdown] RenderContext is required');
});

test('only propagates context values when their fields change', () => {
  const observe = jest.fn();
  const Consumer = memo(function Consumer() {
    observe(useRender());

    return null;
  });
  const view = render(
    <RenderProvider value={{ getProps: undefined }}>
      <Consumer />
    </RenderProvider>,
  );

  expect(observe).toHaveBeenCalledTimes(1);

  view.rerender(
    <RenderProvider value={{ getProps: undefined }}>
      <Consumer />
    </RenderProvider>,
  );

  expect(observe).toHaveBeenCalledTimes(1);

  view.rerender(
    <RenderProvider value={{ getProps: null }}>
      <Consumer />
    </RenderProvider>,
  );

  expect(observe).toHaveBeenCalledTimes(2);
  expect(observe).toHaveBeenLastCalledWith({ getProps: null });
});
