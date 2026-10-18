const path = require('node:path');

module.exports = {
  projects: ['react-native', 'react-native-presets'].map((name) => ({
    displayName: name,
    rootDir: path.join(__dirname, 'packages', name),
    preset: require.resolve('@react-native/jest-preset', {
      paths: [path.join(__dirname, 'packages', name)],
    }),
    testMatch: ['<rootDir>/{src,stories}/**/*.test.{ts,tsx}'],
    moduleNameMapper: {
      '^@fluxdown/react-base-presets/math$': '<rootDir>/../react-base-presets/src/math/index.ts',
      '^react$': '<rootDir>/node_modules/react',
      '^react/(.*)$': '<rootDir>/node_modules/react/$1',
    },
    transform: {
      '^.+/packages/(?:stative|core|core-presets)/.+\\.[jt]sx?$': [
        '@swc/jest',
        {
          jsc: {
            target: 'es2022',
            parser: { syntax: 'typescript', tsx: true, decorators: true },
            transform: {
              legacyDecorator: true,
              react: { runtime: 'automatic', importSource: 'stative' },
            },
          },
          module: { type: 'commonjs' },
        },
      ],
      '^.+/packages/[^/]+/(?:src|stories)/.+\\.[jt]sx?$|^.+\\.mjs$': [
        '@swc/jest',
        {
          jsc: {
            target: 'es2022',
            parser: { syntax: 'typescript', tsx: true },
            transform: {
              useDefineForClassFields: true,
              react: { runtime: 'automatic', importSource: 'react' },
            },
          },
          module: { type: 'commonjs' },
        },
      ],
      '^.+\\.[cm]?[jt]sx?$': ['babel-jest', { presets: ['@react-native/babel-preset'] }],
    },
    transformIgnorePatterns: [],
  })),
};
