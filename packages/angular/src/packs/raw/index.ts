import type { AfterViewInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import type { RenderRange } from '@fluxdown/angular-plugins/base';
import type {
  AngularRenderExtraParams,
  AngularRenderNode,
  AnySlotPlugin,
  IPluginItem,
  Slots,
} from '@fluxdown/angular-plugins/typings';
import type { MapperPluggable } from '@fluxdown/core';
import type { PluggableConfigs, PluginSet } from '@fluxdown/types';
import type { Subscription } from 'rxjs';
import type { IReadableClosure } from 'stative';

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AngularDomRenderer, RenderContext, toPluginList } from '@fluxdown/angular-plugins/base';
import { Core, isPluggablesEqual, isPluginSetEqual, PluginBuilder } from '@fluxdown/core';
import { PRESET_MAPPER_PLUGINS } from '@fluxdown/core-plugins/presets/mapper';
import { assert } from '@fluxdown/utils';
import { castArray, isString, set, uniqueId } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';
import { batch, D, MutableState, render, S } from 'stative';

import type { BlockTemplateContext } from '../../components';
import type { Theme } from '../../types';
import type { BaseBuildConfig, FluxdownRawProps, FluxdownRef, StreamingConfig } from './type';

import { BlockReconciler } from '../../components';
import { EL, EO, ROOT_CLASS_NAME } from '../../consts';
import { createAngularRenderer } from '../../modules';
import { mapTokensToStyles, PRESET_STYLES, resolveTheme } from '../../theme';
import {
  isPatchesEqual,
  toBuildConfig,
  toEffectMappers,
  toEffects,
  toSmoothConfig,
  toStreamingConfig,
} from '../utils';

export * from '../../types';
export * from './type';

@Component({
  selector: 'fluxdown-raw',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlockReconciler],
  templateUrl: './index.html',
  styleUrl: '../../styles/index.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [AngularDomRenderer, RenderContext],
  host: { class: ROOT_CLASS_NAME, '[style]': 'themeStyles()' },
})
export class FluxdownRaw implements AfterViewInit, OnChanges, OnDestroy, FluxdownRef {
  readonly text = input.required<string>();

  readonly plugins = input.required<IPluginItem | IPluginItem[]>();

  readonly build = input<BaseBuildConfig>();

  readonly streaming = input<boolean | StreamingConfig>(false);

  readonly patches = input<FluxdownRawProps['patches']>();

  readonly theme = input<Theme>('light');

  protected readonly themeStyles = computed(() => {
    const theme = this.theme();

    return isString(theme) ? PRESET_STYLES[theme] : mapTokensToStyles(resolveTheme(theme).tokens);
  });

  private readonly blockTemplate = viewChild.required<TemplateRef<BlockTemplateContext>>('block');

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly renderer = inject(AngularDomRenderer);

  private readonly context = inject(RenderContext);

  private readonly idPrefix = uniqueId('fluxdown-');

  private readonly source = MutableState.of('');

  private readonly buildState = new MutableState({
    initial: toBuildConfig({ base: EO, repairEnding: false }),
    distinctor: shallowEqual,
  });

  private readonly patchesState = new MutableState<NonNullable<FluxdownRawProps['patches']>>({
    initial: EL,
    distinctor: isPatchesEqual,
  });

  private readonly remarks = new MutableState<NonNullable<IPluginItem['remarks']>>({
    initial: EL,
    distinctor: isPluggablesEqual,
  });

  private readonly rehypes = new MutableState<NonNullable<IPluginItem['rehypes']>>({
    initial: EL,
    distinctor: isPluggablesEqual,
  });

  private readonly repairs = new MutableState<NonNullable<IPluginItem['repairs']>>({
    initial: EL,
    distinctor: isPluggablesEqual,
  });

  private readonly renders = new MutableState<NonNullable<IPluginItem['renders']>>({
    initial: EL,
    distinctor: isPluggablesEqual,
  });

