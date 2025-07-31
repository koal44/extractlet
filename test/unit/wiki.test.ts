/* eslint-disable no-irregular-whitespace */
import { describe, test } from 'node:test';
import { normalizeWikitext, parseRawIntoSections, toHtml, toMd, WikiNode } from '../../src/wiki.js';
import { el, assertNodeEqual, setupDom } from './test-utils.js';
import { deepEqual, strictEqual } from 'node:assert';

setupDom();

test('normalizeWikitext covers common and edge cases', () => {
  const cases = [
    { wikitext: `'''''bolditalics'''''`,            expected: 'bolditalics' },
    { wikitext: `'''bold'''`,                       expected: 'bold' },
    { wikitext: `''italics''`,                      expected: 'italics' },
    { wikitext: `[[abc]]`,                          expected: 'abc' },
    { wikitext: `[[Tensor|internal link]]`,         expected: 'internal link' },
    { wikitext: `[http://chat.com external link]`,  expected: 'external link' },
    { wikitext: `[[File:Icon-full-32.png|thumb|abc]]`, expected: 'abc' },
    { wikitext: `<ref>reference</ref>`,             expected: '[]' },
    { wikitext: `αβγ`,                              expected: 'αβγ' },
    { wikitext: `* abc`,                            expected: '* abc' },
    { wikitext: `# abc`,                            expected: '# abc' },
    { wikitext: `<code>let foo = 5;</code>`,        expected: 'let foo = 5;' },
    { wikitext: `<big>big man</big>`,               expected: 'big man' },
    { wikitext: `<small>small man</small>`,         expected: 'small man' },
    { wikitext: `<sup>superman</sup>`,              expected: 'superman' },
    { wikitext: `<sub>submarine</sub>`,             expected: 'submarine' },
    { wikitext: `#REDIRECT [[red]]`,                expected: '#REDIRECT red' },
    { wikitext: `<p>hello, world</p>`,              expected: 'hello, world' },
  ];

  for (const { wikitext, expected } of cases) {
    strictEqual(normalizeWikitext(wikitext), expected, `Failed on: ${wikitext}`);
  }
});

test('parseRawIntoSections wikitext with unusual headings', () => {
  const rawText = `
Some intro text.

== '''''bolditalics''''' ==
section 1 content here.

=== '''bold''' ===
section 2. para 1

section 2. para 2

==== ''italics'' ====
[http://www.google.com section 3 link]
section 3 has more than one line.

=== [[abc]] === 
section 4. the heading ends in a space.

== [[Tensor|internal link]] ==  
Section 5 at a higher level. Note the double "==".
It has multiple lines.

=== [http://chat.com external link] ===
<code>Section 6. Computer code</code>
With a code block above.

=== [[File:Icon-full-32.png|thumb|abc]] ===

section 7 has line breaks?

And more content.

=== <ref>reference</ref> ===
Section 8: This heading has only a reference tag.
Additional content for section 8.

==== αβγ ====
Section 9: Heading is pure unicode.

== * abc ==
A list style heading.

=== # abc ===
Heading that looks like a numbered list.

=== <code>let foo = 5;</code> ===
Code as heading.

=== <big>big man</big> ===
Testing big.

==== <small>small man</small> ====
Testing small.

==== <sup>superman</sup> ====
Testing sup.

==== <sub>submarine</sub> ====
Testing sub.

== #REDIRECT [[red]] ==
Section with magic word and link.

=== <p>hello, world</p> ===
Trailing section, HTML in heading.
And some closing content.
`.trim();
  const expectedSections = [
    { level: 1, sectionNum: 0,  title: '', raw: 'Some intro text.' },
    { level: 2, sectionNum: 1,  title: "'''''bolditalics'''''", raw: "== '''''bolditalics''''' ==\nsection 1 content here." },
    { level: 3, sectionNum: 2,  title: "'''bold'''", raw: "=== '''bold''' ===\nsection 2. para 1\n\nsection 2. para 2" },
    { level: 4, sectionNum: 3,  title: "''italics''", raw: "==== ''italics'' ====\n[http://www.google.com section 3 link]\nsection 3 has more than one line." },
    { level: 3, sectionNum: 4,  title: '[[abc]]', raw: '=== [[abc]] === \nsection 4. the heading ends in a space.' },
    { level: 2, sectionNum: 5,  title: '[[Tensor|internal link]]', raw: '== [[Tensor|internal link]] ==  \nSection 5 at a higher level. Note the double "==".\nIt has multiple lines.' },
    { level: 3, sectionNum: 6,  title: '[http://chat.com external link]', raw: '=== [http://chat.com external link] ===\n<code>Section 6. Computer code</code>\nWith a code block above.' },
    { level: 3, sectionNum: 7,  title: '[[File:Icon-full-32.png|thumb|abc]]', raw: '=== [[File:Icon-full-32.png|thumb|abc]] ===\n\nsection 7 has line breaks?\n\nAnd more content.' },
    { level: 3, sectionNum: 8,  title: '<ref>reference</ref>', raw: '=== <ref>reference</ref> ===\nSection 8: This heading has only a reference tag.\nAdditional content for section 8.' },
    { level: 4, sectionNum: 9,  title: 'αβγ', raw: '==== αβγ ====\nSection 9: Heading is pure unicode.' },
    { level: 2, sectionNum: 10, title: '* abc', raw: '== * abc ==\nA list style heading.' },
    { level: 3, sectionNum: 11, title: '# abc', raw: '=== # abc ===\nHeading that looks like a numbered list.' },
    { level: 3, sectionNum: 12, title: '<code>let foo = 5;</code>', raw: '=== <code>let foo = 5;</code> ===\nCode as heading.' },
    { level: 3, sectionNum: 13, title: '<big>big man</big>', raw: '=== <big>big man</big> ===\nTesting big.' },
    { level: 4, sectionNum: 14, title: '<small>small man</small>', raw: '==== <small>small man</small> ====\nTesting small.' },
    { level: 4, sectionNum: 15, title: '<sup>superman</sup>', raw: '==== <sup>superman</sup> ====\nTesting sup.' },
    { level: 4, sectionNum: 16, title: '<sub>submarine</sub>', raw: '==== <sub>submarine</sub> ====\nTesting sub.' },
    { level: 2, sectionNum: 17, title: '#REDIRECT [[red]]', raw: '== #REDIRECT [[red]] ==\nSection with magic word and link.' },
    { level: 3, sectionNum: 18, title: '<p>hello, world</p>', raw: '=== <p>hello, world</p> ===\nTrailing section, HTML in heading.\nAnd some closing content.' },
  ];

  deepEqual(parseRawIntoSections(rawText), expectedSections);
});

