import { enableAutoUnmount } from '@vue/test-utils';

enableAutoUnmount(afterEach);

afterEach(() => {
  vi.restoreAllMocks();

  vi.useRealTimers();
});
