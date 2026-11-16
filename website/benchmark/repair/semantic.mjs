const skipped =
  'button:not([data-streamdown="link"]),style,script,[hidden],.sr-only,.visually-hidden,.code-block-header,[data-streamdown="code-block-header"],[data-streamdown="image-fallback"]';
const blockTags = new Set([
  'blockquote',
  'ul',
  'ol',
  'li',
  'table',
  'tr',
  'th',
  'td',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
]);
const inlineTags = new Set(['strong', 'em', 'del', 'a', 'img']);
const treeTags = new Set([...blockTags, ...inlineTags, 'pre', 'code', 'input', 'hr']);
const normalize = (value) => {
  return value.replace(/\s/gu, '');
};

export function inputOffsets(source) {
  let offset = 0;

  return Array.from(source, (point) => (offset += point.length));
}

export function delivered(test, offset) {
  const units = [];
  let start = 0;

  for (const segment of test.segments) {
    const end = start + segment.raw.length;
    const arrived = Math.max(0, Math.min(segment.raw.length, offset - start));

    if (segment.kind === 'encoded') {
      if (offset >= end)
        Array.from(segment.text).forEach((char, index) => {
          if (!/\s/u.test(char))
            units.push({
              id: `${end}:e${index}`,
              char,
              deliveredAt: end,
              autolink: false,
            });
        });
    } else if (segment.kind === 'content') {
      let local = 0;

      for (const char of Array.from(segment.raw.slice(0, arrived))) {
        local += char.length;
        if (!/\s/u.test(char))
          units.push({
            id: String(start + local),
            char,
            deliveredAt: start + local,
            autolink: Boolean(segment.autolink),
          });
      }
    }

    start = end;
  }

  return { units, text: units.map((unit) => unit.char).join('') };
}

function compact(values) {
  return values.reduce((result, value) => {
    if (typeof value === 'string' && typeof result.at(-1) === 'string')
      result[result.length - 1] += value;
    else result.push(value);

    return result;
  }, []);
}

function canonicalUrl(value) {
  if (!value) return '';

  try {
    return new URL(value, 'https://benchmark.invalid/').href;
  } catch {
    return value;
  }
}

export function semanticSnapshot(container, options = {}) {
  const units = [];
  const view = container.ownerDocument.defaultView;

  function visit(node, blocks = [], inline = [], code = '') {
    if (node.nodeType === 3) {
      const text = normalize(node.textContent || '');
      const role = [...blocks, ...new Set(inline).values()].concat(code ? [code] : []);

      for (const char of Array.from(text)) units.push({ char, role: role.join('/') || 'plain' });

      return text ? [text] : [];
    }

    if (node.nodeType !== 1 || node.matches(skipped)) return [];

    if (options.computedVisibility !== false && view) {
      const style = view.getComputedStyle(node);

      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.visibility === 'collapse' ||
        style.opacity === '0'
      )
        return [];
    }

    if (node.matches('[role="checkbox"],.checkbox-node[role="img"]')) {
      return [
        {
          tag: 'input',
          type: 'checkbox',
          checked:
            node.getAttribute('aria-checked') === 'true' ||
            node.getAttribute('aria-label') === 'checked',
          children: [],
        },
      ];
    }

    if (node.matches('svg,[aria-hidden="true"]')) return [];

    let tag = node.tagName.toLowerCase();

    if (node.getAttribute('data-streamdown') === 'strong') tag = 'strong';
    if (node.getAttribute('data-streamdown') === 'link') tag = 'a';
    if (tag === 'b') tag = 'strong';
    if (tag === 'i') tag = 'em';
    if (tag === 's' || tag === 'strike') tag = 'del';

    const nextBlocks = blockTags.has(tag) ? [...blocks, tag] : blocks;
    const nextInline = inlineTags.has(tag) ? [...inline, tag].toSorted() : inline;
    const nextCode = tag === 'pre' ? 'code-block' : tag === 'code' ? code || 'code-inline' : code;

    if (tag === 'img') {
      const alt = node.getAttribute('alt') || '';
      const role = [...nextBlocks, ...nextInline].join('/');

      for (const char of Array.from(normalize(alt))) units.push({ char, role });

      return [{ tag, src: canonicalUrl(node.getAttribute('src')), alt }];
    }

    const children = compact(
      Array.from(node.childNodes).flatMap((child) =>
        visit(child, nextBlocks, nextInline, nextCode),
      ),
    );

    if (!treeTags.has(tag)) return children;

    const attrs =
      tag === 'a'
        ? { href: canonicalUrl(node.getAttribute('href')) }
        : tag === 'input'
          ? { type: node.getAttribute('type'), checked: Boolean(node.checked) }
          : tag === 'ol'
            ? { start: Number(node.getAttribute('start') || 1) }
            : {};

    return [{ tag, ...attrs, children }];
  }

  const tree = compact(Array.from(container.childNodes).flatMap((node) => visit(node)));

  return {
    units,
    text: units.map((item) => item.char).join(''),
    tree,
  };
}

