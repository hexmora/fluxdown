import { enableAutoUnmount } from '@vue/test-utils';

vi.mock('vue-lynx', async () => {
  const vue = await import('vue');

  return {
    ...vue,
    useMainThreadRef: <T>(current: T) => ({ current }),
    runOnMainThread:
      <A extends unknown[], R>(callback: (...args: A) => R) =>
      (...args: A) =>
        Promise.resolve(callback(...args)),
  };
});

enableAutoUnmount(afterEach);

afterEach(() => {
  vi.restoreAllMocks();
});
