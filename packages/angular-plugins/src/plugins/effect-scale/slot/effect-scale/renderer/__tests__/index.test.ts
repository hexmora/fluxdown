import { TestBed } from '@angular/core/testing';

import { ScaleRenderer } from '..';
import { ChunkRenderer } from '../../../../../effect-chunk/slot/effect-chunk/renderer';
import { ShadRenderer } from '../../../../../effect-shad/slot/effect-shad/renderer';
import { SuffixRenderer } from '../../../../../effect-suffix/slot/effect-suffix/renderer';

afterEach(() => {
  vi.restoreAllMocks();

  TestBed.resetTestingModule();
});

describe('streaming effect renderers', () => {
  test('resumes scale at its original timestamp without restarting on text updates', () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(100);

    const fixture = TestBed.createComponent(ScaleRenderer);

    const props = { Raw: null, start: 50, duration: 300, from: 0.75, blur: 0.2, children: 'A' };

    fixture.componentRef.setInput('props', props);

    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.style.animationDelay).toBe('-50ms');

    expect(root.style.getPropertyValue('--fluxdown-angular-scale-from')).toBe('0.75');

    expect(root.style.getPropertyValue('--fluxdown-angular-scale-blur')).toBe('0.2em');

    now.mockReturnValue(150);

    fixture.componentRef.setInput('props', { ...props, children: 'AB' });

    fixture.detectChanges();

    expect(root.style.animationDelay).toBe('-50ms');

    fixture.componentRef.setInput('props', { ...props, start: 150 });

    fixture.detectChanges();

    expect(root.style.animationDelay).toBe('0ms');
  });

  test('skips expired chunk animations', () => {
    vi.spyOn(performance, 'now').mockReturnValue(1000);

    const fixture = TestBed.createComponent(ChunkRenderer);

    fixture.componentRef.setInput('props', { Raw: null, start: 0, duration: 250 });

    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-fluxdown-chunk')).toBe('1');

    expect(fixture.nativeElement.classList.contains('fluxdown-angular-effect-chunk-active')).toBe(
      false,
    );
  });

  test('resumes a shad fade from its own start and settles once it has finished', () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(1100);

    const running = TestBed.createComponent(ShadRenderer);

    running.componentRef.setInput('props', { Raw: null, start: 1000, duration: 400 });

    running.detectChanges();

    const root = running.nativeElement as HTMLElement;

    expect(root.getAttribute('data-fluxdown-shad')).toBe('fade');

    expect(root.classList.contains('fluxdown-angular-effect-shad-active')).toBe(true);

    expect(root.style.animationDelay).toBe('-100ms');

    expect(root.style.getPropertyValue('--fluxdown-angular-shad-duration')).toBe('400ms');

    now.mockReturnValue(1500);

    const settled = TestBed.createComponent(ShadRenderer);

    settled.componentRef.setInput('props', { Raw: null, start: 1000, duration: 400 });

    settled.detectChanges();

    expect(settled.nativeElement.classList.contains('fluxdown-angular-effect-shad-active')).toBe(
      false,
    );
  });

  test.each(['cursor', 'dot', 'custom'] as const)('marks %s suffix as decorative', (type) => {
    const fixture = TestBed.createComponent(SuffixRenderer);

    fixture.componentRef.setInput('props', { Raw: null, type });

    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBe('true');

    expect(fixture.nativeElement.getAttribute('data-fluxdown-suffix')).toBe(type);
  });
});
