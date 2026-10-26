export const STORY_MARKDOWN = `# Fluxdown for Lynx

Streaming Markdown rendered with **native Lynx elements** and the same reactive core as Fluxdown.

## Text and links

Text supports *emphasis*, **strong**, ~~deleted text~~, and \`inline code\`.
Visit [the Lynx documentation](https://lynxjs.org).

> A block quote can contain **rich text**, lists, and more than one paragraph.

## Lists

- Native text layout
- Nested content
  - Updates preserve stable blocks
  - Render plugins stay configurable
- [x] Completed task
- [ ] Open task

1. Parse Markdown
2. Reconcile blocks
3. Render Lynx elements

## Code

\`\`\`typescript
const message = 'Hello, Lynx!';
console.log(message);
\`\`\`

## Tables

| Package | Purpose |
| --- | --- |
| @fluxdown/lynx | Streaming renderer |
| @fluxdown/lynx-plugins | Native render plugins |

---

中文、English、emoji 🚀 and incremental updates share the same rendering pipeline.
`;

export interface PlaygroundArgs {
  text: string;
  streaming: boolean;
  pack: 'full' | 'lite';
  effect: 'none' | 'scale' | 'shad' | 'chunk' | 'suffix';
  smooth: boolean;
  theme: 'light' | 'dark';
}
