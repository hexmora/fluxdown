import { render } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';

import { ScaleRenderer } from '..';
import { PREFIX } from '../../../../../../base';
import { ChunkRenderer } from '../../../../../effect-chunk/slot/effect-chunk/renderer';
import { ShadRenderer } from '../../../../../effect-shad/slot/effect-shad/renderer';
import { SuffixRenderer } from '../../../../../effect-suffix/slot/effect-suffix/renderer';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('streaming effect renderers', () => {
  test('resumes scale without restarting on text updates', () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(100);

    const [text, setText] = createSignal('A');

    const [start, setStart] = createSignal(50);

    const view = render(() => (
      <ScaleRenderer start={start()} duration={300} from={0.75} blur={0.2}>
        {text()}
      </ScaleRenderer>
    ));

    const root = view.container.firstElementChild as HTMLElement;

    expect(root.style.animationDelay).toBe('-50ms');

    expect(root.style.getPropertyValue(`--${PREFIX}-scale-from`)).toBe('0.75');

    expect(root.style.getPropertyValue(`--${PREFIX}-scale-blur`)).toBe('0.2em');

    now.mockReturnValue(150);

    setText('AB');

    expect(view.container.firstElementChild).toBe(root);

    expect(root.textContent).toBe('AB');

    expect(root.style.animationDelay).toBe('-50ms');

    setStart(150);

    expect(view.container.firstElementChild).not.toBe(root);

    expect((view.container.firstElementChild as HTMLElement).style.animationDelay).toBe('0ms');
  });

  test('keeps zero-time chunk boundaries and skips expired animations', () => {
    vi.spyOn(performance, 'now').mockReturnValue(1000);

    const view = render(() => (
      <ChunkRenderer start={0} duration={250}>
        Complete chunk
      </ChunkRenderer>
    ));

    const root = view.container.firstElementChild!;

    expect(root.getAttribute('data-fluxdown-chunk')).toBe('1');

    expect(root.className).not.toContain('active');

    expect(root.textContent).toBe('Complete chunk');
  });

  test('resumes a shad fade from its own start time and settles once it has finished', () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(1100);

    const running = render(() => (
      <ShadRenderer start={1000} duration={400}>
        tail
      </ShadRenderer>
    ));

    const element = running.container.firstElementChild as HTMLElement;

    expect(element.getAttribute('data-fluxdown-shad')).toBe('fade');

    expect(element.className).toContain('active');

    expect(element.style.animationDelay).toBe('-100ms');

    expect(element.style.getPropertyValue(`--${PREFIX}-shad-duration`)).toBe('400ms');

    expect(element.textContent).toBe('tail');

    running.unmount();

    now.mockReturnValue(1500);

    const settled = render(() => (
      <ShadRenderer start={1000} duration={400}>
        tail
      </ShadRenderer>
    ));

    expect(settled.container.firstElementChild!.className).not.toContain('active');
  });

  test.each(['cursor', 'dot', 'custom'] as const)('marks %s suffix as decorative', (type) => {
    const view = render(() => <SuffixRenderer type={type}>|</SuffixRenderer>);

    const root = view.container.firstElementChild!;

    expect(root.getAttribute('aria-hidden')).toBe('true');

    expect(root.getAttribute('data-fluxdown-suffix')).toBe(type);

    expect(root.textContent).toBe('|');
  });
});
