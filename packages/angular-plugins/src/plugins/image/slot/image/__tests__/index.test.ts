import type { Element } from 'hast';

import { TestBed } from '@angular/core/testing';

import { LinkRenderer } from '../../../../link/slot/link/renderer';
import { ImageRenderer } from '../renderer';

const current: Element = { type: 'element', tagName: 'img', properties: {}, children: [] };

const nodeProps = { Raw: null, current, parents: [], render: () => null };

afterEach(() => TestBed.resetTestingModule());

describe('link and image interactions', () => {
  test('passes the native click event once through image callbacks', () => {
    const onClick = vi.fn();

    const fixture = TestBed.createComponent(ImageRenderer);

    fixture.componentRef.setInput('props', { ...nodeProps, src: '/image.png', onClick });

    fixture.detectChanges();

    fixture.nativeElement.click();

    expect(onClick).toHaveBeenCalledTimes(1);

    expect(onClick.mock.calls[0]?.[0].event.target).toBe(fixture.nativeElement);
  });

  test('passes the native click event once through link callbacks', () => {
    const onClick = vi.fn();

    const fixture = TestBed.createComponent(LinkRenderer);

    fixture.componentRef.setInput('props', { ...nodeProps, href: '#section', onClick });

    fixture.detectChanges();

    fixture.nativeElement.click();

    expect(onClick).toHaveBeenCalledTimes(1);

    expect(onClick.mock.calls[0]?.[0].event.target).toBe(fixture.nativeElement);
  });

  test.each(['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>'])(
    'omits unsafe %s URLs',
    (url) => {
      const image = TestBed.createComponent(ImageRenderer);

      image.componentRef.setInput('props', { ...nodeProps, src: url });

      image.detectChanges();

      const link = TestBed.createComponent(LinkRenderer);

      link.componentRef.setInput('props', { ...nodeProps, href: url });

      link.detectChanges();

      expect(image.nativeElement.getAttribute('src')).toBeNull();

      expect(link.nativeElement.getAttribute('href')).toBeNull();
    },
  );
});
