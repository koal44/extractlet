import { expect, test } from 'vitest';
import { strictEqual, deepStrictEqual } from 'node:assert';
import { toMd, toHtml, scrapePostContributor } from '../../src/sites/se';
import { el, assertNodeEqual, setupDom } from '../utils/test-utils';

setupDom();

test('toHtml test1', () => {
  const html = `
    <div class="s-prose js-post-body" itemprop="text">
      <p>
        <a href="http://en.wikipedia.org/wiki/Tensor">Wikipedia</a> says that a linear transformation is a 
        <span class="MathJax_Preview"></span>
        <span class="MathJax" id="MathJax-Element-3-Frame">
          <nobr aria-hidden="true">
            <span class="math" id="MathJax-Span-10">
            </span>
          </nobr>
          <span class="MJX_Assistive_MathML" role="presentation">
            <math
            xmlns="http://www.w3.org/1998/Math/MathML">
            <mo stretchy="false">(</mo>
            <mn>1</mn>
            <mo>,</mo>
            <mn>1</mn>
            <mo stretchy="false">)</mo>
            </math>
          </span>
        </span>
        <script type="math/tex" id="MathJax-Element-3">(1,1)</script> tensor.
      </p>
    </div>`.trim();
  const result = toHtml(el(html), { mathView: 'tex' });
  const expected = `
    <div>
      <p>
        <a href="http://en.wikipedia.org/wiki/Tensor">Wikipedia</a> says that a linear transformation is a \n        \n        
        <code class="xlet-math-inline xlet-math-tex">(1,1)</code> tensor.
      </p>
    </div>`.trim();
  assertNodeEqual(result, expected);
});

test('toHtml mathjax script', () => {
  const html = `
    <div>
      <p>
        Result:
        <script type="math/tex">(x+y)^2</script>
        is the formula.
      </p>
    </div>`.trim();
  const result = toHtml(el(html), { mathView: 'tex' });
  const expected = `
    <div>
      <p>
        Result:
        <code class="xlet-math-inline xlet-math-tex">(x+y)^2</code>
        is the formula.
      </p>
    </div>`.trim();
  assertNodeEqual(result, expected);
});

test('toMd converts spoiler blockquote to markdown', () => {
  const html = `
    <div>
      <blockquote class="spoiler" data-spoiler="Reveal spoiler">
        <p> don't spoil me!!</p>
      </blockquote>
    </div>`.trim();

  const result = toMd(el(html));
  const expected = '>! don\'t spoil me!!';

  strictEqual(result.trim(), expected.trim());
});

