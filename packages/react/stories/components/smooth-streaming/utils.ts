import type { ChunkPacing, ChunkPlan } from './type';

/**
 * Mulberry32: a small seeded generator, so a chunk plan replays identically for the same seed.
 */
const createRandom = (seed: number) => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;

    let value = state;

    value = Math.imul(value ^ (value >>> 15), value | 1);

    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
};

const between = (random: () => number, min: number, max: number) =>
  min + Math.floor(random() * (Math.max(min, max) - min + 1));

/**
 * Split `length` characters into chunks whose sizes and arrival delays follow `pacing`.
 */
export const createChunkPlan = (length: number, pacing: ChunkPacing): ChunkPlan => {
  const random = createRandom(pacing.seed);

  const plan: ChunkPlan = [];

  for (let end = 0; end < length; ) {
    end = Math.min(length, end + between(random, pacing.minSize, pacing.maxSize));

    plan.push({ end, delay: between(random, pacing.minDelay, pacing.maxDelay) });
  }

  return plan;
};
