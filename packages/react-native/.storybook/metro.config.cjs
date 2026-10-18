const { withStorybook } = require('@storybook/react-native/metro/withStorybook');
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react' || moduleName.startsWith('react/')) {
    const filePath = require.resolve(moduleName, {
      paths: [path.resolve(__dirname, '..')],
    });

    return context.resolveRequest(context, filePath, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withStorybook(config, {
  configPath: __dirname,
});
