/* eslint-disable no-await-in-loop -- Inspect each committed prefix before appending the next character. */
import type { ComponentFixture } from '@angular/core/testing';

import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, test } from 'vitest';

import {
  checkStreamingRepairFrame,
  getStreamingRepairSnapshot,
  getStreamingRepairText,
  STREAMING_REPAIR_CASES,
} from '../../../../scripts/testing/streaming-repair-cases';
import { Fluxdown } from '../packs/full';

const settle = async (view: ComponentFixture<Fluxdown>) => {
  await new Promise((resolve) => setTimeout(resolve, 0));

  await view.whenStable();

  view.detectChanges();
};

afterEach(() => TestBed.resetTestingModule());

describe('character-by-character syntax repair', () => {
  test('does not expose TeX in the first formula render', () => {
    const fixture = STREAMING_REPAIR_CASES.find((item) => item.math)!;

    const view = TestBed.createComponent(Fluxdown);

    view.componentRef.setInput('text', fixture.source);

    view.componentRef.setInput('build', { tex: true });

    view.componentRef.setInput('streaming', { smooth: false, effect: false });

    view.detectChanges();

    checkStreamingRepairFrame(view.nativeElement as HTMLElement, fixture.source, fixture, []);
  });

  test.each(STREAMING_REPAIR_CASES)('$name', async (fixture) => {
    const view = TestBed.createComponent(Fluxdown);

    view.componentRef.setInput('text', '');

    view.componentRef.setInput('build', { tex: true });

    view.componentRef.setInput('streaming', { smooth: false, effect: false });

    view.detectChanges();

    await settle(view);

    const root = view.nativeElement as HTMLElement;

    let text = '';

    let math: string[] = [];

    for (const character of fixture.source) {
      text += character;

      view.componentRef.setInput('text', text);

      view.detectChanges();

      await settle(view);

      math = checkStreamingRepairFrame(root, text, fixture, math);
    }

    view.componentRef.setInput('streaming', false);

    view.detectChanges();

    await settle(view);

    const complete = TestBed.createComponent(Fluxdown);

    complete.componentRef.setInput('text', text);

    complete.componentRef.setInput('build', { tex: true });

    complete.detectChanges();

    await settle(complete);

    expect(getStreamingRepairSnapshot(root)).toEqual(
      getStreamingRepairSnapshot(complete.nativeElement as HTMLElement),
    );

    for (const expected of fixture.completedText) {
      expect(getStreamingRepairText(root)).toContain(expected);
    }

    for (const selector of fixture.completedSelectors) {
      expect(root.querySelector(selector)).not.toBeNull();
    }
  });
});
