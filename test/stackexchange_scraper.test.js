const test = require('node:test');
const assert = require('node:assert');
const { toHtml, toMd } = require('../src/stackexchange_scraper.js');
const { JSDOM } = require('jsdom');

const dom = new JSDOM();
global.Node = dom.window.Node;
global.document = dom.window.document;

function el(html, selector = 'body > *') {
    const dom = new JSDOM(html);
    return dom.window.document.querySelector(selector);
}

/*

// test('isFirstRenderable_two_spans', () => {
//     const html = `<p><span>Hello</span><span> world</span></p>`;
//     const p = el(html);
//     const span1 = p.querySelector('span:first-child');
//     const span2 = p.querySelector('span:last-child');
//     assert.strictEqual(isFirstRenderable(span1), true);
//     assert.strictEqual(isFirstRenderable(span2), false);
// });

// test('isFirstRenderable_nested_text_rendering', () => {
//     const html = `
//     <p>
//         <span><em>Hello</em></span>
//         <span><b> world</b></span>
//     </p>`;
//     const p = el(html);
//     const span1 = p.querySelector('span:first-child');
//     assert.strictEqual(isFirstRenderable(span1), true);
//     const span2 = p.querySelector('span:last-child');
//     assert.strictEqual(isFirstRenderable(span2), false);
//     const em = p.querySelector('em');
//     assert.strictEqual(isFirstRenderable(em), true);
//     const b = p.querySelector('b');
//     assert.strictEqual(isFirstRenderable(b), false);
// });

// test('isFirstRenderable_ignores_empty_inline_siblings', () => {
//     const html = `<p><span></span><span>Hello</span></p>`;
//     const p = el(html);
//     const secondSpan = p.querySelector('span:last-child');
//     assert.strictEqual(isFirstRenderable(secondSpan), true); // should be true!
// });

// test('isFirstRenderable skips MathJax-like nodes', () => {
//     const html = `<p>
//         <span class="MathJax">IGNORED</span>
//         <span>Hello</span>
//     </p>`;
//     const p = el(html);
//     const secondSpan = p.querySelector('span:last-child');
//     assert.strictEqual(isFirstRenderable(secondSpan), true);
// });

// test('isFirstRenderable ignores whitespace-only text before element', () => {
//     const html = `<p>   <span>Hello</span></p>`;
//     const span = el(html).querySelector('span');
//     assert.strictEqual(isFirstRenderable(span), true);
// });

// test('isFirstRenderable ignores empty div before inline', () => {
//     const html = `<div><div></div><span>Hello</span></div>`;
//     const span = el(html).querySelector('span');
//     assert.strictEqual(isFirstRenderable(span), true);
// });

// test('isFirstRenderable inside ignored MathJax parent', () => {
//     const html = `<p>
//         <span class="MathJax"><em>Hello</em></span>
//         <span>world</span>
//     </p>`;
//     const span = el(html).querySelector('span:last-child');
//     assert.strictEqual(isFirstRenderable(span), true);
// });

// test('isFirstRenderable for text node directly under block', () => {
//     const html = `<p>Hello <span>world</span></p>`;
//     const span = el(html).querySelector('span');
//     assert.strictEqual(isFirstRenderable(span), false);
// });

// test('isFirstRenderable skips multiple empty siblings', () => {
//     const html = `<p><span></span><span> </span><span>Hello</span></p>`;
//     const span = el(html).querySelector('span:last-child');
//     assert.strictEqual(isFirstRenderable(span), true);
// });

// test('isFirstRenderable skips deeply nested ignorable wrapper', () => {
//     const html = `
//         <p>
//             <span class="MathJax"><span><em><span>Hello</span></em></span></span>
//             <span>World</span>
//         </p>`;
//     const span = el(html).querySelector('span:last-child');
//     assert.strictEqual(isFirstRenderable(span), true);
// });

// test('isFirstRenderable skips deeply nested empty inlines', () => {
//     const html = `<p><span><span><span></span></span></span><span>Hello</span></p>`;
//     const span = el(html).querySelector('span:last-child');
//     assert.strictEqual(isFirstRenderable(span), true);
// });

// test('isFirstRenderable ignores whitespace between ignored node and content', () => {
//     const html = `<p><span class="MathJax">IGNORED</span>   <span>Hello</span></p>`;
//     const span = el(html).querySelector('span:last-child');
//     assert.strictEqual(isFirstRenderable(span), true);
// });

// test('isFirstRenderable keeps unknown script tag before real content', () => {
//     const html = `<p><script>alert(1)</script><span>Hello</span></p>`;
//     const span = el(html).querySelector('span');
//     assert.strictEqual(isFirstRenderable(span), false);
// });

// test('isFirstRenderable skips comment node before real content', () => {
//     const html = `<p><!-- comment --><span>Hello</span></p>`;
//     const span = el(html).querySelector('span');
//     assert.strictEqual(isFirstRenderable(span), true);
// });


// test('isLastRenderable_two_spans', () => {
//     const html = `<p><span>Hello</span><span> world</span></p>`;
//     const p = el(html);
//     const span1 = p.querySelector('span:first-child');
//     const span2 = p.querySelector('span:last-child');
//     assert.strictEqual(isLastRenderable(span1), false);
//     assert.strictEqual(isLastRenderable(span2), true);
// });

// test('isLastRenderable_ignores_noncontent_siblings', () => {
//     const html = `
//         <p>
//             <span>Hello</span>
//             <span class="MathJax"></span>
//             <span> </span>
//         </p>`;
//     const span = el(html).querySelector('span:first-child');
//     assert.strictEqual(isLastRenderable(span), true);
// });

// test('isLastRenderable_nested_content', () => {
//     const html = `
//         <p>
//             <span class="MathJax"><em><b><i></i></b></em></span>
//             <span><em>Hello</em></span>
//             <span></span>
//         </p>`;
//     const ems = el(html).querySelectorAll('em');
//     const em1 = ems[0]; // inside MathJax – ignored anyway
//     const em2 = ems[1]; // contains visible "Hello"

//     assert.strictEqual(isLastRenderable(em1), false);
//     assert.strictEqual(isLastRenderable(em2), true);
// });

//test('toHtml_test1', () => {
//    const html = `
//        <div class="s-prose js-post-body" itemprop="text">
//        <p>
//            <a href="http://en.wikipedia.org/wiki/Tensor">Wikipedia</a> says that a linear transformation is a 
//            <span class="MathJax_Preview"></span>
//            <span class="MathJax" id="MathJax-Element-3-Frame">
//                <nobr aria-hidden="true">
//                    <span class="math" id="MathJax-Span-10">
//                    </span>
//                </nobr>
//                <span class="MJX_Assistive_MathML" role="presentation">
//                    <math
//                    xmlns="http://www.w3.org/1998/Math/MathML">
//                    <mo stretchy="false">(</mo>
//                    <mn>1</mn>
//                    <mo>,</mo>
//                    <mn>1</mn>
//                    <mo stretchy="false">)</mo>
//                    </math>
//                </span>
//            </span>
//            <script type="math/tex" id="MathJax-Element-3">(1,1)</script> tensor.
//        </p>
//        </div>`;
//    const result = toHtml(el(html));
//    const expected = `<a href="http://en.wikipedia.org/wiki/Tensor">Wikipedia</a> says that a linear transformation is a (1,1) tensor.`;
//    assert.strictEqual(result, expected);
//});


// test('toHtml_test2', () => {
//     const html = `
//         <div>
//             <p>
//                 There was a <a href="allaboutcats.com">big cat</a>
//                 sitting on the tree.
//             </p>
//         </div>`;
//     const result = toHtml(el(html));
//     const expected = `There was a <a href="allaboutcats.com">big cat</a> sitting on the tree.`;
//     assert.strictEqual(result, expected);
// });


// test('toHtml_collapse_linebreaks', () => {
//    const html = `
//        <div>
//            <p>
//                This is
//                a test.
//            </p>
//        </div>`;
//    const result = toHtml(el(html));
//    const expected = `This is a test.`;
//    assert.strictEqual(result, expected);
// });

// test('toHtml_trim_after_anchor', () => {
//     const html = `
//         <div>
//             <p>
//                 See <a href="example.com">this</a> 
//             </p>
//         </div>`;
//     const result = toHtml(el(html));
//     const expected = `See <a href="example.com">this</a>`;
//     assert.strictEqual(result, expected);
// });

// test('toHtml_no_double_space', () => {
//     const html = `
//         <div>
//             <p>
//                 Hello 
//                 <a href="cat.com">big cat</a>
//                 world.
//             </p>
//         </div>`;
//     const result = toHtml(el(html));
//     const expected = `Hello <a href="cat.com">big cat</a> world.`;
//     assert.strictEqual(result, expected);
// });

// test('toHtml_mathjax_script', () => {
//     const html = `
//         <div>
//             <p>
//                 Result:
//                 <script type="math/tex">(x+y)^2</script>
//                 is the formula.
//             </p>
//         </div>`;
//     const result = toHtml(el(html));
//     const expected = `Result: (x+y)^2 is the formula.`;
//     assert.strictEqual(result, expected);
// });

// test('toHtml_trailing_whitespace_node', () => {
//     const html = `
//         <div>
//             <p>Done.</p>
            
//         </div>`;
//     const result = toHtml(el(html));
//     const expected = `Done.`;
//     assert.strictEqual(result, expected);
// });

test('toMd_collapse_linebreaks', () => {
    const html = `
        <div>
            <p>
                This is
                a test.
            </p>
        </div>`;
    const result = toMd(el(html));
    const expected = `This is a test.`;
    assert.strictEqual(result, expected);
});

test('toMd_trim_after_anchor', () => {
    const html = `
        <div>
            <p>
                See <a href="example.com">this</a> 
            </p>
        </div>`;
    const result = toMd(el(html));
    const expected = `See [this](example.com)`;
    assert.strictEqual(result, expected);
});

test('toMd_no_double_space', () => {
    const html = `
        <div>
            <p>
                Hello 
                <a href="cat.com">big cat</a>
                world.
            </p>
        </div>`;
    const result = toMd(el(html));
    const expected = `Hello [big cat](cat.com) world.`;
    assert.strictEqual(result, expected);
});

test('toMd_mathjax_script', () => {
    const html = `
        <div>
            <p>
                Result:
                <script type="math/tex">(x+y)^2</script>
                is the formula.
            </p>
        </div>`;
    const result = toMd(el(html));
    const expected = `Result: (x+y)^2 is the formula.`;
    assert.strictEqual(result, expected);
});

test('toMd_trailing_whitespace_node', () => {
    const html = `
        <div>
            <p>Done.</p>
            
        </div>`;
    const result = toMd(el(html));
    const expected = `Done.`;
    assert.strictEqual(result, expected);
});


test('toMd_single_p', () => {
    const html = `<div><p>Hello world</p></div>`;
    const result = toMd(el(html));
    const expected = `Hello world`;
    assert.strictEqual(result, expected);
});

test('toMd_div_wraps_two_ps', () => {
    const html = `
        <div>
            <p>Hello</p>
            <p>World</p>
        </div>`;
    const result = toMd(el(html));
    const expected = `Hello\n\nWorld`;
    assert.strictEqual(result, expected);
});

test('toMd_nested_divs_with_p', () => {
    const html = `
        <div>
            <div>
                <p>Hello</p>
            </div>
            <div>
                <p>World</p>
            </div>
        </div>`;
    const result = toMd(el(html));
    const expected = `Hello\n\nWorld`;
    assert.strictEqual(result, expected);
});

test('toMd_deeply_nested_divs_collapse_spacing', () => {
    const html = `
        <div>
            <div>
                <div>
                    <div>
                        <p>Hello</p>
                    </div>
                </div>
            </div>
        </div>`;
    const result = toMd(el(html));
    const expected = `Hello`;
    assert.strictEqual(result, expected);
});

test('toMd_deeply_nested_divs_collapse_spacing2', () => {
    const html = `
        <div>
            <div>
                <div>
                    <div>
                        <p>Hello</p>
                    </div>
                </div>
            </div>
            <div>
                <div>
                    <div>
                        <p>Bye</p>
                    </div>
                </div>
            </div>
        </div>`;
    const result = toMd(el(html));
    const expected = `Hello\n\nBye`;
    assert.strictEqual(result, expected);
});

test('toMd_empty_divs_do_not_add_spacing', () => {
  const html = `
    <div>
      <div></div>
      <p>Hello</p>
      <div></div>
      <p>World</p>
    </div>`;
  const result = toMd(el(html));
  const expected = `Hello\n\nWorld`;
  assert.strictEqual(result, expected);
});

test('toMd_div_with_inline_span_text', () => {
  const html = `<div><span>Hello</span>, <em>world</em>!</div>`;
  const result = toMd(el(html));
  const expected = `Hello, *world*!`;
  assert.strictEqual(result, expected);
});

test('toMd_div_with_empty_inline_should_not_count', () => {
  const html = `<div><span> </span></div>`;
  const result = toMd(el(html));
  const expected = ``;
  assert.strictEqual(result, expected);
});

test('toMd_p_and_inline_span_spacing', () => {
  const html = `<div><p>Hello</p><span>World</span></div>`;
  const result = toMd(el(html));
  const expected = `Hello\n\nWorld`;
  assert.strictEqual(result, expected);
});



test('toMd_div_text_p_text', () => {
    const html = `
        <div>
            intro
            <p>Hello</p>
            outro
        </div>`;
    const result = toMd(el(html));
    const expected = `intro\n\nHello\n\noutro`;
    assert.strictEqual(result, expected);
});

test('toMd_messy_spacing_collapse', () => {
    const html = `
        <div>
            <p>Hello   \t\n</p>
            \n\n
            <p>   World</p>
        </div>`;
    const result = toMd(el(html));
    const expected = `Hello\n\nWorld`;
    assert.strictEqual(result, expected);
});



test('toMd_span_does_not_add_break', () => {
    const html = `
        <div>
            <span>Hello</span>
            <span>World</span>
        </div>`;
    const result = toMd(el(html));
    const expected = `HelloWorld`; // no \n
    assert.strictEqual(result, expected);
});


test('toMd_p_with_spans_inline', () => {
    const html = `<p><span>Hello</span><span> world</span></p>`;
    const result = toMd(el(html));
    const expected = `Hello world`;
    assert.strictEqual(result, expected);
});


test('toMd_p_with_spans_inline2', () => {
    const html = `<p>
        <span>
         Hello
        </span>
        <span>
              world 
        </span>
    </p>`;
    const result = toMd(el(html));
    const expected = `Hello world`;
    assert.strictEqual(result, expected);
});

test('toMd_spans_between_ps', () => {
    const html = `<div>
        <p>Hello</p>
        <span> -- </span>
        <p>World</p>
        </div>`;
    const result = toMd(el(html));
    const expected = `Hello\n\n--\n\nWorld`;
    assert.strictEqual(result, expected);
});

test('toMd_p_span_p_combo', () => {
    const html = `<div>
        <p>Hello</p>
        <p><span>World</span></p>
        </div>`;
    const result = toMd(el(html));
    const expected = `Hello\n\nWorld`;
    assert.strictEqual(result, expected);
});


test('toMd_p_with_inline_span_then_p', () => {
    const html = `<div>
        <p>This is <span>inline</span> text.</p>
        <p>Second paragraph.</p>
        </div>`;
    const result = toMd(el(html));
    const expected = `This is inline text.\n\nSecond paragraph.`;
    assert.strictEqual(result, expected);
});



test('toMd_mixed_text_span_p_text', () => {
    const html = `
        <div>
            Intro
            <span>-inline-</span>
            <p>Hello</p>
            <span>again</span>
        </div>`;
    const result = toMd(el(html));
    const expected = `Intro -inline-\n\nHello\n\nagain`;
    assert.strictEqual(result, expected);
});


test('toMd_em_simple', () => {
    const html = `<p>This is <em>important</em> text.</p>`;
    const result = toMd(el(html));
    const expected = `This is *important* text.`;
    assert.strictEqual(result, expected);
});

test('toMd_em_nested_div', () => {
    const html = `<div><p><em>Hello</em> world</p></div>`;
    const result = toMd(el(html));
    const expected = `*Hello* world`;
    assert.strictEqual(result, expected);
});

test('toMd_b_simple', () => {
    const html = `<p>This is <b>bold</b> text.</p>`;
    const result = toMd(el(html));
    const expected = `This is **bold** text.`;
    assert.strictEqual(result, expected);
});

test('toMd_b_nested_div', () => {
    const html = `<div><p><b>Hello</b> world</p></div>`;
    const result = toMd(el(html));
    const expected = `**Hello** world`;
    assert.strictEqual(result, expected);
});

test('toMd_em_and_bold', () => {
    const html = `<p>This is <b><em>very important</em></b> text.</p>`;
    const result = toMd(el(html));
    const expected = `This is ***very important*** text.`;
    assert.strictEqual(result, expected);
});

test('toMd_br_inside_paragraph', () => {
    const html = `<p>Hello<br/>world</p>`;
    const result = toMd(el(html));
    const expected = `Hello  \nworld`;
    assert.strictEqual(result, expected);
});


test('toMd_anchor_simple', () => {
    const html = `<p>Visit <a href="https://example.com">our site</a> today.</p>`;
    const result = toMd(el(html));
    const expected = `Visit [our site](https://example.com) today.`;
    assert.strictEqual(result, expected);
});

test('toMd_anchor_nested_em', () => {
    const html = `<a href="https://example.com"><em>important link</em></a>`;
    const result = toMd(el(html));
    const expected = `[*important link*](https://example.com)`;
    assert.strictEqual(result, expected);
});

test('toMd_a_inline_full_url', () => {
    const html = `<a href="https://example.com">Click here</a>`;
    const result = toMd(el(html));
    const expected = `[Click here](https://example.com)`;
    assert.strictEqual(result, expected);
});

test('toMd_a_inline_relative_url', () => {
    const html = `<a href="/questions/1234">See question</a>`;
    const result = toMd(el(html));
    const expected = `[See question](/questions/1234)`;
    assert.strictEqual(result, expected);
});

test('toMd_a_with_empty_href_is_unlinked', () => {
    const html = `<a href="">No link</a>`;
    const result = toMd(el(html));
    const expected = `No link`; // Don't treat as markdown link
    assert.strictEqual(result, expected);
});

test('toMd_a_name_anchor_only', () => {
    const html = `<a name="section1"></a>`;
    const result = toMd(el(html));
    const expected = ``; // No renderable content
    assert.strictEqual(result, expected);
});


test('toMd_naked_url_text', () => {
    const html = `<div>https://example.com</div>`;
    const result = toMd(el(html));
    const expected = `https://example.com`;
    assert.strictEqual(result, expected);
});

test('toMd_a_with_bold_child', () => {
    const html = `<a href="https://example.com"><b>Link</b></a>`;
    const result = toMd(el(html));
    const expected = `[**Link**](https://example.com)`;
    assert.strictEqual(result, expected);
});


test('toMd_h1_simple', () => {
    const html = `<div><h1>Introduction</h1></div>`;
    const result = toMd(el(html));
    const expected = `# Introduction #`;
    assert.strictEqual(result, expected);
});

test('toMd_h2_with_inline', () => {
    const html = `<div><h2>Usage <em>details</em></h2></div>`;
    const result = toMd(el(html));
    const expected = `## Usage *details* ##`;
    assert.strictEqual(result, expected);
});

test('toMd_h3_with_bold', () => {
    const html = `<div><h3>Important <b>note</b></h3></div>`;
    const result = toMd(el(html));
    const expected = `### Important **note** ###`;
    assert.strictEqual(result, expected);
});

test('toMd_hr_simple', () => {
    const html = `<div>before<hr/>after</div>`;
    const result = toMd(el(html));
    const expected = `before\n\n---\n\nafter`;
    assert.strictEqual(result, expected);
});


test('toMd_ul_simple', () => {
    const html = `<ul><li>Item 1</li><li>Item 2</li></ul>`;
    const result = toMd(el(html));
    const expected = `- Item 1\n- Item 2`;
    assert.strictEqual(result, expected);
});

test('toMd_ol_simple', () => {
    const html = `<ol><li>First</li><li>Second</li></ol>`;
    const result = toMd(el(html));
    const expected = `1. First\n2. Second`;
    assert.strictEqual(result, expected);
});

test('toMd_double_spaced_list', () => {
    const html = `<div><ul><li><p>Item 1</p></li><li><p>Item 2</p></li></ul></div>`;
    const result = toMd(el(html));
    const expected = `- Item 1\n\n- Item 2`;
    assert.strictEqual(result, expected);
});


test('toMd_list_with_two_paragraphs', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><ul>
<li>
<p>Para 1</p>
<p>Para 2</p>
</li>
</ul>
</div>`;
    const result = toMd(el(html));
    const expected = 
`- Para 1

  Para 2`;
    assert.strictEqual(result, expected);
});
*/

