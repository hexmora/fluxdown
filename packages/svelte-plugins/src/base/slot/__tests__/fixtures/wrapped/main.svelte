<script lang="ts">
  import type { ParagraphProps } from '../../../..';

  let { Raw, ...props }: ParagraphProps = $props();
</script>

<section data-wrapped="true">{@render Raw?.(props)}</section>