test('toHtml snippets', () => {
  const html = `
<div>
  <p>check this out!</p>
  <p>
    <div class="snippet">
      <div class="snippet-code">
        <pre class="prettyprint-override lang-js snippet-code-js"><code>document.getElementById('btn').addEventListener('click', () =&gt; {
  const box = document.getElementById('greeting');
  box.textContent = 'You clicked the button!';
  box.style.backgroundColor = '#c0ffc0';
});</code></pre>
        <pre class="prettyprint-override lang-css snippet-code-css"><code>.box {
  padding: 10px;
  background-color: lightblue;
  border: 1px solid #888;
  font-family: sans-serif;
  margin-bottom: 10px;
}</code></pre>
        <pre class="prettyprint-override lang-html snippet-code-html"><code>&lt;div id="greeting" class="box"&gt;Hello, world!&lt;/div&gt;
&lt;button id="btn"&gt;Change Greeting&lt;/button&gt;</code></pre>
        <div class="snippet-result">
          <div class="snippet-ctas d-flex ai-center">
            <div class="d-flex gs4"><button type="button" class="s-btn s-btn__filled flex--item"><svg aria-hidden="true" class="svg-icon iconPlay" width="17" height="18" viewBox="0 0 17 18"><path d="M3 2.87a1 15.13z"></path></svg><span> Run code snippet</span></button><button type="button" class="s-btn s-btn__outlined flex--item js-edit-snippet" style="">Edit code snippet</button>
            </div>
            <div class="d-flex ml-auto gs4"><button type="button" class="s-btn flex--item js-show-hide-results" style="display: none;"><svg aria-hidden="true" class="svg-icon iconEyeOff" width="18" height="18" viewBox="0 0 18 18"><path d="m5.02 16 3.41z"></path></svg><span> Hide Results</span></button><button type="button" class="s-btn flex--item copySnippet" style="display: none;"><svg aria-hidden="true" class="svg-icon iconCopy" width="17" height="18" viewBox="0 0 17 18"><path d="M5 6c0-1.25V8h3.25z"></path><path d="M10 1a2-3z" opacity=".4"></path></svg><span> Copy</span></button><button type="button" class="s-btn flex--item snippet-expand-link popout-code"><svg aria-hidden="true" class="svg-icon iconShareSm" width="14" height="14" viewBox="0 0 14 14"><path d="M5 3H7z"></path></svg><span> Expand</span></button>
            </div>
          </div>
          <div class="snippet-result-code" style="display: none;"><iframe name="sif96" sandbox="allow-forms allow-modals allow-scripts" class="snippet-box-edit snippet-box-result" frameborder="0"></iframe>
          </div>
        </div>
      </div>
    </div>
  </p>
  <p></p>
</div>`;

  const actual = toHtml(el(html));
  const expected = `
<div>
  <p>check this out!</p>
  <p>
    </p><div>
      <div>
        <pre data-xlet-lang="js"><code>document.getElementById('btn').addEventListener('click', () =&gt; {
  const box = document.getElementById('greeting');
  box.textContent = 'You clicked the button!';
  box.style.backgroundColor = '#c0ffc0';
});</code></pre>
        <pre data-xlet-lang="css"><code>.box {
  padding: 10px;
  background-color: lightblue;
  border: 1px solid #888;
  font-family: sans-serif;
  margin-bottom: 10px;
}</code></pre>
        <pre data-xlet-lang="html"><code>&lt;div id="greeting" class="box"&gt;Hello, world!&lt;/div&gt;
&lt;button id="btn"&gt;Change Greeting&lt;/button&gt;</code></pre>
        
      </div>
    </div>
  <p></p>
  <p></p>
</div>`.trim();

  assertNodeEqual(actual, expected);
});

