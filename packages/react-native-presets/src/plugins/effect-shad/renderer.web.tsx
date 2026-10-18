import type { TextStyle } from 'react-native';

import { Text } from 'react-native';

import type { ShadRendererProps } from './type';

import { useNativeTheme } from '../../base';

export const ShadRenderer = ({ leading, active, isActive, maskWidth }: ShadRendererProps) => {
  const { colors } = useNativeTheme();
  return (
    <Text>
      <Text>{leading}</Text>
      <Text style={{ maskImage: 'linear-gradient(to right, #000, transparent)' } as TextStyle}>
        {active}
      </Text>
      <Text
        aria-hidden={true}
        style={
          {
            position: 'relative',
            display: 'inline-block',
            backgroundImage: `linear-gradient(to right, transparent, ${colors.background})`,
            pointerEvents: 'none',
            width: maskWidth,
            marginLeft: -maskWidth,
            opacity: isActive ? 1 : 0,
          } as unknown as TextStyle
        }
      />
    </Text>
  );
};
