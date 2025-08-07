import { isElement } from "./utils";

type MathVariant = 'normal' | 'bold' | 'italic' | 'bold-italic' | 'double-struck' | 'bold-fraktur' | 'script' | 'bold-script' | 'fraktur' | 'sans-serif' | 'bold-sans-serif' | 'sans-serif-italic' | 'sans-serif-bold-italic' | 'monospace' | 'initial' | 'tailed' | 'looped' | 'stretched';
type MmlToTexOptions = {
  variantMap?: Partial<Record<MathVariant, (x: string) => string>>;
}
type Notation = 'longdiv' | 'box' | 'roundedbox' | 'circle' | 'left' | 'right' | 'top' | 'bottom' | 'updiagonalstrike' | 'downdiagonalstrike' | 'verticalstrike' | 'horizontalstrike' | 'updiagonalarrow' | 'phasorangle'
| 'leftright' | 'xcancel' | 'angle' | 'radical'; // extended for this codebase, replaced 'actuarial' and 'madruwb'

const ucRangesByVariant = {
  // https://en.wikipedia.org/wiki/Mathematical_Alphanumeric_Symbols
  normal: [
    { start: 0x41,    end: 0x5A,    base: 0x41   }, // A-Z
    { start: 0x61,    end: 0x7A,    base: 0x61   }, // a-z
    { start: 0x131,   end: 0x131,   base: 0x131  }, // ı
    { start: 0x237,   end: 0x237,   base: 0x237  }, // ȷ
    // Greek
    { start: 0x0391,  end: 0x03A1,  base: 0x0391 }, // Α–Ρ
    { start: 0x03F4,  end: 0x03F4,  base: 0x03F4 }, // ϴ
    { start: 0x03A3,  end: 0x03A9,  base: 0x03A3 }, // Σ–Ω
    { start: 0x2207,  end: 0x2207,  base: 0x2207 }, // ∇
    { start: 0x03DC,  end: 0x03DC,  base: 0x03DC }, // Ϝ
    { start: 0x03B1,  end: 0x03C9,  base: 0x03B1 }, // α–ω
    { start: 0x2202,  end: 0x2202,  base: 0x2202 }, // ∂
    { start: 0x03F5,  end: 0x03F5,  base: 0x03F5 }, // ϵ
    { start: 0x03D1,  end: 0x03D1,  base: 0x03D1 }, // ϑ
    { start: 0x03F0,  end: 0x03F0,  base: 0x03F0 }, // ϰ
    { start: 0x03D5,  end: 0x03D5,  base: 0x03D5 }, // ϕ
    { start: 0x03F1,  end: 0x03F1,  base: 0x03F1 }, // ϱ
    { start: 0x03D6,  end: 0x03D6,  base: 0x03D6 }, // ϖ
    { start: 0x03DD,  end: 0x03DD,  base: 0x03DD }, // ϝ
    // Digits
    { start: 0x30,    end: 0x39,    base: 0x30   }, // 0-9
  ],
  'bold': [
    { start: 0x1D400, end: 0x1D419, base: 0x41   }, // A-Z
    { start: 0x1D41A, end: 0x1D433, base: 0x61   }, // a-z
    { start: 0x1D7CE, end: 0x1D7D7, base: 0x30   }, // 0-9
    // Greek
    { start: 0x1D6A8, end: 0x1D6B8, base: 0x0391 }, // Α–Ρ
    { start: 0x1D6B9, end: 0x1D6B9, base: 0x03F4 }, // ϴ
    { start: 0x1D6BA, end: 0x1D6C0, base: 0x03A3 }, // Σ–Ω
    { start: 0x1D6C1, end: 0x1D6C1, base: 0x2207 }, // ∇
    { start: 0x1D7CA, end: 0x1D7CA, base: 0x03DC }, // Ϝ
    { start: 0x1D6C2, end: 0x1D6DA, base: 0x03B1 }, // α–ω
    { start: 0x1D6DB, end: 0x1D6DB, base: 0x2202 }, // ∂
    { start: 0x1D6DC, end: 0x1D6DC, base: 0x03F5 }, // ϵ
    { start: 0x1D6DD, end: 0x1D6DD, base: 0x03D1 }, // ϑ
    { start: 0x1D6DE, end: 0x1D6DE, base: 0x03F0 }, // ϰ
    { start: 0x1D6DF, end: 0x1D6DF, base: 0x03D5 }, // ϕ
    { start: 0x1D6E0, end: 0x1D6E0, base: 0x03F1 }, // ϱ
    { start: 0x1D6E1, end: 0x1D6E1, base: 0x03D6 }, // ϖ
    { start: 0x1D7CB, end: 0x1D7CB, base: 0x03DD }, // ϝ
    // Digits
    { start: 0x1D7CE, end: 0x1D7D7, base: 0x30   }, // 0-9
  ],
  'italic': [
    { start: 0x1D434, end: 0x1D44D, base: 0x41   }, // A–Z
    { start: 0x1D44E, end: 0x1D467, base: 0x61   }, // a–z
    { start: 0x210E,  end: 0x210E,  base: 0x68   }, // h
    { start: 0x1D6A4, end: 0x1D6A4, base: 0x131  }, // 𝚤
    { start: 0x1D6A5, end: 0x1D6A5, base: 0x237  }, // 𝚥
    // Greek
    { start: 0x1D6E2, end: 0x1D6F2, base: 0x0391 }, // Α–Ρ
    { start: 0x1D6F3, end: 0x1D6F3, base: 0x03F4 }, // ϴ
    { start: 0x1D6F4, end: 0x1D6FA, base: 0x03A3 }, // Σ–Ω
    { start: 0x1D6FB, end: 0x1D6FB, base: 0x2207 }, // ∇
    { start: 0x1D6FC, end: 0x1D714, base: 0x03B1 }, // α–ω
    { start: 0x1D715, end: 0x1D715, base: 0x2202 }, // ∂
    { start: 0x1D716, end: 0x1D716, base: 0x03F5 }, // ϵ
    { start: 0x1D717, end: 0x1D717, base: 0x03D1 }, // ϑ
    { start: 0x1D718, end: 0x1D718, base: 0x03F0 }, // ϰ
    { start: 0x1D719, end: 0x1D719, base: 0x03D5 }, // ϕ
    { start: 0x1D71A, end: 0x1D71A, base: 0x03F1 }, // ϱ
    { start: 0x1D71B, end: 0x1D71B, base: 0x03D6 }, // ϖ
  ],
  'bold-italic': [
    { start: 0x1D468, end: 0x1D481, base: 0x41   }, // A-Z
    { start: 0x1D482, end: 0x1D49B, base: 0x61   }, // a-z
    // Greek
    { start: 0x1D71C, end: 0x1D72C, base: 0x0391 }, // Α–Ρ
    { start: 0x1D72D, end: 0x1D72D, base: 0x03F4 }, // ϴ
    { start: 0x1D72E, end: 0x1D734, base: 0x03A3 }, // Σ–Ω
    { start: 0x1D735, end: 0x1D735, base: 0x2207 }, // ∇
    { start: 0x1D736, end: 0x1D74E, base: 0x03B1 }, // α–ω
    { start: 0x1D74F, end: 0x1D74F, base: 0x2202 }, // ∂
    { start: 0x1D750, end: 0x1D750, base: 0x03F5 }, // ϵ
    { start: 0x1D751, end: 0x1D751, base: 0x03D1 }, // ϑ
    { start: 0x1D752, end: 0x1D752, base: 0x03F0 }, // ϰ
    { start: 0x1D753, end: 0x1D753, base: 0x03D5 }, // ϕ
    { start: 0x1D754, end: 0x1D754, base: 0x03F1 }, // ϱ
    { start: 0x1D755, end: 0x1D755, base: 0x03D6 }, // ϖ
  ],
  'double-struck': [
    { start: 0x1D538, end: 0x1D551, base: 0x41   }, // A–Z
    { start: 0x1D552, end: 0x1D56B, base: 0x61   }, // a–z
    { start: 0x2102,  end: 0x2102,  base: 0x43   }, // C
    { start: 0x210D,  end: 0x210D,  base: 0x48   }, // H
    { start: 0x2115,  end: 0x2115,  base: 0x4E   }, // N
    { start: 0x2119,  end: 0x2119,  base: 0x50   }, // P
    { start: 0x211A,  end: 0x211A,  base: 0x51   }, // Q
    { start: 0x211D,  end: 0x211D,  base: 0x52   }, // R
    { start: 0x2124,  end: 0x2124,  base: 0x5A   }, // Z
    // Digits
    { start: 0x1D7D8, end: 0x1D7E1, base: 0x30   }, // 0–9
  ],
  'bold-fraktur': [
    { start: 0x1D56C, end: 0x1D585, base: 0x41   }, // A–Z
    { start: 0x1D586, end: 0x1D59F, base: 0x61   }, // a–z
  ],
  'script': [
    { start: 0x1D49C, end: 0x1D4B5, base: 0x41   }, // A–Z
    { start: 0x1D4B6, end: 0x1D4CF, base: 0x61   }, // a–z
    { start: 0x212C,  end: 0x212C,  base: 0x42   }, // B
    { start: 0x2130,  end: 0x2131,  base: 0x45   }, // E, F
    { start: 0x210B,  end: 0x210B,  base: 0x48   }, // H
    { start: 0x2110,  end: 0x2110,  base: 0x49   }, // I
    { start: 0x2112,  end: 0x2112,  base: 0x4C   }, // L
    { start: 0x2133,  end: 0x2133,  base: 0x4D   }, // M
    { start: 0x211B,  end: 0x211B,  base: 0x52   }, // R
    { start: 0x212F,  end: 0x212F,  base: 0x65   }, // e
    { start: 0x210A,  end: 0x210A,  base: 0x67   }, // g
    { start: 0x2134,  end: 0x2134,  base: 0x6F   }, // o
  ],
  'bold-script': [
    { start: 0x1D4D0, end: 0x1D4E9, base: 0x41   }, // A–Z
    { start: 0x1D4EA, end: 0x1D503, base: 0x61   }, // a–z
  ],
  'fraktur': [
    { start: 0x1D504, end: 0x1D51D, base: 0x41   }, // A–Z
    { start: 0x1D51E, end: 0x1D537, base: 0x61   }, // a–z
    { start: 0x212D,  end: 0x212D,  base: 0x43   }, // C
    { start: 0x210C,  end: 0x210C,  base: 0x48   }, // H
    { start: 0x2111,  end: 0x2111,  base: 0x49   }, // I
    { start: 0x211C,  end: 0x211C,  base: 0x52   }, // R
    { start: 0x2128,  end: 0x2128,  base: 0x5A   }, // Z
  ],
  'sans-serif': [
    { start: 0x1D5A0, end: 0x1D5B9, base: 0x41   }, // A–Z
    { start: 0x1D5BA, end: 0x1D5D3, base: 0x61   }, // a–z
    // Digits
    { start: 0x1D7E2, end: 0x1D7EB, base: 0x30   }, // 0–9
  ],
  'bold-sans-serif': [
    { start: 0x1D5D4, end: 0x1D5ED, base: 0x41   }, // A–Z
    { start: 0x1D5EE, end: 0x1D607, base: 0x61   }, // a–z
    // Greek
    { start: 0x1D756, end: 0x1D766, base: 0x0391 }, // Α–Ρ
    { start: 0x1D767, end: 0x1D767, base: 0x03F4 }, // ϴ
    { start: 0x1D768, end: 0x1D76E, base: 0x03A3 }, // Σ–Ω
    { start: 0x1D76F, end: 0x1D76F, base: 0x2207 }, // ∇
    { start: 0x1D770, end: 0x1D788, base: 0x03B1 }, // α–ω
    { start: 0x1D789, end: 0x1D789, base: 0x2202 }, // ∂
    { start: 0x1D78A, end: 0x1D78A, base: 0x03F5 }, // ϵ
    { start: 0x1D78B, end: 0x1D78B, base: 0x03D1 }, // ϑ
    { start: 0x1D78C, end: 0x1D78C, base: 0x03F0 }, // ϰ
    { start: 0x1D78D, end: 0x1D78D, base: 0x03D5 }, // ϕ
    { start: 0x1D78E, end: 0x1D78E, base: 0x03F1 }, // ϱ
    { start: 0x1D78F, end: 0x1D78F, base: 0x03D6 }, // ϖ
    // Digits
    { start: 0x1D7EC, end: 0x1D7F5, base: 0x30   }, // 0–9
  ],
  'sans-serif-italic': [
    { start: 0x1D608, end: 0x1D621, base: 0x41   }, // A–Z
    { start: 0x1D622, end: 0x1D63B, base: 0x61   }, // a–z
  ],
  'sans-serif-bold-italic': [
    { start: 0x1D63C, end: 0x1D655, base: 0x41   }, // A–Z
    { start: 0x1D656, end: 0x1D66F, base: 0x61   }, // a–z
    // Greek
    { start: 0x1D790, end: 0x1D7A0, base: 0x0391 }, // Α–Ρ
    { start: 0x1D7A1, end: 0x1D7A1, base: 0x03F4 }, // ϴ
    { start: 0x1D7A2, end: 0x1D7A8, base: 0x03A3 }, // Σ–Ω
    { start: 0x1D7A9, end: 0x1D7A9, base: 0x2207 }, // ∇
    { start: 0x1D7AA, end: 0x1D7C2, base: 0x03B1 }, // α–ω
    { start: 0x1D7C3, end: 0x1D7C3, base: 0x2202 }, // ∂
    { start: 0x1D7C4, end: 0x1D7C4, base: 0x03F5 }, // ϵ
    { start: 0x1D7C5, end: 0x1D7C5, base: 0x03D1 }, // ϑ
    { start: 0x1D7C6, end: 0x1D7C6, base: 0x03F0 }, // ϰ
    { start: 0x1D7C7, end: 0x1D7C7, base: 0x03D5 }, // ϕ
    { start: 0x1D7C8, end: 0x1D7C8, base: 0x03F1 }, // ϱ
    { start: 0x1D7C9, end: 0x1D7C9, base: 0x03D6 }, // ϖ
  ],
  'monospace': [
    { start: 0x1D670, end: 0x1D689, base: 0x41   }, // A–Z
    { start: 0x1D68A, end: 0x1D6A3, base: 0x61   }, // a–z
    // Digits
    { start: 0x1D7F6, end: 0x1D7FF, base: 0x30   }, // 0–9
  ],
  'initial': [],
  'tailed': [],
  'looped': [],
  'stretched': [],
};

