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
| Hard break | Two physical lines | Ready |

Hard-break example:

First line\\
Second line

\`\`\`tsx meta="streaming example"
<Fluxdown text={markdown()} streaming={pending()} />
\`\`\`

Display math:

$$
\\int_0^1 x^2\\,dx = \\frac{1}{3}
$$

\`\`\`mermaid
flowchart LR
  Markdown --> Parse --> Render
\`\`\`

[^note]: Enable footnotes to reveal this note in the rendered document.
`;
