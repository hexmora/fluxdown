import { TestBed } from '@angular/core/testing';
import { ParagraphRenderPlugin } from '@fluxdown/angular-plugins/plugins/paragraph';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { FluxdownLite } from '../packs/lite';

afterEach(() => {
  TestBed.resetTestingModule();

  vi.restoreAllMocks();
});

describe('component lifecycle', () => {
  test('renders each initial block once when its state subscriptions connect', async () => {
    const render = vi.spyOn(ParagraphRenderPlugin.prototype, 'render');

    const fixture = TestBed.createComponent(FluxdownLite);

    fixture.componentRef.setInput('text', 'first\n\nsecond');

    fixture.detectChanges();

    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('firstsecond');

    expect(render).toHaveBeenCalledTimes(2);
  });

  test('isolates generated footnote IDs between component instances', async () => {
    const fixtures = [TestBed.createComponent(FluxdownLite), TestBed.createComponent(FluxdownLite)];

    for (const fixture of fixtures) {
      fixture.componentRef.setInput('text', 'Text[^note]\n\n[^note]: Footnote');

      fixture.componentRef.setInput('build', { footnote: true });
    }

    for (const fixture of fixtures) {
      fixture.detectChanges();
    }

    await Promise.all(fixtures.map((fixture) => fixture.whenStable()));

    const references = fixtures.map((fixture) => {
      return fixture.nativeElement.querySelector('[data-footnote-ref]') as HTMLAnchorElement;
    });

    expect(references[0].getAttribute('href')).not.toBe(references[1].getAttribute('href'));

    for (const [index, fixture] of fixtures.entries()) {
      const target = references[index].getAttribute('href')!.slice(1);

      expect(fixture.nativeElement.querySelector(`[id="${target}"]`)?.textContent).toContain(
        'Footnote',
      );
    }
  });

  test('preserves an explicit build prefix across updates', async () => {
    const fixture = TestBed.createComponent(FluxdownLite);

    fixture.componentRef.setInput('text', 'Text[^note]\n\n[^note]: Footnote');

    fixture.componentRef.setInput('build', { idPrefix: 'message-', footnote: true });

    fixture.detectChanges();

    await fixture.whenStable();

    const reference = fixture.nativeElement.querySelector(
      '[data-footnote-ref]',
    ) as HTMLAnchorElement;

    const target = reference.getAttribute('href');

    expect(target).toBe('#user-content-6d-65-73-73-61-67-65-2d-fn-note');

    fixture.componentRef.setInput('text', 'Updated[^note]\n\n[^note]: Footnote');

    fixture.detectChanges();

    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[data-footnote-ref]')?.getAttribute('href')).toBe(
      reference.getAttribute('href'),
    );
  });
});
