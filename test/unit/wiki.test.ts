/* eslint-disable no-irregular-whitespace */
import { test } from 'node:test';
import { toHtml } from '../../src/wiki.js';
import { el, assertNodeEqual, setupDom } from './test-utils.js';

setupDom();

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
