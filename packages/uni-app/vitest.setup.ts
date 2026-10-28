import { enableAutoUnmount } from '@vue/test-utils';

enableAutoUnmount(afterEach);

afterEach(() => {
  vi.restoreAllMocks();

  vi.useRealTimers();
});

vi.stubGlobal('uni', {
  getWindowInfo: () => ({ pixelRatio: 1 }),
  getElementById: () => null,
});
