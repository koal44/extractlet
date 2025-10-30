import type { HubSidecar  } from '../../hub.test';

export default {
  baseUrl: 'https://github.com/antlr/antlr4/issues/4896',
  expect: {
    permalink: 'https://github.com/antlr/antlr4/issues/4896',
    title: 'typing.io deprecated and removed with python3.13',
    posts: [
      {
        contributor: {
          author: 'tillo-eaux',
          timestamp: '2025-10-19T14:49:29.000Z',
        },
        bodyHtml: '<DIV data-testid="issue-body-viewer"><DIV data-testid="markdown-body" ',
        bodyMd: 'I see that this was a concern in the past [#2611](https://github.com/a',
        postId: 'issue-3530140686',
      },
    ],
    totalPosts: 1,
  },
} satisfies HubSidecar;
