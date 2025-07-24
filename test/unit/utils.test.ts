import { test } from 'node:test';
import { strictEqual } from 'node:assert';
import { jaccardSimilarity, jaroWinklerSimilarity, levenshteinSimilarity, toKebabCase } from '../../src/utils.js';
import { assertApproxEqual } from './test-utils.js';

test('toKebabCase', () => {
  const words = [
    ['StackOverflow', 'stack-overflow'],
    ['camelCase', 'camel-case'],
    ['alllowercase', 'alllowercase'],
    ['ALLCAPITALLETTERS', 'allcapitalletters'],
    ['CustomXMLParser', 'custom-xml-parser'],
    ['APIFinder', 'api-finder'],
    ['JSONResponseData', 'json-response-data'],
    ['Person20Address', 'person20-address'],
    ['UserAPI20Endpoint', 'user-api20-endpoint'],
    ['seResult', 'se-result'],
    ['SEResult', 'se-result'],
  ];

  words.forEach((word) => {
    strictEqual(toKebabCase(word[0]), word[1], `Failed for word: ${word[0]}`);
  });
});

// const testPairs = [
//   { a:"Alpha", b:"Alpha", expected: { lev: 0, jw: 0, jac: 0 } },
//   { a:"Alpha", b:"alpha", expected: { lev: 0, jw: 0, jac: 0 } },
//   { a:"Alpha Beta", b:"Beta Alpha", expected: { lev: 0, jw: 0, jac: 0 } },
//   { a:"Alpha Beta", b:"AlphaBeta", expected: { lev: 0, jw: 0, jac: 0 } },
//   { a:"Alpha", b:"Alfa", expected: { lev: 0, jw: 0, jac: 0 } },
//   { a:"Beta", b:"Alpha", expected: { lev: 0, jw: 0, jac: 0 } },
//   { a:"Gamma-Ray", b:"Gamma Ray", expected: { lev: 0, jw: 0, jac: 0 } },
//   { a:"Hello world", b:"Hello  world", expected: { lev: 0, jw: 0, jac: 0 } },
//   { a:"Section 1", b:"Section 2", expected: { lev: 0, jw: 0, jac: 0 } },
//   { a:"Bold Heading", b:"'''Bold Heading'''", expected: { lev: 0, jw: 0, jac: 0 } },
//   { a:"The quick brown fox", b:"The quick brown fox jumps", expected: { lev: 0, jw: 0, jac: 0 } },
//   { a:"Heading", b:"heading", expected: { lev: 0, jw: 0, jac: 0 } },
//   { a:"Apple", b:"Pineapple", expected: { lev: 0, jw: 0, jac: 0 } },
//   { a:"Intro", b:"<ref>Intro</ref>", expected: { lev: 0, jw: 0, jac: 0 } },
//   { a:"Foo Bar", b:"Bar Foo", expected: { lev: 0, jw: 0, jac: 0 } },
// ];

// testPairs.forEach(({ a, b, expected }) => {
//   test(`levenshteinSimilarity("${a}", "${b}")`, () => {
//     assert.strictEqual(levenshteinSimilarity(a, b), expected.lev, `Levenshtein similarity failed for "${a}" and "${b}"`);
//   });

//   test(`jaroWinklerSimilarity("${a}", "${b}")`, () => {
//     assert.strictEqual(levenshteinSimilarity(a, b), expected.jw, `Jaro-Winkler similarity failed for "${a}" and "${b}"`);
//   });

//   test(`jaccardSimilarity("${a}", "${b}")`, () => {
//     assert.strictEqual(levenshteinSimilarity(a, b), expected.jac, `Jaccard similarity failed for "${a}" and "${b}"`);
//   });
// });

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

  // for (const { a, b, expected: _ } of testPairs) {
  //   console.log(`levenshteinSimilarity("${a}", "${b}") = ${levenshteinSimilarity(a, b)}`);
  //   console.log(`jaroWinklerSimilarity("${a}", "${b}") = ${jaroWinklerSimilarity(a, b)}`);
  //   console.log(`jaccardSimilarity("${a}", "${b}") = ${jaccardSimilarity(a, b)}`);
  // }

  testPairs.forEach(({ a, b, expected }) => {
    assertApproxEqual(levenshteinSimilarity(a, b), expected.lev, 0.01, `Levenshtein similarity failed for "${a}" and "${b}"`);
    assertApproxEqual(jaroWinklerSimilarity(a, b), expected.jw, 0.01, `Jaro-Winkler similarity failed for "${a}" and "${b}"`);
    assertApproxEqual(jaccardSimilarity(a, b), expected.jac, 0.01, `Jaccard similarity failed for "${a}" and "${b}"`);
  });
});