const texFnByVariant: Record<MathVariant, (x: string) => string> = {
  'normal':                 x => x,
  'bold':                   x => `\\mathbf{${x}}`,
  'italic':                 x => `\\mathit{${x}}`,
  'bold-italic':            x => `\\mathbfit{${x}}`,   // `\\boldsymbol{\\mathit{${x}}}`
  'double-struck':          x => `\\mathbb{${x}}`,
  'script':                 x => `\\mathcal{${x}}`,
  'bold-script':            x => `\\mathbfcal{${x}}`,  // `\\mathbf{\\mathcal{${x}}}`
  'fraktur':                x => `\\mathfrak{${x}}`,
  'bold-fraktur':           x => `\\mathbffrak{${x}}`, // `\\mathbf{\\mathfrak{${x}}}`
  'sans-serif':             x => `\\mathsf{${x}}`,
  'bold-sans-serif':        x => `\\mathbfsf{${x}}`,   // `\\mathbf{\\mathsf{${x}}}`
  'sans-serif-italic':      x => `\\mathsfit{${x}}`,   // `\\mathsf{\\mathit{${x}}}`
  'sans-serif-bold-italic': x => `\\mathbfsfit{${x}}`, // `\\mathbf{\\mathsf{\\mathit{${x}}}}`
  'monospace':              x => `\\mathtt{${x}}`,
  'initial':                x => x,
  'tailed':                 x => x,
  'looped':                 x => x,
  'stretched':              x => x,
};

