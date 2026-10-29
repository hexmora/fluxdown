export const FRAMES = /*#__PURE__*/ Array.from({ length: 11 }, (_, index) => {
  const progress = index / 10;

  const eased = 1 - Math.pow(1 - progress, 3);

  return {
    opacity: Number((eased * eased).toFixed(6)),
    blur: Number(Math.cos((progress * Math.PI) / 2).toFixed(6)),
  };
});

export const MEASUREMENT_FONT_SIZE = 256;
