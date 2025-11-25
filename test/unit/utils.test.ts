import { describe, expect, it, test } from 'vitest';
import { strictEqual } from 'node:assert';
import {
  addStyle,
  h,
  htmlToElementK,
  isLabelRedundant,
  jaccardSimilarity, jaroWinklerSimilarity, levenshteinSimilarity, repr, toKebabCase, toKebabCaseI18n,
  toPascalCase, toPascalCaseI18n,
} from '../../src/utils';
import { assertApproxEqual, docEl, setupDom } from '../utils/test-utils';

test('toKebabCase', () => {
  const words = [
    ['', ''],
    ['StackOverflow', 'stack-overflow'],
    ['camelCase', 'camel-case'],
    ['alllowercase', 'alllowercase'],
    ['ALLCAPITALLETTERS', 'allcapitalletters'],
    ['CustomXMLParser', 'custom-xml-parser'],
    ['APIFinder', 'api-finder'],
    ['JSONResponseData', 'json-response-data'],
    ['Person20Address', 'person-20-address'],
    ['UserAPI20Endpoint', 'user-api-20-endpoint'],
    ['seResult', 'se-result'],
    ['SEResult', 'se-result'],
    ['ABCDeFG', 'abc-de-fg'],
    ['JSONData', 'json-data'],
    ['xml-http-request', 'xml-http-request'],
    ['AB12CD34EF', 'ab-12-cd-34-ef'], //'ab12-cd34-ef'],
    ['JSON2XMLConverter', 'json-2-xml-converter'], //'json2-xml-converter'],
    ['IM_A_SHOUTER', 'im-a-shouter'],
    ['_foo', 'foo'],
    ['foo_', 'foo'],
    ['_mixed-|seps|__in this:here.string*', 'mixed-seps-in-this-here-string'],
    ['!--whack-¿?-string--121-**%', 'whack-string-121'],
    ['number42', 'number-42'],
    ['foo123bar', 'foo-123-bar'],
    ['fooBarBAZ123', 'foo-bar-baz-123'],
    ['42#number', '42-number'],
    ['123 456', '123-456'],
    ['(555) 123-4567', '555-123-4567'],
    ['AbcDeFGhiJKL', 'abc-de-f-ghi-jkl'],
    ['XMLHttpRequest', 'xml-http-request'],
    ['APIResponse', 'api-response'],
    ['foo bar baz', 'foo-bar-baz'],
  ];

  words.forEach((word) => {
    strictEqual(toKebabCase(word[0]), word[1], `Failed for word: ${word[0]}`);
  });
});

test('toKebabCaseI18n', () => {
  const words = [
    ['', ''],
    ['StackOverflow', 'stack-overflow'],
    ['camelCase', 'camel-case'],
    ['alllowercase', 'alllowercase'],
    ['ALLCAPITALLETTERS', 'allcapitalletters'],
    ['CustomXMLParser', 'custom-xml-parser'],
    ['APIFinder', 'api-finder'],
    ['JSONResponseData', 'json-response-data'],
    ['Person20Address', 'person-20-address'],
    ['UserAPI20Endpoint', 'user-api-20-endpoint'],
    ['seResult', 'se-result'],
    ['SEResult', 'se-result'],
    ['ABCDeFG', 'abc-de-fg'],
    ['JSONData', 'json-data'],
    ['xml-http-request', 'xml-http-request'],
    ['AB12CD34EF', 'ab-12-cd-34-ef'], //'ab12-cd34-ef'],
    ['JSON2XMLConverter', 'json-2-xml-converter'], //'json2-xml-converter'],
    ['IM_A_SHOUTER', 'im-a-shouter'],
    ['_foo', 'foo'],
    ['foo_', 'foo'],
    ['_mixed-|seps|__in this:here.string*', 'mixed-seps-in-this-here-string'],
    ['!--whack-¿?-string--121-**%', 'whack-string-121'],
    ['number42', 'number-42'],
    ['foo123bar', 'foo-123-bar'],
    ['fooBarBAZ123', 'foo-bar-baz-123'],
    ['42#number', '42-number'],
    ['123 456', '123-456'],
    ['(555) 123-4567', '555-123-4567'],
    ['AbcDeFGhiJKL', 'abc-de-f-ghi-jkl'],
    ['XMLHttpRequest', 'xml-http-request'],
    ['APIResponse', 'api-response'],
    ['foo bar baz', 'foo-bar-baz'],

    // Simple non-ASCII
    ['naïve façade', 'naïve-façade'],
    ['ÜberCool', 'über-cool'],
    // Cyrillic
    ['ПушкинСтихи', 'пушкин-стихи'],
    ['СУПЕРКОТ123Дом', 'суперкот-123-дом'],
    // Greek
    ['ΑθήναΣήμερα', 'αθήνα-σήμερα'],
    // Japanese (doesn't have uppercase/lowercase, but tests splitting)
    ['東京タワー2021', '東京タワー-2021'],
    // Accented/Latin mix
    ['JoséÁlvaroMéndez12Años', 'josé-álvaro-méndez-12-años'],
    // Emoji test (should just drop them)
    ['Smile😀Test', 'smile-test'],
    // Hebrew (right-to-left, still counts)
    ['שלוםעולם123', 'שלוםעולם-123'],
    // Arabic (no upper/lower, but numbers work)
    ['مرحبا123عالم', 'مرحبا-123-عالم'],

    ['ça.roule', 'ça-roule'],
    ['добрий-день', 'добрий-день'],
    ['٤٥٦bar12', '٤٥٦-bar-12'], // Arabic numerals (Eastern Arabic-Indic)
    ['مرحبا-بالعالم', 'مرحبا-بالعالم'], // Mixed Arabic text + Latin
    ['αβγ-δεζ', 'αβγ-δεζ'], // Greek
    ['İstanbul', 'i̇stanbul'], // Turkish I/İ/ı/iş
    ['istanbul', 'istanbul'],
    ['ışık', 'ışık'],
    ['résumé', 'résumé'], // Combining diacritic (e.g., é +  ́)
    ['שלום-עולם', 'שלום-עולם'], // Hebrew
    ['你好-世界', '你好-世界'], // CJK (Chinese, Japanese, Korean)
    ['foo世界bar', 'foo-世界-bar'], // Mixed CJK + Latin
    ['Ｆｏｏ１２３ｂａｒ', 'ｆｏｏ-１２３-ｂａｒ'], // Full-width digit (U+FF11, U+FF12)
    ['foo😀bar', 'foo-bar'], // Emoji as noise
    ['ÉCOLE', 'école'], // // Combining acute accent on capital
    //["It'sTime", "its-time"], // Apostrophe handling
    //['NASA1stMission', 'nasa-1st-mission'], // ordinal numbers
  ];

  words.forEach((word) => {
    strictEqual(toKebabCaseI18n(word[0]), word[1], `Failed for word: ${word[0]}`);
  });
});

