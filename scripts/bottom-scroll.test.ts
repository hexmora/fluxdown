import type { TestContext } from 'node:test';

import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { BottomScrollMode } from '../website/components/bottom-scroll/utils.ts';

import { createBottomScroll } from '../website/components/bottom-scroll/utils.ts';

function preview(
  t: TestContext,
  initialHeight = 0,
  reducedMotion = true,
  initialMode: BottomScrollMode = 'active',
) {
  class Viewport extends EventTarget {
    clientWidth = 600;
    clientHeight = 400;
    scrollHeight = 400;
    top = 0;

    get scrollTop() {
      return this.top;
    }

    set scrollTop(value: number) {
      this.top = Math.max(0, Math.min(value, this.scrollHeight - this.clientHeight));
    }
  }

  const viewport = new Viewport();
  const content = {} as HTMLElement;
  const padding = 40;
  let mode = initialMode;
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 0;
  let time = performance.now();
  let notifyResize: ((entries: ResizeObserverEntry[]) => void) | undefined;
  const disposers: (() => void)[] = [];
  const originals = new Map<string, PropertyDescriptor | undefined>();

  const globals = {
    window: new EventTarget(),
    ResizeObserver: class {
      constructor(callback: (entries: ResizeObserverEntry[]) => void) {
        notifyResize = callback;
      }
      observe() {}
      disconnect() {
        notifyResize = undefined;
      }
    },
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      const id = ++nextFrame;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame: (id: number) => frames.delete(id),
  };

  for (const [name, value] of Object.entries(globals)) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, value });
  }

  t.after(() => {
    for (const dispose of disposers) dispose();
    for (const [name, original] of originals) {
      if (original) Object.defineProperty(globalThis, name, original);
      else Reflect.deleteProperty(globalThis, name);
    }
  });

  const resize = (height: number) => {
    const top = viewport.scrollTop;
    viewport.scrollHeight = Math.max(viewport.clientHeight, height + padding);
    viewport.scrollTop = top;
    notifyResize?.([
      {
        target: content,
        // ResizeObserver reports the content box, excluding the pane's padding.
        contentRect: { height },
      } as unknown as ResizeObserverEntry,
    ]);
  };

  const resizeViewport = () => {
    notifyResize?.([
      {
        target: viewport as unknown as HTMLElement,
        contentRect: { height: viewport.clientHeight },
      } as unknown as ResizeObserverEntry,
    ]);
  };

  const mount = (height = 0) => {
    viewport.scrollHeight = Math.max(viewport.clientHeight, height + padding);
    const dispose = createBottomScroll(
      viewport as unknown as HTMLElement,
      content,
      reducedMotion,
      () => mode,
    );
    disposers.push(dispose);
    resize(height);
    resizeViewport();
    return dispose;
  };

  const dispose = mount(initialHeight);

  const flush = () => {
    for (let count = 0; frames.size && count < 1000; count++) {
      time += 16;
      const pending = [...frames.values()];
      frames.clear();
      for (const callback of pending) callback(time);
    }
    assert.equal(frames.size, 0, 'the follow animation should settle');
  };

  const scroll = (top: number) => {
    viewport.scrollTop = top;
    viewport.dispatchEvent(new Event('scroll'));
  };

  return {
    dispose,
    viewport,
    mount,
    resize,
    resizeViewport,
    scroll,
    flush,
    frames,
    setMode: (nextMode: BottomScrollMode) => {
      mode = nextMode;
    },
  };
}

test('a synchronously mounted tall snapshot stays at the top until its height grows', (t) => {
  const pane = preview(t, 1600);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 0);

  pane.resize(1600);
  pane.resizeViewport();
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 0);

  pane.resize(1800);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 1440);
});

test('empty asynchronous wrappers and padding do not establish the initial height', (t) => {
  const pane = preview(t);
  pane.resize(0);
  pane.resizeViewport();
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 0);

  pane.resize(1600);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 0);

  pane.resize(1800);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 1440);
});

test('a minimum-height content box follows when growth creates overflow', (t) => {
  const pane = preview(t, 360);
  pane.resize(360);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 0);

  pane.resize(500);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 140);
});

