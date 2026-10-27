import { afterEach, expect, test, vi } from 'vitest';

import { createAnimationDelay, resumeAnimation } from '../animation';

afterEach(() => {
  vi.restoreAllMocks();
});

test('reads monotonic time only when the arrival changes even if a derived is reevaluated', () => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(1100);

  const delay = createAnimationDelay();

  expect(delay(1000)).toBe(-100);

  now.mockReturnValue(1200);

  expect(delay(1000)).toBe(-100);

  expect(now).toHaveBeenCalledTimes(1);

  expect(delay(1200)).toBe(0);

  expect(delay(1000)).toBe(-200);

  expect(delay(-1)).toBe(0);

  expect(now).toHaveBeenCalledTimes(3);
});

test('resumes a moved element from its original arrival without counting elapsed time twice', () => {
  vi.spyOn(performance, 'now').mockReturnValue(1180);

  const element = document.createElement('span');

  element.getAnimations = vi.fn().mockReturnValue([{ currentTime: 20 }]);

  element.addEventListener('animationstart', (event) => resumeAnimation(event, 1000));

  element.dispatchEvent(new Event('animationstart'));

  expect(element.style.animationDelay).toBe('-160ms');

  element.getAnimations = vi.fn().mockReturnValue([{ currentTime: 180 }]);

  element.dispatchEvent(new Event('animationstart'));

  expect(element.style.animationDelay).toBe('0ms');
});

test('ignores a nested glyph animation and static content', () => {
  const now = vi.spyOn(performance, 'now');

  const element = document.createElement('span');

  const glyph = document.createElement('span');

  element.append(glyph);

  element.getAnimations = vi.fn();

  element.addEventListener('animationstart', (event) => resumeAnimation(event, -1));

  element.dispatchEvent(new Event('animationstart'));

  element.addEventListener('animationstart', (event) => resumeAnimation(event, 1000));

  glyph.dispatchEvent(new Event('animationstart', { bubbles: true }));

  expect(element.getAnimations).not.toHaveBeenCalled();

  expect(now).not.toHaveBeenCalled();
});