test.skip('toHtml Tensor Para1', () => {
  /*A tensor may be represented as a (potentially multidimensional) array. Just as a [[Vector space|vector]] in an {{mvar|n}}-[[dimension (vector space)|dimensional]] space is represented by a [[multidimensional array|one-dimensional]] array with {{mvar|n}} components with respect to a given [[Basis (linear algebra)#Ordered bases and coordinates|basis]], any tensor with respect to a basis is represented by a multidimensional array.  For example, a [[linear operator]] is represented in a basis as a two-dimensional square {{math|''n'' × ''n''}} array.  The numbers in the multidimensional array are known as the ''components'' of the tensor.  They are denoted by indices giving their position in the array, as [[subscript and superscript|subscripts and superscripts]], following the symbolic name of the tensor.  For example, the components of an order-{{math|2}} tensor {{mvar|T}} could be denoted {{math|''T''<sub>''ij''</sub>}} , where {{mvar|i}} and {{mvar|j}} are indices running from {{math|1}} to {{mvar|n}}, or also by {{math|''T''{{thinsp}}{{su|lh=0.8|b=''j''|p=''i''}}}}.  Whether an index is displayed as a superscript or subscript depends on the transformation properties of the tensor, described below. Thus while {{math|''T''<sub>''ij''</sub>}} and {{math|''T''{{thinsp}}{{su|lh=0.8|b=''j''|p=''i''}}}} can both be expressed as ''n''-by-''n'' matrices, and are numerically related via [[Raising and lowering indices|index juggling]], the difference in their transformation laws indicates it would be improper to add them together.*/

  const html = `<p>A tensor may be represented as a (potentially multidimensional) array. Just as a <a href="/wiki/Vector_space" title="Vector space">vector</a> in an <span class="texhtml mvar" style="font-style:italic;">n</span>-<a href="/wiki/Dimension_(vector_space)" title="Dimension (vector space)">dimensional</a> space is represented by a <a href="/wiki/Multidimensional_array" class="mw-redirect" title="Multidimensional array">one-dimensional</a> array with <span class="texhtml mvar" style="font-style:italic;">n</span> components with respect to a given <a href="/wiki/Basis_(linear_algebra)#Ordered_bases_and_coordinates" title="Basis (linear algebra)">basis</a>, any tensor with respect to a basis is represented by a multidimensional array.  For example, a <a href="/wiki/Linear_operator" class="mw-redirect" title="Linear operator">linear operator</a> is represented in a basis as a two-dimensional square <span class="texhtml"><i>n</i> × <i>n</i></span> array.  The numbers in the multidimensional array are known as the <i>components</i> of the tensor.  They are denoted by indices giving their position in the array, as <a href="/wiki/Subscript_and_superscript" title="Subscript and superscript">subscripts and superscripts</a>, following the symbolic name of the tensor.  For example, the components of an order-<span class="texhtml">2</span> tensor <span class="texhtml mvar" style="font-style:italic;">T</span> could be denoted <span class="texhtml"><i>T</i><sub><i>ij</i></sub></span> , where <span class="texhtml mvar" style="font-style:italic;">i</span> and <span class="texhtml mvar" style="font-style:italic;">j</span> are indices running from <span class="texhtml">1</span> to <span class="texhtml mvar" style="font-style:italic;">n</span>, or also by <span class="texhtml"><i>T</i><span style="white-space: nowrap;"> </span><span class="nowrap"><span style="display:inline-block;margin-bottom:-0.3em;vertical-align:-0.4em;line-height:0.8;font-size:80%;text-align:left"><sup style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>i</i></sup><br><sub style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>j</i></sub></span></span></span>.  Whether an index is displayed as a superscript or subscript depends on the transformation properties of the tensor, described below. Thus while <span class="texhtml"><i>T</i><sub><i>ij</i></sub></span> and <span class="texhtml"><i>T</i><span style="white-space: nowrap;"> </span><span class="nowrap"><span style="display:inline-block;margin-bottom:-0.3em;vertical-align:-0.4em;line-height:0.8;font-size:80%;text-align:left"><sup style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>i</i></sup><br><sub style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>j</i></sub></span></span></span> can both be expressed as <i>n</i>-by-<i>n</i> matrices, and are numerically related via <a href="/wiki/Raising_and_lowering_indices" class="mw-redirect" title="Raising and lowering indices">index juggling</a>, the difference in their transformation laws indicates it would be improper to add them together.
</p>`;
  const result = toHtml(el(html));
  const expected = '';
  assertNodeEqual(result, expected);
});

