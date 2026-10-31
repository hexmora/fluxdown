export const createAnimationDelay = () => {
  let previousStart: number | undefined;

  let delay = 0;

  return (start: number) => {
    if (!Object.is(start, previousStart)) {
      previousStart = start;

      delay = start >= 0 ? Math.min(0, start - performance.now()) : 0;
    }

    return delay;
  };
};

export const resumeAnimation = (event: AnimationEvent, start: number) => {
  if (event.target !== event.currentTarget || start < 0) {
    return;
  }

  const element = event.currentTarget as HTMLElement;

  const animation = element.getAnimations()[0];

  if (typeof animation?.currentTime !== 'number') {
    return;
  }

  const elapsed = Math.max(0, performance.now() - start);

  // Moving a keyed element restarts its CSS animation without remounting the component.
  element.style.animationDelay = `${Math.min(0, animation.currentTime - elapsed)}ms`;
};
