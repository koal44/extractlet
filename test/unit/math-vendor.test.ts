import { describe, it, expect } from 'vitest';
import { normalizeTex, mathReprToMd } from '../../src/math-vendor';
import { DefaultToMdContext, type ToMdContext } from '../../src/core';

describe('math-vendor: normalizeTex', () => {
  it('trims outer whitespace', () => {
    expect(normalizeTex('  x  ')).toBe('x');
  });

  it('strips outer {\\displaystyle ...} wrapper (whole-string only)', () => {
    expect(normalizeTex('{\\displaystyle x+y}')).toBe('x+y');
    expect(normalizeTex('{  \\displaystyle   x+y  }')).toBe('x+y');
  });

  it('does not strip \\displaystyle when not an outer wrapper', () => {
    expect(normalizeTex('x+{\\displaystyle y}')).toBe('x+{\\displaystyle y}');
  });

  it('removes horizontal whitespace before sub/superscripts with braces', () => {
    expect(normalizeTex('a _{i} + b ^{2}')).toBe('a_{i} + b^{2}');
    expect(normalizeTex('\\sum _{j=1}^{n}')).toBe('\\sum_{j=1}^{n}');
  });

  it('removes whitespace between "}" and punctuation', () => {
    expect(normalizeTex('\\mathbb {R} ,')).toBe('\\mathbb{R},');
  });

  it('collapses whitespace between control word and "{"', () => {
    expect(normalizeTex('\\mathbf {x}')).toBe('\\mathbf{x}');
    expect(normalizeTex('\\mathbb   {R}')).toBe('\\mathbb{R}');
  });

  it('', () => {
    expect(
      normalizeTex('{\\displaystyle \\mathbf {\\hat {e}} _{i}=\\sum _{j=1}^{n}\\mathbf {e} _{j}R_{i}^{j}=\\mathbf {e} _{j}R_{i}^{j}.}')
    ).toBe('\\mathbf{\\hat{e}}_{i}=\\sum_{j=1}^{n}\\mathbf{e}_{j}R_{i}^{j}=\\mathbf{e}_{j}R_{i}^{j}.');
  });
});

describe('math-vendor: mathReprToMd', () => {
  it('frames normalized TeX when tex is present', () => {
    const ctx: ToMdContext = {
      ...DefaultToMdContext,
      mathFence: 'dollar',
      compact: false,
      inListItem: false,
    };

    const md = mathReprToMd(
      {
        tex: '{\\displaystyle \\sum _{j=1}^{n} \\mathbb {R} ,}',
        mathml: null,
        svg: null,
        display: 'block',
      },
      ctx
    ).md?.trim();

    expect(md).toBe('$$\n\\sum_{j=1}^{n} \\mathbb{R},\n$$');
  });
});