test('toHtml Tensor Para1 Sentence1', () => {
  // WikiText:
  // A tensor may be represented as a (potentially multidimensional) array. Just as a [[Vector space|vector]] in an {{mvar|n}}-[[dimension (vector space)|dimensional]] space is represented by a [[multidimensional array|one-dimensional]] array with {{mvar|n}} components with respect to a given [[Basis (linear algebra)#Ordered bases and coordinates|basis]], any tensor with respect to a basis is represented by a multidimensional array.

  // HTML for first sentence:
  const html = '<p>A tensor may be represented as a (potentially multidimensional) array.</p>';
  
  // For initial sanity, just check roundtrip basic content.
  const result = toHtml(el(html));
  // Adjust as needed: your expected could be the same string or a normalized version.
  const expected = '<p>A tensor may be represented as a (potentially multidimensional) array.</p>';
  assertNodeEqual(result, expected);
});

test.skip('toHtml Tensor Para1 Sentence2', () => {
  // WikiText:
  // Just as a [[Vector space|vector]] in an {{mvar|n}}-[[dimension (vector space)|dimensional]] space is represented by a [[multidimensional array|one-dimensional]] array with {{mvar|n}} components with respect to a given [[Basis (linear algebra)#Ordered bases and coordinates|basis]], any tensor with respect to a basis is represented by a multidimensional array.

  const html = '<p>Just as a <a href="/wiki/Vector_space" title="Vector space">vector</a> in an <span class="texhtml mvar" style="font-style:italic;">n</span>-<a href="/wiki/Dimension_(vector_space)" title="Dimension (vector space)">dimensional</a> space is represented by a <a href="/wiki/Multidimensional_array" class="mw-redirect" title="Multidimensional array">one-dimensional</a> array with <span class="texhtml mvar" style="font-style:italic;">n</span> components with respect to a given <a href="/wiki/Basis_(linear_algebra)#Ordered_bases_and_coordinates" title="Basis (linear algebra)">basis</a>, any tensor with respect to a basis is represented by a multidimensional array.</p>';

  const result = toHtml(el(html));
  const expected = html;
  assertNodeEqual(result, expected);
});

test('toHtml Tensor Para1 Sentence2a', () => {
  // WikiText:
  // Just as a [[Vector space|vector]] in

  const html = '<p>Just as a <a href="/wiki/Vector_space" title="Vector space">vector</a> in</p>';

  const result = toHtml(el(html));
  const expected = '<p>Just as a <a href="/wiki/Vector_space" title="Vector space">vector</a> in</p>';
  assertNodeEqual(result, expected);
});

test('toHtml Tensor Para1 Sentence2b', () => {
  // WikiText:
  // an {{mvar|n}}-[[dimension (vector space)|dimensional]] space.

  const html = '<p>an <span class="texhtml mvar" style="font-style:italic;">n</span>-<a href="/wiki/Dimension_(vector_space)" title="Dimension (vector space)">dimensional</a> space</p>';

  const result = toHtml(el(html));
  const expected = '<p>an <span class="mvar texhtml">n</span>-<a href="/wiki/Dimension_(vector_space)" title="Dimension (vector space)">dimensional</a> space</p>';
  assertNodeEqual(result, expected);
});

test('toHtml Tensor Para1 Sentence2c', () => {
  // WikiText:
  // is represented by a [[multidimensional array|one-dimensional]] array with {{mvar|n}} components with respect

  const html = '<p>is represented by a <a href="/wiki/Multidimensional_array" class="mw-redirect" title="Multidimensional array">one-dimensional</a> array with <span class="texhtml mvar" style="font-style:italic;">n</span> components with respect</p>';

  const result = toHtml(el(html));
  const expected = '<p>is represented by a <a href="/wiki/Multidimensional_array" title="Multidimensional array">one-dimensional</a> array with <span class="mvar texhtml">n</span> components with respect</p>';
  assertNodeEqual(result, expected);
});

