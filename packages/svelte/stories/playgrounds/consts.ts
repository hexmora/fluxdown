export const STORY_MARKDOWN = `# Field notes for a streaming document

This workspace combines **strong text**, *emphasis*, ~~revisions~~, and an [external link](https://example.com).

## Lists and decisions

1. Draft a section
2. Stream it into the preview
3. Keep the rendered block mounted

- [x] Headings and paragraphs
- [x] Tables and fenced code
- [ ] One final review

> A blockquote can carry a useful aside without interrupting the main thread.

| Capability | Example | Status |
| --- | --- | ---: |
| Inline TeX | $E = mc^2$ | Ready |
| Footnotes | Reference[^note] | Optional |

First line\\
Second line

\`\`\`svelte
<Fluxdown text={markdown} />
\`\`\`

$$
\\int_0^1 x^2\\,dx = \\frac{1}{3}
$$

\`\`\`mermaid
graph LR
  Markdown --> Parse --> Render
\`\`\`

---

中文、English、emoji 🚀 and incremental updates share the same rendering pipeline.

[^note]: A footnote at the end of the document.
`;