test('toMd_deep_list_with_paragraphs', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><h1>H1 Visa</h1>
<ul>
<li>
<p>Li1 Para1</p>
<p>Li1 Para2</p>
<ul>
<li>
<p>Li2 Para1</p>
<p>Li3 Para2</p>
</li>
</ul>
</li>
</ul>
</div>`;
    const result = toMd(el(html));
    const expected = 
`# H1 Visa #

- Li1 Para1

  Li1 Para2

    - Li2 Para1

      Li3 Para2`;
    assert.strictEqual(result, expected);
});

/*
test('toMd_nested_list', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><ul>
<li>Indented 0 spaces.
<ul>
<li>indented 2 or more spaces.</li>
</ul>
</li>
<li>0 spaces again.</li>
</ul>
</div>`;
    const result = toMd(el(html));
    const expected = 
`- Indented 0 spaces.
    - indented 2 or more spaces.
- 0 spaces again.`;
    assert.strictEqual(result, expected);
});

test('toMd_nested_list2', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><ul>
<li>Indented 0 spaces.
<ul>
<li>indented 2 or more spaces.</li>
</ul>
</li>
</ul>
</div>`;
    const result = toMd(el(html));
    const expected = 
`- Indented 0 spaces.
    - indented 2 or more spaces.`;
    assert.strictEqual(result, expected);
});



test('toMd_code_fenced_basic', () => {
    const html = `<div><pre><code>printf("%d\\n", 42);</code></pre></div>`;
    const result = toMd(el(html));
    const expected = "```\nprintf(\"%d\\n\", 42);\n```";
    assert.strictEqual(result, expected);
});

