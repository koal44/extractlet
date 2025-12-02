import type { SESidecar } from '../../se.test';

export default {
  baseUrl: 'https://stackoverflow.com/questions/54408912/how-to-decompose-typescript-discriminated-union-switch-block-and-keep-it-exhau',
  expect: {
    permalink: 'https://stackoverflow.com/questions/54408912/how-to-decompose-typescript-discriminated-union-switch-block-and-keep-it-exhau',
    title: 'how to decompose TypeScript "Discriminated Union" switch block and keep it exhaustive at the same time',
    posts: [
      {
        bodyHtml: '<div>\n                \n<p>For my app I used a "Discriminated Union" pattern with exhaustiveness check as described in the TypeScript <a href="http://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions">manual</a>. \nTime went by, and eventually my switch ended up containing 50+ cases.</p>\n\n<p>So my question is: is there any good solution to decompose this switch without braking its exhaustiveness?</p>\n\n<p>In other words how to split it up, if this can help I can logically divide these unions on subtypes (for ex. shapes below can be divided for equilateral and others):</p>\n\n<pre data-xlet-lang="ts"><code data-highlighted="yes"><span>interface</span> <span>Square</span> {\n    <span>kind</span>: <span>"square"</span>;\n    <span>size</span>: <span>number</span>;\n}\n<span>interface</span> <span>Rectangle</span> {\n    <span>kind</span>: <span>"rectangle"</span>;\n    <span>width</span>: <span>number</span>;\n    <span>height</span>: <span>number</span>;\n}\n<span>interfac',
        bodyMd: 'For my app I used a "Discriminated Union" pattern with exhaustiveness check as described in the TypeScript [manual](http://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions). Time went by, and eventually my switch ended up containing 50+ cases.\n\nSo my question is: is there any good solution to decompose this switch without braking its exhaustiveness?\n\nIn other words how to split it up, if this can help I can logically divide these unions on subtypes (for ex. shapes below can be divided for equilateral and others):\n\n```ts\ninterface Square {\n    kind: "square";\n    size: number;\n}\ninterface Rectangle {\n    kind: "rectangle";\n    width: number;\n    height: number;\n}\ninterface Circle {\n    kind: "circle";\n    radius: number;\n}\n\n//... 50 more shape kinds\n\ntype Equilateral = Square | Circle /*| 25 more...*/;\ntype Other = Rectangle /*| 25 more...*/;\n\ntype Shape = Equilateral |  Other;\n\nfunction assertNever(x: never): never {\n    throw new Error("Unexpected object:',
        contributors: [
          {
            contributorType: 'editor',
            isOwner: false,
            timestamp: '2019-01-28 19:56:23Z',
            name: '',
            userId: -1,
            userSlug: '',
          },
          {
            contributorType: 'author',
            isOwner: true,
            timestamp: '2019-01-28 19:24:17Z',
            name: 'WhiteKnight',
            userId: 1237584,
            userSlug: 'whiteknight',
          },
        ],
        comments: [
          {
            bodyHtml: '<span>Maybe a type hierarchy (with a <code>Shape</code> interface that has an <code>area</code> method) might be more appropriate than a discriminated union here</span>',
            bodyMd: 'Maybe a type hierarchy (with a `Shape` interface that has an `area` method) might be more appropriate than a discriminated union here',
            contributors: [
              {
                contributorType: 'commenter',
                isOwner: false,
                timestamp: '2019-01-28 19:29:16Z',
                name: 'Bergi',
                userId: 1048572,
                userSlug: 'bergi',
              },
            ],
            vote: 0,
          },
          {
            bodyHtml: "<span>@Bergi this example is just for illustration and mostly borrowed from the docs. Despite this I believe DU pattern suits my real need well and I'd like to find out if there are any options before I start totally destruct my architecture.</span>",
            bodyMd: "@Bergi this example is just for illustration and mostly borrowed from the docs. Despite this I believe DU pattern suits my real need well and I'd like to find out if there are any options before I start totally destruct my architecture.",
            contributors: [
              {
                contributorType: 'commenter',
                isOwner: false,
                timestamp: '2019-01-28 19:34:10Z',
                name: 'WhiteKnight',
                userId: 1237584,
                userSlug: 'whiteknight',
              },
            ],
            vote: 0,
          },
          {
            bodyHtml: '<span>So what you now want to do is use two helper functions <code>area_equilateral</code> and <code>area_other</code>, right?</span>',
            bodyMd: 'So what you now want to do is use two helper functions `area_equilateral` and `area_other`, right?',
            contributors: [
              {
                contributorType: 'commenter',
                isOwner: false,
                timestamp: '2019-01-28 19:39:16Z',
                name: 'Bergi',
                userId: 1048572,
                userSlug: 'bergi',
              },
            ],
            vote: 0,
          },
          {
            bodyHtml: "<span>@Bergi well actually I'd like any solution that will be non the less type-safe than the current one</span>",
            bodyMd: "@Bergi well actually I'd like any solution that will be non the less type-safe than the current one",
            contributors: [
              {
                contributorType: 'commenter',
                isOwner: false,
                timestamp: '2019-01-28 19:43:47Z',
                name: 'WhiteKnight',
                userId: 1237584,
                userSlug: 'whiteknight',
              },
            ],
            vote: 0,
          },
          {
            bodyHtml: "<span>@reify In Haskell at least, you would probably make a hierarchy of nested datatypes (<code>data Shape = E Equilateral | O Other</code>). I don't know how to do the same in TypeScript however</span>",
            bodyMd: "@reify In Haskell at least, you would probably make a hierarchy of nested datatypes (`data Shape = E Equilateral | O Other`). I don't know how to do the same in TypeScript however",
            contributors: [
              {
                contributorType: 'commenter',
                isOwner: false,
                timestamp: '2019-01-28 20:09:04Z',
                name: 'Bergi',
                userId: 1048572,
                userSlug: 'bergi',
              },
            ],
            vote: 1,
          },
        ],
        vote: 6,
      },
      {
        bodyHtml: "<div>\n<p>I just found out (through experimentation, not because it's mentioned in documentation anywhere) that you can indeed build a <em>type hierarchy</em> of discriminated unions using <strong>multiple discriminants</strong>:</p>\n\n<pre data-xlet-lang=\"js\"><code data-highlighted=\"yes\">interface <span>Square</span> {\n    <span>shape_kind</span>: <span>\"equilateral\"</span>;\n    <span>kind</span>: <span>\"square\"</span>;\n    <span>size</span>: number;\n}\ninterface <span>Circle</span> {\n    <span>shape_kind</span>: <span>\"equilateral\"</span>;\n    <span>kind</span>: <span>\"circle\"</span>;\n    <span>radius</span>: number;\n}\ninterface <span>Rectangle</span> {\n    <span>shape_kind</span>: <span>\"rectangle\"</span>;\n    <span>width</span>: number;\n    <span>height</span>: number;\n}\n\ntype <span>Equilateral</span> = <span>Square</span> | <span>Circle</span>\n\ntype <span>Shape</span> = <span>Equilateral</span> | <span>Rectangle</span>;\n\n<span>function</span> <span>area</span>(<span>s: Shape</span>) ",
        bodyMd: "I just found out (through experimentation, not because it's mentioned in documentation anywhere) that you can indeed build a *type hierarchy* of discriminated unions using **multiple discriminants**:\n\n```js\ninterface Square {\n    shape_kind: \"equilateral\";\n    kind: \"square\";\n    size: number;\n}\ninterface Circle {\n    shape_kind: \"equilateral\";\n    kind: \"circle\";\n    radius: number;\n}\ninterface Rectangle {\n    shape_kind: \"rectangle\";\n    width: number;\n    height: number;\n}\n\ntype Equilateral = Square | Circle\n\ntype Shape = Equilateral | Rectangle;\n\nfunction area(s: Shape) {\n    switch (s.shape_kind) { // branch on \"outer\" discriminant\n        case \"equilateral\":\n            // s: Equilateral in here!\n            return area_root(s) ** 2;\n        case \"rectangle\":\n            return s.height * s.width;\n    }\n}\nfunction area_root(e: Equiliteral) {\n    switch (s.kind) { // branch on \"inner\" discriminant\n        case \"square\": return s.size;\n        case \"circle\": return Math.sqrt(Math.",
        contributors: [
          {
            contributorType: 'author',
            isOwner: false,
            timestamp: '2019-01-28 20:25:44Z',
            name: 'Bergi',
            userId: 1048572,
            userSlug: 'bergi',
          },
        ],
        comments: [],
        vote: 7,
      },
    ],
  },
} satisfies SESidecar;
