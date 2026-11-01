import type {
  AngularComponentNode,
  AngularRenderNode,
  AngularTemplateNode,
} from '@fluxdown/angular-plugins/typings';

import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
  reflectComponentType,
  RendererFactory2,
  RendererStyleFlags2,
} from '@angular/core';

import type { RenderRange, RenderRecord } from './type';

import { RenderContext } from '../../context';
import {
  composeSlot,
  flattenNodes,
  getHostProps,
  getStyleValue,
  isSameNode,
  resolveSlot,
} from './utils';

export type { RenderRange } from './type';

@Injectable()
export class AngularDomRenderer {
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);

  private readonly application = inject(ApplicationRef);

  private readonly environment = inject(EnvironmentInjector);

  private readonly injector = inject(Injector);

  private readonly context = inject(RenderContext);

  createRange(parent: Node, before: Node | null = null): RenderRange {
    const start: Comment = this.renderer.createComment('');

    const end: Comment = this.renderer.createComment('');

    this.renderer.insertBefore(parent, start, before);

    this.renderer.insertBefore(parent, end, before);

    let records: RenderRecord[] = [];

    return {
      update: (value) => {
        const container = start.parentNode;

        if (!container) {
          return;
        }

        const previous = new Map(records.map((record) => [record.key, record]));

        const next: RenderRecord[] = [];

        let preceding = 'start';

        for (const [index, input] of flattenNodes(value).entries()) {
          const key =
            typeof input === 'object' ? String(input.key ?? `node:${index}`) : `text:${preceding}`;

          const source =
            typeof input === 'object' && input.kind === 'slot'
              ? resolveSlot(input, this.context.slots())
              : input;

          preceding = key;

          if (source === null || source === undefined || typeof source === 'boolean') {
            continue;
          }

          let record = previous.get(key);

          if (record && !isSameNode(record.source, source)) {
            this.destroyRecord(record);

            previous.delete(key);

            record = undefined;
          }

          try {
            if (record) {
              this.updateRecord(record, source);
            } else {
              record = this.createRecord(container, end, source, key);
            }
          } catch (error) {
            if (record) {
              this.destroyRecord(record);
            }

            record = this.createFallback(container, end, input, key, error);
          }

          previous.delete(key);

          if (record) {
            next.push(record);
          }
        }

        for (const record of previous.values()) {
          this.destroyRecord(record);
        }

        let cursor = start.nextSibling;

        for (const record of next) {
          if (record.first !== cursor) {
            this.moveRecord(container, record, cursor ?? end);
          }

          cursor = record.last.nextSibling;
        }

        records = next;
      },
      destroy: () => {
        for (const record of records) {
          this.destroyRecord(record);
        }

        records = [];

        this.remove(start);

        this.remove(end);
      },
    };
  }

  private createRecord(
    parent: Node,
    before: Node,
    source: AngularRenderNode,
    key: string,
  ): RenderRecord {
    if (typeof source === 'string' || typeof source === 'number') {
      const text: Text = this.renderer.createText(String(source));

      this.renderer.insertBefore(parent, text, before);

      return { key, source, first: text, last: text, props: {}, listeners: new Map() };
    }

    if (!source || typeof source !== 'object' || Array.isArray(source) || source.kind === 'slot') {
      throw new Error('Invalid Angular render node.');
    }

    if (source.kind === 'template') {
      return this.createTemplate(parent, before, source, key);
    }

    const tagName = source.tagName ?? 'span';

    const container = parent as Element;

    const namespace =
      tagName === 'svg' ||
      (container.namespaceURI === 'http://www.w3.org/2000/svg' &&
        container.localName !== 'foreignObject')
        ? 'svg'
        : undefined;

    const element: HTMLElement = this.renderer.createElement(tagName, namespace);

    this.renderer.insertBefore(parent, element, before);

    const record: RenderRecord = {
      key,
      source,
      first: element,
      last: element,
      props: {},
      listeners: new Map(),
    };

    try {
      if (source.kind === 'component') {
        this.createComponent(record, source);
      } else {
        record.children = this.createRange(element);

        this.updateRecord(record, source);
      }
    } catch (error) {
      this.destroyRecord(record);

      throw error;
    }

    return record;
  }

  private createComponent(record: RenderRecord, source: AngularComponentNode) {
    const host = record.first as HTMLElement;

    const hasProjection = !!reflectComponentType(source.Component)?.ngContentSelectors.length;

    if (hasProjection) {
      record.children = this.createRange(host);
    }

    const projectableNodes = hasProjection ? [Array.from(host.childNodes)] : undefined;

    const component = createComponent(source.Component, {
      environmentInjector: this.environment,
      elementInjector: this.injector,
      hostElement: host,
      projectableNodes,
    });

    record.component = component;

    this.application.attachView(component.hostView);

    component.setInput('props', source.props);

    component.changeDetectorRef.detectChanges();

    record.children?.update(source.children);

    this.updateProps(record, getHostProps(source.props, host.tagName), true);
  }

  private createTemplate(
    parent: Node,
    before: Node,
    source: AngularTemplateNode,
    key: string,
  ): RenderRecord {
    const first: Comment = this.renderer.createComment('');

    const last: Comment = this.renderer.createComment('');

    const template = source.Template.createEmbeddedView(source.context, this.injector);

    this.renderer.insertBefore(parent, first, before);

    for (const node of template.rootNodes) {
      this.renderer.insertBefore(parent, node, before);
    }

    this.renderer.insertBefore(parent, last, before);

    const record: RenderRecord = {
      key,
      source,
      first,
      last,
      template,
      props: {},
      listeners: new Map(),
    };

    try {
      this.application.attachView(template);

      template.detectChanges();

      return record;
    } catch (error) {
      this.destroyRecord(record);

      throw error;
    }
  }

  private createFallback(
    parent: Node,
    before: Node,
    input: AngularRenderNode,
    key: string,
    error: unknown,
  ) {
    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input) ||
      input.kind !== 'slot' ||
      input.type === 'Fallback'
    ) {
      throw error;
    }

    const fallback = composeSlot(
      'Fallback',
      {
        type: input.type,
        props: input.props,
        error,
      },
      this.context.slots(),
    );

    if (!fallback) {
      throw error;
    }

    return this.createRecord(parent, before, fallback, key);
  }

  private updateRecord(record: RenderRecord, source: AngularRenderNode) {
    record.source = source;

    if (typeof source === 'string' || typeof source === 'number') {
      if (record.first.nodeValue !== String(source)) {
        this.renderer.setValue(record.first, String(source));
      }

      return;
    }

    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      return;
    }

    if (source.kind === 'component' && record.component) {
      record.component.setInput('props', source.props);

      record.component.changeDetectorRef.detectChanges();

      record.children?.update(source.children);

      this.updateProps(
        record,
        getHostProps(source.props, (record.first as HTMLElement).tagName),
        true,
      );

      return;
    }

    if (source.kind === 'template' && record.template) {
      const context = record.template.context as Record<string, unknown>;

      for (const name of Object.keys(context)) {
        if (!(name in source.context)) {
          delete context[name];
        }
      }

      Object.assign(context, source.context);

      record.template.detectChanges();

      return;
    }

    if (source.kind === 'element') {
      const hasContent = 'innerHTML' in source.props || 'textContent' in source.props;

      if (hasContent && record.children) {
        record.children.destroy();

        record.children = undefined;
      }

      this.updateProps(record, source.props);

      if (!hasContent) {
        record.children ??= this.createRange(record.first);

        record.children.update(source.children);
      }
    }
  }

  private updateProps(record: RenderRecord, props: Record<string, unknown>, host = false) {
    const element = record.first as HTMLElement;

    const names = Object.keys({ ...record.props, ...props });

    for (const name of names) {
      const previous = record.props[name];

      const value = props[name];

      if (Object.is(previous, value)) {
        continue;
      }

      if (
        name.startsWith('on') &&
        (typeof value === 'function' || typeof previous === 'function')
      ) {
        record.listeners.get(name)?.();

        record.listeners.delete(name);

        if (typeof value === 'function') {
          record.listeners.set(
            name,
            this.renderer.listen(element, name.slice(2).toLowerCase(), (event) => value(event)),
          );
        }

        continue;
      }

      if (host && (name === 'class' || name === 'className')) {
        const previousClasses = String(previous ?? '')
          .split(/\s+/)
          .filter(Boolean);

        const classes = String(value ?? '')
          .split(/\s+/)
          .filter(Boolean);

        for (const className of previousClasses) {
          if (!classes.includes(className)) {
            this.renderer.removeClass(element, className);
          }
        }

        for (const className of classes) {
          this.renderer.addClass(element, className);
        }

        continue;
      }

      if (name === 'style') {
        this.updateStyles(element, previous, value);

        continue;
      }

      if (
        name === 'innerHTML' ||
        name === 'textContent' ||
        name === 'value' ||
        name === 'checked'
      ) {
        this.renderer.setProperty(element, name, value ?? '');

        continue;
      }

      const attribute = name === 'className' ? 'class' : name;

      if (
        (attribute.startsWith('aria-') || attribute.startsWith('data-')) &&
        typeof value === 'boolean'
      ) {
        this.renderer.setAttribute(element, attribute, String(value));

        continue;
      }

      if (value === null || value === undefined || value === false) {
        this.renderer.removeAttribute(element, attribute);
      } else {
        this.renderer.setAttribute(element, attribute, value === true ? '' : String(value));
      }
    }

    record.props = props;
  }

  private updateStyles(element: HTMLElement, previous: unknown, value: unknown) {
    const oldStyles =
      previous && typeof previous === 'object' ? (previous as Record<string, unknown>) : {};

    const styles = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

    for (const name of Object.keys({ ...oldStyles, ...styles })) {
      if (Object.is(oldStyles[name], styles[name])) {
        continue;
      }

      const flags = name.includes('-') ? RendererStyleFlags2.DashCase : undefined;

      if (styles[name] === null || styles[name] === undefined) {
        this.renderer.removeStyle(element, name, flags);
      } else {
        this.renderer.setStyle(element, name, getStyleValue(name, styles[name]), flags);
      }
    }
  }

  private moveRecord(parent: Node, record: RenderRecord, before: Node) {
    let node: Node | null = record.first;

    while (node) {
      const next: Node | null = node.nextSibling;

      this.renderer.insertBefore(parent, node, before, true);

      if (node === record.last) {
        break;
      }

      node = next;
    }
  }

  private destroyRecord(record: RenderRecord) {
    record.children?.destroy();

    for (const unsubscribe of record.listeners.values()) {
      unsubscribe();
    }

    if (record.component) {
      this.application.detachView(record.component.hostView);

      record.component.destroy();
    }

    if (record.template) {
      this.application.detachView(record.template);

      record.template.destroy();
    }

    let node: Node | null = record.first;

    while (node) {
      const next: Node | null = node.nextSibling;

      this.remove(node);

      if (node === record.last) {
        break;
      }

      node = next;
    }
  }

  private remove(node: Node) {
    if (node.parentNode) {
      this.renderer.removeChild(node.parentNode, node);
    }
  }
}
