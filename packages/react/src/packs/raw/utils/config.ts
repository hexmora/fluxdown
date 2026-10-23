import type { BlockCompilerConfig } from '@fluxdown/core';
import type {
  BaseSmoothConfig,
  DriverType,
  InterpolationType,
  SmoothDriverClass,
  SmoothInterpolatorClass,
} from '@fluxdown/core-presets/plugins/mapper/smooth';

import { assert, defaultsBy } from '@fluxdown/utils';
import { isBoolean, isFunction, isString } from 'lodash-es';

import type { BaseBuildConfig, SmoothConfig, StreamingConfig } from '../type';

import { ALL_DRIVERS, ALL_INTERPOLATORS, DEFAULT_CONFIG } from '../../../consts';

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

export const getDriverByType = (type: DriverType | SmoothDriverClass): SmoothDriverClass => {
  if (!isString(type)) {
    return type;
  }

  const driver = ALL_DRIVERS.find((item) => item.name === type);

  assert(driver, `Unknown driver type: ${type}`);

  return driver;
};

export const getInterpolationByType = (
  type: InterpolationType | SmoothInterpolatorClass,
): SmoothInterpolatorClass => {
  if (!isString(type)) {
    return type;
  }

  const interpolator = ALL_INTERPOLATORS.find((item) => item.name === type);

  assert(interpolator, `Unknown interpolation type: ${type}`);

  return interpolator;
};

export const toSmoothConfig = (config: boolean | SmoothConfig): BaseSmoothConfig => {
  const options: SmoothConfig = isBoolean(config) ? { enabled: config } : config;

  // The deprecated names only apply when the new ones are absent.
  const {
    enabled = false,
    driver = options.ticker ?? (isEnableRAF() ? 'raf' : 'interval'),
    interpolation = options.scheduler ?? 'spring',
  } = options;

  return {
    enabled,
    driver: getDriverByType(driver),
    interpolation: getInterpolationByType(interpolation),
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
