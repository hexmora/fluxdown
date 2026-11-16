import type { PointerEvent } from 'react';

import { useEffect, useRef } from 'react';

import type { StreamingLab } from '../hooks';
import type { SpringSample } from '../type';

import { CHART_WINDOW } from '../consts';
import './chart.scss';

type Accessor = (sample: SpringSample) => number;

interface Series {
  value: Accessor;

  color: string;

  /**
   * Hold each value until the next sample, for quantities that jump (the received target).
   */
  step?: boolean;
}

interface Frame {
  samples: readonly SpringSample[];

  start: number;

  end: number;

  hoverTime: number | null;
}

interface Theme {
  text: string;

  grid: string;

  surface: string;
}

const MIN_PROGRESS_SPAN = 4;

/**
 * Index of the last sample at or before `time`, or -1.
 */
const findSample = (samples: readonly SpringSample[], time: number) => {
  let low = 0;

  let high = samples.length - 1;

  let found = -1;

  while (low <= high) {
    const middle = (low + high) >> 1;

    if (samples[middle]!.time <= time) {
      found = middle;

      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return found;
};

const formatValue = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

const prepareCanvas = (canvas: HTMLCanvasElement) => {
  const ratio = window.devicePixelRatio || 1;

  const width = canvas.clientWidth;

  const height = canvas.clientHeight;

  if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
    canvas.width = Math.round(width * ratio);

    canvas.height = Math.round(height * ratio);
  }

  const context = canvas.getContext('2d');

  context?.setTransform(ratio, 0, 0, ratio, 0, 0);

  context?.clearRect(0, 0, width, height);

  return context ? { context, width, height } : null;
};

/**
 * Draw one panel: hairline grid, its series as 2px lines, the domain labels, and, while
 * hovering, a crosshair with ringed markers.
 */
const drawPanel = (
  canvas: HTMLCanvasElement,
  frame: Frame,
  theme: Theme,
  series: Series[],
  domain: [number, number],
  format: (value: number) => string,
) => {
  const prepared = prepareCanvas(canvas);

  if (!prepared) {
    return;
  }

  const { context, width, height } = prepared;

  const inset = 6;

  const [min, max] = domain;

  const toX = (time: number) => ((time - frame.start) / (frame.end - frame.start)) * width;

  const toY = (value: number) =>
    inset + (1 - (value - min) / (max - min || 1)) * (height - inset * 2);

  context.lineWidth = 1;

  context.strokeStyle = theme.grid;

  for (const value of [max, (min + max) / 2, min]) {
    const y = Math.round(toY(value)) + 0.5;

    context.beginPath();

    context.moveTo(0, y);

    context.lineTo(width, y);

    context.stroke();
  }

  context.fillStyle = theme.text;

  context.font = '10px ui-sans-serif, system-ui, sans-serif';

  context.textBaseline = 'top';

  context.fillText(format(max), 2, 1);

  context.textBaseline = 'bottom';

  context.fillText(format(min), 2, height - 1);

  const { samples } = frame;

  context.lineWidth = 2;

  context.lineJoin = 'round';

  context.lineCap = 'round';

  for (const { value, color, step } of series) {
    context.strokeStyle = color;

    context.beginPath();

    let previous: number | null = null;

    for (const sample of samples) {
      const x = toX(sample.time);

      const y = toY(value(sample));

      if (previous === null) {
        context.moveTo(x, y);
      } else {
        if (step) {
          context.lineTo(x, previous);
        }

        context.lineTo(x, y);
      }

      previous = y;
    }

    // The latest state holds until the next frame arrives, so the line runs on to "now".
    if (previous !== null) {
      context.lineTo(width, previous);
    }

    context.stroke();
  }

  if (frame.hoverTime === null) {
    return;
  }

  const index = findSample(samples, frame.hoverTime);

  const sample = samples[index];

  if (!sample) {
    return;
  }

  const x = Math.round(toX(frame.hoverTime)) + 0.5;

  context.lineWidth = 1;

  context.strokeStyle = theme.text;

  context.beginPath();

  context.moveTo(x, 0);

  context.lineTo(x, height);

  context.stroke();

  for (const { value, color } of series) {
    context.beginPath();

    context.arc(x, toY(value(sample)), 4, 0, Math.PI * 2);

    context.fillStyle = color;

    context.fill();

    context.lineWidth = 2;

    context.strokeStyle = theme.surface;

    context.stroke();
  }
};

const getRange = (samples: readonly SpringSample[], accessors: Accessor[]) => {
  let min = Infinity;

  let max = -Infinity;

  for (const sample of samples) {
    for (const accessor of accessors) {
      const value = accessor(sample);

      min = Math.min(min, value);

      max = Math.max(max, value);
    }
  }

  return [min, max] as const;
};

const target: Accessor = (sample) => sample.target;

const position: Accessor = (sample) => sample.position;

const velocity: Accessor = (sample) => sample.velocity;

/**
 * Live charts of the spring: progress (received target against spring position) and velocity,
 * as two panels over the same rolling window rather than one chart with two scales.
 */
export const StreamingLabChart = ({ lab }: { lab: StreamingLab }) => {
  const progressRef = useRef<HTMLCanvasElement>(null);

  const velocityRef = useRef<HTMLCanvasElement>(null);

  const targetKeyRef = useRef<HTMLSpanElement>(null);

  const positionKeyRef = useRef<HTMLSpanElement>(null);

  const velocityKeyRef = useRef<HTMLSpanElement>(null);

  const targetValueRef = useRef<HTMLOutputElement>(null);

  const positionValueRef = useRef<HTMLOutputElement>(null);

  const velocityValueRef = useRef<HTMLOutputElement>(null);

  const timeRef = useRef<HTMLOutputElement>(null);

  const hoverRef = useRef<number | null>(null);

  const { clock, inspector } = lab;

  useEffect(() => {
    let frameId = 0;

    const draw = () => {
      frameId = requestAnimationFrame(draw);

      const progress = progressRef.current;

      const speed = velocityRef.current;

      const keys = [targetKeyRef.current, positionKeyRef.current, velocityKeyRef.current];

      if (!progress || !speed || keys.some((key) => !key)) {
        return;
      }

      // Canvas cannot resolve CSS variables or light-dark(), so read colors the browser has
      // already resolved: the legend keys carry the series colors, the canvas the chrome.
      const [targetColor, positionColor, velocityColor] = keys.map(
        (key) => getComputedStyle(key!).backgroundColor,
      );

      const canvasStyle = getComputedStyle(progress);

      const theme: Theme = {
        text: canvasStyle.color,
        grid: canvasStyle.borderTopColor,
        surface: canvasStyle.outlineColor,
      };

      const end = clock.now();

      const start = end - CHART_WINDOW;

      const history = inspector.getHistory();

      // Keep the last sample before the window so lines enter from the left edge.
      const first = Math.max(0, findSample(history, start));

      const samples = history.slice(first);

      const hoverRatio = hoverRef.current;

      const hoverTime = hoverRatio === null ? null : start + hoverRatio * CHART_WINDOW;

      const frame: Frame = { samples, start, end, hoverTime };

      const [low, high] = getRange(samples, [target, position]);

      const middle = Number.isFinite(low) ? (low + high) / 2 : 0;

      const half = Math.max(MIN_PROGRESS_SPAN / 2, ((high - low) / 2) * 1.1);

      drawPanel(
        progress,
        frame,
        theme,
        [
          { value: target, color: targetColor!, step: true },
          { value: position, color: positionColor! },
        ],
        // Progress is never negative, so the window slides up instead of dipping below zero.
        [Math.max(0, middle - half), Math.max(0, middle - half) + half * 2],
        (value) => String(Math.round(value)),
      );

      const [slowest, fastest] = getRange(samples, [velocity]);

      drawPanel(
        speed,
        frame,
        theme,
        [{ value: velocity, color: velocityColor! }],
        [Math.min(0, Number.isFinite(slowest) ? slowest : 0), Math.max(1, fastest * 1.1)],
        (value) => `${Math.round(value)}/s`,
      );

      const shown = hoverTime === null ? samples.at(-1) : samples[findSample(samples, hoverTime)];

      targetValueRef.current!.textContent = shown ? formatValue(shown.target) : '–';

      positionValueRef.current!.textContent = shown ? shown.position.toFixed(2) : '–';

      velocityValueRef.current!.textContent = shown ? `${shown.velocity.toFixed(1)}/s` : '–';

      timeRef.current!.textContent =
        hoverTime === null ? 'now' : `−${((end - hoverTime) / 1000).toFixed(2)} s`;
    };

    frameId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(frameId);
  }, [clock, inspector]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();

    hoverRef.current = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
  };

  return (
    <figure aria-label="Spring motion over the last five seconds" className="lab-chart">
      <figcaption className="lab-chart-legend">
        <span className="lab-chart-entry">
          <span className="lab-chart-key lab-chart-key-target" ref={targetKeyRef} />
          Target
          <output ref={targetValueRef}>–</output>
        </span>
        <span className="lab-chart-entry">
          <span className="lab-chart-key lab-chart-key-position" ref={positionKeyRef} />
          Position
          <output ref={positionValueRef}>–</output>
        </span>
        <output className="lab-chart-time" ref={timeRef}>
          now
        </output>
      </figcaption>

      <div
        className="lab-chart-plots"
        onPointerLeave={() => {
          hoverRef.current = null;
        }}
        onPointerMove={handlePointerMove}
      >
        <canvas aria-hidden className="lab-chart-canvas" ref={progressRef} />

        <div className="lab-chart-legend">
          <span className="lab-chart-entry">
            <span className="lab-chart-key lab-chart-key-velocity" ref={velocityKeyRef} />
            Velocity
            <output ref={velocityValueRef}>–</output>
          </span>
        </div>

        <canvas aria-hidden className="lab-chart-canvas" ref={velocityRef} />
      </div>
    </figure>
  );
};
