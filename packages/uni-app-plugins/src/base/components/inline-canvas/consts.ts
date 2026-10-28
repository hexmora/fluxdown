const OFFSETS = [-2, -1, 0, 1, 2];

const SAMPLES = /*#__PURE__*/ OFFSETS.flatMap((x) =>
  OFFSETS.map((y) => ({ x, y, weight: Math.exp(-(x * x + y * y) / 2) })),
);

const TOTAL_WEIGHT = /*#__PURE__*/ SAMPLES.reduce((sum, sample) => sum + sample.weight, 0);

export const BLUR_GROUPS = /*#__PURE__*/ SAMPLES.reduce<
  { weight: number; samples: { x: number; y: number }[] }[]
>((groups, { x, y, weight }) => {
  const normalizedWeight = weight / TOTAL_WEIGHT;

  const group = groups.find((item) => item.weight === normalizedWeight);

  if (group) {
    group.samples.push({ x, y });
  } else {
    groups.push({ weight: normalizedWeight, samples: [{ x, y }] });
  }

  return groups;
}, []);
