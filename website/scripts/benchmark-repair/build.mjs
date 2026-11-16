import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const hash = (value) => {
  return createHash('sha256').update(value).digest('hex');
};

export const buildAdapters = async (options) => {
  const { workspace, output, versions, fluxdownVersion } = options;
  const modules = new Map();
  await Promise.all(
    (await readdir(resolve(workspace, 'packages'))).map(async (name) => {
      const path = resolve(workspace, 'packages', name);
      try {
        const manifest = JSON.parse(await readFile(resolve(path, 'package.json'), 'utf8'));
        modules.set(manifest.name, { path, manifest });
      } catch {}
    }),
  );

  const files = {};

  await build({
    entryPoints: [resolve(dir, 'adapters.jsx')],
    outfile: output,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [
      {
        name: 'workspace',
        setup(b) {
          b.onResolve(
            { filter: /^(?:@fluxdown\/|fluxdown(?:\/|$)|stative(?:\s*\/|$))/ },
            (args) => {
              // esbuild includes trailing whitespace from multiline @jsxImportSource pragmas.
              args.path = args.path.replace(/^stative\s+\//, 'stative/');
              const name = args.path.startsWith('@')
                ? args.path.split('/').slice(0, 2).join('/')
                : args.path.split('/')[0];
              const m = modules.get(name);
              if (!m) return;
              const key = '.' + args.path.slice(name.length);
              let target = m.manifest.exports?.[key];
              if (!target)
                for (const [pattern, value] of Object.entries(m.manifest.exports || {})) {
                  const [pre, suf] = pattern.split('*');
                  if (pattern.includes('*') && key.startsWith(pre) && key.endsWith(suf)) {
                    target = (
                      typeof value === 'string' ? value : value.import || value.default
                    ).replace('*', key.slice(pre.length, key.length - suf.length));
                    break;
                  }
                }
              if (target && typeof target !== 'string') target = target.import || target.default;
              return { path: resolve(m.path, target || m.manifest.module || m.manifest.main) };
            },
          );
          b.onResolve({ filter: /^(react|react-dom)(\/|$)/ }, (args) => ({
            path: require.resolve(args.path),
            external: true,
          }));
          b.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
            if (args.path.startsWith(resolve(workspace, 'packages') + '/'))
              files[relative(workspace, args.path)] = hash(await readFile(args.path));
          });
        },
      },
      {
        name: 'assets',
        setup(b) {
          b.onResolve({ filter: /\.(?:s?css|less)(?:\?.*)?$/ }, (args) => ({
            path: args.path,
            namespace: 'styles',
          }));
          b.onLoad({ filter: /.*/, namespace: 'styles' }, () => ({
            contents: 'export default new Proxy({}, {get:(_,key)=>String(key)});',
            loader: 'js',
          }));
          b.onResolve({ filter: /\.svg\?react$/ }, (args) => ({
            path: args.path,
            namespace: 'svg',
          }));
          b.onLoad({ filter: /.*/, namespace: 'svg' }, () => ({
            contents: 'export default function Icon(){return null}',
            loader: 'js',
          }));
        },
      },
    ],
  });
  const sortedFiles = Object.fromEntries(
    Object.entries(files).toSorted(([left], [right]) => left.localeCompare(right)),
  );
  return {
    commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: workspace, encoding: 'utf8' }).trim(),
    files: sortedFiles,
    sourceHash: hash(JSON.stringify(sortedFiles)),
    bundle: output,
    versions,
    fluxdownVersion,
  };
};
