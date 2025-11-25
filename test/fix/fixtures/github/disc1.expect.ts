import type { HubSidecar } from '../../hub.test';

export default {
  baseUrl: 'https://github.com/antlr/antlr4/discussions/4889',
  expect: {
    permalink: 'https://github.com/antlr/antlr4/discussions/4889',
    title: 'Possibility of grammars transpilation · antlr/antlr4 · Discussion #4889 · GitHub',
    totalPosts: 5,
    posts: [
      {
        contributor: {
          author: 'GreedIsGood10000',
          timestamp: '2025-09-17T13:00:13Z',
        },
        bodyHtml: '<div>\n        <p>Hello,<br>\nI have a task to transpile code from l',
        bodyMd: 'Hello,\nI have a task to transpile code from language grammar A to gr',
        postId: 'discussion-8910946',
      },
      {
        contributor: {
          author: 'KvanTTT',
          timestamp: '2025-09-18T12:34:33Z',
        },
        bodyHtml: '<div>\n        <p>Have you tried using LLM-based solutions for this?</p>',
        bodyMd: 'Have you tried using LLM-based solutions for this?',
        postId: 'discussioncomment-14442708',
      },
    ],
  },
} satisfies HubSidecar;
