export const COPY = {
  zh: {
    label: '一轮修复：准备、依次执行插件、逆序清理',
    prepare: '准备',
    prepareOrder: '本轮插件 A · B · C',
    run: '依次修复',
    runOrder: '插件 A → B → C',
    cleanup: '清理',
    cleanupAction: '执行 prepare 返回的清理函数',
    cleanupOrder: '逆序释放 C → B → A',
  },
  en: {
    label: 'One repair pass: prepare, run plugins in order, clean up in reverse',
    prepare: 'Prepare',
    prepareOrder: 'This pass: A · B · C',
    run: 'Repair in order',
    runOrder: 'Plugins A → B → C',
    cleanup: 'Clean up',
    cleanupAction: 'Call cleanup functions returned by prepare',
    cleanupOrder: 'Reverse order: C → B → A',
  },
};
