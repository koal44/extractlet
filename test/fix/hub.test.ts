import { describe, it, expect } from 'vitest';
import { extractFromDoc } from '../../src/hub';
import { loadFixtureDoc, setupDom } from '../unit/test-utils';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import util from "util";
// import { dumpSkeleton } from '../utils/dump-skeleton';

// let console.log print objects more deeply
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
  metaPath: string;
  html: string;
  baseUrl: string;
  expect: {
    permalink?: string;
    title?: string;
    totalPosts?: number;
    posts?: {
      author?: string;
      date?: string;
      postId?: string;
      bodyHtml?: string;
      bodyMd?: string;
    }[];
  };
};

function loadHubFixtures(dir: string): HubFixtureCase[] {
  const files = readdirSync(dir).filter(f => f.endsWith('.html'));
  const cases: HubFixtureCase[] = [];
  for (const f of files) {
    const name = basename(f, extname(f));
    const htmlPath = join(dir, f);
    const metaPath = join(dir, `${name}.expect.json`);
    const html = readFileSync(htmlPath, 'utf8');
    if (!existsSync(metaPath)) {
      console.warn(`[hub:fixtures] Skipping "${name}": missing sidecar ${metaPath}`);
      continue;
    }
    const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
    cases.push({
      name, htmlPath, metaPath, html,
      baseUrl: meta.baseUrl,
      expect: meta.expect ?? {},
    });
  }
  return cases;
}
function _getDoc(fix: string, domain: 'issues'|'pull'|'discussions') {
  const FOOBAR = `https://github.com/foo/bar/${domain}/1234`;
  const doc = loadFixtureDoc(fix, { baseUrl: FOOBAR });
  return doc;
}

function _logFix(fix: string, domain: 'issues'|'pull'|'discussions', limit = 70) {
  const FOOBAR = `https://github.com/foo/bar/${domain}/1234`;
  const doc = loadFixtureDoc(fix, { baseUrl: FOOBAR });
  const res = extractFromDoc(doc);

  // eslint-disable-next-line no-restricted-properties
  if (!res) { console.log('No result extracted'); return; }
  const trim = (s?: string) => typeof s === 'string' && s.length > limit ? s.slice(0, limit) : s;

  const exp = structuredClone(res ?? {});
  exp.posts?.forEach((p: any) => {
    if (p.bodyHtml) p.bodyHtml = trim(p.bodyHtml);
    if (p.bodyMd) p.bodyMd = trim(p.bodyMd);
  });

  const sidecar = {
    baseUrl: exp.permaLink === FOOBAR ? '???' : exp.permaLink,
    expect: {
      permalink: exp.permaLink === FOOBAR ? '???' : exp.permaLink,
      title: exp.title ? exp.title.trim() : '???',
      totalPosts: exp.posts?.length,
      posts: exp.posts,
    },
  };

  // eslint-disable-next-line no-restricted-properties
  console.log(JSON.stringify(sidecar, null, 2));
}

_logFix('pull1.html', 'pull');
// const skel = dumpSkeleton(_getDoc('pull1.html', 'pull'));
// console.log(skel);

const AllCases = loadHubFixtures(`${__dirname}/fixtures`);
describe("extractFromDoc over real pages", () => {
  for (const f of AllCases) {
    it(f.name, () => {
      const doc = loadFixtureDoc(f.htmlPath, { baseUrl: f.baseUrl });
      const r = extractFromDoc(doc);
      expect(r).toBeDefined();
      if (!r) return; // for TS
      const e = f.expect ?? {};

      if (e.permalink) expect(r.permaLink).toBe(e.permalink);
      if (e.title)  expect(r.title).toContain(e.title);
      if (e.totalPosts !== undefined) expect(r.posts.length).toBe(e.totalPosts);

      (e.posts ?? []).forEach((ep, i) => {
        const rp = r.posts[i];
        expect(rp).toBeDefined();
        const rpc = rp?.contributor;
        if (ep.author) expect(rpc?.author ?? "").toContain(ep.author);
        if (ep.date) expect(rpc?.timestamp ?? "").toContain(ep.date);
        if (ep.postId) expect((rp?.postId ?? "")).toBe(ep.postId);
        if (ep.bodyHtml) expect((rp?.bodyHtml ?? "")).toContain(ep.bodyHtml);
        if (ep.bodyMd) expect((rp?.bodyMd ?? "")).toContain(ep.bodyMd);
      });
    });
  }
});

// describe('extractFromDoc Dummy', () => {
//   it('extracts permalink, title, first post, and comment posts', () => {
//     const doc = loadFixtureDoc('issue1.htm', { baseUrl: 'https://github.com/antlr/antlr4/issues/1234' });
//     const result = extractFromDoc(doc);
//     // console.log(result);
//   });
// });