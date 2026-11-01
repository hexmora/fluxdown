export const CODE_FRAMEWORKS = [
  'Core',
  'React',
  'Vue',
  'Svelte',
  'Angular',
  'React Native',
  'Lynx',
  'Solid',
  'Taro',
  'uni-app',
] as const;

export const DEFAULT_FRAMEWORKS = CODE_FRAMEWORKS.slice(1);

export const FRAMEWORK_STORAGE_KEY = 'fluxdown:code-framework';
