const bezier = (x1: number, x2: number) => {
  return (progress: number) => {
    if (progress <= 0 || progress >= 1) {
      return Math.min(1, Math.max(0, progress));
    }

    let left = 0;

    let right = 1;

    for (let index = 0; index < 16; index += 1) {
      const time = (left + right) / 2;

      const inverse = 1 - time;

      const x = 3 * inverse * inverse * time * x1 + 3 * inverse * time * time * x2 + time ** 3;

      if (x < progress) {
        left = time;
      } else {
        right = time;
      }
    }

    const time = (left + right) / 2;

    return 3 * time * time - 2 * time ** 3;
  };
};

export const EASE_OUT = /*#__PURE__*/ bezier(0, 0.58);

export const EASE_IN_OUT = /*#__PURE__*/ bezier(0.42, 0.58);
