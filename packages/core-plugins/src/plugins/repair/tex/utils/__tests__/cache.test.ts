import { TexPrefixCache } from '../cache';

test('reuses matching formula checkpoints without mixing formulas or display modes', () => {
  const render = jest.fn((tex: string, mode: string) =>
    ['alpha', 'beta'].includes(tex) ? `${mode}:${tex}` : null,
  );

  const cache = new TexPrefixCache(render);

  expect(cache.parse('alpha?', 'inline')).toBe('alpha');

  expect(cache.parse('beta?', 'inline')).toBe('beta');

  render.mockClear();

  expect(cache.parse('alpha??', 'inline')).toBe('alpha');

  expect(render.mock.calls).toEqual([['alpha??', 'inline']]);

  expect(cache.parse('alpha??', 'display')).toBe('alpha');

  expect(render).toHaveBeenCalledWith('alpha', 'display');

  expect(cache.parse('al', 'inline')).toBe('');

  expect(cache.parse('other', 'inline')).toBe('');
});

test('bounds retained formulas and releases their checkpoints on destruction', () => {
  const render = jest.fn((tex: string) => tex);

  const cache = new TexPrefixCache(render);

  for (let index = 0; index < 17; index += 1) {
    cache.parse(`formula-${index}!`, 'inline');
  }

  render.mockClear();

  cache.parse('formula-0!', 'inline');

  expect(render).toHaveBeenCalledTimes(1);

  cache.destroy();

  cache.parse('formula-0!', 'inline');

  expect(render).toHaveBeenCalledTimes(2);
});

test('does not share validation caches between differently configured repair instances', () => {
  const first = new TexPrefixCache((tex) => (tex === 'macro' ? tex : null));

  const second = new TexPrefixCache(() => null);

  expect(first.parse('macro?', 'inline')).toBe('macro');

  expect(second.parse('macro?', 'inline')).toBe('');
});
