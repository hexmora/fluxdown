const BOTTOM_TOLERANCE = 1;
const FOLLOW_TIME = 100;

export const createBottomScroll = (
  viewport: HTMLElement,
  content: HTMLElement,
  reducedMotion: boolean,
) => {
  const bottom = () => Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  const atBottom = () => bottom() - viewport.scrollTop <= BOTTOM_TOLERANCE;
  let following = atBottom();
  let lastTop = viewport.scrollTop;
  let frame = 0;
  let lastTime = 0;
  let touchY = 0;
  let draggingScrollbar = false;

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const detach = () => {
    following = false;
    stop();
  };

  const observeScroll = () => {
    if (viewport.scrollTop === lastTop) {
      return;
    }

    // Moving toward a still-growing bottom must not cancel existing follow intent.
    following = atBottom() || (following && viewport.scrollTop > lastTop);
    lastTop = viewport.scrollTop;
    if (!following) {
      stop();
    }
  };

  const write = (top: number) => {
    viewport.scrollTop = top;
    // Scroll events arrive later; record our write before they can look like user input.
    lastTop = viewport.scrollTop;
  };

  const tick = (time: number) => {
    frame = 0;
    observeScroll();
    if (!following || draggingScrollbar || !viewport.clientWidth || !viewport.clientHeight) {
      return;
    }

    const target = bottom();
    const distance = target - viewport.scrollTop;
    if (reducedMotion || distance <= BOTTOM_TOLERANCE) {
      write(target);
      return;
    }

    // Retarget one continuous animation as streaming/layout changes the bottom.
    // Cap elapsed time so returning from a background tab cannot skip the animation.
    const elapsed = Math.min(time - lastTime, 32);
    lastTime = time;
    // Some browsers round scrollTop writes to whole pixels; still reach the target.
    const step = Math.max(1, distance * (1 - Math.exp(-elapsed / FOLLOW_TIME)));
    write(Math.min(target, viewport.scrollTop + step));
    frame = requestAnimationFrame(tick);
  };

  const follow = () => {
    if (!following || draggingScrollbar || frame) {
      return;
    }

    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  };

  const onResize = () => {
    // Consume browser clamps now, before another resize moves the bottom again.
    observeScroll();
    // Replaying clears the scroll range. The next stream should follow again.
    if (bottom() === 0) {
      following = true;
      lastTop = viewport.scrollTop;
    }
    follow();
  };

  const onScroll = () => {
    observeScroll();
    follow();
  };

  const onWheel = (event: WheelEvent) => {
    if (!event.ctrlKey && event.deltaY < 0) {
      detach();
    }
  };

  const onTouchStart = (event: TouchEvent) => {
    touchY = event.touches[0].clientY;
  };

  const onTouchMove = (event: TouchEvent) => {
    const nextY = event.touches[0].clientY;
    if (nextY > touchY) {
      detach();
    }
    touchY = nextY;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.target !== viewport) {
      return;
    }

    const upward =
      event.key === 'ArrowUp' ||
      event.key === 'PageUp' ||
      event.key === 'Home' ||
      (event.key === ' ' && event.shiftKey);
    if (upward) {
      detach();
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    // Content fills the pane; a press on the viewport itself targets its scrollbar.
    if (event.target === viewport) {
      draggingScrollbar = true;
      detach();
    }
  };

  const onPointerUp = () => {
    if (draggingScrollbar) {
      draggingScrollbar = false;
      following = atBottom();
      follow();
    }
  };

  const observer = new ResizeObserver(onResize);
  observer.observe(content, { box: 'border-box' });
  observer.observe(viewport);
  viewport.addEventListener('scroll', onScroll, { passive: true });
  viewport.addEventListener('wheel', onWheel, { passive: true });
  viewport.addEventListener('touchstart', onTouchStart, { passive: true });
  viewport.addEventListener('touchmove', onTouchMove, { passive: true });
  viewport.addEventListener('keydown', onKeyDown);
  viewport.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  return () => {
    stop();
    observer.disconnect();
    viewport.removeEventListener('scroll', onScroll);
    viewport.removeEventListener('wheel', onWheel);
    viewport.removeEventListener('touchstart', onTouchStart);
    viewport.removeEventListener('touchmove', onTouchMove);
    viewport.removeEventListener('keydown', onKeyDown);
    viewport.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
  };
};