test('toMd_inline_code_basic', () => {
    const html = `<p>The <code>$</code> character is a shortcut for <code>window.jQuery</code>.</p>`;
    const result = toMd(el(html));
    const expected = "The `$` character is a shortcut for `window.jQuery`.";
    assert.strictEqual(result, expected);
});

test('toMd_inline_code_with_backtick', () => {
    const html = `<p>The name <code>Tuple\`2</code> is valid.</p>`;
    const result = toMd(el(html));
    const expected = "The name ``Tuple`2`` is valid.";
    assert.strictEqual(result, expected);
});


test('toMd_pre_with_trailing_newline', () => {
    const html = `<div><pre>line1\nline2\n</pre></div>`;
    const result = toMd(el(html));
    const expected = '```\nline1\nline2\n```';
    assert.strictEqual(result, expected);
});

test('toMd_h1_p_pre_code_and_inline_code_mix', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><h1>code block</h1>
<p>foo</p>
<pre class="lang-py s-code-block"><code data-highlighted="yes" class="hljs language-python"><span class="hljs-keyword">def</span> <span class="hljs-title function_">hello</span>():
    <span class="hljs-built_in">print</span>(<span class="hljs-string">"hello world"</span>)
</code></pre>
<p>bar <code>function bye() { console.log("bye-bye!") }</code>
baz</p>
</div>`
    const result = toMd(el(html));
    const expected  = 
`# code block #

foo

\`\`\`py
def hello():
    print("hello world")
\`\`\`

bar \`function bye() { console.log("bye-bye!") }\` baz`
    assert.strictEqual(result, expected);
});


