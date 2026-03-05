import { describe, expect, it, test, vi } from 'vitest';
import { docEl, setupDom } from '../utils/test-utils';
import { addStyle, h, htmlToElementK } from '../../src/utils/dom';

describe('h()', () => {
  test('h sets xlink:href on <use> with namespace', () => {
    const doc = docEl('<div></div>');
    const svg = h('svg:use', { __doc: doc, 'xlink:href': '#icon' });
    expect(svg.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toBe('#icon');
  });

  test('h sets plain href on <use> (SVG2 style)', () => {
    const doc = docEl('<div></div>');
    const svg = h('svg:use', { __doc: doc, href: '#icon' });
    expect(svg.getAttribute('href')).toBe('#icon');
    expect(svg.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toBe(null);
  });
});

describe('htmlToElementK', () => {
  setupDom();

  const MATH_NS = 'http://www.w3.org/1998/Math/MathML';
  const SVG_NS  = 'http://www.w3.org/2000/svg';

  it('parses HTML elements (HTMLElement overload)', () => {
    const el = htmlToElementK('<div class="foo">bar</div>', 'div');
    expect(el).not.toBeNull();
    expect(el!.tagName.toLowerCase()).toBe('div');
    expect(el!.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
    expect(el!.getAttribute('class')).toBe('foo');
    expect(el!.textContent).toBe('bar');
  });

  it('parses MathML elements (MathMLElement overload)', () => {
    const html = `
      <math xmlns="${MATH_NS}" data-latex="E = mc^2">
        <mi data-latex="E">E</mi>
        <mo data-latex="=">=</mo>
        <mi data-latex="m">m</mi>
        <msup data-latex="c^2">
          <mi data-latex="c">c</mi>
          <mn data-latex="2">2</mn>
        </msup>
      </math>`;
    const math = htmlToElementK(html, 'math:math');
    expect(math).not.toBeNull();

    // tag + namespace
    expect(math!.tagName.toLowerCase()).toBe('math');
    expect(math!.namespaceURI).toBe(MATH_NS);

    // root attrs
    expect(math!.getAttribute('data-latex')).toBe('E = mc^2');

    // children structure
    const children = Array.from(math!.children);
    expect(children.map((c) => c.tagName.toLowerCase())).toEqual([
      'mi', 'mo', 'mi', 'msup',
    ]);

    const firstMi = children[0];
    expect(firstMi.getAttribute('data-latex')).toBe('E');
    expect(firstMi.textContent).toBe('E');
  });

  it('parses SVG elements (SVGElement overload)', () => {
    const html = `
      <svg xmlns="${SVG_NS}" viewBox="0 0 10 10">
        <circle cx="5" cy="5" r="3" />
      </svg>`;
    const svg = htmlToElementK(html, 'svg:svg');
    expect(svg).not.toBeNull();

    expect(svg!.tagName.toLowerCase()).toBe('svg');
    expect(svg!.namespaceURI).toBe(SVG_NS);
    expect(svg!.getAttribute('viewBox')).toBe('0 0 10 10');

    const circle = svg!.querySelector('circle');
    expect(circle).not.toBeNull();
    expect(circle!.namespaceURI).toBe(SVG_NS);
    expect(circle!.getAttribute('cx')).toBe('5');
    expect(circle!.getAttribute('cy')).toBe('5');
    expect(circle!.getAttribute('r')).toBe('3');
  });

  it('returns null when there is more than one root element', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const html = '<div></div><span></span>';
    const el = htmlToElementK(html, 'div');
    expect(el).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('must contain exactly one element'));
    warnSpy.mockRestore();
  });

  it('returns null when the tag does not match', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = htmlToElementK('<span>oops</span>', 'div');
    expect(el).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('expected root <div>'));
    warnSpy.mockRestore();
  });
});

describe('addStyle (CSSOM + jsdom fallback)', () => {
  setupDom();

  it('uses CSSOM when elem.style.setProperty exists', () => {
    const el = htmlToElementK('<div></div>', 'div')!;
    expect(el).not.toBeNull();

    addStyle(el, 'color', 'red');
    addStyle(el, 'font-weight', 'bold');
    expect(el.style.getPropertyValue('color')).toBe('red');
    expect(el.style.getPropertyValue('font-weight')).toBe('bold');
  });

  it('preserves existing inline styles when adding a new property', () => {
    const el = htmlToElementK('<div style="color: blue;"></div>', 'div')!;
    expect(el).not.toBeNull();

    addStyle(el, 'font-size', '16px');
    expect(el.style.getPropertyValue('color')).toBe('blue');
    expect(el.style.getPropertyValue('font-size')).toBe('16px');
  });

  it('falls back to style attribute when CSSStyleDeclaration is missing (MathML in jsdom)', () => {
    const el = htmlToElementK('<math xmlns:math="http://www.w3.org/1998/Math/MathML"></math:math>', 'math:math')!;
    expect(el).not.toBeNull();

    addStyle(el, 'background-color', 'yellow');
    expect(el.style).toBeUndefined(); // jsdom will not have CSSStyleDeclaration on MathML elements. only true in testing??
    expect(el.getAttribute('style')).toBe('background-color: yellow;');
  });

  it('preserves existing values containing colons when falling back (jsdom MathML)', () => {
    // inline style includes a data URL with multiple colons
    const el = htmlToElementK(
      `<math xmlns:math="http://www.w3.org/1998/Math/MathML"
            style="background-image: url('data:image/png;base64,AAAA:BBBB:CCCC');">
      </math:math>`,
      'math:math'
    );
    if (!el) throw new Error('Element is null');

    // jsdom should NOT have a real CSSStyleDeclaration for MathML → fallback path
    expect(el.style).toBeUndefined();

    addStyle(el, 'border', '1px solid red');

    // output must preserve the FULL value after the first colon only
    expect(el.getAttribute('style')).toBe(
      `background-image: url("data:image/png;base64,AAAA:BBBB:CCCC"); border: 1px solid red;`
    );
  });

  it('overwrites existing property values containing colons correctly', () => {
    const el = htmlToElementK(
      `<math xmlns:math="http://www.w3.org/1998/Math/MathML"
            style="content: ':';">
      </math:math>`,
      'math:math'
    );
    if (!el) throw new Error('Element is null');

    addStyle(el, 'content', `":"`);
    expect(el.getAttribute('style')).toBe(`content: ":";`);
  });
});