test('toHtml Tensor Para1 Sentence2d', () => {
  // WikiText:
  // to a given [[Basis (linear algebra)#Ordered bases and coordinates|basis]], any tensor with respect to a basis is represented by a multidimensional array.

  const html = '<p>to a given <a href="/wiki/Basis_(linear_algebra)#Ordered_bases_and_coordinates" title="Basis (linear algebra)">basis</a>, any tensor with respect to a basis is represented by a multidimensional array.</p>';

  const result = toHtml(el(html));
  const expected = '<p>to a given <a href="/wiki/Basis_(linear_algebra)#Ordered_bases_and_coordinates" title="Basis (linear algebra)">basis</a>, any tensor with respect to a basis is represented by a multidimensional array.</p>';
  assertNodeEqual(result, expected);
});

test('toHtml Tensor Para1 Sentence3', () => {
  // WikiText:
  // For example, a [[linear operator]] is represented in a basis as a two-dimensional square {{math|''n'' × ''n''}} array.

  const html = '<p>For example, a <a href="/wiki/Linear_operator" class="mw-redirect" title="Linear operator">linear operator</a> is represented in a basis as a two-dimensional square <span class="texhtml"><i>n</i> × <i>n</i></span> array.</p>';

  const result = toHtml(el(html));
  const expected = '<p>For example, a <a href="/wiki/Linear_operator" title="Linear operator">linear operator</a> is represented in a basis as a two-dimensional square <span class="texhtml"><i>n</i> × <i>n</i></span> array.</p>';
  assertNodeEqual(result, expected);
});

test('toHtml Tensor Para1 Sentence4', () => {
  // WikiText:
  // For example, the components of an order-{{math|2}} tensor {{mvar|T}} could be denoted {{math|''T''<sub>''ij''</sub>}} , where {{mvar|i}} and {{mvar|j}} are indices running from {{math|1}} to {{mvar|n}}, or also by {{math|''T''{{thinsp}}{{su|lh=0.8|b=''j''|p=''i''}}}}.

  const html = '<p>For example, the components of an order-<span class="texhtml">2</span> tensor <span class="texhtml mvar" style="font-style:italic;">T</span> could be denoted <span class="texhtml"><i>T</i><sub><i>ij</i></sub></span> , where <span class="texhtml mvar" style="font-style:italic;">i</span> and <span class="texhtml mvar" style="font-style:italic;">j</span> are indices running from <span class="texhtml">1</span> to <span class="texhtml mvar" style="font-style:italic;">n</span>, or also by <span class="texhtml"><i>T</i><span style="white-space: nowrap;"> </span><span class="nowrap"><span style="display:inline-block;margin-bottom:-0.3em;vertical-align:-0.4em;line-height:0.8;font-size:80%;text-align:left"><sup style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>i</i></sup><br><sub style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>j</i></sub></span></span></span>.</p>';

  const expected = '<p>For example, the components of an order-<span class="texhtml">2</span> tensor <span class="mvar texhtml">T</span> could be denoted <span class="texhtml"><i>T</i><sub><i>ij</i></sub></span> , where <span class="mvar texhtml">i</span> and <span class="mvar texhtml">j</span> are indices running from <span class="texhtml">1</span> to <span class="mvar texhtml">n</span>, or also by <span class="texhtml"><i>T</i><span style="white-space: nowrap;"> </span><span><span style="display:inline-block;margin-bottom:-0.3em;vertical-align:-0.4em;line-height:0.8;font-size:80%;text-align:left"><sup style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>i</i></sup><br><sub style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>j</i></sub></span></span></span>.</p>';

  assertNodeEqual(toHtml(el(html)), el(expected));
});

test('toHtml strips meta', () => {
  const html = '<div>foo<meta property="mw:pageProp/toc">bar</div>';
  const result = toHtml(el(html));
  const expected = '<div>foobar</div>';
  assertNodeEqual(result, expected);
});

test('toHtml strips style', () => {
  const html = '<div>foo<style>.a{}</style>bar</div>';
  const result = toHtml(el(html));
  const expected = '<div>foobar</div>';
  assertNodeEqual(result, expected);
});

test('toHtml strips link', () => {
  const html = '<div>foo<link rel="stylesheet" href="foo.css">bar</div>';
  const result = toHtml(el(html));
  const expected = '<div>foobar</div>';
  assertNodeEqual(result, expected);
});

test('toHtml strips display none', () => {
  const html = '<div>foo<div style="display:none">baz</div>bar</div>';
  const result = toHtml(el(html));
  const expected = '<div>foobar</div>';
  assertNodeEqual(result, expected);
});

