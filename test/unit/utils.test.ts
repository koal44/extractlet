// import { test } from 'node:test';
import { test } from 'vitest';
import { strictEqual } from 'node:assert';
import { jaccardSimilarity, jaroWinklerSimilarity, levenshteinSimilarity, toKebabCase, toKebabCaseI18n, toPascalCase, toPascalCaseI18n } from '../../src/utils.js';
import { assertApproxEqual } from './test-utils.js';

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
    { a:"Alpha", b:"Alpha", expected: { lev: 1.00, jw: 1.00, jac: 1.00 } },
    { a:"Alpha", b:"alpha", expected: { lev: 0.80, jw: 0.87, jac: 1.00 } },
    { a:"Alpha Beta", b:"Beta Alpha", expected: { lev: 0.20, jw: 0.53, jac: 1.00 } },
    { a:"Alpha Beta", b:"AlphaBeta", expected: { lev: 0.90, jw: 0.98, jac: 0.00 } },
    { a:"Alpha", b:"Alfa", expected: { lev: 0.60, jw: 0.83, jac: 0.00 } },
    { a:"Beta", b:"Alpha", expected: { lev: 0.20, jw: 0.48, jac: 0.00 } },
    { a:"Gamma-Ray", b:"Gamma Ray", expected: { lev: 0.89, jw: 0.96, jac: 0.00 } },
    { a:"Hello world", b:"Hello  world", expected: { lev: 0.92, jw: 0.98, jac: 1.00 } },
    { a:"Section 1", b:"Section 2", expected: { lev: 0.89, jw: 0.96, jac: 0.33 } },
    { a:"Bold Heading", b:"'''Bold Heading'''", expected: { lev: 0.67, jw: 0.89, jac: 0.00 } },
    { a:"The quick brown fox", b:"The quick brown fox jumps", expected: { lev: 0.76, jw: 0.95, jac: 0.80 } },
    { a:"Heading", b:"heading", expected: { lev: 0.86, jw: 0.90, jac: 1.00 } },
    { a:"Apple", b:"Pineapple", expected: { lev: 0.44, jw: 0.37, jac: 0.00 } },
    { a:"Intro", b:"<ref>Intro</ref>", expected: { lev: 0.31, jw: 0.64, jac: 0.00 } },
    { a:"Foo Bar", b:"Bar Foo", expected: { lev: 0.14, jw: 0.43, jac: 1.00 } },
    { a:'', b:'', expected: { lev: 1, jw: 1, jac: 1 } },
  ];

  testPairs.forEach(({ a, b, expected }) => {
    assertApproxEqual(levenshteinSimilarity(a, b), expected.lev, 0.01, `Levenshtein similarity failed for "${a}" and "${b}"`);
    assertApproxEqual(jaroWinklerSimilarity(a, b), expected.jw, 0.01, `Jaro-Winkler similarity failed for "${a}" and "${b}"`);
    assertApproxEqual(jaccardSimilarity(a, b), expected.jac, 0.01, `Jaccard similarity failed for "${a}" and "${b}"`);
  });
});