const texFnByNotation: Record<Notation, (x: string) => string> = {
  'box':                x => `\\boxed{${x}}`,
  'roundedbox':         x => `\\boxed{${x}}`,
  'circle':             x => `\\circled{${x}}`,
  'top':                x => `\\overline{${x}}`,
  'bottom':             x => `\\underline{${x}}`,
  'leftright':          x => `\\left|${x}\\right|`,
  'left':               x => `\\left|${x}\\right.`,
  'right':              x => `\\left.${x}\\right|`,
  'angle':              x => `\\angle{${x}}`,
  'updiagonalarrow':    x => `\\cancelto{}{${x}}`, 
  'updiagonalstrike':   x => `\\cancel{${x}}`,
  'downdiagonalstrike': x => `\\bcancel{${x}}`,
  'xcancel':            x => `\\xcancel{${x}}`,
  'verticalstrike':     x => `\\hcancel{${x}}`,
  'horizontalstrike':   x => `\\text{\\sout{$${x}$}}`,
  'longdiv':            x => `\\longdiv{${x}}`,
  'radical':            x => `\\sqrt{${x}}`,
  'phasorangle':        x => `\\angle{\\underline{${x}}}`,
};

const notationPriority: Notation[] = Object.keys(texFnByNotation).reverse() as Notation[];

