<script lang="ts">
  import type { ParagraphProps } from '../../../..';

  let { title, children }: ParagraphProps = $props();

  const checked = $derived.by(() => {
    if (title === 'fail') {
      throw new Error('Render failed');
    }

    return title;
  });
</script>

<p title={checked}>{@render children?.()}</p>
