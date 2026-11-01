import { TestBed } from '@angular/core/testing';
import { AngularDomRenderer, RenderContext } from '@fluxdown/angular-plugins/base';

import { CodeHeaderRenderer } from '../renderer';

beforeEach(() => {
  TestBed.configureTestingModule({ providers: [RenderContext, AngularDomRenderer] });
});

afterEach(() => {
  vi.restoreAllMocks();

  vi.unstubAllGlobals();

  TestBed.resetTestingModule();
});

describe('code header actions', () => {
  test('copies code once and keeps feedback during unrelated prop updates', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

    const onCopy = vi.fn();

    const props = { Raw: null, code: 'const value = 42;', language: 'typescript', onCopy };

    const fixture = TestBed.createComponent(CodeHeaderRenderer);

    fixture.componentRef.setInput('props', props);

    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    await fixture.whenStable();

    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledWith(props.code);

    expect(onCopy).toHaveBeenCalledTimes(1);

    expect(fixture.nativeElement.textContent).toContain('Copied');

    fixture.componentRef.setInput('props', { ...props, class: 'updated' });

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Copied');
  });

  test('ignores an in-flight copy after the code changes', async () => {
    let resolve!: () => void;

    const writeText = vi.fn(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );

    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

    const onCopy = vi.fn();

    const fixture = TestBed.createComponent(CodeHeaderRenderer);

    fixture.componentRef.setInput('props', { Raw: null, code: 'before', onCopy });

    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    fixture.componentRef.setInput('props', { Raw: null, code: 'after', onCopy });

    fixture.detectChanges();

    resolve();

    await fixture.whenStable();

    expect(onCopy).not.toHaveBeenCalled();

    expect(fixture.nativeElement.textContent).not.toContain('Copied');
  });

  test('lets custom actions replace the copy button', () => {
    const fixture = TestBed.createComponent(CodeHeaderRenderer);

    fixture.componentRef.setInput('props', {
      Raw: null,
      code: 'content',
      actions: () => [{ key: 'custom', target: 'Custom action' }],
    });

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Custom action');

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
