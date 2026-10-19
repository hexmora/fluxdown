import { EFFECT_SAMPLES } from '../../samples';

const CODE = `\`\`\`ts
interface Message {
  role: "assistant" | "user";
  content: string;
}

const messages: Message[] = [];

async function receiveMessage(
  stream: AsyncIterable<string>,
  onUpdate: (message: Message) => void,
) {
  const message: Message = {
    role: "assistant",
    content: "",
  };

  messages.push(message);

  for await (const chunk of stream) {
    message.content += chunk;
    onUpdate({ ...message });
  }

  return message;
}

function summarizeConversation() {
  return messages.map((message, index) => ({
    number: index + 1,
    role: message.role,
    characters: message.content.length,
  }));
}

console.table(summarizeConversation());
\`\`\``;

export const SUFFIX_SAMPLES = {
  zh: {
    paragraph: { label: '段落', source: EFFECT_SAMPLES.zh },
    inline: {
      label: '行内代码',
      source: `### 跟着一段消息的变化

新内容到达时，先把它接在已有内容后面，再更新 \`message.text\`。保持完整的文本，让渲染器能够理解前后相连的 Markdown 结构。

如果只需要立即展示，可以关闭平滑化。希望输出更连贯时，则开启 \`streaming.smooth\`。这两种方式都会让标记跟随当前可见的末尾。

行内代码保留自己的背景、字体与间距。例如这句以一个变量结尾：\`receivedText\`

如果标记之后还有普通文字，它就应该继续向后移动。这时我们读到的是一句包含 \`message.content\` 的说明，而标记仍然只在整段内容的末尾。

再看看标点与多个行内代码片段：先调用 \`append(chunk)\`，再调用 \`render(text)\`，每一步都沿用已经积累的消息内容。

这个过程也适用于加粗文字、列表和引用。无论最后一个字符使用什么格式，都只需要在这一份完整文本的末尾添加一个标记。

最后，把整个响应保存到 \`conversation.messages[0].content\``,
    },
    code: { label: '代码块', source: CODE },
    list: {
      label: '列表',
      source: `### 写作时可以留意的细节

- 先确定一个**清楚的主题**，让读者知道这段文字要去哪里。
- 用短句开始，再逐渐补充背景，不必在第一句话里放进所有信息。
- 每个段落围绕一个想法展开，转向新想法时给它一个新的位置。
- 选择具体的例子，让读者能够想象正在描述的场景。
- 保留已经写好的内容，让后面的文字自然接上前面的节奏。
- 需要强调时，用**少量的加粗**帮助读者找到关键内容。
- 如果存在先后关系，就把步骤放进有序列表，让顺序清楚可见。
- 描述一段代码时，使用行内代码，例如 \`message.content\`。
- 别忘了读一遍自己的句子，看看是否还可以更短、更直接。
- 留意每次停顿的位置，让段落之间有足够的呼吸空间。
- 删除重复的解释，让例子承担一部分说明的工作。
- 最后，用一句简单的话，为**下一段内容**留下一个起点。`,
    },
    table: {
      label: '表格',
      source: `| 记录 | 位置 | 细节 |
| --- | --- | --- |
| 清晨 | 河岸 | 第一束落在桥面的光 |
| 早餐 | 小广场 | 杯子碰到木桌的轻响 |
| 散步 | 旧街 | 刚刚打开的店门 |
| 停留 | 书店 | 翻动书页的声音 |
| 转角 | 花店 | 换好水的枝叶 |
| 午后 | 长椅 | 树影慢慢移动 |
| 回程 | 小桥 | 比早上更多的行人 |
| 傍晚 | 路口 | 从窗口透出的灯光 |
| 整理 | 书桌 | 把零散观察写成句子 |
| 回看 | 笔记 | 为下一次出发留下空间 |`,
    },
  },
  en: {
    paragraph: { label: 'Paragraph', source: EFFECT_SAMPLES.en },
    inline: {
      label: 'Inline code',
      source: `### Follow a message as it changes

When a new chunk arrives, append it to the content you already have and update \`message.text\`. Passing the complete text gives the renderer the context it needs to understand unfinished Markdown.

Turn smoothing off when each update should appear immediately. Turn \`streaming.smooth\` on when the visible text should move at a steadier pace. In both cases, the marker follows the end of the content currently on screen.

Inline code keeps its own background, font, and spacing. For example, this paragraph ends with a variable: \`receivedText\`

When more ordinary text follows, the marker should move along with it. A sentence can include \`message.content\` in the middle, while the suffix still belongs at the end of the whole paragraph.

Now consider punctuation and several code fragments in the same sentence. First call \`append(chunk)\`, then call \`render(text)\`, keeping the accumulated message available through every update.

The same idea works with emphasis, lists, and quotations. The formatting of the last character can change without changing the rule: there is one marker at the end of the visible content.

Finally, store the complete response in \`conversation.messages[0].content\``,
    },
    code: { label: 'Code block', source: CODE },
    list: {
      label: 'List',
      source: `### Details to notice while writing

- Begin with a **clear subject** so the reader knows where this passage is going.
- Use a short opening sentence, then add the background as it becomes useful.
- Keep one thought at the center of each paragraph, giving a new idea its own space.
- Choose a concrete example that the reader can picture without extra explanation.
- Leave earlier content in place as each new sentence joins the thought before it.
- Use **a little emphasis** to help the eye find the part that matters most.
- Put sequential actions in an ordered list so their relationship stays clear.
- Use inline code for a value or expression, such as \`message.content\`.
- Read the sentence aloud once and listen for a place where it could become simpler.
- Notice the pauses between paragraphs and give the reader a moment to follow.
- Remove repeated explanations and let a useful example carry some of the detail.
- Finish with a simple line that leaves a starting point for **the next idea**.`,
    },
    table: {
      label: 'Table',
      source: `| Entry | Place | Detail |
| --- | --- | --- |
| Early morning | River | The first light on the bridge |
| Breakfast | Square | A cup meeting a wooden table |
| Walking | Old street | A shop opening for the day |
| Pausing | Bookshop | The sound of a page turning |
| Around the corner | Florist | Fresh water for the branches |
| Afternoon | Bench | The slow movement of a shadow |
| Heading back | Bridge | More people than before |
| Evening | Crossroads | Light coming from a window |
| Sorting notes | Desk | Observations becoming sentences |
| Reading again | Notebook | Room for the next journey |`,
    },
  },
};