test('toPascalCase', () => {
  const words = [
    ['alllower', 'Alllower', 'Alllower'],
    ['ALLCAPS', 'Allcaps', 'ALLCAPS'],
    ['IM_A_SHOUTER', 'ImAShouter', 'IMASHOUTER'],
    ['PascalCase', 'PascalCase', 'PascalCase'],
    ['camelCase', 'CamelCase', 'CamelCase'],
    ['foo bar baz', 'FooBarBaz', 'FooBarBaz'],
    ['_foo', 'Foo', 'Foo'],
    ['foo_', 'Foo', 'Foo'],
    ['_mixed-|seps|__in this:here.string*', 'MixedSepsInThisHereString', 'MixedSepsInThisHereString'],
    ['!--whack-¿?-string--121-**%', 'WhackString121', 'WhackString121'],
    ['number42', 'Number42', 'Number42'],
    ['foo123bar', 'Foo123Bar', 'Foo123Bar'],
    ['42#number', '42Number', '42Number'],
    ['123 456', '123456', '123456'],
    ['(555) 123-4567', '5551234567', '5551234567'],
    ['AbcDeFGhiJKL', 'AbcDeFGhiJkl', 'AbcDeFGhiJKL'],
    ['XMLHttpRequest', 'XmlHttpRequest', 'XMLHttpRequest'],
    ['APIResponse', 'ApiResponse', 'APIResponse'],
    ['', '', ''],
  ];

  words.forEach(([input, expectFalse, expectTrue]) => {
    strictEqual(toPascalCase(input, false), expectFalse, `Failed for input: "${input}" (keepAcronyms=false). Expected "${expectFalse}", got "${toPascalCase(input, false)}"`);
    strictEqual(toPascalCase(input, true), expectTrue, `Failed for input: "${input}" (keepAcronyms=true). Expected "${expectTrue}", got "${toPascalCase(input, true)}"`);
  });

});