export function align(expected, actual) {
  if (expected.map((item) => item.char).join('') === actual.map((item) => item.char).join('')) {
    return { matches: expected.map((_, index) => [index, index]), extra: [] };
  }

  const rows = Array.from(
    { length: expected.length + 1 },
    () => new Uint16Array(actual.length + 1),
  );

  for (let left = expected.length - 1; left >= 0; left -= 1) {
    for (let right = actual.length - 1; right >= 0; right -= 1) {
      rows[left][right] =
        expected[left].char === actual[right].char
          ? rows[left + 1][right + 1] + 1
          : Math.max(rows[left + 1][right], rows[left][right + 1]);
    }
  }

  const matches = [];
  const extra = [];
  let left = 0;
  let right = 0;

  while (right < actual.length) {
    if (left < expected.length && expected[left].char === actual[right].char) {
      matches.push([left++, right++]);
    } else if (left < expected.length && rows[left + 1][right] > rows[left][right + 1]) left += 1;
    else extra.push(right++);
  }

  return { matches, extra };
}

function withoutLink(role) {
  return (
    role
      .split('/')
      .filter((part) => part !== 'a')
      .join('/') || 'plain'
  );
}

function allowedRecognition(unit, before, after, history) {
  return (
    unit.autolink &&
    after.split('/').includes('a') &&
    !history.some((role) => role.split('/').includes('a')) &&
    before === withoutLink(after)
  );
}

function firstAcceptable(unit, actual, expected) {
  return actual === expected || (unit.autolink && actual === withoutLink(expected));
}

export function syntaxUnits(test, offset) {
  const units = [];
  let start = 0;

  for (const [index, segment] of test.segments.entries()) {
    const arrived = Math.max(0, Math.min(segment.raw.length, offset - start));
    const adjacent = [test.segments[index - 1], test.segments[index + 1]].filter(Boolean);
    const allowedAutolinkDelimiter =
      adjacent.some((part) => part.autolink) && /^[<>]$/u.test(segment.raw.trim());
    let local = 0;

    if (segment.kind !== 'content' && !allowedAutolinkDelimiter) {
      for (const char of Array.from(segment.raw.slice(0, arrived))) {
        local += char.length;
        if (!/\s/u.test(char))
          units.push({
            id: `s:${start + local}`,
            char,
            start: start + local - char.length,
            end: start + local,
          });
      }
    }

    start += segment.raw.length;
  }

  return units;
}

export function visibleSyntax(test, frame, bodyAlignment) {
  const grammar = syntaxUnits(test, frame.offset);
  const points = [
    [-1, 0],
    ...bodyAlignment.matches.map(([left, right]) => [
      right,
      frame.expected.units[left].deliveredAt,
    ]),
    [frame.snapshot.units.length, frame.offset + 1],
  ];
  const visible = new Map();

  for (let index = 0; index < points.length - 1; index += 1) {
    const [leftActual, leftSource] = points[index];
    const [rightActual, rightSource] = points[index + 1];
    const candidates = grammar.filter((unit) => unit.start >= leftSource && unit.end < rightSource);
    const actual = frame.snapshot.units.slice(leftActual + 1, rightActual);
    const alignment = align(candidates, actual);

    for (const [sourceIndex, actualIndex] of alignment.matches) {
      const unit = candidates[sourceIndex];

      visible.set(unit.id, { ...unit, role: actual[actualIndex].role });
    }
  }

  return visible;
}

