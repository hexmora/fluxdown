import { cleanup, fireEvent, render, waitFor } from '@testing-library/svelte';
import { afterEach, expect, test, vi } from 'vitest';

import { createElement } from '../../../../../base';
import { CodeHeaderRenderer } from '../code-header-renderer';

afterEach(() => {
  cleanup();

  vi.restoreAllMocks();
});

test('copies the source and reports its metadata after a successful clipboard write', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

  const onCopy = vi.fn();

  const view = render(CodeHeaderRenderer, {
    Raw: null,
    code: 'const n = 1;',
    language: 'ts',
    meta: 'example',
    onCopy,
  });

  await fireEvent.click(view.getByRole('button', { name: 'Copy' }));

  await waitFor(() => expect(view.getByRole('button', { name: 'Copied' })).toBeDefined());

  expect(writeText).toHaveBeenCalledWith('const n = 1;');

  expect(onCopy).toHaveBeenCalledWith({ code: 'const n = 1;', language: 'ts', meta: 'example' });
});

test('allows action functions to replace the default copy action', () => {
  const actions = vi.fn(() => [
    { key: 'run', target: createElement('button', { type: 'button' }, 'Run') },
  ]);

  const view = render(CodeHeaderRenderer, { Raw: null, code: 'run()', actions });

  expect(actions.mock.calls.length).toBeGreaterThan(0);

  expect(view.queryByRole('button', { name: 'Copy' })).toBeNull();

  expect(view.getByRole('button', { name: 'Run' })).toBeDefined();
});

test('keeps copying available when permission is denied', async () => {
  const writeText = vi.fn().mockRejectedValue(new Error('Denied'));

  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

  const onCopy = vi.fn();

  const view = render(CodeHeaderRenderer, { Raw: null, code: 'text', onCopy });

  await fireEvent.click(view.getByRole('button', { name: 'Copy' }));

  await waitFor(() =>
    expect(view.getByRole('button', { name: 'Copy' }).hasAttribute('disabled')).toBe(false),
  );

  expect(onCopy).not.toHaveBeenCalled();
});