test('switching renderers cancels pending scrolling and establishes a new baseline', (t) => {
  const pane = preview(t, 200);
  pane.resize(1600);
  assert.ok(pane.frames.size > 0);

  pane.dispose();
  pane.mount(1600);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 0);

  pane.resize(1800);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 1440);
});

test('manual upward input before the first layout keeps later growth detached', (t) => {
  const pane = preview(t);
  pane.viewport.dispatchEvent(Object.assign(new Event('wheel'), { deltaY: -30, ctrlKey: false }));
  pane.resize(0);
  pane.resize(0);
  pane.resizeViewport();
  pane.resize(1600);
  pane.resize(1800);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 0);
});

test('manual scrolling detaches following, returning to the bottom and replaying restore it', (t) => {
  const pane = preview(t, 200);
  pane.resize(1600);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 1240);

  pane.scroll(300);
  pane.resize(1800);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 300);

  pane.scroll(1440);
  pane.resize(2000);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 1640);

  pane.scroll(300);
  pane.resize(0);
  pane.flush();
  pane.resize(200);
  pane.resize(1600);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 1240);
});

test('smooth following includes final delayed layout and stops on disposal', (t) => {
  const pane = preview(t, 200, false);
  pane.resize(1600);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 1240);

  // A renderer can keep growing after its final stream update.
  pane.resize(1800);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 1440);

  pane.resize(2000);
  assert.ok(pane.frames.size > 0);
  pane.dispose();
  pane.resize(2200);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 1440);
});

test('End resumes following when content grows before its scroll event arrives', (t) => {
  const pane = preview(t, 200);
  pane.resize(1600);
  pane.flush();
  pane.scroll(300);

  pane.viewport.dispatchEvent(Object.assign(new Event('keydown'), { key: 'End' }));
  // The browser reaches the old bottom, then layout grows before scroll fires.
  pane.viewport.scrollTop = 1240;
  pane.resize(1800);
  pane.viewport.dispatchEvent(new Event('scroll'));
  pane.flush();

  assert.equal(pane.viewport.scrollTop, 1440);
});

test('static previews stay at the top through multiple delayed font and formula layouts', (t) => {
  const pane = preview(t, 0, true, 'static');
  for (const height of [0, 3424, 3527, 3577, 3700]) {
    pane.resize(height);
    pane.resizeViewport();
    pane.flush();
    assert.equal(pane.viewport.scrollTop, 0);
  }

  pane.scroll(300);
  pane.resize(3800);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 300);
});

test('activating playback or editing waits for height growth instead of jumping on mode change', (t) => {
  const pane = preview(t, 1600, true, 'static');
  pane.resize(1800);
  pane.flush();

  pane.setMode('active');
  pane.resize(1800);
  pane.resizeViewport();
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 0);

  pane.resize(2000);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 1640);
});

test('a completed session retains following through its final delayed layout', (t) => {
  const pane = preview(t, 200);
  pane.resize(1600);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 1240);

  pane.setMode('idle');
  pane.resize(1800);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 1440);

  pane.scroll(300);
  pane.resize(2000);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 300);
});

test('a newly added completed preview stays static until playback is restarted', (t) => {
  const pane = preview(t, 1600, true, 'idle');
  pane.resize(1800);
  pane.resize(2000);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 0);

  pane.setMode('active');
  pane.resize(0);
  pane.resize(200);
  pane.resize(1600);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 1240);
});

test('returning to static mode stops pending scrolling and clears the previous session', (t) => {
  const pane = preview(t, 200);
  pane.resize(1600);
  assert.ok(pane.frames.size > 0);

  pane.setMode('static');
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 0);
  pane.resize(1800);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 0);

  pane.setMode('idle');
  pane.resize(2000);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 0);
});

test('pausing retains an existing follower but a newly mounted paused preview waits for resume', (t) => {
  const pane = preview(t, 200);
  pane.resize(1600);
  pane.flush();

  pane.setMode('idle');
  pane.resize(1800);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 1440);

  pane.dispose();
  pane.mount(1800);
  pane.resize(1900);
  pane.resize(2000);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 0);

  pane.setMode('active');
  pane.resize(2000);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 0);
  pane.resize(2200);
  pane.flush();
  assert.equal(pane.viewport.scrollTop, 1840);
});
