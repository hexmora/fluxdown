import type { Options } from '@swc/core';
import type { Config } from 'jest';

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

const require = createRequire(import.meta.url);

const nativePreset = require('@react-native/jest-preset') as Config;

const swc = (importSource: string): [string, Options] => [
  '@swc/jest',
  {
    jsc: {
      target: 'es2022',
      parser: { syntax: 'typescript', tsx: true, decorators: true },
      transform: {
        legacyDecorator: true,
        react: { runtime: 'automatic', importSource, development: false },
      },
    },
    module: { type: 'commonjs' },
  },
];

const config: Config = {
  rootDir,
  projects: [
    'utils',
    'hast',
    'mdast',
    'stative',
    'core-plugins',
    'core',
    'react-hooks',
    'react-base',
    'react-base-plugins',
    'react-plugins',
    'react-native-plugins',
    'react-native',
    'react',
  ].map((name) => ({
    displayName: name,
    rootDir,
    // Release dry runs contain package copies; keep them outside Jest's module map.
    roots: ['<rootDir>/packages', '<rootDir>/scripts/testing'],
    modulePathIgnorePatterns: ['<rootDir>/packages/[^/]+/dist/'],
    testMatch: [`<rootDir>/packages/${name}/src/**/*.test.{ts,tsx}`],
    ...(name === 'react-native' ? nativePreset : {}),
    testEnvironment:
      name === 'react-native'
        ? nativePreset.testEnvironment
        : name.startsWith('react')
          ? '<rootDir>/scripts/testing/jsdom-environment.ts'
          : 'node',
    ...(name === 'react-native-plugins'
      ? {
          resolver: '<rootDir>/scripts/testing/native-web-resolver.cjs',
          moduleFileExtensions: [
            'web.tsx',
            'web.ts',
            'web.jsx',
            'web.js',
            'tsx',
            'ts',
            'jsx',
            'js',
            'mjs',
            'cjs',
            'json',
            'node',
          ],
        }
      : {}),
    setupFilesAfterEnv: name.startsWith('react')
      ? [`<rootDir>/packages/${name}/jest.setup.ts`]
      : [],
    moduleNameMapper: {
      '^(.+\\.svg)\\?react$': '$1',
      ...(name === 'react-native' ? nativePreset.moduleNameMapper : {}),
      ...(name === 'react-native-plugins'
        ? {
            '^react-native$': 'react-native-web',
            '^@react-native/assets-registry/registry$':
              '<rootDir>/packages/react-native-plugins/node_modules/react-native-web/asset-registry.js',
          }
        : {}),
      ...(name.startsWith('react-native')
        ? {
            '^react$': '<rootDir>/packages/react-native/node_modules/react',
            '^react/(.*)$': '<rootDir>/packages/react-native/node_modules/react/$1',
          }
        : {}),
    },
    transform: {
      ...(name === 'react-native'
        ? {
            '^.+/node_modules/(?:react-native|@react-native)/.+\\.[cm]?[jt]sx?$': [
              'babel-jest',
              { presets: ['module:@react-native/babel-preset'], babelrc: false, configFile: false },
            ],
          }
        : {}),
      // A project may import another package's sources, so select JSX by source path.
      '^.+/packages/(?:stative|core|core-plugins)/.+\\.[jt]sx?$': swc('stative'),
      '^.+\\.[cm]?[jt]sx?$': swc('react'),
      '^.+\\.(?:css|scss|sass|less|svg)$': '<rootDir>/scripts/testing/assets-transformer.ts',
    },
    // Markdown and Shiki dependencies are ESM-only. SWC also transforms dependencies
    // so the CJS Jest runtime can execute them without experimental VM flags.
    transformIgnorePatterns: [],
  })),
};

export default config;
