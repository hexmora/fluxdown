import { TestBed } from '@angular/core/testing';
import { AngularDomRenderer, RenderContext } from '@fluxdown/angular-plugins/base';

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

  test('uses pixel widths for the shad mask without changing text flow', () => {
    TestBed.configureTestingModule({ providers: [RenderContext, AngularDomRenderer] });

    const fixture = TestBed.createComponent(ShadRenderer);

    const props = { Raw: null, leading: 'stable ', active: 'tail', isActive: true, maskWidth: 64 };

    fixture.componentRef.setInput('props', props);

    fixture.detectChanges();

    const mask = fixture.nativeElement.querySelector('[aria-hidden="true"]') as HTMLElement;

    expect(mask.style.width).toBe('64px');

    expect(mask.style.marginLeft).toBe('-64px');

    expect(fixture.nativeElement.textContent).toBe('stable tail');

    fixture.componentRef.setInput('props', { ...props, isActive: false });

    fixture.detectChanges();

    expect(mask.classList.contains('fluxdown-angular-effect-shad-maskHidden')).toBe(true);
  });

  test.each(['cursor', 'dot', 'custom'] as const)('marks %s suffix as decorative', (type) => {
    const fixture = TestBed.createComponent(SuffixRenderer);

    fixture.componentRef.setInput('props', { Raw: null, type });

    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBe('true');

    expect(fixture.nativeElement.getAttribute('data-fluxdown-suffix')).toBe(type);
  });
});