test('toMd converts anchor to markdown', () => {
  const html = '<a href="foo" title="bar">baz</a>';
  const result = toMd(el(html));
  const expected = '[baz](foo "bar")';
  strictEqual(result, expected);
});

test('toMd converts img to markdown', () => {
  const html = '<img src="pic.jpg" alt="my alt">';
  const result = toMd(el(html));
  const expected = '![my alt](pic.jpg)';
  strictEqual(result, expected);
});

test('toMd tensor preamble', () => {
  const html = `
<div class="wikinode-section-content">
  <div>For other uses, see <a href="https://en.wikipedia.org/wiki/Tensor_(disambiguation)">Tensor (disambiguation)</a>.
  </div>
  <div>Not to be confused with <a href="https://en.wikipedia.org/wiki/Vector_field">Vector field</a> or <a href="https://en.wikipedia.org/wiki/Tensor_field">Tensor field</a>.
  </div>
</div>`.trim();
  const result = toMd(el(html));
  const expected = `
For other uses, see [](https://en.wikipedia.org/wiki/Tensor_(disambiguation)).

Not to be confused with [](https://en.wikipedia.org/wiki/Vector_field) or [](https://en.wikipedia.org/wiki/Tensor_field).
`.trim();
  strictEqual(result, expected);
});

test('WikiNode.buildFromHTML produces double linefeeds between top-level children', () => {
  const html = `
  <main id="content" class="mw-body">
    <header>
      <h1 id="firstHeading" class="firstHeading mw-first-heading">
        <span class="mw-page-title-main">Tensor</span>
      </h1>
    </header>
    <div id="bodyContent">
      <div id="mw-content-text" class="mw-body-content">
        <div class="mw-content-ltr mw-parser-output" lang="en" dir="ltr">
          <div class="shortdescription nomobile noexcerpt noprint searchaux" style="display:none">Algebraic object with geometric applications</div>
          <style data-mw-deduplicate="TemplateStyles:r1236090951">.mw-parser-output .hatnote{font-style:italic}</style>
          <div role="note" class="hatnote navigation-not-searchable">For other uses, see <a href="/wiki/Tensor_(disambiguation)" class="mw-disambig" title="Tensor (disambiguation)">Tensor (disambiguation)</a>.</div>
          <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1236090951">
          <div role="note" class="hatnote navigation-not-searchable">This article is about tensors on a single vector space and is not to be confused with <a href="/wiki/Vector_field" title="Vector field">Vector field</a> or <a href="/wiki/Tensor_field" title="Tensor field">Tensor field</a>.</div>
          <figure class="mw-halign-right" typeof="mw:File/Thumb"><a href="/wiki/File:Components_stress_tensor.svg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/4/45/Components_stress_tensor.svg/330px-Components_stress_tensor.svg.png" decoding="async" width="300" height="274" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/4/45/Components_stress_tensor.svg/450px-Components_stress_tensor.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/4/45/Components_stress_tensor.svg/600px-Components_stress_tensor.svg.png 2x" data-file-width="340" data-file-height="310"></a><figcaption>The second-order <a href="/wiki/Cauchy_stress_tensor" title="Cauchy stress tensor">Cauchy stress tensor</a></figcaption></figure>
        </div>
      </div>
    </div>
  </div>
</main>`.trim();
  const htmlEl = el(html) as HTMLDivElement;
  const result = WikiNode.buildFromHTML(htmlEl);
  const expectedMd = `
For other uses, see [](/wiki/Tensor_(disambiguation)).

This article is about tensors on a single vector space and is not to be confused with [](/wiki/Vector_field) or [](/wiki/Tensor_field).

:::figure
[![](//upload.wikimedia.org/wikipedia/commons/thumb/4/45/Components_stress_tensor.svg/330px-Components_stress_tensor.svg.png)](/wiki/File:Components_stress_tensor.svg)\n\nThe second-order [](/wiki/Cauchy_stress_tensor)
:::`.trim();
  strictEqual(result!.md, expectedMd);
});

