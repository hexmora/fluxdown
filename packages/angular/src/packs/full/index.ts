import type { IPluginItem } from '@fluxdown/angular-plugins/typings';
import type {
  BaseBuildConfig,
  FluxdownRawProps,
  FluxdownRef,
  StreamingConfig,
  Theme,
} from '@fluxdown/angular/raw';

import { ChangeDetectionStrategy, Component, computed, input, viewChild } from '@angular/core';
import { PRESET_FULL_PLUGINS } from '@fluxdown/angular-plugins/full';
import { FluxdownRaw } from '@fluxdown/angular/raw';
import { castArray } from 'lodash-es';

export type {
  BaseBuildConfig,
  EffectItem,
  FluxdownRawProps,
  FluxdownRef,
  SmoothConfig,
  StreamingConfig,
  Theme,
  ThemeConfig,
  ThemeTokens,
  PartialThemeConfig,
  PresetKeys,
  HeadingThemeTokens,
} from '@fluxdown/angular/raw';

export * from './type';

@Component({
  selector: 'fluxdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FluxdownRaw],
  template: `<fluxdown-raw
    [text]="text()"
    [build]="build()"
    [streaming]="streaming()"
    [patches]="patches()"
    [plugins]="mergedPlugins()"
    [theme]="theme()"
  />`,
  host: { style: 'display: contents' },
})
export class Fluxdown implements FluxdownRef {
  readonly text = input.required<string>();

  readonly plugins = input<IPluginItem | IPluginItem[]>();

  readonly build = input<BaseBuildConfig>();

  readonly streaming = input<boolean | StreamingConfig>(false);

  readonly patches = input<FluxdownRawProps['patches']>();

  readonly theme = input<Theme>('light');

  protected readonly mergedPlugins = computed(() => [
    ...PRESET_FULL_PLUGINS,
    ...castArray(this.plugins() ?? []),
  ]);

  private readonly raw = viewChild.required(FluxdownRaw);

  get value() {
    return this.raw().value;
  }

  destroy() {
    this.raw().destroy();
  }
}
