import { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { SvgXml } from 'react-native-svg';

import type { TexProps } from '../../../../../../../base';

import { useTheme } from '../../../../../../../base';
import { renderFormula } from './utils';

const SvgRenderer = ({ Raw, ...props }: TexProps) => {
  const { tex, mode = 'inline' } = props;

  const { tokens } = useTheme();

  const fontSize = tokens.typography.fontSize.md;

  const formula = useMemo(() => renderFormula(tex, mode, fontSize), [tex, mode, fontSize]);

  if (!formula) {
    return Raw && <Raw {...props} />;
  }

  const rendered = (
    <SvgXml
      xml={formula.svg}
      color={tokens.colors.fg}
      width={formula.width}
      height={formula.height}
      accessibilityLabel={tex}
    />
  );

  return mode === 'display' ? (
    <ScrollView
      horizontal
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: tokens.spacing.lg,
      }}
    >
      {rendered}
    </ScrollView>
  ) : (
    rendered
  );
};

export default SvgRenderer;
