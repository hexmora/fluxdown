import type { TexProps } from '@fluxdown/react-base-plugins/base';
import type { Element } from 'hast';

import { renderHook } from '@testing-library/react';
import { StrictMode } from 'react';

import type { TexRender } from '../type';

import { useTexRenderResult } from '../use-tex';

interface HookProps {
  props: TexProps;

  render: TexRender;
}

const current: Element = {
  type: 'element',
  tagName: 'span',
  properties: {},
  children: [{ type: 'text', value: '', data: { repairEnding: true } }],
};

const props: TexProps = {
  Raw: null,
  current,
  parents: [],
  render: () => null,
  tex: 'valid?',
};

const replacement: TexRender = (source) => (source === 'other' ? 'configured-macro' : null);

const completeEngine: TexRender = (source) => (source === 'valid' ? 'valid-html' : null);

test('reuses accepted engine output and resets for mode, source, and engine replacement', () => {
  const engine = jest.fn((source, mode) => (source === 'valid' ? `${mode}:${source}` : null));

  const initialProps: HookProps = { props, render: engine };

  const hook = renderHook(
    ({ props: input, render }: HookProps) => useTexRenderResult(input, render),
    {
      initialProps,
      wrapper: StrictMode,
    },
  );

  expect(hook.result.current).toEqual({ tex: 'valid', html: 'inline:valid' });

  engine.mockClear();

  hook.rerender({ props: { ...props, tex: 'valid??' }, render: engine });

  expect(engine.mock.calls).toEqual([['valid??', 'inline']]);

  expect(hook.result.current).toEqual({ tex: 'valid', html: 'inline:valid' });

  hook.rerender({ props: { ...props, mode: 'display' }, render: engine });

  expect(hook.result.current).toEqual({ tex: 'valid', html: 'display:valid' });

  hook.rerender({ props: { ...props, tex: 'other?' }, render: engine });

  expect(hook.result.current).toEqual({ tex: '', html: '' });

  hook.rerender({ props: { ...props, tex: 'other?' }, render: replacement });

  expect(hook.result.current).toEqual({ tex: 'other', html: 'configured-macro' });
});

test('uses the complete expression when repair metadata disappears', () => {
  const initialProps: HookProps = { props, render: completeEngine };

  const hook = renderHook(
    ({ props: input, render }: HookProps) => useTexRenderResult(input, render),
    {
      initialProps,
    },
  );

  expect(hook.result.current).toEqual({ tex: 'valid', html: 'valid-html' });

  hook.rerender({
    props: { ...props, current: { ...current, children: [] } },
    render: completeEngine,
  });

  expect(hook.result.current).toEqual({ tex: 'valid?', html: null });

  hook.rerender({ props: { ...props, tex: 'v' }, render: completeEngine });

  expect(hook.result.current).toEqual({ tex: '', html: '' });
});
