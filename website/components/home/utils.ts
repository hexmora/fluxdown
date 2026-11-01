const getComponentExample = (
  entry: string,
  comment: string,
) => `import { Fluxdown } from '${entry}';

type MessageProps = {
  text: string;
  isStreaming: boolean;
};

${comment}
export function Message({ text, isStreaming }: MessageProps) {
  return (
    <Fluxdown
      text={text}
      streaming={isStreaming}
    />
  );
}`;

export const getQuickStarts = (comment: string) =>
  [
    {
      framework: 'React',
      renderer: 'react',
      lang: 'tsx',
      code: getComponentExample('fluxdown', comment),
    },
    {
      framework: 'Vue',
      renderer: 'vue',
      lang: 'vue',
      code: `<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue';

${comment}
defineProps<{
  text: string;
  isStreaming: boolean;
}>();
</script>

<template>
  <Fluxdown :text="text" :streaming="isStreaming" />
</template>`,
    },
    {
      framework: 'Svelte',
      renderer: 'svelte',
      lang: 'svelte',
      code: `<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  type MessageProps = {
    text: string;
    isStreaming: boolean;
  };

  ${comment}
  let { text, isStreaming }: MessageProps = $props();
</script>

<Fluxdown {text} streaming={isStreaming} />`,
    },
    {
      framework: 'Angular',
      renderer: 'angular',
      lang: 'ts',
      code: `import { Component, input } from '@angular/core';
import { Fluxdown } from '@fluxdown/angular';

@Component({
  selector: 'app-message',
  imports: [Fluxdown],
  template: \`<fluxdown [text]="text()" [streaming]="isStreaming()" />\`,
})
export class Message {
  ${comment}
  readonly text = input.required<string>();
  readonly isStreaming = input(false);
}`,
    },
    {
      framework: 'React Native',
      renderer: 'react-native',
      lang: 'tsx',
      code: getComponentExample('@fluxdown/react-native', comment),
    },
    {
      framework: 'Lynx',
      renderer: 'lynx',
      lang: 'tsx',
      code: getComponentExample('@fluxdown/lynx', comment),
    },
    {
      framework: 'Solid',
      renderer: 'solid',
      lang: 'tsx',
      code: `import { Fluxdown } from '@fluxdown/solid';

type MessageProps = {
  text: string;
  isStreaming: boolean;
};

${comment}
export function Message(props: MessageProps) {
  return (
    <Fluxdown
      text={props.text}
      streaming={props.isStreaming}
    />
  );
}`,
    },
    {
      framework: 'Taro',
      renderer: 'taro',
      lang: 'tsx',
      code: getComponentExample('@fluxdown/taro', comment),
    },
  ] as const;
