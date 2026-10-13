import type { HastRoot } from '../../../../../typings';
import type { MarkdownCompilerInputs } from './type';
import type { ProcessorSnapshot } from './utils';

import { createProcessorSnapshot, isProcessorEqual } from './utils';

export * from './type';

/** Reuses the prepared pipeline while its ordered plugins and namespace stay unchanged. */
export class MarkdownCompiler {
  private processor?: ProcessorSnapshot;

  static build(inputs: MarkdownCompilerInputs): HastRoot {
    const compiler = new MarkdownCompiler();

    return compiler.build(inputs);
  }

  build(inputs: MarkdownCompilerInputs): HastRoot {
    if (!this.processor || !isProcessorEqual(this.processor, inputs)) {
      this.processor = createProcessorSnapshot(inputs);
    }

    const { text } = inputs;

    const { processor } = this.processor;

    const mdast = processor.parse(text);

    return processor.runSync(mdast, text);
  }
}