test('toPascalCaseI18n', () => {
  const words = [
    ['alllower', 'Alllower', 'Alllower'],
    ['ALLCAPS', 'Allcaps', 'ALLCAPS'],
    ['IM_A_SHOUTER', 'ImAShouter', 'IMASHOUTER'],
    ['PascalCase', 'PascalCase', 'PascalCase'],
    ['camelCase', 'CamelCase', 'CamelCase'],
    ['foo bar baz', 'FooBarBaz', 'FooBarBaz'],
    ['_foo', 'Foo', 'Foo'],
    ['foo_', 'Foo', 'Foo'],
    ['_mixed-|seps|__in this:here.string*', 'MixedSepsInThisHereString', 'MixedSepsInThisHereString'],
    ['!--whack-¿?-string--121-**%', 'WhackString121', 'WhackString121'],
    ['number42', 'Number42', 'Number42'],
    ['foo123bar', 'Foo123Bar', 'Foo123Bar'],
    ['42#number', '42Number', '42Number'],
    ['123 456', '123456', '123456'],
    ['(555) 123-4567', '5551234567', '5551234567'],
    ['AbcDeFGhiJKL', 'AbcDeFGhiJkl', 'AbcDeFGhiJKL'],
    ['XMLHttpRequest', 'XmlHttpRequest', 'XMLHttpRequest'],
    ['APIResponse', 'ApiResponse', 'APIResponse'],
    ['', '', ''],
    ['ça.roule', 'ÇaRoule', 'ÇaRoule'],
    ['добрий-день', 'ДобрийДень', 'ДобрийДень'],
    ['٤٥٦bar12', '٤٥٦Bar12', '٤٥٦Bar12'], // Arabic numerals (Eastern Arabic-Indic)
    ['مرحبا-بالعالم', 'مرحبابالعالم', 'مرحبابالعالم'], // Mixed Arabic text + Latin
    ['αβγ-δεζ', 'ΑβγΔεζ', 'ΑβγΔεζ'], // Greek
    ['İstanbul', 'İstanbul', 'İstanbul'], // Turkish I/İ/ı/iş
    ['istanbul', 'Istanbul', 'Istanbul'],
    ['ışık', 'Işık', 'Işık'],
    ['résumé', 'Résumé', 'Résumé'], // Combining diacritic (e.g., é +  ́)
    ['שלום-עולם', 'שלוםעולם', 'שלוםעולם'], // Hebrew
    ['你好-世界', '你好世界', '你好世界'], // CJK (Chinese, Japanese, Korean)
    ['foo世界bar', 'Foo世界Bar', 'Foo世界Bar'], // Mixed CJK + Latin
    ['Ｆｏｏ１２３ｂａｒ', 'Ｆｏｏ１２３Ｂａｒ', 'Ｆｏｏ１２３Ｂａｒ'], // Full-width digit (U+FF11, U+FF12)
    ['foo😀bar', 'FooBar', 'FooBar'], // Emoji as noise
    ['ÉCOLE', 'École', 'ÉCOLE'], // // Combining acute accent on capital
  ];

  words.forEach(([input, expectFalse, expectTrue]) => {
    strictEqual(toPascalCaseI18n(input, false), expectFalse, `Failed for input: "${input}" (keepAcronyms=false). Expected "${expectFalse}", got "${toPascalCaseI18n(input, false)}"`);
    strictEqual(toPascalCaseI18n(input, true), expectTrue, `Failed for input: "${input}" (keepAcronyms=true). Expected "${expectTrue}", got "${toPascalCaseI18n(input, true)}"`);
  });

});

test('Levenshtein, Jaro-Winkler, and Jaccard Similarity Tests', () => {
  const testPairs = [
    { a: 'Alpha', b: 'Alpha', expected: { lev: 1.00, jw: 1.00, jac: 1.00 } },
    { a: 'Alpha', b: 'alpha', expected: { lev: 0.80, jw: 0.87, jac: 1.00 } },
    { a: 'Alpha Beta', b: 'Beta Alpha', expected: { lev: 0.20, jw: 0.53, jac: 1.00 } },
    { a: 'Alpha Beta', b: 'AlphaBeta', expected: { lev: 0.90, jw: 0.98, jac: 0.00 } },
    { a: 'Alpha', b: 'Alfa', expected: { lev: 0.60, jw: 0.83, jac: 0.00 } },
    { a: 'Beta', b: 'Alpha', expected: { lev: 0.20, jw: 0.48, jac: 0.00 } },
    { a: 'Gamma-Ray', b: 'Gamma Ray', expected: { lev: 0.89, jw: 0.96, jac: 0.00 } },
    { a: 'Hello world', b: 'Hello  world', expected: { lev: 0.92, jw: 0.98, jac: 1.00 } },
    { a: 'Section 1', b: 'Section 2', expected: { lev: 0.89, jw: 0.96, jac: 0.33 } },
    { a: 'Bold Heading', b: '\'\'\'Bold Heading\'\'\'', expected: { lev: 0.67, jw: 0.89, jac: 0.00 } },
    { a: 'The quick brown fox', b: 'The quick brown fox jumps', expected: { lev: 0.76, jw: 0.95, jac: 0.80 } },
    { a: 'Heading', b: 'heading', expected: { lev: 0.86, jw: 0.90, jac: 1.00 } },
    { a: 'Apple', b: 'Pineapple', expected: { lev: 0.44, jw: 0.37, jac: 0.00 } },
    { a: 'Intro', b: '<ref>Intro</ref>', expected: { lev: 0.31, jw: 0.64, jac: 0.00 } },
    { a: 'Foo Bar', b: 'Bar Foo', expected: { lev: 0.14, jw: 0.43, jac: 1.00 } },
    { a: '', b: '', expected: { lev: 1, jw: 1, jac: 1 } },
  ];

  testPairs.forEach(({ a, b, expected }) => {
    assertApproxEqual(levenshteinSimilarity(a, b), expected.lev, 0.01, `Levenshtein similarity failed for "${a}" and "${b}"`);
    assertApproxEqual(jaroWinklerSimilarity(a, b), expected.jw, 0.01, `Jaro-Winkler similarity failed for "${a}" and "${b}"`);
    assertApproxEqual(jaccardSimilarity(a, b), expected.jac, 0.01, `Jaccard similarity failed for "${a}" and "${b}"`);
  });
});

