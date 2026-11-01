import type { ApplicationRef, ComponentRef } from '@angular/core';

import { createComponent } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { Fluxdown } from '@fluxdown/angular';
import { useLayoutEffect, useRef } from 'react';

import type { AngularPreviewProps } from './type';

export const Preview = (props: AngularPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const componentRef = useRef<ComponentRef<Fluxdown> | null>(null);

  const propsRef = useRef(props);

  useLayoutEffect(() => {
    propsRef.current = props;

    const component = componentRef.current;

    if (!component) {
      return;
    }

    for (const [name, value] of Object.entries(props)) {
      component.setInput(name, value);
    }

    component.changeDetectorRef.detectChanges();
  }, [props]);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let active = true;

    let app: ApplicationRef | undefined;

    void createApplication().then((application) => {
      if (!active) {
        application.destroy();

        return;
      }

      app = application;

      const component = createComponent(Fluxdown, {
        environmentInjector: app.injector,
      });

      container.appendChild(component.location.nativeElement);

      componentRef.current = component;

      for (const [name, value] of Object.entries(propsRef.current)) {
        component.setInput(name, value);
      }

      app.attachView(component.hostView);

      component.changeDetectorRef.detectChanges();
    });

    return () => {
      active = false;

      componentRef.current = null;

      app?.destroy();
    };
  }, []);

  return <div ref={containerRef} />;
};
