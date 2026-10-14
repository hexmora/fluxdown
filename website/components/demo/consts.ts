import type { BaseBuildConfig, PartialThemeConfig, Theme } from 'fluxdown';

import { BaseSlotPlugin } from '@fluxdown/react-presets/base';

import type { Locale } from '../type';

import { CodeHeader } from './components';

class CodeHeaderPlugin extends BaseSlotPlugin<'CodeHeader'> {
  static readonly key = 'demo-code-header';

  readonly type = 'CodeHeader';

  readonly Component = CodeHeader;
}

export const DEMO_PLUGINS = [{ slots: [CodeHeaderPlugin] }];

const overrides: PartialThemeConfig = {
  tokens: {
    colors: {
      bg: 'var(--site-surface)',
      fg: 'var(--site-ink)',
      fgMuted: 'var(--site-muted)',
      accent: 'var(--site-accent)',
      accentHover: 'var(--rp-c-brand-light)',
    },
  },
};

export const DEMO_THEMES: Record<'light' | 'dark', Theme> = {
  light: ['light', overrides],
  dark: ['dark', overrides],
};

export const DEMO_BUILD = {
  tex: true,
  footnote: false,
  indentedCode: true,
  setextHeading: true,
} satisfies BaseBuildConfig;

export const STREAM_SAMPLES = {
  zh: `# 文字正在到来，阅读已经开始。

一个好答案，不必等到最后一个字才值得阅读。Fluxdown 接住分批送来的 Markdown，让它从第一句开始，就有清晰的结构和自然的节奏。

## 从片段，到完整表达

网络里的文字时快时慢：有时是一个词，有时是一整段。**平滑输出**把这些片段连在一起，*末尾渐变*让新内容轻轻出现。你可以专注阅读，而不是等待下一次跳动。

> 语言有自己的节奏。
> 工具应该帮助它表达，而不是打断它。

### 不同语言，同一种阅读体验

- **中文**：让想法自然展开。
- **English**: Give good ideas room to unfold.
- **日本語**：言葉とともに、考えが形になる。
- **한국어**: 생각이 자연스럽게 이어집니다.

段落里可以有 **重点**、*斜体*、***组合强调***，也可以 ~~划掉旧想法~~。提到配置时，用行内代码 \`streaming\` 标记就很清楚。

## 为真实内容准备好

| 内容 | 阅读体验 | 开启方式 |
| :--- | :---: | ---: |
| 代码 | 高亮与复制 | 默认 |
| 表格 | 对齐与比较 | 默认 |
| 任务列表 | 整理进度 | 默认 |
| 公式 | 表达数学关系 | 按需开启 |

### 一份小小的接入清单

- [x] 安装 Fluxdown
- [x] 传入已经收到的完整文本
- [x] 打开流式模式
- [ ] 加入自己的视觉风格

可以先这样开始：

1. 新建一条消息。
2. 随着内容到达，更新它。
   - 已有内容保持稳定。
   - 新增内容继续展开。
3. 完成后关闭流式模式。

## 几行代码，让内容动起来

\`\`\`tsx
import { Fluxdown } from 'fluxdown';

type MessageProps = {
  text: string;
  pending: boolean;
};

export const Message = ({ text, pending }: MessageProps) => (
  <Fluxdown text={text} streaming={pending} />
);
\`\`\`

这背后是一套框架无关的 Core。使用现成的界面，也可以把同一份能力带进自己的渲染环境。

### 代码，也有不同的表达

\`\`\`python
# 把输入片段连成完整消息
def accumulate(chunks):
    message = ""
    for chunk in chunks:
        message += chunk
        yield message
\`\`\`

\`\`\`json
{ "renderer": "Fluxdown", "message": "你好，世界。" }
\`\`\`

熟悉的缩进代码块也能保留：

    const message = '从一个好想法开始。';
    console.log(message);

让思路继续展开
============

这是另一种一级标题写法：文字下面放一行等号。

留一点空间给细节
----------------

用短横线也能写二级标题。本示例开启了这两种标题和缩进代码块；你的应用可以按需开启。

## 让数学回到文字里

本示例也开启了公式。行内的 $E = mc^2$ 可以自然地出现在句子中，较长的表达则独立展示：

$$
\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}
$$

### 给文字一点额外的表情

<span>少量 HTML 也可以融入文字：<u>划出重点</u>，或用 <em>强调</em> 放慢脚步。</span><br />
继续阅读 <a href="https://github.com/hexmora/fluxdown">Fluxdown 项目</a>。这里使用默认允许的标签，输出仍会经过 HTML 清理。

#### 链接与图片

阅读 [Fluxdown 项目介绍](https://github.com/hexmora/fluxdown)，也可以使用[引用式链接][fluxdown]，把地址留到文末。

网址可以直接写：https://github.com/hexmora/fluxdown
邮箱也能写成链接：<hello@example.com>。

![Fluxdown 标志]({LOGO})

##### 一些细小但有用的表达

想展示星号本身？写成 \\*这样\\*。\x20\x20
行尾的两个空格会带来明确的换行。
普通换行也会保留，让句子自然分行。

熟悉的字符同样可以使用：&copy;、&amp;、&lt;Markdown&gt;。

###### 内容还在生长

---

从普通文字，到代码、公式和结构化内容，Fluxdown 让每一种表达都有合适的位置。

**现在，把下一段好内容交给你的读者。**

[fluxdown]: https://github.com/hexmora/fluxdown
`,
  en: `# The words arrive. The reading begins.

A good answer is worth reading before its final word. Fluxdown keeps incoming Markdown clear, even while the thought is still taking shape.

## From fragments to a thought

**Smooth streaming** connects uneven bursts. A *gentle fade* welcomes new text.

> Give language room to breathe.
> Let the reader follow along.

### Many languages, one experience

- **English**: Ideas unfold.
- **中文**：让想法自然展开。
- **日本語**：考えが形になる。
- **한국어**: 생각이 이어집니다.

Use **bold**, *emphasis*, ***both***, or ~~an old idea~~. Keep names like \`streaming\` easy to spot.

| Content | Experience | Enabled |
| :--- | :---: | ---: |
| Code | Highlight and copy | Default |
| Tables | Align and compare | Default |
| Tasks | Track progress | Default |
| Math | Explain equations | Opt in |

- [x] Install Fluxdown
- [x] Pass accumulated text
- [ ] Make it your own

1. Start a message.
2. Append new content.
   - Keep existing content steady.
   - Let new words unfold.
3. End streaming when done.

## Put words in motion

\`\`\`tsx
import { Fluxdown } from 'fluxdown';

type MessageProps = {
  text: string;
  pending: boolean;
};

export const Message = ({ text, pending }: MessageProps) => (
  <Fluxdown text={text} streaming={pending} />
);
\`\`\`

A framework-independent Core powers this interface.

\`\`\`python
# Collect incoming text
message = ""
for chunk in chunks:
    message += chunk
\`\`\`

\`\`\`json
{ "renderer": "Fluxdown", "message": "Hello!" }
\`\`\`

Indented code works too:

    const message = 'Keep going.';
    console.log(message);

A familiar heading
==================

An alternative to a level-one heading.

Room for details
----------------

Dashes make a level-two heading. This demo opts into both forms and indented code.

## Keep math close

Math is enabled here: $E = mc^2$, or a separate equation:

$$
\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}
$$

### A little HTML

<span>Try an <u>underline</u> or <em>emphasis</em>.</span><br />
Visit <a href="https://github.com/hexmora/fluxdown">Fluxdown</a>. These tags are allowed by default; HTML is still sanitized.

#### Links and images

Use a [project link](https://github.com/hexmora/fluxdown), or a [reference link][fluxdown].
Plain URLs work too: https://github.com/hexmora/fluxdown, or <hello@example.com>.

![The Fluxdown mark]({LOGO})

##### Small details

Escape an asterisk: \\*this\\*.\x20\x20
Two trailing spaces make a hard break.
Plain newlines work too.

Entities: &copy;, &amp;, &lt;Markdown&gt;.

###### One more thought

---

**Bring your next idea to the people reading it.**

[fluxdown]: https://github.com/hexmora/fluxdown
`,
} satisfies Record<Locale, string>;