test('toMd_complex_mixed_markup_case', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><h1>Header One</h1>
<p>This is the first paragraph. It has <em>italic</em> text, <strong>bold</strong> text, and <em><strong>both</strong></em>.</p>
<p>This is the second paragraph.<br>
It contains a manual line break above.</p>
<h2>Header Two</h2>
<p>Another paragraph here with a <a href="https://example.com">link</a>.</p>
<hr>
<p><strong>Bold line.</strong><br>
<em>Italic line.</em><br>
<em><strong>Bold and italic line.</strong></em></p>
<h3>Header Three</h3>
<p>Final paragraph.</p>
</div>`;
    const result = toMd(el(html));
    const expected = 
`# Header One #

This is the first paragraph. It has *italic* text, **bold** text, and ***both***.

This is the second paragraph.  
It contains a manual line break above.

## Header Two ##

Another paragraph here with a [link](https://example.com).

---

**Bold line.**  
*Italic line.*  
***Bold and italic line.***

### Header Three ###

Final paragraph.`;
    assert.strictEqual(result, expected);
});

test('toMd_StackOverflow_example_code_blocks', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><h2>Code and Preformatted Text</h2>
<p>Indent four spaces to create an escaped <code>&lt;pre&gt; &lt;code&gt;</code> block:</p>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-title function_">printf</span>(<span class="hljs-string">"%d\n"</span>, <span class="hljs-number">42</span>);  <span class="hljs-comment">/- what was the
                        question again? -/</span>
</code></pre>
<p>You can also select text and press <code>CTRL+K</code> to toggle indenting as code.</p>
<p>The text will be wrapped in tags, and displayed in a monospaced font. The first four spaces will be stripped off, but all other whitespace will be preserved.</p>
<p>Markdown and HTML are ignored within a code block:</p>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript">&lt;blink&gt;
   <span class="hljs-title class_">You</span> would hate <span class="hljs-variable language_">this</span> <span class="hljs-keyword">if</span> it weren<span class="hljs-string">'t
   wrapped in a code block.
&lt;/blink&gt;
</span></code></pre>
<p>Instead of using indentation, you can also create code blocks by using “code fences”, consisting of three or more backticks or tildes:</p>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-title function_">alert</span>(<span class="hljs-literal">false</span>);
</code></pre>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-title function_">alert</span>(<span class="hljs-literal">true</span>);
</code></pre>
<hr>
<h2>Code Spans</h2>
<p>Use backticks to create an inline <code>&lt;code&gt;</code> span:</p>
<p>The <code>$</code> character is just a shortcut for <code>window.jQuery</code>.</p>
<p>(The backtick key is in the upper left corner of most keyboards.)</p>
<p>Like code blocks, code spans will be displayed in a monospaced font. Markdown and HTML will not work within them. Note that, unlike code blocks, code spans require you to manually escape any HTML within!</p>
<p>If your code itself contains backticks, you may have to use multiple backticks as delimiters:</p>
<p>The name <code>Tuple\`2</code> is a valid .NET type name.</p>
</div>`;
    const result = toMd(el(html));
    const expected =
`## Code and Preformatted Text ##

Indent four spaces to create an escaped \`<pre> <code>\` block:

\`\`\`js
printf("%d\n", 42);  /- what was the
                        question again? -/
\`\`\`

You can also select text and press \`CTRL+K\` to toggle indenting as code.

The text will be wrapped in tags, and displayed in a monospaced font. The first four spaces will be stripped off, but all other whitespace will be preserved.

Markdown and HTML are ignored within a code block:

\`\`\`js
<blink>
   You would hate this if it weren't
   wrapped in a code block.
</blink>
\`\`\`

Instead of using indentation, you can also create code blocks by using “code fences”, consisting of three or more backticks or tildes:

\`\`\`js
alert(false);
\`\`\`

\`\`\`js
alert(true);
\`\`\`

---

## Code Spans ##

Use backticks to create an inline \`<code>\` span:

The \`$\` character is just a shortcut for \`window.jQuery\`.

(The backtick key is in the upper left corner of most keyboards.)

Like code blocks, code spans will be displayed in a monospaced font. Markdown and HTML will not work within them. Note that, unlike code blocks, code spans require you to manually escape any HTML within!

If your code itself contains backticks, you may have to use multiple backticks as delimiters:

The name \`\`Tuple\`2\`\` is a valid .NET type name.`;
    assert.strictEqual(result, expected);
});


