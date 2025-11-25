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
        bodyHtml: '<div>\n          <p>Add non-overlapping ANTLR grammar examples for runt',
        bodyMd: 'Add non-overlapping ANTLR grammar examples for runtime tests\n\nThis com',
        postId: 'issuecomment-3394081817',
      },
      {
        contributor: {
          author: 'sumittlearnbay',
          timestamp: '2025-10-12T10:21:40Z',
        },
        bodyHtml: '<div>\n          <p>successful check</p>\n\n      </div>',
        bodyMd: 'successful check',
        postId: 'issuecomment-3394131530',
      },
      {
        contributor: {
          author: 'kaby76',
          timestamp: '2025-10-12T10:56:58Z',
        },
        bodyHtml: '<div>\n          <p>For pedagogical purposes, your grammars should use ',
        bodyMd: 'For pedagogical purposes, your grammars should use EOF-terminated star',
        postId: 'issuecomment-3394162753',
      },
      {
        contributor: {
          author: 'sumittlearnbay',
          timestamp: '2025-10-12T11:10:53Z',
        },
        bodyHtml: '<div>\n          <p>Add EOF-terminated fixed grammars following ANTLR 4',
        bodyMd: 'Add EOF-terminated fixed grammars following ANTLR 4.7+ and Boolean pre',
        postId: 'issuecomment-3394177357',
      },
      {
        contributor: {
          author: 'sumittlearnbay',
          timestamp: '2025-10-12T12:49:42Z',
        },
        bodyHtml: '<div>\n          <p>Add EOF-terminated fixed grammars following ANTLR 4',
        bodyMd: 'Add EOF-terminated fixed grammars following ANTLR 4.7+ and Boolean pre',
        postId: 'issuecomment-3394343216',
      },
    ],
    totalPosts: 6,
  },
} satisfies HubSidecar;
