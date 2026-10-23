/**
 * @jsxImportSource stative
 */

import type { IBlockState } from '@fluxdown/types';

import { D, type IReadableClosure, once, useDefaults, useSwitchMap } from 'stative';

import type { SmoothInputs, SmoothPluginConfig } from './type';

import { withKey } from '../../../utils';
import { IntervalSmoothDriver, RafSmoothDriver, SpringSmoothInterpolator } from './modules';
import { CutoffBlocks, SmoothCursor } from './states';
import { isEnableRAF } from './utils';

export * from './modules';
export * from './type';

declare global {
  interface MapperConfigs {
    smooth: SmoothPluginConfig;
  }
}

export const Smooth = /*#__PURE__*/ withKey(
  'smooth',
  /*#__PURE__*/ once<<T>(inputs: SmoothInputs<T>) => IReadableClosure<IBlockState<T>[]>>(
    function Smooth<T>({
      source,
      enabled: _enabled,
      driver: _driver,
      interpolation: _interpolation,
      ticker: _ticker,
      scheduler: _scheduler,
    }: SmoothInputs<T>): IReadableClosure<IBlockState<T>[]> {
      const enabled = useDefaults(_enabled, false);

      // The deprecated names only apply when the new ones are absent.
      const driver = useDefaults(
        _driver ?? _ticker,
        D(isEnableRAF() ? RafSmoothDriver : IntervalSmoothDriver),
      );

      const interpolation = useDefaults(_interpolation ?? _scheduler, D(SpringSmoothInterpolator));

      return useSwitchMap(enabled, (active) =>
        active ? (
          <CutoffBlocks<T>
            items={source}
            end={
              <SmoothCursor<T>
                source={source}
                enabled={enabled}
                driver={driver}
                interpolation={interpolation}
              />
            }
          />
        ) : (
          source
        ),
      );
    },
  ),
);
