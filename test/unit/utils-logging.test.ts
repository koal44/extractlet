import { describe, expect, it } from 'vitest';
import { docEl, setupDom } from '../utils/test-utils';
import { h } from '../../src/utils/dom';
import { repr } from '../../src/utils/logging';

setupDom();

describe('repr', () => {
  it('summarizes various values and truncates correctly', () => {
    // primitives / specials
    expect(repr(undefined)).toBe('undefined');
    expect(repr(null)).toBe('null');
    expect(repr(0)).toBe('0');
    expect(repr(42)).toBe('42');
    expect(repr(true)).toBe('true');
    expect(repr(false)).toBe('false');

    // string (no truncation)
    expect(repr('hello')).toBe('hello');

    // string (truncation)
    const longStr = 'x'.repeat(200);
    const longSummary = repr(longStr, 20);
    expect(longSummary.length).toBe(20);
    expect(longSummary.endsWith('…')).toBe(true);

    // Error
    const err = new Error('boom');
    expect(repr(err)).toBe('Error: boom');

    // bigint
    expect(repr(123n)).toBe('123n');

    // symbol
    const sym = Symbol('foo');
    const symSummary = repr(sym);
    expect(symSummary.startsWith('Symbol(')).toBe(true);

    // function
    function namedFn() { /* noop */ }
    expect(repr(namedFn)).toBe('function namedFn()');

    // array
    expect(repr([])).toBe('Array(len=0)');
    expect(repr([1, 2, 3])).toBe('Array(len=3)');

    // plain object: small
    const smallObj = { a: 1, b: 2 };
    const smallSummary = repr(smallObj);
    expect(smallSummary).toBe('Object(a,b)');

    // plain object: empty
    const emptyObj = {};
    expect(repr(emptyObj)).toBe('Object()');

    // plain object: many keys + truncation logic
    const bigObj = {
      a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10,
    };
    const bigSummary = repr(bigObj, 20);
    expect(bigSummary).toBe('Object(a,b,c,d,e,f…)');

    // Date
    const d = new Date('2020-01-02T03:04:05.000Z');
    const dateSummary = repr(d);
    expect(dateSummary).toBe('2020-01-02T03:04:05.000Z');

    // class instance
    class MyClass { prop = 123; }
    const myInstance = new MyClass();
    const instanceSummary = repr(myInstance);
    expect(instanceSummary).toBe('MyClass(prop)');

    // class instance with many props + truncation
    class BigClass {
      a = 1; b = 2; c = 3; d = 4; e = 5; f = 6; g = 7; h = 8; i = 9; j = 10;
    }
    const bigInstance = new BigClass();
    const bigInstanceSummary = repr(bigInstance, 20);
    expect(bigInstanceSummary).toBe('BigClass(a,b,c,d,e…)');

    // Map
    const map = new Map();
    map.set('a', 1);
    map.set('b', 2);
    expect(repr(map)).toBe('Map(size=2)');

    // Set
    const set = new Set([1, 2, 3]);
    expect(repr(set)).toBe('Set(size=3)');

    // Element
    const div = h('div', { id: 'test', className: 'foo bar' });
    expect(repr(div)).toBe('<div#test>');

    // NodeList
    const div2 = h('div', {}, h('span'), h('span'));
    const nodeList = div2.querySelectorAll('div');
    expect(repr(nodeList)).toBe('NodeList(len=0)');
    const nodeList2 = div2.querySelectorAll('span');
    expect(repr(nodeList2)).toBe('NodeList(len=2)');

    // Node (comment)
    const commentNode = docEl('<!-- a comment -->').childNodes[0];
    expect(repr(commentNode)).toBe('CommentNode');

    // RegExp
    const re = /foo/i;
    expect(repr(re)).toBe('/foo/i');

    // Promise
    const p = Promise.resolve(123);
    expect(repr(p)).toBe('Promise');

    // URL
    const url = new URL('https://example.com/path?x=1');
    expect(repr(url)).toBe('URL(https://example.com/path?x=1)');

    // ErrorEvent
    const errorEvent = new ErrorEvent('error', { message: 'boom from event' });
    expect(repr(errorEvent)).toBe('ErrorEvent: boom from event');

    // Document
    const docSummary = repr(document);
    expect(docSummary).toBe(`Document(title="${document.title}")`);

    // Date truncation behavior
    const longDate = new Date('2020-01-02T03:04:05.123Z');
    expect(repr(longDate, 10)).toBe('2020-01-0…');

    // URL truncation behavior
    const longUrl = new URL(`https://example.com/${'x'.repeat(200)}`);
    expect(repr(longUrl, 30)).toBe('URL(https://example.com/xxxxx…');

  });
});