// Test suite: mediawiki.org / spec/HTML 2.8.0 / image cases
describe('Extractlet: Parsoid HTML 2.8.0 Image Handling', () => {
  // wikitext: [[File:Foobar.jpg]]
  test('1', () => {
    const html = `
<span typeof="mw:File" class="mw-default-size">
 <a href="./File:Foobar.jpg" class="mw-file-description">
  <img class="mw-file-element" resource="./File:Foobar.jpg" src="http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg"
       width="1941" height="220">
 </a>
</span>`.trim();
    const expectedMd = `[![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg)`;
    strictEqual(toMd(el(html)), expectedMd);
  });

  // wikitext: [[File:Foo.jpg|link=]]
  test('inline image no link', () => {
    const html = `
<span typeof="mw:File" class="mw-default-size">
 <span>
  <img class="mw-file-element" resource="./File:Foobar.jpg" src="http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg"
       width="1941" height="220">
 </span>
</span>`.trim();
    const expectedMd = `![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)`;
    strictEqual(toMd(el(html)), expectedMd);
  });

  // wikitext: [[File:Foo.jpg|left|<p>caption</p>]]
  test('figure with caption', () => {
    const html = `
<figure typeof="mw:File" class="mw-default-size">
 <a href="./File:Foo.jpg" class="mw-file-description" title="caption">
  <img class="mw-file-element" alt="caption" resource="./File:Foo.jpg" src="http://upload.wikimedia.org/wikipedia/commons/3/3a/Foo.jpg"
       width="1941" height="220">
 </a>
 <figcaption><p>caption</p></figcaption>
</figure>`.trim();
    const expectedMd = `
:::figure
[![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foo.jpg)](./File:Foo.jpg)

caption
:::`.trim();
    strictEqual(toMd(el(html)), expectedMd);
  });

  // wikitext: [[File:Foobar.jpg|50px|middle]]
  test('inline image with 50px width, vertical align', () => {
    const html = `
<span typeof="mw:File" class="mw-valign-middle">
 <a href="./File:Foobar.jpg" class="mw-file-description">
  <img class="mw-file-element" resource="./File:Foobar.jpg" src="http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg"
       width="50" height="6">
 </a>
</span>`.trim();
    const expectedMd = `[![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg)`;
    strictEqual(toMd(el(html)), expectedMd);
  });

  // wikitext: [[File:Foobar.jpg|500x10px|baseline|cap<div></div>tion]]
  test('figure with disallowed caption', () => {
    const html = `
<span typeof="mw:File" class="mw-valign-baseline"
    data-mw='{"caption":"cap<div></div>tion"}'>
 <a href="./File:Foobar.jpg" class="mw-file-description" title="caption">
  <img class="mw-file-element" alt="caption" resource="./File:Foobar.jpg" src="http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg"
       width="89" height="10">
 </a>
</span>`.trim();
    const expectedMd = `[![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg "caption")`.trim();
    strictEqual(toMd(el(html)), expectedMd);
  });

  // wikitext: [[File:Foobar.jpg|50px|border|caption]]
  test('inline image with border and caption', () => {
    const html = `
<span typeof="mw:File" class="mw-image-border" data-mw='{"caption":"caption"}'>
 <a href="./File:Foobar.jpg" class="mw-file-description" title="caption">
  <img class="mw-file-element" alt="caption" resource="./File:Foobar.jpg" src="http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg"
       width="50" height="6">
 </a>
</span>`.trim();
    const expectedMd = `[![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg "caption")`.trim();
    strictEqual(toMd(el(html)), expectedMd);
  });

  // wikitext: [[File:Foobar.jpg|thumb|left|caption content]]
  test('figure thumb left aligned with caption', () => {
    const html = `
<figure typeof="mw:File/Thumb" 
  class="mw-halign-left mw-default-size">
   <a href="./File:Foobar.jpg" class="mw-file-description">
     <img class="mw-file-element" src="http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg" width="180" height="20" 
        resource="./File:Foobar.jpg" />
   </a>
   <figcaption>caption content</figcaption>
</figure>`.trim();
    const expectedMd = `
:::figure
[![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg)

caption content
:::`.trim();
    strictEqual(toMd(el(html)), expectedMd);
  });

  // wikitext: [[File:Foobar.jpg|thumb|50x50px|right|caption]]
  test('figure thumb right aligned, scaled, with caption', () => {
    const html = `
<figure typeof="mw:File/Thumb" class="mw-halign-right">
   <a href="./File:Foobar.jpg" class="mw-file-description">
     <img class="mw-file-element" src="http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg" width="50" height="6" 
        resource="./File:Foobar.jpg" />
   </a>
   <figcaption>caption</figcaption>
</figure>`.trim();
    const expectedMd = `
:::figure
[![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg)

caption
:::`.trim();
    strictEqual(toMd(el(html)), expectedMd);
  });

  // wikitext: [[File:Foobar.jpg|frame|caption]]
  test('figure frame with caption', () => {
    const html = `
<figure typeof="mw:File/Frame" class="mw-default-size">
   <a href="./File:Foobar.jpg" class="mw-file-description">
     <img class="mw-file-element" src="http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg" width="1941" height="220" 
        resource="./File:Foo.jpg" />
   </a>
   <figcaption>caption</figcaption>
</figure>`.trim();
    const expectedMd = `
:::figure
[![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg)

caption
:::`.trim();
    strictEqual(toMd(el(html)), expectedMd);
  });

  // wikitext: [[File:Foobar.jpg|500x50px|frame|left|caption]]
  test('figure frame left aligned, scaled, with caption', () => {
    const html = `
<figure typeof="mw:File/Frame" class="mw-halign-left">
   <a href="./File:Foobar.jpg" class="mw-file-description">
     <img class="mw-file-element" src="http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg" width="442" height="50" 
        resource="./File:Foo.jpg" />
   </a>
   <figcaption>caption</figcaption>
</figure>`.trim();
    const expectedMd = `
:::figure
[![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg)

caption
:::`.trim();
    strictEqual(toMd(el(html)), expectedMd);
  });

  // wikitext: [[File:Foobar.jpg|frameless|500x50px|caption]]
  test('figure frameless, scaled, with caption', () => {
    const html = `
<figure typeof="mw:File/Frameless">
   <a href="./File:Foobar.jpg" class="mw-file-description" title="caption">
     <img class="mw-file-element" alt="caption" src="http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg" width="442" height="50" 
        resource="./File:Foobar.jpg" />
   </a>
   <figcaption>caption</figcaption>
</figure>`.trim();
    const expectedMd = `
:::figure
[![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg)

caption
:::`.trim();
    strictEqual(toMd(el(html)), expectedMd);
  });

  // wikitext: [[File:Foobar.jpg|frameless|500x50px|border|caption]]
  test('figure frameless, scaled, with border and caption', () => {
    const html = `
<figure typeof="mw:File/Frameless" class="mw-image-border">
   <a href="./File:Foobar.jpg" class="mw-file-description" title="caption">
     <img class="mw-file-element" alt="caption" src="http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg" width="442" height="50" 
        resource="./File:Foobar.jpg" />
   </a>
   <figcaption>caption</figcaption>
</figure>`.trim();
    const expectedMd = `
:::figure
[![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg)

caption
:::`.trim();
    strictEqual(toMd(el(html)), expectedMd);
  });

  // wikitext: [[File:Foobar.jpg|thumb=Thumb.png|Title]]
  test('figure thumb with manual thumbnail and caption', () => {
    const html = `
<figure class="mw-default-size" typeof="mw:File/Thumb" data-mw='{"thumb":"Thumb.png"}'>
  <a href="File:Foobar.jpg" class="mw-file-description">
    <img class="mw-file-element" src="//example.com/images/e/ea/Thumb.png" height="135" width="135"
         resource="./File:Foobar.jpg" />
  </a>
  <figcaption>Title</figcaption>
</figure>`.trim();
    const expectedMd = `
:::figure
[![](//example.com/images/e/ea/Thumb.png)](file:///Foobar.jpg)

Title
:::`.trim();
    strictEqual(toMd(el(html)), expectedMd);
  });

  // wikitext: [[File:Foobar.jpg|scale=0.5]]
  test('inline image scaled by 0.5', () => {
    const html = `
<span typeof="mw:File" class="mw-default-size" data-mw='{"scale":0.5}'>
 <a href="./File:Foobar.jpg" class="mw-file-description">
  <img class="mw-file-element" resource="./File:Foobar.jpg" src="//upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg"
       width="971" height="110">
 </a>
</span>`.trim();
    const expectedMd = `[![](//upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg)`;
    strictEqual(toMd(el(html)), expectedMd);
  });

  // wikitext: [[File:Foobar.jpg|thumb|scale=1]]
  test('figure thumb, scaled to 1, empty caption', () => {
    const html = `
<figure class="mw-default-size" typeof="mw:File/Thumb" data-mw='{"scale":1}'>
  <a href="File:Foobar.jpg" class="mw-file-description">
    <img class="mw-file-element" src="//upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Foobar.jpg/220px-Foobar.jpg"
         height="26" width="220" resource="./File:Foobar.jpg" />
  </a>
  <figcaption></figcaption>
</figure>`.trim();
    const expectedMd = `
:::figure
[![](//upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Foobar.jpg/220px-Foobar.jpg)](file:///Foobar.jpg)
:::`.trim();
    strictEqual(toMd(el(html)), expectedMd);
  });

  // wikitext: [[File:Foobar.jpg|thumb|upright=1]]
  test('figure thumb with upright scaling, empty caption', () => {
    const html = `
<figure class="mw-default-size" typeof="mw:File/Thumb" data-mw='{"scale":1}'>
  <a href="File:Foobar.jpg" class="mw-file-description">
    <img class="mw-file-element" src="//upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Foobar.jpg/220px-Foobar.jpg"
         height="26" width="220" resource="./File:Foobar.jpg" />
  </a>
  <figcaption></figcaption>
</figure>`.trim();
    const expectedMd = `
:::figure
[![](//upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Foobar.jpg/220px-Foobar.jpg)](file:///Foobar.jpg)
:::`.trim();
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('figure video thumb with poster and caption', () => {
    const html = `
<figure class="mw-halign-right" typeof="mw:File/Thumb">
  <span>
    <video class="mw-file-element" poster="//upload.wikimedia.org/wikipedia/commons/thumb/9/94/Folgers.ogv/50px--Folgers.ogv.jpg"
            controls=""
            preload="none"
            height="38"
            width="50"
            resource="./File:Folgers.ogv">
      <source src="https://upload.wikimedia.org/wikipedia/commons/9/94/Folgers.ogv"
              type='video/ogg; codecs="theora, vorbis"'
              data-file-width="352"
              data-file-height="264"
              data-title="Original Ogg file, 352 × 264 (637 kbps)"
              data-shorttitle="Ogg source"/>
      <source src="https://upload.wikimedia.org/wikipedia/commons/transcoded/9/94/Folgers.ogv/Folgers.ogv.160p.webm"
              type='video/webm; codecs="vp8, vorbis"'
              data-width="214"
              data-height="160"
              data-title="Low bandwidth WebM (160P)"
              data-shorttitle="WebM 160P"/>
      <track kind="subtitles"
              type="text/x-srt"
              src="https://commons.wikimedia.org/w/index.php?title=TimedText:Folgers.ogv.de.srt&amp;action=raw&amp;ctype=text%2Fx-srt"
              srclang="de"
              label="Deutsch (de) subtitles"
              data-mwtitle="TimedText:Folgers.ogv.de.srt"
              data-dir="ltr"/>
    </video>
  </span>
  <figcaption>caption</figcaption>
</figure>`.trim();

    const expectedMd = `
:::figure
**Video sources:**
- [Ogg source](https://upload.wikimedia.org/wikipedia/commons/9/94/Folgers.ogv)
- [WebM 160P](https://upload.wikimedia.org/wikipedia/commons/transcoded/9/94/Folgers.ogv/Folgers.ogv.160p.webm)

**Poster:** ![Poster](//upload.wikimedia.org/wikipedia/commons/thumb/9/94/Folgers.ogv/50px--Folgers.ogv.jpg)

**Subtitles:**
- [Deutsch (de) subtitles](https://commons.wikimedia.org/w/index.php?title=TimedText:Folgers.ogv.de.srt&action=raw&ctype=text%2Fx-srt)

caption
:::`.trim();

    strictEqual(toMd(el(html)), expectedMd);
  });

  test('video with poster only (thumbtime, no sources/tracks)', () => {
    const html = `
<span class="mw-default-size" typeof="mw:File" data-mw='{"thumbtime":"1:25"}'>
  <span>
    <video class="mw-file-element" poster="//upload.wikimedia.org/wikipedia/commons/thumb/9/94/Folgers.ogv/seek%3D59-Folgers.ogv.jpg"
           controls=""
           preload="none"
           height="264"
           width="352"
           resource="./File:Folgers.ogv">
      <!-- No <source>, no <track> -->
    </video>
  </span>
</span>`.trim();

    const expectedMd = `**Poster:** ![Poster](//upload.wikimedia.org/wikipedia/commons/thumb/9/94/Folgers.ogv/seek%3D59-Folgers.ogv.jpg)`;

    strictEqual(toMd(el(html)), expectedMd);
  });

  test('video with one fragmented source, poster', () => {
    const html = `
<span class="mw-default-size" typeof="mw:File" data-mw='{"starttime":"25","endtime":"45"}'>
  <span>
    <video class="mw-file-element" poster="//upload.wikimedia.org/wikipedia/commons/thumb/9/94/Folgers.ogv/seek%3D25-Folgers.ogv.jpg"
           controls=""
           preload="none"
           height="264"
           width="352"
           resource="./File:Folgers.ogv">
      <source src="https://upload.wikimedia.org/wikipedia/commons/9/94/Folgers.ogv#t=25,45"
              type='video/ogg; codecs="theora, vorbis"'
              data-file-width="352"
              data-file-height="264"
              data-title="Original Ogg file, 352 × 264 (637 kbps)"
              data-shorttitle="Ogg source"/>
    </video>
  </span>
</span>`.trim();

    const expectedMd = `
**Video sources:**
- [Ogg source](https://upload.wikimedia.org/wikipedia/commons/9/94/Folgers.ogv#t=25,45)

**Poster:** ![Poster](//upload.wikimedia.org/wikipedia/commons/thumb/9/94/Folgers.ogv/seek%3D25-Folgers.ogv.jpg)
`.trim();

  // Single source (with #t= fragment), poster, no tracks.
    strictEqual(toMd(el(html)), expectedMd);

  });

  test('audio with one source, no poster', () => {
    const html = `
      <span class="mw-default-size mw-default-audio-height" typeof="mw:File">
        <span>
          <audio class="mw-file-element" controls=""
                preload="none"
                height="20"
                width="220"
                resource="./File:Continuity_proof.ogg">
            <source src="https://upload.wikimedia.org/wikipedia/commons/4/4d/Continuity_proof.ogg"
                    type='audio/ogg; codecs="vorbis"'
                    data-title="Original Ogg file (25 kbps)"
                    data-shorttitle="Ogg source"/>
          </audio>
        </span>
      </span>`.trim();

    const expectedMd = `
**Audio sources:**
- [Ogg source](https://upload.wikimedia.org/wikipedia/commons/4/4d/Continuity_proof.ogg)
`.trim();

    // Single audio source, no poster, no tracks.
    strictEqual(toMd(el(html)), expectedMd);
  });

});