export function mmlToTex(node: MathMLElement|undefined|null): string {
  if (!isMathMLElement(node)) return '';

  function glueChildren(node: Element): string {
    return [...node.children].filter(isMathMLElement).map(mmlToTex).filter(Boolean).join('');
  }

  switch (node.tagName.toLowerCase()) {
    case "annotation-xml":
      return '';
    case "annotation":
      return '';
    case "maction": {
      // NOTE: unclear whether to filter on `isMathMLElement`, as `maction` can contain non-MathML content.
      const el = node.children[+(node.getAttribute('selection') ?? '1') - 1];
      return isMathMLElement(el) ? mmlToTex(el) : '';
    }
    case "math": {
      return glueChildren(node);
    }
    case "menclose": {
      let notationsArr = node.getAttribute('notation')?.trim().split(/\s+/).filter(Boolean) ?? ['longdiv'];
      notationsArr = notationsArr.flatMap((n): string[] => {
        switch (n) {
          case 'actuarial':   return ['top', 'right'];
          case 'madruwb':     return ['bottom', 'right'];
          default: return [n];
        }
      });
      let notationsSet = new Set(notationsArr);

      // Collapse combos in priority order
      const replacements: [Notation, Set<Notation>][] = [
        ['box',       new Set(['top', 'bottom', 'left', 'right'])],
        ['leftright', new Set(['left', 'right'])],
        ['xcancel',   new Set(['updiagonalstrike', 'downdiagonalstrike'])],
      ];
      for (const [replacement, group] of replacements) {
        if (notationsSet.isSupersetOf(group)) {
          notationsSet = notationsSet.difference(group);
          notationsSet.add(replacement);
        }
      }
      notationsArr = [...notationsSet];
      notationsArr.sort((a, b) => notationPriority.indexOf(a as Notation) - notationPriority.indexOf(b as Notation));

      let content = glueChildren(node);
      for (const notation of notationsArr) {
        if (notation in texFnByNotation) {
          content = texFnByNotation[notation as Notation](content);
        } else {
          content = `\\unsupportednotation-${notation}{${content}}`;
        }
      }
      return content;
    }
    case 'merror': {
      return glueChildren(node);
    }
    case "mi": {
      // <mi>: Identifier, e.g. variables ("x", "sin", ...)
      const attrVariant = node.getAttribute('mathvariant') as MathVariant | null;

      const segments = segmentMathVariants(node.textContent ?? '');
      const resolved = segments.map(seg => ({
        variant: (attrVariant && seg.variant === 'normal') ? attrVariant : seg.variant,
        str: seg.str,
      }));
      const merged = resolved.reduce((acc, seg) => {
        if (acc[acc.length - 1]?.variant === seg.variant) {
          acc[acc.length - 1].str += seg.str;
        } else {
          acc.push({ ...seg });
        }
        return acc;
      }, [] as { variant: MathVariant, str: string }[]);
      return merged.map(({ variant, str }) => texifyVariantText(variant, str)).join('');
    }

    case "mn": {
      return node.textContent ?? "";
    }

    case "mo": {
      // <mo>: Operator, e.g. "+", "-", "∫"

      // Eventually: lookup Unicode→LaTeX map; for now, just emit content
      return node.textContent ?? "";
    }

    case "mrow": {
      return glueChildren(node);
    }

    case "mtext": {
      // If you want to be robust: escape braces, etc.
      return `\\text{${node.textContent ?? ""}}`;
    }

    default:
      throw new Error(`Unsupported MathML tag: ${node.tagName}`);
  }
}

