import type { StreamingLabSettings } from '../streaming-lab';

export interface SmoothStreamingProps {
  initialText?: string;

  /**
   * Lab settings to start from, such as a different effect.
   */
  initialSettings?: Partial<StreamingLabSettings>;

  title?: string;
}

export interface ChunkPacing {
  seed: number;

  minSize: number;

  maxSize: number;

  /**
   * Shortest wait before a chunk arrives, in milliseconds at 1×.
   */
  minDelay: number;

  maxDelay: number;
}

export type ChunkPlan = {
  /**
   * Received length after this chunk arrives.
   */
  end: number;

  delay: number;
}[];
