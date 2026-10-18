import { Fluxdown } from '@fluxdown/react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { PlaygroundProps } from './type';

import { BUILD_CONFIG } from './consts';
import { usePlayground } from './hooks/use-playground';
import { styles } from './styles';

export type { PlaygroundProps } from './type';

export const Playground = ({ theme = 'light', ...props }: PlaygroundProps) => {
  const {
    complete,
    cursor,
    handlePause,
    handlePlay,
    handleReset,
    playing,
    previewText,
    progress,
    status,
    total,
  } = usePlayground(props);

  let playLabel = '播放';

  if (complete && total > 0) {
    playLabel = '重播';
  } else if (playing && !complete) {
    playLabel = '暂停';
  } else if (cursor > 0) {
    playLabel = '继续';
  }

  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Fluxdown · React Native</Text>
        <Text style={styles.title}>中文 Markdown 流式预览</Text>
        <Text style={styles.description}>正文从空内容开始，逐步展示标题、列表、代码与公式。</Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: total === 0 }}
            disabled={total === 0}
            onPress={playing && !complete ? handlePause : handlePlay}
            style={[styles.button, total === 0 && styles.disabledButton]}
          >
            <Text style={styles.buttonText}>{playLabel}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handleReset}
            style={[styles.button, styles.secondaryButton]}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>重置</Text>
          </Pressable>
        </View>

        <Text accessibilityLiveRegion="polite" style={styles.progressLabel}>
          {status} · {Math.round(progress)}%
        </Text>

        <View
          accessible
          accessibilityLabel="播放进度"
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }}
          style={styles.progressTrack}
        >
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.count}>
          {cursor} / {total} 字符
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        style={[styles.preview, theme === 'dark' && styles.darkPreview]}
      >
        {cursor === 0 && (
          <Text style={styles.placeholder}>
            {playing ? '文字正在逐步到达…' : '点击播放，逐步展开 Markdown。'}
          </Text>
        )}

        <Fluxdown
          build={BUILD_CONFIG}
          streaming={{ repairEnding: !complete, smooth: false, effect: false }}
          text={previewText}
          theme={theme}
        />
      </ScrollView>
    </View>
  );
};