test('toMd snippets', () => {
  const html = `<div><p>check this out!</p>
<p><div class="snippet"><div class="snippet-code"><pre class="prettyprint-override lang-js snippet-code-js"><code>document.getElementById('btn').addEventListener('click', () =&gt; {
  const box = document.getElementById('greeting');
  box.textContent = 'You clicked the button!';
  box.style.backgroundColor = '#c0ffc0';
});</code></pre><pre class="prettyprint-override lang-css snippet-code-css"><code>.box {
  padding: 10px;
  background-color: lightblue;
  border: 1px solid #888;
  font-family: sans-serif;
  margin-bottom: 10px;
}</code></pre><pre class="prettyprint-override lang-html snippet-code-html"><code>&lt;div id="greeting" class="box"&gt;Hello, world!&lt;/div&gt;
&lt;button id="btn"&gt;Change Greeting&lt;/button&gt;</code></pre><div class="snippet-result"><div class="snippet-ctas d-flex ai-center"><div class="d-flex gs4"><button type="button" class="s-btn s-btn__filled flex--item"><svg aria-hidden="true" class="svg-icon iconPlay" width="17" height="18" viewBox="0 0 17 18"><path d="M3 2.87a1 1 0 0 1 1.55-.83l9.2 6.13a1 1 0 0 1 0 1.66l-9.2 6.13A1 1 0 0 1 3 15.13z"></path></svg><span> Run code snippet</span></button><button type="button" class="s-btn s-btn__outlined flex--item js-edit-snippet" style="">Edit code snippet</button></div><div class="d-flex ml-auto gs4"><button type="button" class="s-btn flex--item js-show-hide-results" style="display: none;"><svg aria-hidden="true" class="svg-icon iconEyeOff" width="18" height="18" viewBox="0 0 18 18"><path d="m5.02 9.44-2.22 2.2C1.63 10.25 1 9 1 9s3-6 8.06-6q1.13.01 2.12.38L9.5 5.03 9 5a4 4 0 0 0-3.98 4.44m2.03 3.05A4 4 0 0 0 13 9q-.01-1.1-.54-2l-1.51 1.54q.05.22.05.46a2 2 0 0 1-2.44 1.95zm7.11-7.22A15 15 0 0 1 17 9s-3 6-7.94 6c-1.31 0-2.48-.4-3.5-1l-1.97 2L2 14.41 14.59 2 16 3.41z"></path></svg><span> Hide Results</span></button><button type="button" class="s-btn flex--item copySnippet" style="display: none;"><svg aria-hidden="true" class="svg-icon iconCopy" width="17" height="18" viewBox="0 0 17 18"><path d="M5 6c0-1.09.91-2 2-2h4.5L15 7.5V15c0 1.09-.91 2-2 2H7c-1.09 0-2-.91-2-2zm6-1.25V8h3.25z"></path><path d="M10 1a2 2 0 0 1 2 2H6a2 2 0 0 0-2 2v9a2 2 0 0 1-2-2V4a3 3 0 0 1 3-3z" opacity=".4"></path></svg><span> Copy</span></button><button type="button" class="s-btn flex--item snippet-expand-link popout-code"><svg aria-hidden="true" class="svg-icon iconShareSm" width="14" height="14" viewBox="0 0 14 14"><path d="M5 1H3a2 2 0 0 0-2 2v8c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V9h-2v2H3V3h2zm2 0h6v6h-2V4.5L6.5 9 5 7.5 9.5 3H7z"></path></svg><span> Expand</span></button></div></div><div class="snippet-result-code" style="display: none;"><iframe name="sif96" sandbox="allow-forms allow-modals allow-scripts" class="snippet-box-edit snippet-box-result" frameborder="0"></iframe></div></div></div></div></p>
<p></p>
</div>`;

  const result = toMd(el(html));
  const expected = `
check this out!

<!-- begin snippet: -->

<!-- language: lang-js -->

document.getElementById('btn').addEventListener('click', () => {
  const box = document.getElementById('greeting');
  box.textContent = 'You clicked the button!';
  box.style.backgroundColor = '#c0ffc0';
});

<!-- language: lang-css -->

.box {
  padding: 10px;
  background-color: lightblue;
  border: 1px solid #888;
  font-family: sans-serif;
  margin-bottom: 10px;
}

<!-- language: lang-html -->

<div id="greeting" class="box">Hello, world!</div>
<button id="btn">Change Greeting</button>

<!-- end snippet -->`;

  strictEqual(result.trim(), expected.trim());
});