export function isMathMLElement(node?: Node|null): node is MathMLElement {
  return !!node && isElement(node) && node.namespaceURI === "http://www.w3.org/1998/Math/MathML";
}

export function segmentMathVariants(text: string): { variant: MathVariant, str: string }[] {
  let current: { variant: MathVariant|null, str: string } = { variant: null, str: '' };
  const runs = [current];

  for (const char of text) {
    const { variant, ascii } = getMathVariant(char);
    if (current.variant === null && variant) {
      current.variant = variant;
    }
    if (current.variant === variant || variant === null) {
      current.str += ascii;
    } else {
      current = { variant, str: ascii };
      runs.push(current);
    }
  }
  return runs.map(run => ({ variant: run.variant || 'normal', str: run.str }));
}

export function getMathVariant(char: string): { variant: MathVariant|null, ascii: string } {
  const code = char.codePointAt(0);
  if (code === undefined) return { variant: null, ascii: char };

  for (const [variant, ranges] of Object.entries(ucRangesByVariant) as [MathVariant, { start: number, end: number, base: number }[]][]) {
    const match = ranges.find(({ start, end }) => code >= start && code <= end);
    if (match) {
      const asciiCode = match.base + (code - match.start);
      return { variant, ascii: String.fromCodePoint(asciiCode) };
    }
  }
  return { variant: null, ascii: char };
}

export function texifyVariantText(variant: MathVariant, text: string, opts:MmlToTexOptions = {}): string {
  const { variantMap: userVariantMap } = opts;
  const fn = userVariantMap?.[variant] ?? texFnByVariant[variant];
  return fn ? fn(text) : text;
}

