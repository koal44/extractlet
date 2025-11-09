import { describe, expect, it, test } from 'vitest';
import { strictEqual } from 'node:assert';
import {
  h,
  isLabelRedundant,
  jaccardSimilarity, jaroWinklerSimilarity, levenshteinSimilarity, toKebabCase, toKebabCaseI18n,
  toPascalCase, toPascalCaseI18n,
} from '../../src/utils';
import { assertApproxEqual, docEl } from '../utils/test-utils';

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


// describe('Intra-link redundancy: title vs href', () => {
//   // 1) Scheme-only difference -> redundant (naive fails)
//   it('treats "martinfowler.com/… " vs "http://martinfowler.com/…" as redundant', () => {
//     const text = 'martinfowler.com/articles/newMethodology.html';
//     const href = 'http://martinfowler.com/articles/newMethodology.html';
//     expect(isTextRedundantForHref(text, href)).toBe(true);
//     // naiveContains happens to pass here (text is contained in href), included for completeness:
//     expect(isCaptionSimilar(text, href)).toBe(true);
//   });

//   // 2) www alias -> redundant (naive usually passes; keep as a sanity check)
//   it('treats "youtube.com/watch?v=ID" vs "https://www.youtube.com/watch?v=ID" as redundant', () => {
//     const text = 'youtube.com/watch?v=wymmCdLdPvM';
//     const href  = 'https://www.youtube.com/watch?v=wymmCdLdPvM';
//     expect(isTextRedundantForHref(text, href)).toBe(true);
//     // naiveContains passes here too:
//     expect(isCaptionSimilar(text, href)).toBe(true);
//   });

//   // 3) Mobile alias (m.youtube.com) -> redundant (naive FAILS: different host strings)
//   it('treats mobile vs canonical YouTube host as redundant', () => {
//     const text = 'm.youtube.com/watch?v=wymmCdLdPvM';
//     const href  = 'https://www.youtube.com/watch?v=wymmCdLdPvM';
//     expect(isTextRedundantForHref(text, href)).toBe(true);
//     // naiveContains fails (m.youtube.com not contained in www.youtube.com):
//     expect(isCaptionSimilar(text, href)).toBe(false);
//   });

//   // 4) Wikipedia mobile alias (en.m.wikipedia.org) -> redundant (naive FAILS)
//   it('treats Wikipedia mobile subdomain as redundant vs canonical', () => {
//     const text = 'en.m.wikipedia.org/wiki/Hofstadter\'s_law';
//     const href  = 'https://en.wikipedia.org/wiki/Hofstadter%27s_law';
//     // console.log(decodeURIComponent(text));
//     // console.log(decodeURIComponent(href));
//     // console.log('----');
//     expect(isTextRedundantForHref(text, href)).toBe(true);
//     // naiveContains fails for both m. and %27:
//     expect(isCaptionSimilar(text, href)).toBe(true);
//   });

//   // 5) Percent-encoding vs literal apostrophe -> redundant (naive FAILS)
//   it('handles % decoding: Grinberg%27s_theorem vs Grinberg\'s_theorem', () => {
//     const text = 'http://en.wikipedia.org/wiki/Grinberg\'s_theorem';
//     const href  = 'http://en.wikipedia.org/wiki/Grinberg%27s_theorem';
//     expect(isTextRedundantForHref(text, href)).toBe(true);
//     expect(isCaptionSimilar(text, href)).toBe(true);
//   });

//   // 6) Last segment equivalence -> redundant (title equals last path segment)
//   it('treats last path segment alone as redundant vs full URL', () => {
//     const text = 'newMethodology.html';
//     const href  = 'https://martinfowler.com/articles/newMethodology.html';
//     expect(isTextRedundantForHref(text, href)).toBe(true);
//     // naiveContains fails unless the segment appears inside the longer string (it does); still good to check:
//     expect(isCaptionSimilar(text, href)).toBe(true);
//   });

//   // 7) Trailing slash noise -> redundant
//   it('ignores trailing slashes when deciding redundancy', () => {
//     const text = 'wikipedia.org/wiki/Tetration';
//     const href  = 'https://wikipedia.org/wiki/Tetration/';
//     expect(isTextRedundantForHref(text, href)).toBe(true);
//     expect(isCaptionSimilar(text, href)).toBe(true);
//   });

//   // 8) Short human text (<= 15) -> NOT redundant even if substring
//   it('keeps short human-ish titles regardless (≤15 chars)', () => {
//     const text = 'Numberphile'; // ≤ 15
//     const href  = 'https://www.youtube.com/watch?v=_-M_3oV75Lw';
//     expect(isTextRedundantForHref(text, href)).toBe(false);
//     // naiveContains also false; included for symmetry:
//     expect(isCaptionSimilar(text, href)).toBe(false);
//   });

//   // 9) Generic words like "here" must not force redundancy (naive would mark false negative/positive inconsistently)
//   it('does not mark very short generic words as redundant', () => {
//     const text = 'here';
//     const href  = 'https://example.com/some/path';
//     expect(isTextRedundantForHref(text, href)).toBe(false);
//     // naiveContains is false here (fine), but would be true for hrefs containing "here" in the path, which is undesirable.
//   });

//   // 10) Distinct meaningful title -> NOT redundant
//   it('keeps meaningful titles that add information', () => {
//     const text = 'Burnside’s problem — overview';
//     const href  = 'http://en.wikipedia.org/wiki/Burnside\'s_problem';
//     expect(isTextRedundantForHref(text, href)).toBe(false);
//     expect(isCaptionSimilar(text, href)).toBe(false);
//   });

//   // 11) Tooltip case (treat as another caption): redundant against href
//   it('would drop a tooltip that merely repeats the URL', () => {
//     const tooltip = 'youtube.com/watch?v=ASoz_NuIvP0';
//     const href    = 'https://www.youtube.com/watch?v=ASoz_NuIvP0';
//     expect(isTextRedundantForHref(tooltip, href)).toBe(true);
//   });

//   // 12) Query must be preserved in href but can still be redundant by title
//   it('respects query strings while still deduping the title', () => {
//     const text = 'youtube.com/watch?v=ASoz_NuIvP0';
//     const href  = 'https://www.youtube.com/watch?v=ASoz_NuIvP0';
//     expect(isTextRedundantForHref(text, href)).toBe(true);
//   });
// });

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
