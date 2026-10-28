import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(new URL('../../packages/taro/package.json', import.meta.url));

/** Match Taro's h5.useHtmlComponents option in hosts outside the Taro CLI. */
export const taroWebAliases = () => ({
  '@tarojs/components$': require.resolve('@tarojs/components-react'),
  '@tarojs/taro$': require.resolve('@tarojs/taro-h5'),
  '@taro-prefix': fileURLToPath(
    new URL('../../packages/taro-plugins/src/styles/_prefix.scss', import.meta.url),
  ),
});

export const taroWebDefines = {
  DEPRECATED_ADAPTER_COMPONENT: 'false',
  'process.env.TARO_PLATFORM': JSON.stringify('web'),
  'process.env.TARO_ENV': JSON.stringify('h5'),
};