test('toMd js snippet', () => {
  const html = `<div class="s-prose py16 js-md-preview"><p>jstime, baby!</p>
<p><div class="snippet"><div class="snippet-code"><pre class="prettyprint-override lang-js snippet-code-js"><code>const x = 2;
const y = 3**2;
console.log(y);</code></pre><div class="snippet-result"><div class="snippet-ctas d-flex ai-center"><div class="d-flex gs4"><button type="button" class="s-btn s-btn__filled flex--item"><svg aria-hidden="true" class="svg-icon iconPlay" width="17" height="18" viewBox="0 0 17 18"><path d="M3 2.87a1 1 0 0 1 1.55-.83l9.2 6.13a1 1 0 0 1 0 1.66l-9.2 6.13A1 1 0 0 1 3 15.13z"></path></svg><span> Run code snippet</span></button><button type="button" class="s-btn s-btn__outlined flex--item js-edit-snippet" style="">Edit code snippet</button></div><div class="d-flex ml-auto gs4"><button type="button" class="s-btn flex--item js-show-hide-results" style=""><svg aria-hidden="true" class="svg-icon iconEyeOff" width="18" height="18" viewBox="0 0 18 18"><path d="m5.02 9.44-2.22 2.2C1.63 10.25 1 9 1 9s3-6 8.06-6q1.13.01 2.12.38L9.5 5.03 9 5a4 4 0 0 0-3.98 4.44m2.03 3.05A4 4 0 0 0 13 9q-.01-1.1-.54-2l-1.51 1.54q.05.22.05.46a2 2 0 0 1-2.44 1.95zm7.11-7.22A15 15 0 0 1 17 9s-3 6-7.94 6c-1.31 0-2.48-.4-3.5-1l-1.97 2L2 14.41 14.59 2 16 3.41z"></path></svg><span> Hide results</span></button><button type="button" class="s-btn flex--item copySnippet" style="display: none;"><svg aria-hidden="true" class="svg-icon iconCopy" width="17" height="18" viewBox="0 0 17 18"><path d="M5 6c0-1.09.91-2 2-2h4.5L15 7.5V15c0 1.09-.91 2-2 2H7c-1.09 0-2-.91-2-2zm6-1.25V8h3.25z"></path><path d="M10 1a2 2 0 0 1 2 2H6a2 2 0 0 0-2 2v9a2 2 0 0 1-2-2V4a3 3 0 0 1 3-3z" opacity=".4"></path></svg><span> Copy</span></button><button type="button" class="s-btn flex--item snippet-expand-link popout-code"><svg aria-hidden="true" class="svg-icon iconShareSm" width="14" height="14" viewBox="0 0 14 14"><path d="M5 1H3a2 2 0 0 0-2 2v8c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V9h-2v2H3V3h2zm2 0h6v6h-2V4.5L6.5 9 5 7.5 9.5 3H7z"></path></svg><span> Expand</span></button></div></div><div class="snippet-result-code" style=""><iframe name="sif41" sandbox="allow-forms allow-modals allow-scripts" class="snippet-box-edit snippet-box-result" frameborder="0"></iframe></div></div></div></div></p>
<p></p>
</div>`;

  const result = toMd(el(html));
  const expected = `
jstime, baby!

<!-- begin snippet: -->

<!-- language: lang-js -->

const x = 2;
const y = 3**2;
console.log(y);

<!-- end snippet -->`.trim();
  strictEqual(result, expected);
});

test('toHtml js snippet', () => {
  const html = `
<div class="s-prose py16 js-md-preview">
  <p>jstime, baby!</p>
  <p>
    <div class="snippet">
      <div class="snippet-code">
        <pre class="prettyprint-override lang-js snippet-code-js"><code>
const x = 2;
const y = 3**2;
console.log(y);
        </code></pre>
        <div class="snippet-result">
          <div class="snippet-ctas d-flex ai-center">
            <div class="d-flex gs4"><button type="button" class="s-btn s-btn__filled flex--item"><svg aria-hidden="true" class="svg-icon iconPlay" width="17" height="18" viewBox="0 0 17 18"><path d="M3 15.13z"></path></svg><span> Run code snippet</span></button><button type="button" class="s-btn s-btn__outlined flex--item js-edit-snippet" style="">Edit code snippet</button>
            </div>
            <div class="d-flex ml-auto gs4"><button type="button" class="s-btn flex--item js-show-hide-results" style=""><svg aria-hidden="true" class="svg-icon iconEyeOff" width="18" height="18" viewBox="0 0 18 18"><path d="m5.02 3.41z"></path></svg><span> Hide results</span></button><button type="button" class="s-btn flex--item copySnippet" style="display: none;"><svg aria-hidden="true" class="svg-icon iconCopy" width="17" height="18" viewBox="0 1.25V8h3.25z"></path><path d="M10 1a2-3z" opacity=".4"></path></svg><span> Copy</span></button><button type="button" class="s-btn flex--item snippet-expand-link popout-code"><svg aria-hidden="true" class="svg-icon iconShareSm" width="14" height="14" viewBox="0 0 14 14"><path d="M5 3H7z"></path></svg><span> Expand</span></button>
            </div>
          </div>
          <div class="snippet-result-code" style=""><iframe name="sif41" sandbox="allow-forms allow-modals allow-scripts" class="snippet-box-edit snippet-box-result" frameborder="0"></iframe>
          </div>
        </div>
      </div>
    </div>
  </p>
  <p></p>
</div>`.trim();

  const result = toHtml(el(html));

  // note that 'expected' here corrects malformed <div> inside <p>
  const expected = `
<div>
  <p>jstime, baby!</p>
  <p>
    </p><div>
      <div>
        <pre data-xlet-lang="js"><code>
const x = 2;
const y = 3**2;
console.log(y);
        </code></pre>
        
      </div>
    </div>
  <p></p>
  <p></p>
</div>`.trim();
  assertNodeEqual(result, expected);
});

