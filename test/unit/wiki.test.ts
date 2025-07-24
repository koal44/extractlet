/* eslint-disable no-irregular-whitespace */
import { test } from 'node:test';
import { normalizeWikitext, parseRawIntoSections, toHtml } from '../../src/wiki.js';
import { el, assertNodeEqual, setupDom } from './test-utils.js';
import { deepEqual, strictEqual } from 'node:assert';

setupDom();


test('foo', () => {
// === '''''bolditalics''''' ===
// === '''bold''' ===
// === ''italics'' ===
// === [[abc]] ===
// === [[Tensor|internal link]] ===
// === [http://chat.com external link] ===
// === [[File:Icon-full-32.png|thumb|abc]] ===
// === <ref>reference</ref> ===
// === αβγ ===
// === * abc ===
// === # abc ===
// === <code>let foo = 5;</code> ===
// === <big>big man</big> ===
// === <small>small man</small> ===
// === <sup>superman</sup> ===
// === <sub>submarine</sub> ===
// === #REDIRECT [[red]] ===
// === <p>hello, world</p> ===


// <div class="mw-content-ltr mw-parser-output" lang="en" dir="ltr"><meta property="mw:PageProp/toc">
// <div class="mw-heading mw-heading3"><h3 id="bolditalics"><i><b>bolditalics</b></i></h3></div>
// <div class="mw-heading mw-heading3"><h3 id="bold"><b>bold</b></h3></div>
// <div class="mw-heading mw-heading3"><h3 id="italics"><i>italics</i></h3></div>
// <div class="mw-heading mw-heading3"><h3 id="abc"><a href="/wiki/Abc" class="mw-redirect mw-disambig" title="Abc">abc</a></h3></div>
// <div class="mw-heading mw-heading3"><h3 id="internal_link"><a href="/wiki/Tensor" title="Tensor">internal link</a></h3></div>
// <div class="mw-heading mw-heading3"><h3 id="external_link"><a rel="nofollow" class="external text" href="http://chat.com">external link</a></h3></div>
// <div class="mw-heading mw-heading3"><h3 id="abc_2"><figure class="mw-default-size" typeof="mw:File/Thumb"><a href="/wiki/File:Icon-full-32.png" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/d/d7/Icon-full-32.png" decoding="async" width="32" height="32" class="mw-file-element" data-file-width="32" data-file-height="32"></a><figcaption>abc</figcaption></figure></h3></div>
// <div class="mw-heading mw-heading3"><h3 id="[1]"><span id=".5B1.5D"></span><sup id="cite_ref-1" class="reference"><a href="#cite_note-1"><span class="cite-bracket">[</span>1<span class="cite-bracket">]</span></a></sup></h3></div>
// <div class="mw-heading mw-heading3"><h3 id="αβγ"><span id=".CE.B1.CE.B2.CE.B3"></span>αβγ</h3></div>
// <div class="mw-heading mw-heading3"><h3 id="*_abc"><span id=".2A_abc"></span>* abc</h3></div>
// <div class="mw-heading mw-heading3"><h3 id="#_abc"><span id=".23_abc"></span># abc</h3></div>
// <div class="mw-heading mw-heading3"><h3 id="let_foo_=_5;"><span id="let_foo_.3D_5.3B"></span><code>let foo = 5;</code></h3></div>
// <div class="mw-heading mw-heading3"><h3 id="big_man"><big>big man</big></h3></div>
// <div class="mw-heading mw-heading3"><h3 id="small_man"><small>small man</small></h3></div>
// <div class="mw-heading mw-heading3"><h3 id="superman"><sup>superman</sup></h3></div>
// <div class="mw-heading mw-heading3"><h3 id="submarine"><sub>submarine</sub></h3></div>
// <div class="mw-heading mw-heading3"><h3 id="#REDIRECT_red"><span id=".23REDIRECT_red"></span>#REDIRECT <a href="/wiki/Red" title="Red">red</a></h3></div>
// <div class="mw-heading mw-heading3"><h3 id="hello,_world"><span id="hello.2C_world"></span><p>hello, world</p></h3></div>
// <div class="mw-references-wrap"><ol class="references">
// <li id="cite_note-1"><span class="mw-cite-backlink"><b><a href="#cite_ref-1" aria-label="Jump up" title="Jump up">^</a></b></span> <span class="reference-text">reference</span>
// </li>
// </ol></div>
// </div>

// ((temp0) => {

// let arr = [...temp0.querySelectorAll('.mw-heading h2, .mw-heading h3, .mw-heading h4, .mw-heading h5, .mw-heading h6')]
//   .map(h => h.textContent.trim());
// console.log(arr.join('\n'));
// })(temp1);

// bolditalics
// bold
// italics
// abc
// internal link
// external link
// abc
// [1]
// αβγ
// * abc
// # abc
// let foo = 5;
// big man
// small man
// superman
// submarine
// #REDIRECT red
// hello, world

// '''''bolditalics''''' 
// '''bold''' 
// ''italics'' 
// [[abc]] 
// [[Tensor|internal link]] 
// [http://chat.com external link] 
// [[File:Icon-full-32.png|thumb|abc]] 
// <ref>reference</ref> 
// αβγ 
// * abc 
// # abc 
// <code>let foo = 5;</code> 
// <big>big man</big> 
// <small>small man</small> 
// <sup>superman</sup> 
// <sub>submarine</sub> 
// #REDIRECT [[red]] 
// <p>hello, world</p> 
});

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

