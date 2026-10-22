import type { BlockCompilerConfig } from '@fluxdown/core';
import type {
  BaseSmoothConfig,
  SchedulerType,
  SmoothSchedulerClass,
  SmoothTickerClass,
  TickerType,
} from '@fluxdown/core-presets/plugins/mapper/smooth';

import { assert, defaultsBy } from '@fluxdown/utils';
import { isBoolean, isFunction, isString } from 'lodash-es';

import type { BaseBuildConfig, SmoothConfig, StreamingConfig } from '../type';

import { ALL_SCHEDULERS, ALL_TICKERS, DEFAULT_CONFIG } from '../../../consts';

export interface ToBuildConfigParams {
  base: BaseBuildConfig;

  repairEnding: boolean;

  idPrefix?: string;
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
    return { repairEnding: config, smooth: config, effect: config ? 'scale' : false };
  }

  const { repairEnding = true, smooth = true, effect = 'scale' } = config;

  return { repairEnding, smooth, effect };
};

export const toBuildConfig = ({
  base,
  repairEnding,
  idPrefix,
}: ToBuildConfigParams): BlockCompilerConfig => {
  return {
    ...defaultsBy(base, { ...DEFAULT_CONFIG, idPrefix }),
    repairEnding,
  };
};