  private readonly slots = new MutableState<NonNullable<IPluginItem['slots']>>({
    initial: EL,
    distinctor: isPluggablesEqual,
  });

  private readonly mappers = new MutableState<
    PluginSet<MapperPluggable, PluggableConfigs<MapperConfigs>>
  >({ initial: [[], {}], distinctor: isPluginSetEqual });

  private core?: FluxdownRef;

  private slotBuilder?: IReadableClosure<AnySlotPlugin[]>;

  private range?: RenderRange;

  private readonly subscriptions: Subscription[] = [];

  get value() {
    assert(this.core, 'Fluxdown has not been initialized.');

    return this.core.value;
  }

  ngOnChanges(changes: SimpleChanges) {
    const initial = !this.core;

    batch(() => {
      if (initial || changes['build'] || changes['streaming']) {
        const streaming = toStreamingConfig(this.streaming());

        this.buildState.next(
          toBuildConfig({
            base: this.build() ?? EO,
            repairEnding: streaming.repairEnding,
            idPrefix: this.idPrefix,
          }),
        );
      }

      if (initial || changes['patches']) {
        this.patchesState.next(this.patches() ?? EL);
      }

      if (initial || changes['plugins']) {
        const plugins = castArray(this.plugins());

        this.slots.next(toPluginList(plugins, 'slots'));

        this.remarks.next(toPluginList(plugins, 'remarks'));

        this.rehypes.next(toPluginList(plugins, 'rehypes'));

        this.repairs.next(toPluginList(plugins, 'repairs'));

        this.renders.next(toPluginList(plugins, 'renders'));
      }

      if (initial || changes['plugins'] || changes['streaming']) {
        const streaming = toStreamingConfig(this.streaming());

        this.mappers.next([
          [
            ...toPluginList(castArray(this.plugins()), 'mappers'),
            ...toEffectMappers(toEffects(streaming.effect), PRESET_MAPPER_PLUGINS),
          ],
          { smooth: toSmoothConfig(streaming.smooth) },
        ]);
      }

      if (initial || changes['text']) {
        this.source.next(this.text());
      }
    });
  }

  ngAfterViewInit() {
    this.range = this.renderer.createRange(this.element.nativeElement);

    this.slotBuilder = render(S([PluginBuilder<AnySlotPlugin>, { plugins: this.slots }]));

    const updateSlots = () => {
      const slots: Partial<Slots> = {};

      for (const instance of this.slotBuilder!.value.value) {
        if (!instance.Component) {
          continue;
        }

        const current = slots[instance.type] ?? [];

        set(slots, [instance.type], [...current, instance]);
      }

      this.context.slots.set(slots);

      this.range?.update(this.core?.value.value);
    };

    this.subscriptions.push(this.slotBuilder.value.subscribe(updateSlots));

    this.core = render(
      S([
        Core<AngularRenderNode, AngularRenderExtraParams>,
        {
          Renderer: D(createAngularRenderer(this.blockTemplate())),
          build: this.buildState,
          patches: this.patchesState,
          remarks: this.remarks,
          rehypes: this.rehypes,
          repairs: this.repairs,
          renders: this.renders,
          mappers: this.mappers,
          text: this.source,
        },
      ]),
    );

    const update = () => this.range!.update(this.core!.value.value);

    this.subscriptions.push(this.core.value.subscribe(update));
  }

  destroy() {
    for (const subscription of this.subscriptions.splice(0)) {
      subscription.unsubscribe();
    }

    this.range?.destroy();

    this.core?.destroy();

    this.slotBuilder?.destroy();

    for (const state of [
      this.source,
      this.buildState,
      this.patchesState,
      this.remarks,
      this.rehypes,
      this.repairs,
      this.renders,
      this.slots,
      this.mappers,
    ]) {
      state.destroy();
    }
  }

  ngOnDestroy() {
    this.destroy();
  }
}
