<script lang="ts">
  interface CopyButtonProps {
    copied: boolean;

    copying: boolean;

    onclick: () => void;
  }

  let { copied, copying, onclick }: CopyButtonProps = $props();
</script>

<button aria-label={copied ? 'Copied' : 'Copy'} aria-live="polite" disabled={copying} {onclick} type="button">
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24">
    {#if copied}
      <path d="m5 12 4 4L19 6" />
    {:else}
      <rect height="13" rx="2" width="13" x="8" y="8" />

      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    {/if}
  </svg>
  {copied ? 'Copied' : 'Copy'}
</button>
