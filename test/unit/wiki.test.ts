/* eslint-disable no-irregular-whitespace */
import { describe, test } from 'vitest';
import { normalizeWikitext, parseRawIntoSections, toHtml, toMd, WikiNode } from '../../src/wiki.js';
import { el, assertNodeEqual, setupDom, logPandocWtToMd, logPandocHtmlToMd } from '../utils/test-utils.js';
import { deepEqual, strictEqual } from 'node:assert';

setupDom();

void logPandocWtToMd; // appease eslint whining
void logPandocHtmlToMd; // appease eslint whining

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
[![](https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Components_stress_tensor.svg/330px-Components_stress_tensor.svg.png)](/wiki/File:Components_stress_tensor.svg)\n\nThe second-order [](/wiki/Cauchy_stress_tensor)
:::`.trim();
  strictEqual(result!.md, expectedMd);
});

// https://www.mediawiki.org/wiki/Specs/HTML/2.8.0
describe('Extractlet: Parsoid HTML 2.8.0 Spec', () => {
  // wikitext: [[File:Foobar.jpg]]
  test('1', () => {
    const html = `
<span typeof="mw:File" class="mw-default-size">
 <a href="./File:Foobar.jpg" class="mw-file-description">
  <img class="mw-file-element" resource="./File:Foobar.jpg" src="http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg"
       width="1941" height="220">
 </a>
