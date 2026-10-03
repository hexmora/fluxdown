import { isEqual } from 'lodash-es';

import type { IBlockSection } from '../type';

export const isSectionEqual = (section: IBlockSection, other: IBlockSection): boolean => {
  return (
    section === other || (section.text === other.text && isEqual(section.patches, other.patches))
  );
};
