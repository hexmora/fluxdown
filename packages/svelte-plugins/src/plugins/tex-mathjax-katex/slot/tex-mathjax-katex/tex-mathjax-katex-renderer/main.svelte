<script lang="ts">
  import type { TexProps } from '../../../../../base';

  import { TexKatexRenderer } from '../../../../tex-katex/slot/tex-katex/tex-katex-renderer';
  import { MathjaxTexRenderer } from './components/mathjax-tex-renderer';

  let props: TexProps = $props();
</script>

<TexKatexRenderer {...props} Fallback={MathjaxTexRenderer} />
