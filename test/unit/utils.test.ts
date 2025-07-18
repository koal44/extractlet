import { test } from 'node:test';
import assert from 'node:assert';
import { toKebabCase } from '../../src/utils.js';

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
    assert.strictEqual(toKebabCase(word[0]), word[1], `Failed for word: ${word[0]}`);
  });
});