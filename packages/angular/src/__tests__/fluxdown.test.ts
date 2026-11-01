import type { ComponentFixture } from '@angular/core/testing';
import type { ParagraphProps } from '@fluxdown/angular-plugins/typings';

import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  BaseSlotPlugin,
  createElement,
  PREFIX,
  RenderOutlet,
} from '@fluxdown/angular-plugins/base';
import {
  ParagraphPlugin,
  ParagraphRenderPlugin,
  ParagraphSlotPlugin,
} from '@fluxdown/angular-plugins/plugins/paragraph';

import { FluxdownLite } from '../packs/lite';
import { FluxdownRaw } from '../packs/raw';

@Component({
  selector: 'test-paragraph',
  imports: [RenderOutlet],
  template: `<section data-custom="paragraph">
    <ng-container [fluxdownRender]="render()" />
  </section>`,
})
class CustomParagraph {
  readonly props = input.required<ParagraphProps>();

  render() {
    const { Raw, ...props } = this.props();

    return Raw ? Raw(props) : props.children;
  }
}

class ExtendedParagraph extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'test-paragraph';

  readonly type = 'Paragraph';

  readonly Component = CustomParagraph;
}

const mount = async (text: string, props: Record<string, unknown> = {}) => {
  const fixture = TestBed.createComponent(FluxdownLite);

  fixture.componentRef.setInput('text', text);

  for (const [key, value] of Object.entries(props)) {
    fixture.componentRef.setInput(key, value);
  }

  fixture.detectChanges();

  await fixture.whenStable();

  return fixture;
};

const update = async (fixture: ComponentFixture<FluxdownLite>, name: string, value: unknown) => {
  fixture.componentRef.setInput(name, value);

  fixture.detectChanges();

  await fixture.whenStable();
};

describe('Fluxdown components', () => {
  test('renders common Markdown with preset slots', async () => {
    const fixture = await mount(
      '# Heading\n\nA **strong** and *emphasized* [link](https://example.com) with `code`.\n\n> quote\n\n1. first\n2. second\n\n---\n\n```ts\nconst answer = 42;\n```\n\n| A | B |\n| - | - |\n| 1 | 2 |',
    );

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toBe('Heading');

    expect(root.querySelector('strong')?.textContent).toBe('strong');

    expect(root.querySelector('em')?.textContent).toBe('emphasized');

    expect(root.querySelector('a')?.getAttribute('href')).toBe('https://example.com');

    expect(root.querySelectorAll('ol li')).toHaveLength(2);

    expect(root.querySelector('blockquote')?.textContent?.trim()).toBe('quote');

    expect(root.querySelector('pre code')?.textContent).toBe('const answer = 42;');

    expect(root.querySelectorAll('table tbody td')).toHaveLength(2);
  });

  test('updates source without replacing completed blocks', async () => {
    const fixture = await mount('first\n\nsecond');

    const first = fixture.nativeElement.querySelector('p');

    await update(fixture, 'text', 'first\n\nsecond appended');

    expect(fixture.nativeElement.querySelector('p')).toBe(first);

    expect(fixture.nativeElement.textContent).toBe('firstsecond appended');

    await update(fixture, 'text', '');

    expect(fixture.nativeElement.textContent).toBe('');
  });

  test('raw uses only explicitly configured renderers and slots', async () => {
    const fixture = TestBed.createComponent(FluxdownRaw);

    fixture.componentRef.setInput('text', 'content');

    fixture.componentRef.setInput('plugins', []);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('');

    fixture.componentRef.setInput('plugins', ParagraphPlugin);

    fixture.detectChanges();

    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('p')?.textContent).toBe('');
  });

  test('extends slot components and updates disabled presets', async () => {
    const fixture = await mount('content', { plugins: { slots: [ExtendedParagraph] } });

    expect(fixture.nativeElement.querySelector('[data-custom="paragraph"] p')?.textContent).toBe(
      'content',
    );

    await update(fixture, 'plugins', {
      slots: [[ParagraphSlotPlugin, { disabled: true }], ExtendedParagraph],
    });

    expect(fixture.nativeElement.querySelector('p')).toBeNull();

    expect(fixture.nativeElement.querySelector('section')?.textContent).toBe('content');

    await update(fixture, 'plugins', { renders: [[ParagraphRenderPlugin, { disabled: true }]] });

    expect(fixture.nativeElement.querySelector('p')?.className).toBe('');
  });

  test('updates theme tokens without replacing content', async () => {
    const fixture = await mount('# Theme');

    const heading = fixture.nativeElement.querySelector('h1');

    const root = fixture.nativeElement.querySelector('fluxdown-raw') as HTMLElement;

    expect(root.style.getPropertyValue(`--${PREFIX}-colors-bg`)).toBe('#ffffff');

    await update(fixture, 'theme', ['dark', { tokens: { colors: { accent: 'hotpink' } } }]);

    expect(fixture.nativeElement.querySelector('h1')).toBe(heading);

    expect(root.style.getPropertyValue(`--${PREFIX}-colors-accent`)).toBe('hotpink');
  });

  test('renders point and range patches and updates callbacks', async () => {
    const fixture = await mount('Hello world', {
      patches: [
        { key: 'point', range: 5, render: () => createElement('i', {}, '|') },
        {
          key: 'word',
          range: [6, 11],
          render: (text: string) => createElement('mark', {}, `first:${text}`),
        },
      ],
    });

    expect(fixture.nativeElement.textContent).toBe('Hello| first:world');

    await update(fixture, 'patches', [
      {
        key: 'word',
        range: [6, 11],
        render: (text: string) => createElement('mark', {}, `second:${text}`),
      },
    ]);

    expect(fixture.nativeElement.querySelector('mark')?.textContent).toBe('second:world');
  });

  test('exposes the readable Core and releases subscriptions on destroy', async () => {
    const fixture = await mount('content');

    const value = fixture.componentInstance.value;

    expect(value?.value.length).toBeGreaterThan(0);

    fixture.destroy();

    expect(value?.closed).toBe(true);
  });
});
