export const COPY = {
  zh: {
    label: 'Markdown AST 经语法修复后转换成 HAST',
    input: 'Markdown 语法树',
    repair: '语法修复',
    steps: ['准备边界', '依次修复节点', '清理临时信息'],
    convert: '转换',
    output: 'HTML 语法树',
  },
  en: {
    label: 'Repair the Markdown AST, then convert it to HAST',
    input: 'Markdown tree',
    repair: 'Syntax repair',
    steps: ['Prepare boundaries', 'Repair nodes in order', 'Clean up'],
    convert: 'Convert',
    output: 'HTML tree',
  },
};
