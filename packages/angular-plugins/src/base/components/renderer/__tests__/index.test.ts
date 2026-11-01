import type { AngularRenderNode, ParagraphProps } from '@fluxdown/angular-plugins/typings';

import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { RenderRange } from '..';

import { AngularDomRenderer } from '..';
import { RenderContext } from '../../../context';
import { createElement, createTemplateNode } from '../../../render/create';
import { BaseSlotPlugin, createTypeOfSlot } from '../../../slot';
import { RenderOutlet } from '../../render-outlet';

let destroyed = 0;

@Component({
  selector: 'p[test-paragraph]',
  standalone: true,
  template: '<ng-content />',
  host: { class: 'paragraph' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ParagraphRenderer {
  readonly props = input.required<ParagraphProps>();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      destroyed += 1;
    });
  }
}

class ParagraphSlotPlugin extends BaseSlotPlugin<'Paragraph'> {
  readonly type = 'Paragraph';

  readonly Component = ParagraphRenderer;

  readonly tagName = 'p';
}

@Component({
  selector: 'test-slot-wrapper',
  standalone: true,
  imports: [RenderOutlet],
  template: '<ng-container [fluxdownRender]="props().Raw?.(props())" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ParagraphWrapper {
  readonly props = input.required<ParagraphProps>();
}

class ParagraphWrapperPlugin extends BaseSlotPlugin<'Paragraph'> {
  readonly type = 'Paragraph';

  readonly Component = ParagraphWrapper;

  readonly tagName = 'section';
}

@Component({
  selector: 'test-render-template',
  standalone: true,
  imports: [RenderOutlet],
  template: '<ng-template #block let-value><ng-container [fluxdownRender]="value" /></ng-template>',
})
class TemplateHost {
  readonly block = viewChild.required<TemplateRef<{ $implicit: AngularRenderNode }>>('block');
}

@Component({
  selector: 'test-failing-template',
  template: '<ng-template #block><span>{{ fail() }}</span></ng-template>',
})
class FailingTemplateHost {
  readonly block = viewChild.required<TemplateRef<object>>('block');

  fail(): never {
    throw new Error('Template rendering failed.');
  }
}

const Paragraph = /*#__PURE__*/ createTypeOfSlot('Paragraph');

const createParagraph = (children: string, className?: string) => {
  return Paragraph({
    current: { type: 'element', tagName: 'p', properties: {}, children: [] },
    parents: [],
    render: () => null,
    children,
    class: className,
  });
};

describe('AngularDomRenderer', () => {
  let host: HTMLElement;

  let range: RenderRange;

  let renderer: AngularDomRenderer;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RenderContext, AngularDomRenderer] });

    host = document.createElement('main');

    document.body.append(host);

    renderer = TestBed.inject(AngularDomRenderer);

    range = renderer.createRange(host);

    destroyed = 0;
  });

  afterEach(() => {
    range.destroy();

    host.remove();

    TestBed.resetTestingModule();
  });

  it('updates and reorders keyed elements without replacing their DOM', () => {
    range.update([
      createElement('p', { key: 'first' }, 'First'),
      createElement('p', { key: 'second' }, 'Second'),
    ]);

    const first = host.querySelector('p');

    const second = host.querySelectorAll('p')[1];

    range.update([
      createElement('p', { key: 'second' }, 'Second updated'),
      createElement('p', { key: 'first' }, 'First updated'),
    ]);

    expect(host.querySelectorAll('p')[0]).toBe(second);

    expect(host.querySelectorAll('p')[1]).toBe(first);

    expect(host.textContent).toBe('Second updatedFirst updated');
  });

  it('projects live children into a semantic Angular host and disposes the component', () => {
    TestBed.inject(RenderContext).slots.set({ Paragraph: [new ParagraphSlotPlugin()] });

    range.update(createParagraph('First', 'custom'));

    const paragraph = host.querySelector('p');

    expect(paragraph?.className).toBe('paragraph custom');

    range.update(createParagraph('Second', 'updated'));

    expect(host.querySelector('p')).toBe(paragraph);

    expect(paragraph?.textContent).toBe('Second');

    expect(paragraph?.className).toBe('paragraph updated');

    expect(destroyed).toBe(0);

    range.update(null);

    expect(destroyed).toBe(1);

    expect(host.querySelector('p')).toBeNull();
  });

  it('composes custom Angular slots through Raw without runtime component factories', () => {
    TestBed.inject(RenderContext).slots.set({
      Paragraph: [new ParagraphSlotPlugin(), new ParagraphWrapperPlugin()],
    });

    range.update(createParagraph('First'));

    const paragraph = host.querySelector('section > p');

    expect(paragraph?.textContent).toBe('First');

    range.update(createParagraph('Second'));

    expect(host.querySelector('section > p')).toBe(paragraph);

    expect(paragraph?.textContent).toBe('Second');
  });

  it('moves and updates all nodes produced inside a reused embedded template', () => {
    const fixture = TestBed.createComponent(TemplateHost);

    fixture.detectChanges();

    const template = fixture.componentInstance.block();

    const item = (key: string, text: string) => {
      return createTemplateNode(template, { $implicit: createElement('p', {}, text) }, key);
    };

    range.update([item('first', 'First'), item('second', 'Second')]);

    const first = host.querySelector('p');

    const second = host.querySelectorAll('p')[1];

    range.update([item('second', 'Second updated'), item('first', 'First updated')]);

    expect(host.querySelectorAll('p')[0]).toBe(second);

    expect(host.querySelectorAll('p')[1]).toBe(first);

    expect(host.textContent).toBe('Second updatedFirst updated');

    range.update([]);

    expect(host.querySelector('p')).toBeNull();

    fixture.destroy();
  });

  it('detaches a failed embedded view and removes its partial DOM', () => {
    const fixture = TestBed.createComponent(FailingTemplateHost);

    fixture.detectChanges();

    const application = TestBed.inject(ApplicationRef);

    const views = application.viewCount;

    expect(() => range.update(createTemplateNode(fixture.componentInstance.block(), {}))).toThrow(
      'Template rendering failed.',
    );

    expect(application.viewCount).toBe(views);

    expect(host.children).toHaveLength(0);

    expect(host.childNodes).toHaveLength(2);

    fixture.destroy();
  });

  it('removes old event handlers and styles when an element changes', () => {
    let clicks = 0;

    range.update(
      createElement(
        'button',
        {
          style: { color: 'red', marginTop: 4 },
          onClick: () => {
            clicks += 1;
          },
        },
        'Click',
      ),
    );

    const button = host.querySelector('button')!;

    button.click();

    expect(clicks).toBe(1);

    expect(button.style.marginTop).toBe('4px');

    range.update(createElement('button', { style: { color: 'blue' } }, 'Click'));

    button.click();

    expect(clicks).toBe(1);

    expect(button.style.marginTop).toBe('');

    expect(button.style.color).toBe('blue');
  });

  it('retains checkbox properties and explicit accessibility values', () => {
    range.update(
      createElement('input', {
        type: 'checkbox',
        disabled: true,
        checked: true,
        'aria-hidden': false,
      }),
    );

    const checkbox = host.querySelector('input')!;

    expect(checkbox.type).toBe('checkbox');

    expect(checkbox.checked).toBe(true);

    expect(checkbox.disabled).toBe(true);

    expect(checkbox.getAttribute('aria-hidden')).toBe('false');
  });

  it('replaces a slot implementation when its registered plugins change', () => {
    const context = TestBed.inject(RenderContext);

    context.slots.set({ Paragraph: [new ParagraphSlotPlugin()] });

    const paragraph = createParagraph('Content');

    range.update(paragraph);

    expect(host.querySelector('section')).toBeNull();

    context.slots.set({
      Paragraph: [new ParagraphSlotPlugin(), new ParagraphWrapperPlugin()],
    });

    range.update(paragraph);

    expect(host.querySelector('section > p')?.textContent).toBe('Content');

    expect(destroyed).toBe(1);
  });

  it('creates SVG descendants in their namespace and restores HTML inside foreignObject', () => {
    range.update(
      createElement('svg', { viewBox: '0 0 24 24' }, [
        createElement('path', { d: 'M0 0L24 24' }),
        createElement('foreignObject', {}, createElement('div', {}, 'HTML')),
      ]),
    );

    expect(host.querySelector('svg')?.namespaceURI).toBe('http://www.w3.org/2000/svg');

    expect(host.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 24 24');

    expect(host.querySelector('path')?.namespaceURI).toBe('http://www.w3.org/2000/svg');

    expect(host.querySelector('div')?.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
  });

  it('can return from trusted inner HTML to reconciled children', () => {
    range.update(createElement('div', { innerHTML: '<b>First</b>' }));

    const element = host.querySelector('div');

    expect(element?.textContent).toBe('First');

    range.update(createElement('div', {}, createElement('em', {}, 'Second')));

    expect(host.querySelector('div')).toBe(element);

    expect(element?.querySelector('em')?.textContent).toBe('Second');
  });
});
