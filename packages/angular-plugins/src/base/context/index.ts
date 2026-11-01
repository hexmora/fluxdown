import type { Slots } from '@fluxdown/angular-plugins/typings';

import { Injectable, signal } from '@angular/core';

@Injectable()
export class RenderContext {
  readonly slots = signal<Partial<Slots>>({});
}