test('toMd_pre_1', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-title function_">printf</span>(<span class="hljs-string">"%d\n"</span>, <span class="hljs-number">42</span>);  <span class="hljs-comment">/- what was the
                        question again? -/</span></code></pre>
</div>`;
    const result = toMd(el(html));
    const expected =
`\`\`\`js
printf("%d\n", 42);  /- what was the
                        question again? -/
\`\`\``;
    assert.strictEqual(result, expected);
});

test('toMd_pre_2', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-title function_">alert</span>(<span class="hljs-literal">false</span>);
</code></pre>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-title function_">alert</span>(<span class="hljs-literal">true</span>);
</code></pre>
</div>`;
    const result = toMd(el(html));
    const expected =
`\`\`\`js
alert(false);
\`\`\`

\`\`\`js
alert(true);
\`\`\``;
    assert.strictEqual(result, expected);
});

test('toMd_pre_3', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><hr>
<h2>Code Spans</h2>
</div>`;
    const result = toMd(el(html));
    const expected =
`---

## Code Spans ##`;
    assert.strictEqual(result, expected);
});


test('toMd_simple_blockquotes', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><blockquote>
<p>The syntax is based on the way email programs
usually do quotations. You don't need to hard-wrap
the paragraphs in your blockquotes, but it looks much nicer if you do.  Depends how lazy you feel.</p>
</blockquote>
</div>`
    const result = toMd(el(html));
    const expected =
`> The syntax is based on the way email programs usually do quotations. You don't need to hard-wrap the paragraphs in your blockquotes, but it looks much nicer if you do. Depends how lazy you feel.`;
    assert.strictEqual(result, expected);
});