export function scoreTrajectory(test, frames, oracle) {
  const implicitWholeSourceLink =
    test.segments?.length === 1 &&
    test.segments[0].kind === 'content' &&
    /^(?:[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+|(?:https?:\/\/|www\.)\S+)$/u.test(test.source);
  const history = new Map();
  const events = [];
  let previous = new Map();
  let previousSyntax = new Map();
  const seenSyntax = new Set();
  let syntaxChanges = 0;
  let exposedTransitions = 0;
  let missingArea = 0;
  let deliveredArea = 0;
  let firstWrongChars = 0;

  for (const [frameIndex, frame] of frames.entries()) {
    const bodyAlignment = align(frame.expected.units, frame.snapshot.units);
    const { matches } = bodyAlignment;
    const currentSyntax = visibleSyntax(test, frame, bodyAlignment);
    const present = new Map(
      matches.map(([left, right]) => [
        frame.expected.units[left].id,
        frame.snapshot.units[right].role,
      ]),
    );
    const groups = new Map();
    let changed = 0;
    let firstWrong = 0;

    for (const originalUnit of frame.expected.units) {
      const unit = implicitWholeSourceLink ? { ...originalUnit, autolink: true } : originalUnit;
      const role = present.get(unit.id);
      const prior = previous.get(unit.id);
      const seen = history.get(unit.id) || [];
      const expected = oracle?.roles[unit.id] || 'plain';
      let type = '';

      if (role && !seen.length) {
        if (oracle && !firstAcceptable(unit, role, expected)) {
          type = 'wrong-first-role';
          firstWrong += 1;
        }
      } else if (prior && !role) type = 'disappearance';
      else if (!prior && role && seen.length) type = 'reappearance';
      else if (prior && role && prior !== role) {
        if (!allowedRecognition(unit, prior, role, seen)) {
          type = seen.includes(role) ? 'role-reversal' : 'role-change';
        }
      }

      if (type) {
        const key = [type, prior || 'unseen', role || 'hidden', expected].join('|');
        const event = groups.get(key) || {
          type,
          before: prior || 'unseen',
          after: role || 'hidden',
          expected,
          ids: [],
          text: '',
        };

        event.ids.push(unit.id);
        event.text += unit.char;
        groups.set(key, event);

        if (type !== 'wrong-first-role') changed += 1;
      }

      if (role && seen.at(-1) !== role) history.set(unit.id, [...seen, role]);
    }

    let syntaxChanged = 0;

    for (const id of new Set([...previousSyntax.keys(), ...currentSyntax.keys()])) {
      const prior = previousSyntax.get(id);
      const current = currentSyntax.get(id);
      const unit = current || prior;
      const type =
        prior && !current
          ? 'syntax-consumed'
          : prior && current && prior.role !== current.role
            ? 'syntax-role-change'
            : !prior && current && seenSyntax.has(id)
              ? 'syntax-reappearance'
              : '';

      if (current) seenSyntax.add(id);
      if (!type) continue;

      const key = [type, prior?.role || 'hidden', current?.role || 'hidden'].join('|');
      const event = groups.get(key) || {
        type,
        before: prior?.role || 'hidden',
        after: current?.role || 'hidden',
        expected: 'syntax-hidden',
        ids: [],
        text: '',
      };

      event.ids.push(id);
      event.text += unit.char;
      groups.set(key, event);
      syntaxChanged += 1;
    }

    const missing = frame.expected.units.length - matches.length;

    if (!frame.done) {
      missingArea += missing;
      deliveredArea += frame.expected.units.length;
      firstWrongChars += firstWrong;
      syntaxChanges += syntaxChanged;
      if (changed || syntaxChanged) exposedTransitions += 1;
    }

    for (const event of groups.values())
      events.push({
        ...event,
        frameIndex,
        offset: frame.offset,
        done: frame.done,
        affected: event.ids.length,
      });

    previous = present;
    previousSyntax = currentSyntax;
  }

  const terminal = frames.at(-1);
  const terminalAlignment = align(terminal.expected.units, terminal.snapshot.units);
  const streamingEvents = events.filter(
    (event) => !event.done && event.type !== 'wrong-first-role',
  );

  return {
    events,
    summary: {
      hadJump: streamingEvents.length > 0,
      events: streamingEvents.length,
      bodyEvents: streamingEvents.filter((event) => !event.type.startsWith('syntax-')).length,
      syntaxEvents: streamingEvents.filter((event) => event.type.startsWith('syntax-')).length,
      syntaxChanges,
      transitionFrames: exposedTransitions,
      firstWrongChars,
      missingArea,
      deliveredArea,
      inputChars: Array.from(test.source).length,
      completionEvents: events.filter((event) => event.done).length,
      finalTextCorrect:
        terminalAlignment.matches.length === terminal.expected.units.length &&
        terminalAlignment.extra.length === 0,
      finalStructureCorrect: oracle
        ? equivalentTree(terminal.snapshot.tree, oracle.tree)
        : undefined,
    },
  };
}

export function canonicalTree(nodes, marks = []) {
  const result = [];
  const inline = new Set(['strong', 'em', 'del', 'a']);

  function append(value) {
    const last = result.at(-1);

    if (
      value.text !== undefined &&
      last?.text !== undefined &&
      JSON.stringify(last.marks) === JSON.stringify(value.marks)
    )
      last.text += value.text;
    else result.push(value);
  }

  for (const node of nodes) {
    if (typeof node === 'string') {
      append({ text: node, marks });
      continue;
    }

    const { children, ...attrs } = node;

    if (inline.has(node.tag)) {
      const nextMarks = [...marks, attrs].toSorted((left, right) =>
        JSON.stringify(left).localeCompare(JSON.stringify(right)),
      );

      for (const child of canonicalTree(children || [], nextMarks)) append(child);
    } else {
      append({
        ...attrs,
        ...(marks.length && !children ? { marks } : {}),
        ...(children ? { children: canonicalTree(children, marks) } : {}),
      });
    }
  }

  return result;
}

export function equivalentTree(left, right) {
  return JSON.stringify(canonicalTree(left)) === JSON.stringify(canonicalTree(right));
}
