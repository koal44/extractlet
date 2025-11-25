Bookmarklets for capturing fixtures
===================================

These bookmarklets are dev-only helpers for grabbing stable HTML fixtures
from live pages (GitHub, Stack Exchange, Wikipedia, etc.).

They assume:
- You're looking at the live page in a normal browser tab.
- You'll move the saved HTML into `test/fix/fixtures/...`.
- You have `npm run printfix` wired up to inspect/pretty-print a fixture.

Use them exactly in this order.

------------------------------------------------------------
1. Annotate MathJax (TeX / MathML) *before saving*
------------------------------------------------------------

Run this FIRST on pages that use MathJax v3/v4.

It walks `MathJax.startup.document.math.list` and adds the original math
source onto each `mjx-container`:

- TeX    → `data-xlet-tex="..."`
- MathML → `data-xlet-mathml="..."`

If it sees **any other** input jax (AsciiMath, generic, custom), it *throws*.
That's deliberate: it means this page uses an input type we don't support.
Investigate before capturing the fixture.

(Bookmarklet code:)
javascript: (function() {
  try {
    if (MathJax?.Hub?.getAllJax) {
      MathJax.Hub.getAllJax().forEach((jax) => {
        const src = jax.SourceElement && jax.SourceElement();
        if (!src) throw new Error('MathJax v2: Jax without source element');
        if (!jax.root || typeof jax.root.toMathML !== 'function') {
          throw new Error('MathJax v2: Jax missing root.toMathML');
        }

        const mml = jax.root.toMathML('');
        src.setAttribute('data-xlet-mathml', mml);
      });
      return;
    }

    const list = MathJax?.startup?.document?.math?.list;
    if (!list) throw new Error('MathJax startup.document.math.list not found');

    for (let link = list.next; link !== list; link = link.next) {
      const m = link.data;
      if (!m || !m.typesetRoot) continue;

      const name = m.inputJax?.name;

      if (name === 'TeX') {
        if (!m.math) throw new Error('TeX item missing math source');
        m.typesetRoot.setAttribute('data-xlet-tex', m.math);
      } else if (name === 'MathML') {
        if (!m.math) throw new Error('MathML item missing math source');
        m.typesetRoot.setAttribute('data-xlet-mathml', m.math);
      } else {
        throw new Error(`Unsupported MathJax inputJax.name: ${String(name)}`);
      }

      const originalMml = m.inputData?.originalMml;
      if (originalMml) m.typesetRoot.setAttribute('data-xlet-mathml', originalMml);

      if (!m.typesetRoot.getAttribute('data-xlet-mathml')) {
        const root = m.root || m.data?.root;
        const mml = root && MathJax.startup.document.toMML?.(root);
        if (mml) {
          m.typesetRoot.setAttribute('data-xlet-mathml', mml);
        } else {
          throw new Error('Failed to regenerate MathML from root');
        }
      }
    }
  } catch (e) {
    console.error(e);
    alert(`[xlet MathJax normalize] ${ e?.message ? e.message : 'Unknown error'}`);
  }
})();

------------------------------------------------------------
2. Save current page as a static HTML fixture
------------------------------------------------------------

Use this AFTER normalization (or immediately, if there's no MathJax).

This captures `document.documentElement.outerHTML`, injects a strict CSP
so that **no JS runs** when you open the file offline, and saves a single
standalone HTML file that won't mutate on reload.

(Bookmarklet code:)
javascript:(()=>{try{
  const addCSP = s => s.replace(/<head(\b[^>]*)>/i,
    '<head$1><meta http-equiv="Content-Security-Policy" content="script-src \'none\'; connect-src \'none\'; frame-src \'none\'; object-src \'none\'">');
  const html='<!DOCTYPE html>\n'+addCSP(document.documentElement.outerHTML);
  const blob=new Blob([html],{type:'text/html'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='page.html';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
}catch(e){alert('Save failed: '+e)}})();

------------------------------------------------------------
Typical fixture workflow (for Future Me)
------------------------------------------------------------

1. Open the live page you want to fixture.

2. If the page uses MathJax v3/v4:
   - Run the **Annotate MathJax** bookmarklet first.
   - If it alerts about unsupported `inputJax.name`, stop and investigate.

3. Run the **Save current page** bookmarklet.
   - Move the saved HTML into `test/fix/fixtures/...`.
   - Rename to something reasonable (e.g. `se-inline-math.html`).

4. From repo root:
   - `npm run printfix -- path/to/fixture.html`
   - Use the output to inspect DOM structure, derive `.expect.ts`,
     and confirm math annotations look correct.

5. Update tests / code paths to support whatever the new fixture exposes.
