import { enableAutoUnmount } from '@vue/test-utils';

enableAutoUnmount(afterEach);

afterEach(() => {
  vi.restoreAllMocks();

  resizeObserver.mockClear();
});

vi.stubGlobal('uni', {
  getWindowInfo: () => ({ pixelRatio: 1 }),
  getElementById: () => null,
});

const resizeObserver = vi.fn(function () {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});

vi.stubGlobal('UniResizeObserver', resizeObserver);