describe('isLabelRedundant', () => {
  it('wiki-style title vs URL last-segment (underscores, decoding, relative, query)', () => {
    expect(isLabelRedundant('Non existing page', './Non_existing_page?action=edit&redlink=1')).toBe(true);
    expect(isLabelRedundant('Main Page', './Main_Page')).toBe(true);
    expect(isLabelRedundant('Cauchy stress tensor', '/wiki/Cauchy_stress_tensor')).toBe(true);
    expect(isLabelRedundant('Tensor (disambiguation)', '/wiki/Tensor_(disambiguation)')).toBe(true);
    expect(isLabelRedundant('Tensor (disambiguation)', 'https://en.wikipedia.org/wiki/Tensor_(disambiguation)')).toBe(true);
    expect(isLabelRedundant('Tensor', '/wiki/Tensor_field')).toBe(true);
    expect(isLabelRedundant('Vector field', 'https://en.wikipedia.org/wiki/Vector_field')).toBe(true);
    expect(isLabelRedundant('Tensor field', 'https://en.wikipedia.org/wiki/Tensor_field')).toBe(true);
    expect(isLabelRedundant('stress–energy tensor', 'https://en.wikipedia.org/wiki/Stress-energy_tensor')).toBe(true);
    expect(isLabelRedundant('Stress–energy tensor', 'https://en.wikipedia.org/wiki/Stress%E2%80%93energy_tensor')).toBe(true);
    expect(isLabelRedundant('link', '/wiki/Link')).toBe(true);
    expect(isLabelRedundant('', '/wiki/Foo')).toBe(false);
    expect(isLabelRedundant('Foo', '')).toBe(false);
    expect(isLabelRedundant('Completely unrelated', '/wiki/Tensor_field')).toBe(false);

    expect(isLabelRedundant('martinfowler.com/articles/newMethodology.html', 'http://martinfowler.com/articles/newMethodology.html')).toBe(true);
    expect(isLabelRedundant('m.youtube.com/watch?v=wymmCdLdPvM', 'https://m.youtube.com/watch?v=wymmCdLdPvM')).toBe(true);
    expect(isLabelRedundant('youtube.com/watch?v=_-M_3oV75Lw', 'https://www.youtube.com/watch?v=_-M_3oV75Lw')).toBe(true);
    expect(isLabelRedundant('http://en.wikipedia.org/wiki/Grinberg%27s_theorem', 'http://en.wikipedia.org/wiki/Grinberg\'s_theorem')).toBe(true);
    expect(isLabelRedundant('this link', 'http://en.wikipedia.org/wiki/Chakravala_method')).toBe(false); // generic label
    expect(isLabelRedundant('here', 'http://en.wikipedia.org/wiki/Classification_of_finite_simple_groups')).toBe(false); // generic label

    expect(isLabelRedundant('example.com', 'https://example.com/foo%2')).toBe(true);
    expect(isLabelRedundant('wiki', 'https://en.wikipedia.org/wiki/Tensor')).toBe(true);
    expect(isLabelRedundant('redlink', '/wiki/Main_Page?action=edit&redlink=1')).toBe(true);
    expect(isLabelRedundant('References', 'https://en.wikipedia.org/wiki/Tensor#References')).toBe(true);
    // expect(isLabelRedundant('', '')).toBe(true);

    expect(isLabelRedundant('/Café', '/wiki/Caf%C3%A9')).toBe(true);
    expect(isLabelRedundant('/Café', '/wiki/Café')).toBe(true);
    expect(isLabelRedundant('/Café', '/wiki/Cafe\u0301')).toBe(true);
  });
});

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
    const html = '<div></div><span></span>';
    const el = htmlToElementK(html, 'div');
    expect(el).toBeNull();
  });

  it('returns null when the tag does not match', () => {
    const el = htmlToElementK('<span>oops</span>', 'div');
    expect(el).toBeNull();
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

describe('summarizeUnknown', () => {
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
