/* eslint-disable @typescript-eslint/no-base-to-string */
import { describe, it, test } from 'vitest';
import assert, { notStrictEqual, strictEqual } from 'node:assert';
import { el, setupDom, htmlify, assertNodeEqual, mathEl } from './test-utils';
import { h } from '../../src/utils/dom';

setupDom();

test('htmlify simple', () => {
  const html = el('<div class="test" style="color: red;">Hello <span>World</span></div>');
  strictEqual(htmlify(html), '<div class="test" style="color: red;">Hello <span>World</span></div>');
});

test('htmlify unordered class', () => {
  const html = el('<div class="beta alpha">Hello <span>World</span></div>');
  strictEqual(htmlify(html), '<div class="alpha beta">Hello <span>World</span></div>');
});

describe('htmlify()', () => {
  test('returns string input unchanged', () => {
    strictEqual(htmlify('hello'), 'hello');
  });

  test('returns empty string for null or undefined', () => {
    strictEqual(htmlify(null), '');
    strictEqual(htmlify(undefined), '');
  });

  test('handles simple element with no attributes', () => {
    const node = el('<span>hello</span>');
    strictEqual(htmlify(node), '<span>hello</span>');
  });

  test('normalizes attribute order', () => {
    const a = el('<div id="x" class="foo bar"></div>');
    const b = el('<div class="bar foo" id="x"></div>');
    strictEqual(htmlify(a), htmlify(b));
  });

  test('normalizes class order', () => {
    const a = el('<div class="z a b"></div>');
    const b = el('<div class="b z a"></div>');
    strictEqual(htmlify(a), htmlify(b));
  });

  test('normalizes style order and whitespace', () => {
    const a = el('<div style="color: red; font-size: 12px;"></div>');
    const b = el('<div style=" font-size:12px ; color:red "></div>');
    strictEqual(htmlify(a), htmlify(b));
  });

  test('serializes nested children', () => {
    const a = el('<div><span>Hi</span><b>Bye</b></div>');
    strictEqual(htmlify(a), '<div><span>Hi</span><b>Bye</b></div>');
  });

  test('handles custom styles', () => {
    const html = el('<div style="color: red; --size: 100px, width: var(--size); --foo: bar"></div>');
    const actual = htmlify(html);
    const expected = '<div style="--foo: bar; --size: 100px, width: var(--size); color: red;"></div>';
    strictEqual(actual, expected);
  });

  test('drops indentation whitespace between block children', () => {
    const node = el('<div>\n  <p>a</p>\n  <p>b</p>\n</div>');
    strictEqual(
      htmlify(node, { dropWsNodes: true }),
      '<div><p>a</p><p>b</p></div>',
    );
  });
});

describe('htmlify() negative cases', () => {
  test('fails if text content differs', () => {
    const a = el('<p>hello</p>');
    const b = el('<p>hello!</p>');
    notStrictEqual(htmlify(a), htmlify(b));
  });

  test('fails if class is missing', () => {
    const a = el('<div class="a b"></div>');
    const b = el('<div class="a"></div>');
    notStrictEqual(htmlify(a), htmlify(b));
  });

  test('fails if different tag', () => {
    const a = el('<span>test</span>');
    const b = el('<div>test</div>');
    notStrictEqual(htmlify(a), htmlify(b));
  });

  test('fails if attribute value differs', () => {
    const a = el('<input type="checkbox" checked="checked" />');
    const b = el('<input type="checkbox" />');
    notStrictEqual(htmlify(a), htmlify(b));
  });
});

describe('htmlify() dropWsNodes', () => {
  test('keeps pretty-print whitespace by default', () => {
    const node = el('<div><span>a</span>\n  <span>b</span></div>');
    strictEqual(
      htmlify(node),
      '<div><span>a</span>\n  <span>b</span></div>',
    );
  });

  test('drops whitespace-only text nodes between elements when dropWsNodes is true', () => {
    const node = el('<div><span>a</span>\n  <span>b</span></div>');
    strictEqual(
      htmlify(node, { dropWsNodes: true }),
      '<div><span>a</span><span>b</span></div>',
    );
  });

  test('does not touch mixed text content when dropWsNodes is true', () => {
    const node = el('<p>a b</p>');
    strictEqual(
      htmlify(node, { dropWsNodes: true }),
      '<p>a b</p>',
    );
  });
});

