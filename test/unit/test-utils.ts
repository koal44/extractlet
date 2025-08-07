import { JSDOM } from 'jsdom';
import { strictEqual } from 'node:assert';
import { escapeHtml, isElement, isHTML, isNode, isText, log } from '../../src/utils';
import { execSync } from 'node:child_process';
import path from 'node:path';
import saxonJS from 'saxon-js';
import { existsSync, readFileSync } from 'node:fs';

export function setupDom() {
  const dom = new JSDOM();

  // add global.Node, global.document, global.HTMLDivElement, etc.
  for (const prop of Object.getOwnPropertyNames(dom.window)) {
    if (prop in globalThis) continue;
    try {
      (globalThis as any)[prop] = (dom.window as any)[prop];
    } catch {
      // Ignore properties that cannot be set
    }
  }
}

// Each call creates a new JSDOM instance to break prototype chain assumptions.
// This ensures tests will fail if src code relies on instanceof checks.
export function el(html: string, selector = 'body > *'): Element | null {
  // document.body.innerHTML = html;
  // return document.querySelector(selector);

  const dom = new JSDOM(html);
  return dom.window.document.querySelector(selector);
}

export function mathEl(html: string): MathMLElement {
  html = /^\s*<math\b/i.test(html)
    ? html.replace(/^(\s*<math)(?![^>]*\bxmlns=)/i, '$1 xmlns="http://www.w3.org/1998/Math/MathML"')
    : `<math xmlns="http://www.w3.org/1998/Math/MathML">${html}</math>`;

  return el(html) as MathMLElement;
}

export function assertNodeEqual(actual:Node|string|null, expected:Node|string|null) {
  const actualHtml = htmlify(actual); //.replace(/\s+/g, '');
  const expectedHtml = htmlify(expected); //.replace(/\s+/g, '');

  strictEqual(actualHtml, expectedHtml);
}

export function htmlify(el: Node|string|null|undefined): string {
  if (el === null || el === undefined) return '';
  if (typeof el === 'string') return el;
  if (isElement(el)) {
    const tag = el.tagName.toLowerCase();
    const attrs: string[] = [];
    const sorted = [...el.attributes].sort((a, b) => a.name.localeCompare(b.name));
    for (const { name, value } of sorted) {
      let val = value;

      switch (name) {
        case 'class':
          if (el.classList.length > 0) {
            val = [...el.classList].sort().join(' ');
          }
          break;
        case 'style':
          if (isHTML(el) && el.style.length > 0) {
            val = Array.from(el.style)
              .sort()
              .map(k => `${k}: ${el.style.getPropertyValue(k)};`)
              .join(' ');
          }
          break;
        default:
          val = value;
      }

      attrs.push(`${name}="${val}"`);
    }
    const attrString = attrs.length ? ' ' + attrs.join(' ') : '';
    const children = [...el.childNodes].map(child => htmlify(child)).join('');
    return `<${tag}${attrString}>${children}</${tag}>`;
  }
  if (isText(el)) {
    return escapeHtml(el.textContent || '');
  }
  if (isNode(el)) {
    return escapeHtml(el.textContent || '');
  }
  return String(el);
}

export function assertApproxEqual(actual:number, expected:number, tolerance = 0.001, message = '') {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`Expected a:'${actual}' ≈ e:'${expected}' (±${tolerance})${message ? ': ' + message : ''}`);
  }
}

function pandocAvailable(): void {
  try {
    execSync('pandoc --version', { stdio: 'ignore' });
  } catch {
    throw new Error('Error: Pandoc not found in PATH.\nInstall from https://github.com/jgm/pandoc/releases\n');
  }
}