test('toMd_spaced_blockquote', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><blockquote>
<p>The <code>&gt;</code> on the blank lines is required
to create a single blockquote.</p>
<p>If you leave out the extra <code>&gt;</code>
you will end up with
two distinct blockquotes.</p>
</blockquote>
</div>`
    const result = toMd(el(html));
    const expected =
`> The \`>\` on the blank lines is required to create a single blockquote.
> 
> If you leave out the extra \`>\` you will end up with two distinct blockquotes.`;
    assert.strictEqual(result, expected);
});

test('toMd_blockquotes_within_blockquotes', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><blockquote>
<p>A standard blockquote is indented</p>
<blockquote>
<p>A nested blockquote is indented more</p>
<blockquote>
<blockquote>
<p>You can nest to any depth.</p>
</blockquote>
</blockquote>
</blockquote>
</blockquote>
</div>`
    const result = toMd(el(html));
    const expected =
`> A standard blockquote is indented
> 
> > A nested blockquote is indented more
> > 
> > > > You can nest to any depth.`;
    assert.strictEqual(result, expected);
});


test('toMd_lists_in_a_blockquote', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><blockquote>
<ul>
<li>A list in a blockquote</li>
<li>With a &gt; and space in front of it
<ul>
<li>A sublist</li>
</ul>
</li>
</ul>
</blockquote>
</div>`
    const result = toMd(el(html));
    const expected =
`> - A list in a blockquote
> - With a > and space in front of it
>     - A sublist`;
    assert.strictEqual(result, expected);
});


