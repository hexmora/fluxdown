import { useEffect, useId, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { parse, SvgAst } from 'react-native-svg';

import type { CodeBlockProps } from '../../../../../../../base';
import type { Diagram } from './type';

import { createTypeOfSlot, useTheme } from '../../../../../../../base';
import { decodeSvgEntities, renderDiagram } from './utils';

const CodeHeader = /*#__PURE__*/ createTypeOfSlot('CodeHeader');

const MermaidRenderer = ({ Raw, ...props }: CodeBlockProps) => {
  const { code, language, meta, loading, onCopy, showHeader = true, suffix } = props;

  const { tokens } = useTheme();

  const id = useId().replaceAll(':', '');

  const [diagram, setDiagram] = useState<Diagram | null>(null);

  const ast = useMemo(() => (diagram ? parse(diagram.svg, decodeSvgEntities) : null), [diagram]);

  useEffect(() => {
    let active = true;

    if (!code.trim()) {
      setDiagram(null);
    } else {
      void renderDiagram(code, tokens, id).then(
        (result) => {
          if (active && (result || !loading)) {
            setDiagram(result);
          }
        },
        () => {
          if (active && !loading) {
            setDiagram(null);
          }
        },
      );
    }

    return () => {
      active = false;
    };
  }, [code, loading, tokens, id]);

  if (!diagram) {
    return Raw && <Raw {...props} />;
  }

  return (
    <View
      accessibilityState={{ busy: loading }}
      style={{
        marginVertical: tokens.spacing.lg,
        borderWidth: 1,
        borderColor: tokens.colors.border,
        borderRadius: tokens.radius.md,
        overflow: 'hidden',
      }}
    >
      {showHeader ? (
        <CodeHeader code={code} language={language} meta={meta} onCopy={onCopy} />
      ) : null}
      <ScrollView horizontal contentContainerStyle={{ padding: tokens.spacing.lg }}>
        <SvgAst
          ast={ast}
          override={{
            width: diagram.width,
            height: diagram.height,
            accessibilityLabel: meta || diagram.label,
          }}
        />
      </ScrollView>
      {suffix}
    </View>
  );
};

export default MermaidRenderer;
