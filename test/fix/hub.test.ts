import { describe, it, expect } from 'vitest';
import { extractFromDoc, HubResult } from '../../src/hub';
import { loadFixtureDoc, setupDom } from '../unit/test-utils';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import util from 'util';
import { pathToFileURL } from 'node:url';

// allow console.log print objects more deeply
util.inspect.defaultOptions = { depth: 4, colors: true };

// Bookmarklet to save GitHub fixture. Broswer `save as` unreliable (missing posts and JS reload hid them).
// Adds CSP to block JS so full DOM stays visible offline.
//
// javascript:(()=>{try{
//   const addCSP = s => s.replace(/<head(\b[^>]*)>/i,
//     '<head$1><meta http-equiv="Content-Security-Policy" content="script-src \'none\'; connect-src \'none\'; frame-src \'none\'; object-src \'none\'">');
//   const html='<!DOCTYPE html>\n'+addCSP(document.documentElement.outerHTML);
//   const blob=new Blob([html],{type:'text/html'});
//   const a=document.createElement('a');
//   a.href=URL.createObjectURL(blob);
//   a.download='github-out.html';
//   a.click();
//   setTimeout(()=>URL.revokeObjectURL(a.href),4000);
// }catch(e){alert('Save failed: '+e)}})();


// defines global.document, global.window, etc
setupDom();

type HubFixtureCase = {
  name: string;
  htmlPath: string;
  sidePath: string;
  html: string;
  baseUrl: string;
  expect: Partial<HubResult> & {
    totalPosts?: number;
  };
};

export type SideCar = Pick<HubFixtureCase, 'baseUrl' | 'expect'>;

async function loadHubFixtures(dir: string) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.html'));
  const cases: HubFixtureCase[] = [];
  for (const f of files) {
    const name = basename(f, extname(f));
    const htmlPath = join(dir, f);
    const sidePath = join(dir, `${name}.expect.ts`);
    if (!existsSync(sidePath)) {
      console.warn(`[hub:fixtures] Skipping "${name}": missing sidecar ${sidePath}`);
      continue;
    }

    const html = readFileSync(htmlPath, 'utf8');

    const { default: meta } =
      (await import(pathToFileURL(sidePath).href)) as { default: SideCar; };
    if (!meta.baseUrl) throw new Error(`Fixture ${name} missing baseUrl in ${sidePath}`);

    cases.push({
      name, htmlPath, sidePath, html,
      baseUrl: meta.baseUrl,
      expect: meta.expect,
    });
  }
  return cases;
}

function _logFix(fix: string, limit = 70) {
  const domain: 'issues' | 'pull' | 'discussions'
    = fix.startsWith('issue') ? 'issues'
    : fix.startsWith('pull') ? 'pull'
    : fix.startsWith('disc') ? 'discussions'
    : (() => { throw new Error(`Unknown fix type for ${fix}`); })();

  const FOOBAR = `https://github.com/foo/bar/${domain}/1234`;
  const doc = loadFixtureDoc(fix, { baseUrl: FOOBAR });
  const res = extractFromDoc(doc);

  // eslint-disable-next-line no-restricted-properties
  if (!res) { console.log('No result extracted'); return; }
  const trim = (s?: string) => typeof s === 'string' && s.length > limit ? s.slice(0, limit) : s;

  const exp = structuredClone(res);
  exp.posts.forEach((p) => {
    if (p.bodyHtml) p.bodyHtml = trim(p.bodyHtml);
    if (p.bodyMd) p.bodyMd = trim(p.bodyMd);
  });
  exp.permalink = exp.permalink === FOOBAR ? '???' : exp.permalink;

  const sidecar = {
    baseUrl: exp.permalink,
    expect: {
      ...exp,
      title: exp.title ? trim(exp.title) : '???',
      totalPosts: exp.posts.length,
    },
  };

  const prefix = `import type { SideCar  } from '../hub.test';\n\nexport default `;
  const suffix = ' satisfies SideCar;\n';
  const fullOutput = prefix + JSON.stringify(sidecar, null, 2) + suffix;
  // eslint-disable-next-line no-restricted-properties
  console.log(`\n--- Copy below to test/fix/fixtures/${fix.replace('.html', '.expect.ts')} ---\n`);
  // eslint-disable-next-line no-restricted-properties
  console.log(fullOutput);
  // eslint-disable-next-line no-restricted-properties
  console.log(`\n--- End of fixture ${fix} ---\n`);
}

_logFix('issue2.html');

const AllCases = await loadHubFixtures(`${__dirname}/fixtures`);
describe('extractFromDoc over real pages', () => {
  for (const f of AllCases) {
    it(f.name, () => {
      const doc = loadFixtureDoc(f.htmlPath, { baseUrl: f.baseUrl });
      const r = extractFromDoc(doc);
      expect(r).toBeDefined();
      if (!r) return; // for TS
      const e = f.expect;

      if (e.permalink) expect(r.permalink).toBe(e.permalink);
      if (e.title)  expect(r.title).toContain(e.title);
      if (e.totalPosts !== undefined) expect(r.posts.length).toBe(e.totalPosts);

      (e.posts ?? []).forEach((ep, i) => {
        const rp = r.posts[i];
        expect(rp).toBeDefined();
        const rpc = rp.contributor;
        const epc = ep.contributor;
        if (epc?.author) expect(rpc?.author ?? '').toContain(epc.author);
        if (epc?.timestamp) expect(rpc?.timestamp ?? '').toContain(epc.timestamp);
        if (ep.postId) expect((rp.postId ?? '')).toBe(ep.postId);
        if (ep.bodyHtml) expect((rp.bodyHtml ?? '')).toContain(ep.bodyHtml);
        if (ep.bodyMd) expect((rp.bodyMd ?? '')).toContain(ep.bodyMd);
      });
    });
  }
});