test('scrapePostContributor basic editor', () => {
  const html = `<div class="post-signature flex--item">
<div class="user-info user-hover ">
    <div class="d-flex ">
        <div class="user-action-time fl-grow1">
            <a href="/posts/216464/revisions" title="show all edits to this post" class="js-gps-track" data-gps-track="post.click({ item: 4, priv: -1, post_type: 1 })">edited <span title="2014-01-16 21:40:44Z" class="relativetime">Jan 16, 2014 at 21:40</span></a>
        </div>
        
    </div>
    <div class="user-gravatar32">
        <a href="/users/21960/ale"><div class="gravatar-wrapper-32"><img src="https://www.gravatar.com/avatar/38fcb5fae943973f193524a8d597a65f?s=64&amp;d=identicon&amp;r=PG" alt="ale's user avatar" width="32" height="32" class="bar-sm"></div></a>
    </div>
    <div class="user-details">
        <a href="/users/21960/ale" dir="auto">ale</a>
        <div class="-flair">
            <span class="reputation-score" title="reputation score 25,032" dir="ltr">25k</span><span title="7 gold badges" aria-hidden="true"><span class="badge1"></span><span class="badgecount">7</span></span><span class="v-visible-sr">7 gold badges</span><span title="77 silver badges" aria-hidden="true"><span class="badge2"></span><span class="badgecount">77</span></span><span class="v-visible-sr">77 silver badges</span><span title="124 bronze badges" aria-hidden="true"><span class="badge3"></span><span class="badgecount">124</span></span><span class="v-visible-sr">124 bronze badges</span>
        </div>
    </div>
</div>
                </div>`;

  const node = el(html);
  const result = scrapePostContributor(node, document);
  const expected = {
    contributorType: 'editor',
    isOwner: false,
    timestamp: '2014-01-16 21:40:44Z',
    name: 'ale',
    userId: 21960,
    userSlug: 'ale',
  };
  deepStrictEqual(result, expected);
});

test('scrapePostContributor basic editor', () => {
  const html = `<div class="post-signature owner flex--item">
                <div class="user-info ">
    <div class="d-flex ">
        <div class="user-action-time fl-grow1">
            asked <span title="2014-01-16 20:53:40Z" class="relativetime">Jan 16, 2014 at 20:53</span>
        </div>
        
    </div>
    <div class="user-gravatar32">
        <span class="anonymous-gravatar"></span>
    </div>
    <div class="user-details" itemprop="author" itemscope="" itemtype="http://schema.org/Person">
        StinkyTofu<span class="d-none" itemprop="name">StinkyTofu</span>
        <div class="-flair">
            
        </div>
    </div>
</div>
            </div>`;

  const node = el(html);
  const result = scrapePostContributor(node, document);
  const expected = {
    contributorType: 'author',
    isOwner: true,
    timestamp: '2014-01-16 20:53:40Z',
    name: 'StinkyTofu',
    userId: -1,
    userSlug: '',
  };
  deepStrictEqual(result, expected);
});