</span>`.trim();
    const expectedMd = '[![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg)';
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
    const expectedMd = '![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)';
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
    const expectedMd = '[![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg)';
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
    const expectedMd = '[![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg "caption")'.trim();
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
    const expectedMd = '[![](http://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg "caption")'.trim();
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
[![](https://example.com/images/e/ea/Thumb.png)](file:///Foobar.jpg)

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
    const expectedMd = '[![](https://upload.wikimedia.org/wikipedia/commons/3/3a/Foobar.jpg)](./File:Foobar.jpg)';
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
[![](https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Foobar.jpg/220px-Foobar.jpg)](file:///Foobar.jpg)
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
[![](https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Foobar.jpg/220px-Foobar.jpg)](file:///Foobar.jpg)
:::`.trim();
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('figure video thumb with poster and caption', () => {
    // wikitext: [[File:Folgers.ogv|thumb|50x50px|right|caption]]
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
    // wikitext: [[File:Folgers.ogv|thumbtime=1:25]]
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

    const expectedMd = '**Poster:** ![Poster](//upload.wikimedia.org/wikipedia/commons/thumb/9/94/Folgers.ogv/seek%3D59-Folgers.ogv.jpg)';

    strictEqual(toMd(el(html)), expectedMd);
  });

  test('video with one fragmented source, poster', () => {
    // wikitext: [[File:Folgers.ogv|start=25|end=45]]
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
    // wikitext: [[File:Continuity proof.ogg]]
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


  test('pdf preview with "page" option', () => {
    // wikitext: [[File:Foobar.pdf|thumb|page=3]]
    const html = `
      <figure class="mw-default-size" typeof="mw:File/Thumb" data-mw='{"page":"3"}'>
          <a href="./File:Foobar.pdf">
              <img class="mw-file-element" resource="./File:Foobar.pdf" src="//upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Foobar.pdf/page3-220px-Foobar.pdf.jpg" height="285" width="220"/>
          </a>
          <figcaption>caption</figcaption>
      </figure>
    `.trim();

    const expectedMd = `
:::figure
[![](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Foobar.pdf/page3-220px-Foobar.pdf.jpg)](./File:Foobar.pdf)

page 3 preview
caption
:::`.trim();

    strictEqual(toMd(el(html)), expectedMd);
  });

  test('figure for missing media with figcaption', () => {
    // wikitext: [[File:This_image_does_not_exist_yet.jpg|thumb|caption]]
    const html = `
      <figure class="mw-default-size" typeof="mw:Error mw:File/Thumb" data-mw='{"errors":[{"key":"apierror-filedoesnotexist","message":"This image does not exist."}]}'>
          <a href="./Special:FilePath/This_image_does_not_exist_yet.jpg">
              <span class="mw-file-element mw-broken-media" resource="./File:This_image_does_not_exist_yet.jpg" data-width="220">File:This image does not exist yet.jpg</span>
          </a>
          <figcaption>caption</figcaption>
      </figure>
    `.trim();

    const expectedMd = `
:::figure
[File:This image does not exist yet.jpg](./Special:FilePath/This_image_does_not_exist_yet.jpg)

caption
:::`.trim();

    strictEqual(toMd(el(html)), expectedMd);
  });

  test('span for missing media with caption', () => {
    // wikitext: [[File:This_image_does_not_exist_yet.jpg|caption]]
    const html = `
      <span class="mw-default-size" typeof="mw:Error mw:File" data-mw='{"caption":"caption","errors":[{"key":"apierror-filedoesnotexist","message":"This image does not exist."}]}'>
        <a href="./Special:FilePath/This_image_does_not_exist_yet.jpg">
          <span class="mw-file-element mw-broken-media" resource="./File:This_image_does_not_exist_yet.jpg">caption</span>
        </a>
      </span>
    `.trim();

    const expectedMd = '[caption](./Special:FilePath/This_image_does_not_exist_yet.jpg)'.trim();

    strictEqual(toMd(el(html)), expectedMd);
  });

  test('span for missing media with alt text', () => {
    // [[File:This_image_does_not_exist_yet.jpg|alt=alt text]]
    const html = `
      <span class="mw-default-size" typeof="mw:Error mw:File" data-mw='{"attribs":[["alt",{"txt":"alt text"}]],"errors":[{"key":"apierror-filedoesnotexist","message":"This image does not exist."}]}'>
        <a href="./Special:FilePath/This_image_does_not_exist_yet.jpg">
          <span class="mw-file-element mw-broken-media" resource="./File:This_image_does_not_exist_yet.jpg">alt text</span>
        </a>
      </span>
    `.trim();

    const expectedMd = '[alt text](./Special:FilePath/This_image_does_not_exist_yet.jpg)';

    strictEqual(toMd(el(html)), expectedMd);
  });

  test('wikilink with alternate text', () => {
    // [[Main Page|alternate linked content]]
    const html = '<a rel="mw:WikiLink" href="./Main_Page">alternate linked content</a>'.trim();
    const expectedMd = '[alternate linked content](./Main_Page)';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('wikilink with identical label', () => {
    // [[Main Page]]
    const html = '<a rel="mw:WikiLink" href="./Main_Page">Main Page</a>'.trim();
    const expectedMd = '[](./Main_Page)';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('wikilink with tail (plural)', () => {
    // [[Potato]]es
    const html = '<a rel="mw:WikiLink" href="./Potato">Potatoes</a>'.trim();
    const expectedMd = '[Potatoes](./Potato)';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('wikilink to non-existing page (red link)', () => {
    // [[Non existing page]]
    const html = '<a href="./Non_existing_page?action=edit&amp;redlink=1" title="Non existing page" rel="mw:WikiLink" class="new" typeof="mw:LocalizedAttrs" data-mw-i18n=\'{"title":{"lang":"x-page","key":"red-link-title","params":["Non existing page"]}}\'>Non existing page</a>'.trim();
    const expectedMd = '[](./Non_existing_page?action=edit&redlink=1)';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('media link with default label', () => {
    // [[Media:Foo.jpg]]
    const html = '<a rel="mw:MediaLink" href="//upload.wikimedia.org/wikipedia/commons/0/06/Foo.jpg" title="Foo.jpg">Media:Foo.jpg</a>'.trim();
    const expectedMd = '[Media:Foo.jpg](https://upload.wikimedia.org/wikipedia/commons/0/06/Foo.jpg)';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('media link with alternate text', () => {
    // [[Media:Foo.jpg|Link text]]
    const html = '<a rel="mw:MediaLink" href="//upload.wikimedia.org/wikipedia/commons/0/06/Foo.jpg" title="Foo.jpg">Link text</a>'.trim();
    const expectedMd = '[Link text](https://upload.wikimedia.org/wikipedia/commons/0/06/Foo.jpg)';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('category link as metadata is not rendered', () => {
    // [[Category:Foo]]
    const html = '<link rel="mw:PageProp/Category" href="./Category:Foo">';
    const expectedMd = '';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('autolinked (free) external URL', () => {
    // http://example.com
    const html = '<a rel="mw:ExtLink" class="external free" href="http://example.com">http://example.com/</a>';
    const expectedMd = '[](http://example.com/)';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('numbered external link (autonumber)', () => {
    // [http://example.com]
    const html = '<a rel="mw:ExtLink" class="external autonumber" href="http://example.com"></a>';
    const expectedMd = '[](http://example.com/)';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('named external link', () => {
    // [http://example.com Link content]
    const html = '<a rel="mw:ExtLink" class="external text" href="http://example.com">Link content</a>';
    const expectedMd = '[Link content](http://example.com/)';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('magic ISBN link', () => {
    // ISBN 978-1413304541
    const html = `
      <a rel="mw:WikiLink" href="./Special:BookSources/9781413304541">
        ISBN 978-1413304541
      </a>
    `.trim();
    const expectedMd = '[ISBN 978-1413304541](./Special:BookSources/9781413304541)';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('magic RFC link', () => {
    // RFC 1945
    const html = `
      <a rel="mw:ExtLink" href="http://tools.ietf.org/html/rfc1945">
        RFC 1945
      </a>
    `.trim();
    const expectedMd = '[RFC 1945](http://tools.ietf.org/html/rfc1945)';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('magic PMID link', () => {
    // PMID 20610307
    const html = `
      <a rel="mw:ExtLink" href="//www.ncbi.nlm.nih.gov/pubmed/20610307?dopt=Abstract">
        PMID 20610307
      </a>
    `.trim();
    const expectedMd = '[PMID 20610307](https://www.ncbi.nlm.nih.gov/pubmed/20610307?dopt=Abstract)';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('nowiki block preserves raw wikitext', () => {
    // <nowiki>[[foo]]</nowiki>
    const html = '<span typeof="mw:Nowiki">[[foo]]</span>';
    const expectedMd = '[[foo]]';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('various mw:Entity spans', () => {
    // const wikiText = '&nbsp; &copy; &lt; &mdash;';
    // logPandocWtToMd(wikiText);
    const html = `<div>
      <span typeof="mw:Entity">&nbsp;</span>
      <span typeof="mw:Entity">&copy;</span>
      <span typeof="mw:Entity">&lt;</span>
      <span typeof="mw:Entity">&mdash;</span>
    </div>`.trim();
    // &nbsp; is ommitted as spacing is always reduced to single space which is trimmed for root
    const expectedMd = '© < —';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('mw:DisplaySpace span with non-breaking space', () => {
    // HTML with mw:DisplaySpace added by Parsoid, not user content
    const html = '<div>Text before<span typeof="mw:DisplaySpace">&nbsp;</span>and after.</div>';
    const expectedMd = 'Text before and after.';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('Parsoid redirect links produce empty markdown', () => {
    // const wikiText = [
    //   '#REDIRECT [[foo]]',
    //   '#REDIRECT [[:Category:Foo]]',
    //   '#REDIRECT [[Category:Foo]]',
    //   '#REDIRECT [[meatball:Foo]]',
    //   '#REDIRECT [[:en:File:Wiki.png]]',
    // ].join('\n');
    // logPandocWtToMd(wikiText);

    const html = `
      <div>
        <link rel="mw:PageProp/redirect" href="./Foo" />
        <link rel="mw:PageProp/redirect" href="./Category:Foo" />
        <link rel="mw:PageProp/redirect" href="http://www.usemod.com/cgi-bin/mb.pl?Foo" />
        <link rel="mw:PageProp/redirect" href="//en.wikipedia.org/wiki/File:Wiki.png" />
      </div>`.trim();

    const expectedMd = '';
    strictEqual(toMd(el(html)), expectedMd);
  });

  test('Parsoid mw:Transclusion with template parameters', () => {
    // const wikiText = '{{foo|unused value|paramname=used value}}';
    // logPandocWtToMd(wikiText);
    const html = `
      <body prefix="mw: http://mediawiki.org/rdf/ mwns10: http://en.wikipedia.org/wiki/Template%58">
        <span typeof="mw:Transclusion" about="#mwt1" data-mw='{"parts": [{"template":{"target":{"wt":"foo","href":"./Template:Foo"},"params":{"1":{"wt":"unused value"},"paramname":{"wt":"used value"}},"i":0}}]}'>
          Some text content
        </span>
        <table about="#mwt1">
          <tr>
            <td>used value</td>
          </tr>
        </table>
      </body>`.trim();
    // logPandocHtmlToMd(html);

    const expectedMd = `
Some text content

|            |
| ---------- |
| used value |
`.trim();

    const resultMd = toMd(el(html, 'body'));
    strictEqual(resultMd, expectedMd);
  });

  test('Parsoid mw:Annotation meta tags are ignored', () => {
    const html = `
<meta typeof="mw:Annotation/translate" data-mw='{"rangeId":"mwa0","extendedRange":false,"wtOffsets":[0,11]}'/>
<p>One paragraph.</p>

<p>And another.
</p><meta typeof="mw:Annotation/translate/End" data-mw='{"wtOffsets":[41,53]}'/>
`.trim();

    const expectedMd = `
One paragraph.

And another.`.trim();

    const resultMd = toMd(el(html, 'body'));
    strictEqual(resultMd, expectedMd);
  });
});

// test('foo', () => {
//   const html = `
// <div>
//   <table>
//     <tbody>
//       <tr>
//         <th scope="col" colspan="2">
//           <button type="button">
//             <span>show</span>
//           </button>
//           <a href="/wiki/Template:Tensors">foo</a>
//         </div>
//         <a>Tensors</a>
//       </th>
//     </tr>
//     <tr hidden="until-found">
//       <td colspan="2">
//         <a href="/wiki/Glossary_of_tensor_theory" title="Glossary of tensor theory">Glossary of tensor theory</a>
//       </td>
//     </tr>
//     <tr hidden="until-found">
//       <th scope="row">Scope</th>
//       <td>
//         <div>foo</div>
//       </td>
//     </tr>
//     <tr hidden="until-found">
//       <th scope="row">Notation</th>
//       <td>
//         <a href="/wiki/Abstract_index_notation" title="Abstract index notation">Abstract index notation</a>
//       </td>
//     </tr>
//     <tr hidden="until-found">
//       <th scope="row">Tensor
//         <br />definitions
//         </th>
//         <td>
//           <a href="/wiki/Tensor_(intrinsic_definition)" title="Tensor (intrinsic definition)">Tensor (intrinsic definition)</a>
//         </td>
//       </tr>
//       <tr hidden="until-found">
//         <th scope="row">
//           <a href="/wiki/Operation_(mathematics)" title="Operation (mathematics)">Operations</a>
//         </th>
//         <td>
//           <a href="/wiki/Covariant_derivative" title="Covariant derivative">Covariant derivative</a>
//         </td>
//       </tr>
//       <tr hidden="until-found">
//         <th scope="row">Related
//           <br />abstractions
//         </th>
//         <td>
//           <a href="/wiki/Affine_connection" title="Affine connection">Affine connection</a>
//         </td>
//       </tr>
//       <tr hidden="until-found">
//         <th scope="row">Notable tensors</th>
//         <td>
//           <div>foo</div>
//         </td>
//       </tr>
//       <tr hidden="until-found">
//         <th scope="row">
//           <a href="/wiki/Mathematician" title="Mathematician">Mathematicians</a>
//         </th>
//         <td>
//           <a href="/wiki/%C3%89lie_Cartan" title="Élie Cartan">Élie Cartan</a>
//         </td>
//       </tr>
//     </tbody>
//   </table>
// </div>
// `.trim();
//   const result = toMd(el(html));
//   // console.log(result);
//   // const expected = 'foo';
//   // assertNodeEqual(result, expected);
// });


// describe('MediaWiki Math rendering', () => {

// test('toHtml of <math>\\alpha</math>', () => {
//   // <math>\alpha</math>
//   const html = `
//     <math class="mwe-math-element mwe-math-element-inline" xmlns="http://www.w3.org/1998/Math/MathML">
//       <mrow data-mjx-texclass="ORD">
//         <mstyle displaystyle="true" scriptlevel="0">
//           <mi>α</mi>
//         </mstyle>
//       </mrow>
//     </math>`.trim();
//   const actual = toHtml(el(html));
//   const expected = `
//     <math xmlns="http://www.w3.org/1998/Math/MathML">
//       <mrow data-mjx-texclass="ORD">
//         <mstyle>
//           <mi>α</mi>
//         </mstyle>
//       </mrow>
//     </math>`.trim();
//   assertNodeEqual(actual, expected);
// });

// test('toMd of math alpha', () => {
//   // <math>\alpha</math>
//   const html = `
//     <math class="mwe-math-element mwe-math-element-inline" xmlns="http://www.w3.org/1998/Math/MathML">
//       <mrow data-mjx-texclass="ORD">
//         <mstyle displaystyle="true" scriptlevel="0">
//           <mi>α</mi>
//         </mstyle>
//       </mrow>
//     </math>`.trim();
//   const actual = toMd(el(html));
//   const expected = '';
//   strictEqual(actual, expected);
// });

//   test('toHtml math var alpha', () => {
//     // {{math|<var>&alpha;</var>}}
//     const html = `<div>
//         <span class="texhtml">
//           <var>α</var>
//         </span></div>`.trim();
//     const actual = toHtml(el(html));
//     const expected = '';
//     strictEqual(actual, expected);
//   });

//   test('toMd math var alpha', () => {
//     // {{math|<var>&alpha;</var>}}
//     const html = `<div>
//         <span class="texhtml">
//           <var>α</var>
//         </span></div>`.trim();
//     const actual = toMd(el(html));
//     const expected = '';
//     strictEqual(actual, expected);
//   });

// });