export function logPandocHtmlToMd(input: string): void {
  pandocAvailable();
  if (process?.env?.PANDOC !== 'true') return;

  const mdFlavors = ['markdown']; //, 'markdown_phpextra', 'markdown_mmd', 'markdown_strict', 'commonmark', 'gfm', 'commonmark_x'];
  log(`[${logPandocHtmlToMd.name}]\n--- Input ---\n${input}\n\n`, { jsonifyStrings: false });
  for (const flavor of mdFlavors) {
    const out = execSync(`pandoc -f html -t markdown`, { input }).toString();
    log(`--- Output ${flavor} ---\n${out}`, { jsonifyStrings: false });
  }
}

export function logPandocWtToMd(input: string): void {
  pandocAvailable();
  if (process?.env?.PANDOC !== 'true') return;

  const mdFlavors = ['markdown']; // 'markdown_phpextra', 'markdown_mmd', 'markdown_strict', 'commonmark', 'gfm', 'commonmark_x'];
  log(`[${logPandocWtToMd.name}]\n--- Input ---\n${input}\n\n`, { jsonifyStrings: false });
  for (const flavor of mdFlavors) {
    const out = execSync(`pandoc -f mediawiki -t ${flavor}`, { input }).toString();
    log(`--- Output ${flavor} ---\n${out}`, { jsonifyStrings: false });
  }
}

/**
 * Integration Notes: Patching Transpect XSLT (MathML-to-TeX) for Node.js/SaxonJS
 *
 * Required patches to make vendor/mml2tex/xsl/mml2tex.xsl work in Node:
 *
 *   1. [PATCH] Ensure mode invocation:
 *      Add template to apply-templates in mode="mathml2tex" at the root:
 *        <xsl:template match="/">
 *          <xsl:apply-templates mode="mathml2tex"/>
 *        </xsl:template>
 *
 *   2. [PATCH] Remove/disable any remote XSLT dependencies:
 *      Comment out unreachable <xsl:import> (e.g., colors.xsl from HTTP).
 *      <!-- <xsl:import href="http://transpect.io/xslt-util/colors/xsl/colors.xsl"/> -->
 *
 *   3. [PATCH] Remove/rewrite references to functions missing after (2):
 *      If a function (e.g., tr:color-hex-rgb-to-keyword) is used only to map colors,
 *      replace conditional with the fallback clause only.
 *      <xsl:value-of select="concat('\textcolor{color-', upper-case(substring-after((@mathcolor, @color)[1], '#')), '}{')"/>
 *
 */

/**
 * Transform MathML (or XML) to TeX using the Transpect XSLT, asynchronously.
 * 
 * @param input XML string to transform
 * @returns Promise<string | undefined> The transformation result as a string, or undefined if not configured.
 * 
 * PATCHES needed for Transpect compatibility:
 *  1. Comment out XSL import of colors.xsl if network fetch fails.
 *  2. Patch or disable color mapping fallback code.
 *  3. Ensure the top-level template applies templates in mathml2tex mode:
 *     <xsl:template match="/"><xsl:apply-templates mode="mathml2tex"/></xsl:template>
 */
export function logTranspect(input: string): string|undefined {
  // console.log('saxonJS keys:', Object.keys(saxonJS));
  // console.log('saxonJS.XPath keys:', Object.keys(saxonJS.XPath));

  if (!process?.env?.TRANSPECT) return;
  const xslPath = path.resolve(process.env.TRANSPECT);
  if (!xslPath.endsWith('.xsl')) throw new Error(`.env.TRANSPECT must point to an .xsl file, got: ${xslPath}`);
  if (!existsSync(xslPath))  throw new Error(`File not found: ${xslPath}`);
  
  const xslContent = readFileSync(xslPath, 'utf8');

  const result = saxonJS.XPath.evaluate(
    `transform(
        map {
          'source-node': parse-xml($xml),
          'stylesheet-text': $xslt,
          'delivery-format': 'serialized',
          'stylesheet-base-uri': $baseuri
        }
    )?output`,
    [],
    {
      params: {
        xml: input,
        xslt: xslContent,
        baseuri: "file:///C:/Users/rando/source/repos/_JS/extractlet/vendor/mml2tex/xsl/",
      },
    }
  );

  return result; // return the result of the transformation
}