test('toMd_preformatted_text_in_a_blockquote', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><blockquote>
<p>Intro</p>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-title class_">Indent</span> five spaces total.  <span class="hljs-title class_">The</span> first
one is part <span class="hljs-keyword">of</span> the blockquote designator.
</code></pre>
<p>Outro</p>
</blockquote>
</div>`
    const result = toMd(el(html));
    const expected =
`> Intro
> 
> \`\`\`js
> Indent five spaces total.  The first
> one is part of the blockquote designator.
> \`\`\`
> 
> Outro`;
    assert.strictEqual(result, expected);
});

test('toMd_blockquote_with_anchor', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><blockquote>
<p>Check out <a href="https://example.com">this link</a> with <strong>bold</strong> and <code>code</code>.</p>
</blockquote>
</div>`
    const result = toMd(el(html));
    const expected =
`> Check out [this link](https://example.com) with **bold** and \`code\`.`;
    assert.strictEqual(result, expected);
});

test('toMd_blockquote_with_list', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview">
<blockquote>
<p>Here are my thoughts:</p>
<ul>
<li>One</li>
<li>Two</li>
</ul>
</blockquote>
</div>`
    const result = toMd(el(html));
    const expected =
`> Here are my thoughts:
> 
> - One
> - Two`;
    assert.strictEqual(result, expected);
});

test('toMd_blockquote_with_header', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><blockquote>
<h2>Important</h2>
<p>Pay attention to this header.</p>
</blockquote>
</div>`
    const result = toMd(el(html));
    const expected =
`> ## Important ##
> 
> Pay attention to this header.`;
    assert.strictEqual(result, expected);
});

test('toMd_blockquote_with_code_block', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><blockquote>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-keyword">const</span> x = <span class="hljs-number">42</span>;
</code></pre>
</blockquote>
</div>`
    const result = toMd(el(html));
    const expected =
`> \`\`\`js
> const x = 42;
> \`\`\``;
    assert.strictEqual(result, expected);
});

test('toMd_blockquote_with_nested_blockquote', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><blockquote>
<p>Here's what they said:</p>
<blockquote>
<p>It was great!</p>
</blockquote>
</blockquote>
</div>`
    const result = toMd(el(html));
    const expected =
`> Here's what they said:
> 
> > It was great!`;
    assert.strictEqual(result, expected);
});

test('toMd_blockquote_with_ruler', () => {
    const html = `<div id="wmd-preview-40593632" class="s-prose mb16 wmd-preview js-wmd-preview"><blockquote>
<p>Before</p>
<hr>
<p>After</p>
</blockquote>
</div>`
    const result = toMd(el(html));
    const expected =
`> Before
> 
> ---
> 
> After`;
    assert.strictEqual(result, expected);
});
*/