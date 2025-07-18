import { describe, test } from 'node:test';
import { notStrictEqual, strictEqual } from 'node:assert';
import { el, setupDom, htmlify } from './test-utils.js';

setupDom();

test('htmlify_simple', () => {
  const html = el('<div class="test" style="color: red;">Hello <span>World</span></div>');
  strictEqual(htmlify(html), '<div class="test" style="color: red;">Hello <span>World</span></div>');
});

test('htmlify_unordered_class', () => {
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
    const html = el('<div style="color: red; --size: 100px, width: var(--size); --foo: bar"></div>') as HTMLElement;
    const actual = htmlify(html!);
    const expected = '<div style="--foo: bar; --size: 100px, width: var(--size); color: red;"></div>';
    strictEqual(actual, expected);
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
