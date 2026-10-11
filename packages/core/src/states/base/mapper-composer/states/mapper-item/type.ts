import type { Mapper, MapperComposerInputs } from '../../type';

export type MapperItemInputs = MapperComposerInputs & {
  mapper: [Mapper, object | undefined];
};
