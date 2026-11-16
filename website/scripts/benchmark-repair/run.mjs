import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

import {
  align,
  delivered,
  inputOffsets,
  scoreTrajectory,
  semanticSnapshot,
} from '../../benchmark/repair/semantic.mjs';
import { dom } from './environment.mjs';

const tick = () => {
  return new Promise((resolve) => setImmediate(resolve));
};

const mean = (xs) => {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
};

const aggregate = (rs) => {
  return {
    cases: rs.length,
    frames: rs.reduce((a, r) => a + r.inputChars, 0),
    jumpFrameRate: mean(rs.map((r) => r.transitionFrames / r.inputChars)),
    jumpCaseRate: mean(rs.map((r) => Number(r.hadJump))),
    heldContentRate: mean(rs.map((r) => (r.deliveredArea ? r.missingArea / r.deliveredArea : 0))),
    finalTextRate: mean(rs.map((r) => Number(r.finalTextCorrect))),
    finalStructureRate: mean(rs.map((r) => Number(r.finalStructureCorrect))),
    firstWrongRoleChars: rs.reduce((a, r) => a + r.firstWrongChars, 0),
    completionEvents: rs.reduce((a, r) => a + r.completionEvents, 0),
  };
};

export const runBenchmark = async (manifest) => {
  const require = createRequire(import.meta.url);
  const { create, flushSync, staticOracle } = require(manifest.bundle);
  const source = JSON.parse(
    await readFile(new URL('../../benchmark/repair/corpus.json', import.meta.url), 'utf8'),
  );
  const libraries = [
    {
      id: 'fluxdown',
      name: 'Fluxdown',
      version: manifest.fluxdownVersion,
      source: 'https://github.com/hexmora/fluxdown',
      profile:
        'React full; default repair, repairEnding; smooth/effect off; tex/footnote off; indentedCode/setextHeading on; code toolbar/highlighter disabled.',
    },
    {
      id: 'streamdown',
      name: 'Streamdown',
      package: 'streamdown',
      source: 'https://github.com/vercel/streamdown',
      profile:
        'Official streaming mode and parseIncompleteMarkdown; completion switches to static mode; animation, controls and link-safety UI off.',
    },
    {
      id: 'xmarkdown',
      name: 'Ant Design X Markdown',
      package: '@ant-design/x-markdown',
      source: 'https://ant-design-x.antgroup.com/x-markdowns/introduce',
      profile:
        'Official streaming incompleteMarkdown=complete; hasNextChunk tracks stream state; typewriter/animation off.',
    },
    {
      id: 'reactmarkdown',
      name: 'react-markdown + GFM',
      package: 'react-markdown',
      source: 'https://github.com/remarkjs/react-markdown',
      profile:
        'ReactMarkdown + remark-gfm 4.0.1; full received prefix rendered each update; no streaming repair.',
    },
    {
      id: 'markdownit',
      name: 'markdown-it',
      package: 'markdown-it',
      source: 'https://github.com/markdown-it/markdown-it',
      profile:
        'html=false, linkify=true; markdown-it-task-lists 2.1.1; full prefix rendered each update; no streaming repair.',
    },
    {
      id: 'marked',
      name: 'Marked',
      package: 'marked',
      source: 'https://github.com/markedjs/marked',
      profile: 'gfm=true; full prefix rendered each update; no streaming repair.',
    },
  ];
  for (const lib of libraries) if (lib.package) lib.version = manifest.versions[lib.package];
  const scratch = dom.window.document.createElement('main');
  const oracle = {};
  const invalid = [];
  for (const test of source) {
    scratch.innerHTML = staticOracle(test.source);
    const snapshot = semanticSnapshot(scratch, { computedVisibility: false });
    const expected = delivered(test, test.source.length);
    const match = align(expected.units, snapshot.units);
    if (match.matches.length !== expected.units.length || match.extra.length) {
      invalid.push({
        id: test.id,
        source: test.source,
        expected: expected.text,
        actual: snapshot.text,
      });
      continue;
    }
    oracle[test.id] = {
      tree: snapshot.tree,
      text: snapshot.text,
      roles: Object.fromEntries(
        match.matches.map(([l, r]) => [expected.units[l].id, snapshot.units[r].role]),
      ),
    };
  }
  if (invalid.length)
    throw new Error(
      'Corpus annotations no longer match final GFM oracle: ' + JSON.stringify(invalid),
    );

  const rows = Object.fromEntries(libraries.map((l) => [l.id, []]));
  for (const [caseIndex, test] of source.entries()) {
    const instances = libraries.map((l) => create(l.id));
    const trajectories = libraries.map(() => []);
    const offsets = inputOffsets(test.source);
    try {
      for (const [frameIndex, offset] of [...offsets, test.source.length].entries()) {
        const done = frameIndex === offsets.length;
        const prefix = test.source.slice(0, offset);
        for (const instance of instances) instance.update(prefix, done);
        // eslint-disable-next-line no-await-in-loop -- Each input prefix must settle before the next one.
        await tick();
        flushSync(() => {});
        // eslint-disable-next-line no-await-in-loop -- Each input prefix must settle before the next one.
        await tick();
        instances.forEach((instance, index) =>
          trajectories[index].push({
            offset,
            done,
            expected: delivered(test, offset),
            snapshot: semanticSnapshot(instance.container, { computedVisibility: false }),
          }),
        );
      }
      libraries.forEach((lib, i) => {
        const scored = scoreTrajectory(test, trajectories[i], oracle[test.id]);
        const row = { id: test.id, category: test.category, ...scored.summary };
        rows[lib.id].push(row);
      });
    } finally {
      instances.forEach((i) => i.destroy());
    }
    if (caseIndex % 100 === 0) process.stdout.write(`${caseIndex + 1}/${source.length}\n`);
  }

  const report = {
    meta: {
      date: new Date().toISOString().slice(0, 10),
      generatedAt: new Date().toISOString(),
      node: process.version,
      environment:
        'Persistent React DOM and HTML DOM in JSDOM; no CSS layout, paints, FPS, screenshots or video. All animation/typewriter scheduling disabled; two event-loop turns after each update.',
      cases: source.length,
      framesPerLibrary: source.reduce((a, t) => a + inputOffsets(t.source).length, 0),
      categories: [...new Set(source.map((t) => t.category))],
      corpusSha256: createHash('sha256').update(JSON.stringify(source)).digest('hex'),
      fluxdownCommit: manifest.commit,
      fluxdownSourceHash: manifest.sourceHash,
      selection:
        'Representative widely-used streaming-aware, React, and framework-neutral renderers. Not a claim of the exact five highest-download libraries.',
      scope:
        'Frozen 1327 non-math/common-dialect annotated cases from the earlier regression corpus, selected before renderer runs. GFM content, literal controls and combinations; formulas excluded because no common built-in math profile exists. No result-based filtering.',
      metrics: {
        jumpFrameRate:
          'Mean across cases of streaming input frames containing one or more changes to already shown source characters: semantic role change, disappearance/reappearance, or visible syntax consumed/reinterpreted. New first appearance is not a jump. First automatic-link recognition is allowed. Terminal stream=false frame excluded and reported separately.',
        heldContentRate:
          'Mean across cases of missing arrived non-whitespace body character-frame count / arrived body character-frame count. Exposes stability achieved by withholding content. Zero-body cases contribute zero.',
        finalTextRate:
          'Fraction of complete outputs matching authored decoded body text (ignoring whitespace).',
        finalStructureRate:
          'Fraction matching normalized final ReactMarkdown+GFM structure, including semantic markup, href/src, list start and checkbox state. This is profile compatibility, not universal correctness.',
      },
      limitations: [
        'This is a syntax regression and combination corpus, not a sample of production chat traffic. Macro averaging weights each case equally.',
        'Images use alt text as a semantic proxy; images are not loaded. Empty wrappers, paragraphs, line breaks and whitespace are normalized away.',
        'LCS text alignment can be ambiguous for repeated characters.',
        'Only settled DOM per input prefix is measured, not intermediate React paints or CSS geometry.',
        'Whitespace/layout-only changes are excluded.',
        'No formula validity or glyph-layout comparison is claimed.',
        'Different Markdown profiles can have valid but different final structures; all failures remain in the table.',
      ],
    },
    libraries: libraries.map((lib) => ({
      ...lib,
      metrics: aggregate(rows[lib.id]),
      categories: [...new Set(source.map((t) => t.category))].map((category) =>
        Object.assign({ category }, aggregate(rows[lib.id].filter((r) => r.category === category))),
      ),
    })),
    cases: libraries.map((lib) => ({ library: lib.id, results: rows[lib.id] })),
  };
  return report;
};
