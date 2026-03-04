import type { HubSidecar } from '../../hub.test';

export default {
  baseUrl: 'https://github.com/antlr/antlr4/pull/4894',
  expect: {
    permalink: 'https://github.com/antlr/antlr4/pull/4894',
    title: 'Add fixed grammars',
    posts: [
      {
        contributor: {
          author: 'sumittlearnbay',
          timestamp: '2025-10-12T07:33:55Z',
        },
        bodyHtml: '<div>\n      <p>\n        <em> No description provided. </em>\n      </p>',
        bodyMd: '_No description provided. _',
        postId: 'issue-3506781411',
      },
      {
        contributor: {
          author: 'sumittlearnbay',
          timestamp: '2025-10-12T08:57:13Z',
        },
        bodyHtml: '<div>\n\n    <div data-body-version="5e93c0cdbde450712f99cdd2dfc416d5288',
        bodyMd: 'Add non-overlapping ANTLR grammar examples for runtime tests\n\nThis com',
        postId: 'issuecomment-3394081817',
      },
      {
        contributor: {
          author: '0xFireWolf',
          timestamp: '2025-10-12T14:29:42+05:30',
        },
        bodyHtml: '<div data-view-component="true">          <a data-test-selector="pr-ti',
        bodyMd: '[0xFireWolf](https://github.com/0xFireWolf) and others added 4 commits',
      },
      {
        contributor: {
          author: '0xFireWolf',
        },
        bodyHtml: '<div data-view-component="true">          <div>\n  <div>\n    <div>\n    ',
        bodyMd: '[Cpp: Fix the unused parameter warning in the sempred function. (](https://github.com',
      },
      {
        contributor: {
          author: 'sumittlearnbay',
        },
        bodyHtml: '<div data-view-component="true">          <div>\n  <div>\n    <div>\n    ',
        bodyMd: '[Add 9 non-overlapping grammars and compilation test under antlr_gramm',
      },
    ],
    totalPosts: 13,
  },
} satisfies HubSidecar;
