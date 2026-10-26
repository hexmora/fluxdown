import { Text } from 'react-native';

import type { ShadProps } from '../../../../../base';

import { ShadContent } from './components/content';

export const ShadRenderer = ({ active, isActive, leading, offset }: ShadProps) => {
  if (isActive) {
    return <ShadContent leading={leading} active={active} offset={offset} />;
  }

  return (
    <Text>
      {leading}
      {active}
    </Text>
  );
};