describe('el helper', () => {
  test('should support svg', () => {
    const svg = el('<svg></svg>');
    const svgElement = svg.ownerDocument.defaultView?.SVGElement;
    assert(svgElement !== undefined, 'SVGElement constructor should exist');
    assert(svg instanceof svgElement, 'svg should be instanceof SVGElement');
  });

  test('should partially support MathML elements in JSDOM', () => {
    const math = el('<math><mi>x</mi></math>');
    assert(typeof math === 'object');

    const mathElementCtor = math.ownerDocument.defaultView?.MathMLElement;
    assert(mathElementCtor === undefined, 'MathMLElement should be undefined');

    const elementCtor = math.ownerDocument.defaultView?.Element;
    assert(elementCtor !== undefined, 'Element constructor should exist');
    assert(math instanceof elementCtor, 'math should be instanceof Element');

    assert(math.querySelector('mi')?.textContent === 'x');

    assert(math.tagName === 'math', 'math tagName should be "math"');
    assert(math.namespaceURI === 'http://www.w3.org/1998/Math/MathML', 'math namespaceURI should be MathML');

    strictEqual(String(document.createElement('math')), '[object HTMLUnknownElement]', 'clone should serialize as HTMLUnknownElement');
    strictEqual(String(document.createElement('div')), '[object HTMLDivElement]', 'div should serialize as HTMLDivElement');
  });

});

test('el, h and htmlify should handle MathML', () => {
  const math = el('<math><mi>x</mi></math>');
  // assert(math !== null, 'math should not be null');
  strictEqual(String(math), '[object Element]');
  strictEqual(math.namespaceURI, 'http://www.w3.org/1998/Math/MathML');

  const html = htmlify(math);
  strictEqual(html, '<math><mi>x</mi></math>');

  const hMath = h('math:math', {}, h('math:mi', {}, 'x'));
  strictEqual(htmlify(hMath), '<math><mi>x</mi></math>', 'h should create MathML element correctly');
});

test('mathEl wraps mml fragments and preserves roots', () => {
  assertNodeEqual(mathEl('<mi>x</mi>'), mathEl('<mi>x</mi>'));
  assertNodeEqual(mathEl('<math><mi>x</mi></math>'), mathEl('<mi>x</mi>'));
  assertNodeEqual(mathEl('<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>x</mi></math>'), mathEl('<mi>x</mi>'));
});

describe('assertNodeEqual — element vs string normalization', () => {
  it('treats self-closing <input/> and explicit </input> as equivalent (should fail now)', () => {
    const a = el('<div><input type="checkbox" checked=""></div>');
    const b = '<div><input type="checkbox" checked="" /></div>';
    assertNodeEqual(a, b);
  });

  it('ignores attribute order differences when comparing Element vs string (should fail now)', () => {
    const a = el('<div><input type="checkbox" checked=""></div>');
    const b = '<div><input checked="" type="checkbox"></div>';
    assertNodeEqual(a, b);
  });

  it('ignores class order when comparing Element vs string (should fail now)', () => {
    const a = el('<div class="alpha beta">ok</div>');
    const b = '<div class="beta alpha">ok</div>';
    assertNodeEqual(a, b);
  });

  it('drops whitespace-only text nodes between elements when dropWsNodes=true', () => {
    const a = el('<div><span>a</span>\n  <span>b</span></div>');
    const b = '<div><span>a</span><span>b</span></div>';

    // Should pass only when dropWsNodes is enabled
    assertNodeEqual(a, b, { dropWsNodes: true });
  });

  it('preserves meaningful inline whitespace even when dropWsNodes=true', () => {
    const a = el('<p>a b</p>');
    const b = '<p>a b</p>';

    // Must not collapse or trim the " " between a and b
    assertNodeEqual(a, b, { dropWsNodes: true });
  });

  it('drops indentation whitespace between block-level children', () => {
    const a = el('<div>\n  <p>a</p>\n  <p>b</p>\n</div>');
    const b = '<div><p>a</p><p>b</p></div>';

    assertNodeEqual(a, b, { dropWsNodes: true });
  });
});