test('parseRawIntoSections_wikitext_with_unusual_headings', () => {
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

test.skip('toHtml_Tensor_Para1', () => {
  /*A tensor may be represented as a (potentially multidimensional) array. Just as a [[Vector space|vector]] in an {{mvar|n}}-[[dimension (vector space)|dimensional]] space is represented by a [[multidimensional array|one-dimensional]] array with {{mvar|n}} components with respect to a given [[Basis (linear algebra)#Ordered bases and coordinates|basis]], any tensor with respect to a basis is represented by a multidimensional array.  For example, a [[linear operator]] is represented in a basis as a two-dimensional square {{math|''n'' × ''n''}} array.  The numbers in the multidimensional array are known as the ''components'' of the tensor.  They are denoted by indices giving their position in the array, as [[subscript and superscript|subscripts and superscripts]], following the symbolic name of the tensor.  For example, the components of an order-{{math|2}} tensor {{mvar|T}} could be denoted {{math|''T''<sub>''ij''</sub>}} , where {{mvar|i}} and {{mvar|j}} are indices running from {{math|1}} to {{mvar|n}}, or also by {{math|''T''{{thinsp}}{{su|lh=0.8|b=''j''|p=''i''}}}}.  Whether an index is displayed as a superscript or subscript depends on the transformation properties of the tensor, described below. Thus while {{math|''T''<sub>''ij''</sub>}} and {{math|''T''{{thinsp}}{{su|lh=0.8|b=''j''|p=''i''}}}} can both be expressed as ''n''-by-''n'' matrices, and are numerically related via [[Raising and lowering indices|index juggling]], the difference in their transformation laws indicates it would be improper to add them together.*/

  const html = `<p>A tensor may be represented as a (potentially multidimensional) array. Just as a <a href="/wiki/Vector_space" title="Vector space">vector</a> in an <span class="texhtml mvar" style="font-style:italic;">n</span>-<a href="/wiki/Dimension_(vector_space)" title="Dimension (vector space)">dimensional</a> space is represented by a <a href="/wiki/Multidimensional_array" class="mw-redirect" title="Multidimensional array">one-dimensional</a> array with <span class="texhtml mvar" style="font-style:italic;">n</span> components with respect to a given <a href="/wiki/Basis_(linear_algebra)#Ordered_bases_and_coordinates" title="Basis (linear algebra)">basis</a>, any tensor with respect to a basis is represented by a multidimensional array.  For example, a <a href="/wiki/Linear_operator" class="mw-redirect" title="Linear operator">linear operator</a> is represented in a basis as a two-dimensional square <span class="texhtml"><i>n</i> × <i>n</i></span> array.  The numbers in the multidimensional array are known as the <i>components</i> of the tensor.  They are denoted by indices giving their position in the array, as <a href="/wiki/Subscript_and_superscript" title="Subscript and superscript">subscripts and superscripts</a>, following the symbolic name of the tensor.  For example, the components of an order-<span class="texhtml">2</span> tensor <span class="texhtml mvar" style="font-style:italic;">T</span> could be denoted <span class="texhtml"><i>T</i><sub><i>ij</i></sub></span> , where <span class="texhtml mvar" style="font-style:italic;">i</span> and <span class="texhtml mvar" style="font-style:italic;">j</span> are indices running from <span class="texhtml">1</span> to <span class="texhtml mvar" style="font-style:italic;">n</span>, or also by <span class="texhtml"><i>T</i><span style="white-space: nowrap;"> </span><span class="nowrap"><span style="display:inline-block;margin-bottom:-0.3em;vertical-align:-0.4em;line-height:0.8;font-size:80%;text-align:left"><sup style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>i</i></sup><br><sub style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>j</i></sub></span></span></span>.  Whether an index is displayed as a superscript or subscript depends on the transformation properties of the tensor, described below. Thus while <span class="texhtml"><i>T</i><sub><i>ij</i></sub></span> and <span class="texhtml"><i>T</i><span style="white-space: nowrap;"> </span><span class="nowrap"><span style="display:inline-block;margin-bottom:-0.3em;vertical-align:-0.4em;line-height:0.8;font-size:80%;text-align:left"><sup style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>i</i></sup><br><sub style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>j</i></sub></span></span></span> can both be expressed as <i>n</i>-by-<i>n</i> matrices, and are numerically related via <a href="/wiki/Raising_and_lowering_indices" class="mw-redirect" title="Raising and lowering indices">index juggling</a>, the difference in their transformation laws indicates it would be improper to add them together.
</p>`;
  const result = toHtml(el(html));
  const expected = '';
  assertNodeEqual(result, expected);
});

test('toHtml_Tensor_Para1_Sentence1', () => {
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

test.skip('toHtml_Tensor_Para1_Sentence2', () => {
  // WikiText:
  // Just as a [[Vector space|vector]] in an {{mvar|n}}-[[dimension (vector space)|dimensional]] space is represented by a [[multidimensional array|one-dimensional]] array with {{mvar|n}} components with respect to a given [[Basis (linear algebra)#Ordered bases and coordinates|basis]], any tensor with respect to a basis is represented by a multidimensional array.

  const html = '<p>Just as a <a href="/wiki/Vector_space" title="Vector space">vector</a> in an <span class="texhtml mvar" style="font-style:italic;">n</span>-<a href="/wiki/Dimension_(vector_space)" title="Dimension (vector space)">dimensional</a> space is represented by a <a href="/wiki/Multidimensional_array" class="mw-redirect" title="Multidimensional array">one-dimensional</a> array with <span class="texhtml mvar" style="font-style:italic;">n</span> components with respect to a given <a href="/wiki/Basis_(linear_algebra)#Ordered_bases_and_coordinates" title="Basis (linear algebra)">basis</a>, any tensor with respect to a basis is represented by a multidimensional array.</p>';

  const result = toHtml(el(html));
  const expected = html;
  assertNodeEqual(result, expected);
});

test('toHtml_Tensor_Para1_Sentence2a', () => {
  // WikiText:
  // Just as a [[Vector space|vector]] in

  const html = '<p>Just as a <a href="/wiki/Vector_space" title="Vector space">vector</a> in</p>';

  const result = toHtml(el(html));
  const expected = '<p>Just as a <a href="/wiki/Vector_space" title="Vector space">vector</a> in</p>';
  assertNodeEqual(result, expected);
});

test('toHtml_Tensor_Para1_Sentence2b', () => {
  // WikiText:
  // an {{mvar|n}}-[[dimension (vector space)|dimensional]] space.

  const html = '<p>an <span class="texhtml mvar" style="font-style:italic;">n</span>-<a href="/wiki/Dimension_(vector_space)" title="Dimension (vector space)">dimensional</a> space</p>';

  const result = toHtml(el(html));
  const expected = '<p>an <span class="mvar texhtml">n</span>-<a href="/wiki/Dimension_(vector_space)" title="Dimension (vector space)">dimensional</a> space</p>';
  assertNodeEqual(result, expected);
});

test('toHtml_Tensor_Para1_Sentence2c', () => {
  // WikiText:
  // is represented by a [[multidimensional array|one-dimensional]] array with {{mvar|n}} components with respect

  const html = '<p>is represented by a <a href="/wiki/Multidimensional_array" class="mw-redirect" title="Multidimensional array">one-dimensional</a> array with <span class="texhtml mvar" style="font-style:italic;">n</span> components with respect</p>';

  const result = toHtml(el(html));
  const expected = '<p>is represented by a <a href="/wiki/Multidimensional_array" title="Multidimensional array">one-dimensional</a> array with <span class="mvar texhtml">n</span> components with respect</p>';
  assertNodeEqual(result, expected);
});

test('toHtml_Tensor_Para1_Sentence2d', () => {
  // WikiText:
  // to a given [[Basis (linear algebra)#Ordered bases and coordinates|basis]], any tensor with respect to a basis is represented by a multidimensional array.

  const html = '<p>to a given <a href="/wiki/Basis_(linear_algebra)#Ordered_bases_and_coordinates" title="Basis (linear algebra)">basis</a>, any tensor with respect to a basis is represented by a multidimensional array.</p>';

  const result = toHtml(el(html));
  const expected = '<p>to a given <a href="/wiki/Basis_(linear_algebra)#Ordered_bases_and_coordinates" title="Basis (linear algebra)">basis</a>, any tensor with respect to a basis is represented by a multidimensional array.</p>';
  assertNodeEqual(result, expected);
});

test('toHtml_Tensor_Para1_Sentence3', () => {
  // WikiText:
  // For example, a [[linear operator]] is represented in a basis as a two-dimensional square {{math|''n'' × ''n''}} array.

  const html = '<p>For example, a <a href="/wiki/Linear_operator" class="mw-redirect" title="Linear operator">linear operator</a> is represented in a basis as a two-dimensional square <span class="texhtml"><i>n</i> × <i>n</i></span> array.</p>';

  const result = toHtml(el(html));
  const expected = '<p>For example, a <a href="/wiki/Linear_operator" title="Linear operator">linear operator</a> is represented in a basis as a two-dimensional square <span class="texhtml"><i>n</i> × <i>n</i></span> array.</p>';
  assertNodeEqual(result, expected);
});

test('toHtml_Tensor_Para1_Sentence4', () => {
  // WikiText:
  // For example, the components of an order-{{math|2}} tensor {{mvar|T}} could be denoted {{math|''T''<sub>''ij''</sub>}} , where {{mvar|i}} and {{mvar|j}} are indices running from {{math|1}} to {{mvar|n}}, or also by {{math|''T''{{thinsp}}{{su|lh=0.8|b=''j''|p=''i''}}}}.

  const html = '<p>For example, the components of an order-<span class="texhtml">2</span> tensor <span class="texhtml mvar" style="font-style:italic;">T</span> could be denoted <span class="texhtml"><i>T</i><sub><i>ij</i></sub></span> , where <span class="texhtml mvar" style="font-style:italic;">i</span> and <span class="texhtml mvar" style="font-style:italic;">j</span> are indices running from <span class="texhtml">1</span> to <span class="texhtml mvar" style="font-style:italic;">n</span>, or also by <span class="texhtml"><i>T</i><span style="white-space: nowrap;"> </span><span class="nowrap"><span style="display:inline-block;margin-bottom:-0.3em;vertical-align:-0.4em;line-height:0.8;font-size:80%;text-align:left"><sup style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>i</i></sup><br><sub style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>j</i></sub></span></span></span>.</p>';

  const expected = '<p>For example, the components of an order-<span class="texhtml">2</span> tensor <span class="mvar texhtml">T</span> could be denoted <span class="texhtml"><i>T</i><sub><i>ij</i></sub></span> , where <span class="mvar texhtml">i</span> and <span class="mvar texhtml">j</span> are indices running from <span class="texhtml">1</span> to <span class="mvar texhtml">n</span>, or also by <span class="texhtml"><i>T</i><span style="white-space: nowrap;"> </span><span><span style="display:inline-block;margin-bottom:-0.3em;vertical-align:-0.4em;line-height:0.8;font-size:80%;text-align:left"><sup style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>i</i></sup><br><sub style="font-size:inherit;line-height:inherit;vertical-align:baseline"><i>j</i></sub></span></span></span>.</p>';

  assertNodeEqual(toHtml(el(html)), el(expected));
});
