import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'url';
import { JSDOM, VirtualConsole } from 'jsdom';

export type BaseSidecar<TExpect> = {
  baseUrl: string;
  expect: TExpect;
  test?: (dom: Document) => void | Promise<void>;
};

export type FixtureCase<TExpect> = BaseSidecar<TExpect> & {
  name: string;          // derived from sidecar filename
  sidePath: string;      // absolute sidecar path
  htmlPath: string;      // absolute html path
  html: string;          // file contents
  dom: Document;         // parsed DOM
};

export function readHtmlFile(fullPath: string, { baseUrl = 'https://example.com' } = {}): Document {
  const html = fs.readFileSync(fullPath, 'utf8');

  // TODO: find out why this is blowing up with some fixtures (e.g., se1.html). for now, suppress with empty VC
  const vc = new VirtualConsole();
  const dom = new JSDOM(html, { url: baseUrl, contentType: 'text/html', virtualConsole: vc });
  return dom.window.document;
}

export async function loadFixtures<TExpect>(rootDir: string): Promise<FixtureCase<TExpect>[]> {
  const htmlPaths: string[] = [];
  for (const f of walkFiles(rootDir)) {
    if (f.endsWith('.html')) htmlPaths.push(f);
  }

  const cases: FixtureCase<TExpect>[] = [];
  for (const htmlPath of htmlPaths) {
    const name = path.basename(htmlPath, '.html');
    const sidePath = path.join(path.dirname(htmlPath), `${name}.expect.ts`);
    if (!fs.existsSync(sidePath)) {
      console.warn(`[fixtures] Skipping "${name}": missing sidecar ${sidePath}`);
      continue;
    }

    const { default: meta } =
      (await import(pathToFileURL(sidePath).href)) as { default: BaseSidecar<TExpect>; };
    if (!meta.baseUrl) throw new Error(`Fixture ${name} missing baseUrl in ${sidePath}`);

    const html = fs.readFileSync(htmlPath, 'utf8');
    const dom = readHtmlFile(htmlPath, { baseUrl: meta.baseUrl });

    cases.push({
      name, sidePath, htmlPath, html, dom,
      baseUrl: meta.baseUrl,
      expect: meta.expect,
      test: meta.test,
    });

  }

  return cases;
}

function* walkFiles(root: string): Generator<string> {
  const items = fs.readdirSync(root, { withFileTypes: true });
  for (const it of items) {
    const p = path.join(root, it.name);
    if (it.isDirectory()) yield* walkFiles(p);
    else yield p;
  }
}
