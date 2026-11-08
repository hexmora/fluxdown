export const COPY = {
  zh: {
    label: 'Core 实时处理管线',
    edit: '编辑 Markdown 文本',
    hint: '编辑文本，或逐段追加',
    append: '追加一段',
    reset: '重新开始',
    smooth: '平滑展开',
    columns: ['文本输入', '分块列表', '构建 HAST', '映射后 HAST', 'Markdown'],
    chunks: [
      '## 一次更新\n\n周末的笔记从一句话开始，沿途看到的景色，随后慢慢补进来。\n\n',
      '走出车站，先沿着河边散步。树影落在水面上，风把远处的钟声送过来。**不用急着赶路',
      '，也不必一次写完**。找一张长椅坐下，把刚才看见的颜色、声音，还有突然想到的小事，一点点记下来。\n\n',
      '### 路上记下的事\n\n- 在桥边停一会儿，看船从下面经过。\n- 拐进一条没走过的小街，买一杯热茶。\n- 傍晚再翻开笔记，把空白的地方补上。\n\n',
      '![Fluxdown 标志](/demo-mark.svg)\n\n',
      '> 留一点空白给接下来发生的事。\n> 有时一句话，就能让人想起整个下午。\n\n',
      '天色暗下来时，这页笔记也快写满了。最后再添上一行：今天没有走很远，但看见了不少平时会错过的细节。把本子合上，明天还可以接着写。',
    ],
  },
  en: {
    label: 'Live Core pipeline',
    edit: 'Edit Markdown text',
    hint: 'Edit the text or append a chunk',
    append: 'Append',
    reset: 'Reset',
    smooth: 'Smooth',
    columns: ['Text input', 'Blocks', 'Built HAST', 'Mapped HAST', 'Markdown'],
    chunks: [
      '## One update\n\nA weekend note begins with one sentence. The details of the walk arrive a little later.\n\n',
      'Leave the station and follow the river. Shadows move across the water, and a distant bell rings. **There is no need to hurry',
      ' or finish the story at once**. Find a bench and write down a color, a sound, or a small thought before it slips away.\n\n',
      '### Notes from the walk\n\n- Stop by the bridge and watch a boat pass underneath.\n- Turn into a quiet street and buy a cup of tea.\n- Open the notebook again at dusk and fill in the gaps.\n\n',
      '![Fluxdown logo](/demo-mark.svg)\n\n',
      '> Leave a little space for what happens next.\n> Sometimes one sentence brings back a whole afternoon.\n\n',
      'By evening, the page is almost full. Add one last line: the walk was short, but there was plenty to notice. Close the notebook for now. There is room to continue tomorrow.',
    ],
  },
};

export const PROCESSORS = ['TextChunker', 'BlockCompiler', 'MapperComposer', 'Renderer'];