test('', () => {
  const html = `
<div class="s-prose js-post-body" itemprop="text">
  <p>For an integer 
    <span class="math-container">
      <span class="MathJax_Preview" style=""></span>
      <span class="MathJax" id="MathJax-Element-33-Frame" tabindex="0" style="position: relative;" data-mathml="&lt;math
        xmlns=&quot;http://www.w3.org/1998/Math/MathML&quot;&gt;&lt;mi&gt;n&lt;/mi&gt;&lt;/math&gt;" role="presentation">
      </span>
      <script type="math/tex" id="MathJax-Element-33">n</script></span>, let's seek integral solutions of 
    <span class="math-container">
      <span class="MathJax_Preview" style=""></span>
      <span class="MathJax" id="MathJax-Element-34-Frame" tabindex="0" style="position: relative;" data-mathml="" role="presentation">
      </span>
      <script type="math/tex" id="MathJax-Element-34">x^3 + y^3 + z^3 = n</script></span>. 
  </p>
  <p>1) When 
    <span class="math-container">
      <span class="MathJax_Preview" style=""></span>
      <span class="MathJax" id="MathJax-Element-35-Frame" tabindex="0" style="position: relative;" data-mathml="&lt;math
        xmlns=&quot;http://www.w3.org/1998/Math/MathML&quot;&gt;&lt;mi&gt;n&lt;/mi&gt;&lt;mo&gt;=&lt;/mo&gt;&lt;mn&gt;29&lt;/mn&gt;&lt;/math&gt;" role="presentation">
      </span>
      <script type="math/tex" id="MathJax-Element-35">n = 29</script>
    </span> a solution is easy to find: 
    <span class="math-container">
      <span class="MathJax_Preview" style=""></span>
      <span class="MathJax" id="MathJax-Element-36-Frame" tabindex="0" style="position: relative;" data-mathml="" role="presentation">
      </span>
      <script type="math/tex" id="MathJax-Element-36">(x,y,z) = (3,1,1)</script></span>. 
  </p>
  <p>2) When 
    <span class="math-container">
      <span class="MathJax_Preview" style=""></span>
      <span class="MathJax" id="MathJax-Element-37-Frame" tabindex="0" style="position: relative;" data-mathml="&lt;math
        xmlns=&quot;http://www.w3.org/1998/Math/MathML&quot;&gt;&lt;mi&gt;n&lt;/mi&gt;&lt;mo&gt;=&lt;/mo&gt;&lt;mn&gt;33&lt;/mn&gt;&lt;/math&gt;" role="presentation">
      </span>
      <script type="math/tex" id="MathJax-Element-37">n = 33</script>
    </span> it is harder to find a solution, but one is known: 

    <span class="math-container">
      <span class="MathJax_Preview" style=""></span>
      <div class="MathJax_Display" style="text-align: center;">
        <span class="MathJax" id="MathJax-Element-38-Frame" tabindex="0" style="text-align: center; position: relative;" data-mathml="" role="presentation">
        </span>
      </div>
      <script type="math/tex; mode=display" id="MathJax-Element-38">(x,y,z) = (8866128975287528, -8778405442862239, -2736111468807040).</script>
    </span>
This was found in 2019 by Andrew Booker. See 
    <a href="https://people.maths.bris.ac.uk/~maarb/papers/cubesv1.pdf" rel="noreferrer">https://people.maths.bris.ac.uk/~maarb/papers/cubesv1.pdf</a> and 
    <a href="https://www.youtube.com/watch?v=ASoz_NuIvP0" rel="noreferrer">https://www.youtube.com/watch?v=ASoz_NuIvP0</a>.
  </p>
</div>
`.trim();
  const actual = toMd(el(html));
  // console.log(actual);
  const expected = `
For an integer $n$, let's seek integral solutions of $x^3 + y^3 + z^3 = n$.

1) When $n = 29$ a solution is easy to find: $(x,y,z) = (3,1,1)$.

2) When $n = 33$ it is harder to find a solution, but one is known:

$$
(x,y,z) = (8866128975287528, -8778405442862239, -2736111468807040).
$$

This was found in 2019 by Andrew Booker. See [https://people.maths.bris.ac.uk/~maarb/papers/cubesv1.pdf](https://people.maths.bris.ac.uk/~maarb/papers/cubesv1.pdf) and [https://www.youtube.com/watch?v=ASoz_NuIvP0](https://www.youtube.com/watch?v=ASoz_NuIvP0).
`.trim();

  expect(actual).toBe(expected);
});
