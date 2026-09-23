import type { BlockCompilerConfig } from '@fluxdown/core';
import type {
  BaseShadConfig,
  BaseSmoothConfig,
  SchedulerType,
  SmoothConfig,
  SmoothSchedulerClass,
  SmoothTickerClass,
  TickerType,
} from '@fluxdown/core-presets/mapper';

import { assert, defaultsBy } from '@fluxdown/utils';
import { isBoolean, isFinite, isFunction, isString } from 'lodash-es';

import type { BaseBuildConfig, ShadConfig, StreamingConfig } from '../types';

import { ALL_SCHEDULERS, ALL_TICKERS, DEFAULT_CONFIG } from '../consts';

export interface ToBuildConfigParams {
  base: BaseBuildConfig;

  repairEnding: boolean;
}

export const isEnableRAF = () => {
  return (
    isFunction(globalThis.requestAnimationFrame) && isFunction(globalThis.cancelAnimationFrame)
  );
};

export const getTickerByType = (type: TickerType | SmoothTickerClass): SmoothTickerClass => {
  if (!isString(type)) {
    return type;
  }

  const ticker = ALL_TICKERS.find((item) => item.name === type);

  assert(ticker, `Unknown ticker type: ${type}`);

  return ticker;
};

export const getSchedulerByType = (
  type: SchedulerType | SmoothSchedulerClass,
): SmoothSchedulerClass => {
  if (!isString(type)) {
    return type;
  }

  const scheduler = ALL_SCHEDULERS.find((item) => item.name === type);

  assert(scheduler, `Unknown scheduler type: ${type}`);

  return scheduler;
};

export const toShadConfig = (config: boolean | ShadConfig): BaseShadConfig => {
  const { enabled = true, length = 2 } = isBoolean(config) ? { enabled: config } : config;

  return {
    enabled,
    length: isFinite(length) ? Math.max(0, Math.floor(length)) : 0,
  };
};

export const toSmoothConfig = (config: boolean | SmoothConfig): BaseSmoothConfig => {
  const options: SmoothConfig = isBoolean(config)
    ? {
        enabled: config,
        ticker: isEnableRAF() ? 'raf' : 'interval',
        scheduler: 'spring',
      }
    : config;

  const { enabled = false, ticker, scheduler } = options;

  return {
    enabled,
    ticker: getTickerByType(ticker),
    scheduler: getSchedulerByType(scheduler),
  };
};

export const toStreamingConfig = (
  config: boolean | StreamingConfig = false,
): Required<StreamingConfig> => {
  if (isBoolean(config)) {
    return { repairEnding: config, smooth: config, shad: config };
  }

  const { repairEnding = true, smooth = true, shad = true } = config;

  return { repairEnding, smooth, shad };
};

export const toBuildConfig = ({ base, repairEnding }: ToBuildConfigParams): BlockCompilerConfig => {
  return {
    ...defaultsBy(base, { ...DEFAULT_CONFIG, repair: repairEnding }),
    repairEnding,
  };
};
