import type { HubSidecar } from '../../hub.test';

export default {
  baseUrl: 'https://github.com/antlr/antlr4/issues/4848',
  expect: {
    permalink: 'https://github.com/antlr/antlr4/issues/4848',
    title: 'Performance questions regarding C++ target',
    posts: [
      {
        contributor: {
          author: 'Duttenheim',
          timestamp: '2025-06-09T11:33:44.000Z',
        },
        bodyHtml: '<DIV data-testid="issue-body-viewer"><DIV data-testid="markdown-body" ',
        bodyMd: 'Hello! I am using ANTLR to parse [](https://github.com/gscept/GPULang)',
        postId: 'issue-3130032756',
      },
      {
        contributor: {
          author: 'kaby76',
          timestamp: '2025-06-09T13:32:03.000Z',
        },
        bodyHtml: '<DIV data-testid="markdown-body" data-team-hovercards-enabled="true" d',
        bodyMd: '@Duttenheim, You might want to first resolve ambiguity in your grammar',
        postId: 'issuecomment-2955808059',
      },
      {
        contributor: {
          author: 'Duttenheim',
          timestamp: '2025-06-09T16:11:29.000Z',
        },
        bodyHtml: '<DIV data-testid="markdown-body" data-team-hovercards-enabled="true" d',
        bodyMd: 'I fixed the suffix and prefix to be direct left recursive. I run it wi',
        postId: 'issuecomment-2956251618',
      },
      {
        contributor: {
          author: 'kaby76',
          timestamp: '2025-06-09T17:27:44.000Z',
        },
        bodyHtml: '<DIV data-testid="markdown-body" data-team-hovercards-enabled="true" d',
        bodyMd: 'Yes, your grammar is _really slow_!\n\nI grabbed the latest copy of your',
        postId: 'issuecomment-2956449433',
      },
      {
        contributor: {
          author: 'KvanTTT',
          timestamp: '2025-06-10T09:12:31.000Z',
        },
        bodyHtml: '<DIV data-testid="markdown-body" data-team-hovercards-enabled="true" d',
        bodyMd: "I don't recommend use ANTLR for anything that requires high performanc",
        postId: 'issuecomment-2958316081',
      },
      {
        contributor: {
          author: 'jimidle',
          timestamp: '2025-06-10T15:30:19.000Z',
        },
        bodyHtml: '<DIV data-testid="markdown-body" data-team-hovercards-enabled="true" d',
        bodyMd: "> I don't recommend use ANTLR for anything that requires high performa",
        postId: 'issuecomment-2959726860',
      },
      {
        contributor: {
          author: 'KvanTTT',
          timestamp: '2025-06-10T16:20:29.000Z',
        },
        bodyHtml: '<DIV data-testid="markdown-body" data-team-hovercards-enabled="true" d',
        bodyMd: "> almost all tools do way more work than the parser\n\nIt's true. Typica",
        postId: 'issuecomment-2959905795',
      },
      {
        contributor: {
          author: 'Duttenheim',
          timestamp: '2025-06-23T20:22:52.000Z',
        },
        bodyHtml: '<DIV data-testid="markdown-body" data-team-hovercards-enabled="true" d',
        bodyMd: 'Hello everyone!\n\nI took what you said to heart and worked on the gramm',
        postId: 'issuecomment-2997837895',
      },
      {
        contributor: {
          author: 'Duttenheim',
          timestamp: '2025-08-09T20:33:09.000Z',
        },
        bodyHtml: '<DIV data-testid="markdown-body" data-team-hovercards-enabled="true" d',
        bodyMd: 'I decided to dump ANTLR in favor of just writing my own lexer and pars',
        postId: 'issuecomment-3172081116',
      },
      {
        contributor: {
          author: 'jimidle',
          timestamp: '2025-08-10T17:55:43.000Z',
        },
        bodyHtml: '<DIV data-testid="markdown-body" data-team-hovercards-enabled="true" d',
        bodyMd: 'Depends what your compiler does. I would still suspect that your gramm',
        postId: 'issuecomment-3172796464',
      },
    ],
    totalPosts: 10,
  },
} satisfies HubSidecar;
