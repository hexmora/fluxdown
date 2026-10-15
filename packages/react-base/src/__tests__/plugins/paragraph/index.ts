import type { ParagraphProps } from '@fluxdown/react-base-presets/base';

import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';
import { createElement } from 'react';

export class MockParagraphSlotPlugin extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'mock-slot-paragraph';

  readonly type = 'Paragraph';

  constructor(private readonly options: { testID?: string } = {}) {
    super();
  }

  readonly Component = ({ children }: ParagraphProps) =>
    createElement('p', { 'data-testid': this.options.testID }, children);
}
