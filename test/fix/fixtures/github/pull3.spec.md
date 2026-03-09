
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- fix(typescript): avoid resolving definition files with arbitrary extensions by ychavoya · Pull Request #1949 · rollup/plugins -->
<!-- https://github.com/rollup/plugins/pull/1949 -->

## Initial Post
## Rollup Plugin Name: `typescript`

This PR contains:

- [x]  bugfix
- [ ]  feature
- [ ]  refactor
- [ ]  documentation
- [ ]  other

Are tests included?

- [x]  yes (_bugfixes and features will not be merged without tests_)
- [ ]  no

Breaking Changes?

- [ ]  yes (_breaking changes will not be merged unless absolutely necessary_)
- [x]  no

If yes, then include "BREAKING CHANGES:" in the first commit message body, followed by a description of what is breaking.

List any relevant issue numbers: resolves [#1858](https://github.com/rollup/plugins/issues/1858)

### Description

This PR updates the regular expression used to detect declaration files (`*.d.ts`) to include declaration files for arbitrary extensions, such as the ones allowed with the [`allowArbitraryExtensions` compiler option](https://www.typescriptlang.org/tsconfig/#allowArbitraryExtensions) (`*.d.*.ts`). By including these in the regex, they are not resolved and therefore prevent the error displayed in [#1858](https://github.com/rollup/plugins/issues/1858).

Also, in order to add a test for this behavior, the typescript version in the dev dependencies was upgraded to v5 and therefore some other pieces of code had to be changed.

[[ ychavoya on 2025-11-28 (3 months ago) ]]


## Comment 1
[ychavoya](https://github.com/ychavoya) requested a review from [shellscape](https://github.com/shellscape) as a [code owner](https://github.com/rollup/plugins/blob/c8e78c8584007999050f7d9878d87e15046bbf09/CODEOWNERS#L1)

[[ ychavoya on 2025-11-28 (3 months ago) ]]


## Comment 2
**[emersion](https://github.com/emersion)** reviewed

[View reviewed changes](https://github.com/rollup/plugins/pull/1949/changes)

[[ emersion on 2026-02-04 (27 days ago) ]]


## Comment 3
▸ 

[packages/typescript/src/outputFile.ts](https://github.com/rollup/plugins/pull/1949/files#diff-120678bfd12e91144ba66253506e2d2e4314e4d287fa75b216b217417cd31d90)

```
  39 39    */
  40 40   export function isDeclarationOutputFile(name: string): boolean {
  41    -   return /\.d\.[cm]?ts$/.test(name);
     41 +   return /\.d(\..+)?\.[cm]?ts$/.test(name);
```

I was wondering whether an arbitrary string is allowed between `.d.` and `.ts`, or if only a restricted set of characters are allowed. It turns out any arbitrary string is allowed here:

[https://github.com/microsoft/TypeScript/blob/01c23d68b1113a4b71acb8484f1bf78a98307933/src/compiler/parser.ts#L10568](https://github.com/microsoft/TypeScript/blob/01c23d68b1113a4b71acb8484f1bf78a98307933/src/compiler/parser.ts#L10568)

tl;dr this regexp sounds correct to me.

[[ emersion on 2026-02-04 (27 days ago) ]]


## Comment 4
**[emersion](https://github.com/emersion)** reviewed

[View reviewed changes](https://github.com/rollup/plugins/pull/1949/changes)

[[ emersion on 2026-02-04 (27 days ago) ]]


## Comment 5
▸ 

[packages/typescript/test/test.js](https://github.com/rollup/plugins/pull/1949/files#diff-9b47757e1347eae5ab5cefedce0669826e925f9b073a02815b9507b782f2211b) Outdated

```
  1541      -   t.is(warnings.length, 1);
  1542      -   t.is(warnings[0].code, 'UNRESOLVED_IMPORT');
       1541 +   t.is(warnings.length, 2);
       1542 +   t.is(warnings[0].pluginCode, 'TS5110');
```

What is this warning? Is it about the `module` value not being aligned with the `moduleResolution` value?

Shouldn't we resolve it instead?

Resolved! I was not sure if I should update this to include the warning, or this other statement [https://github.com/rollup/plugins/pull/1949/changes#diff-9b47757e1347eae5ab5cefedce0669826e925f9b073a02815b9507b782f2211bL1540](https://github.com/rollup/plugins/pull/1949/changes#diff-9b47757e1347eae5ab5cefedce0669826e925f9b073a02815b9507b782f2211bL1540) since changing the module changes how the code is output in the test.

What the test cares about is the unresolved import, so I'd say it's better if we avoid any other unnecessary noise :P

[[ emersion on 2026-02-04 (27 days ago) ]]


## Comment 6
**[emersion](https://github.com/emersion)** reviewed

[View reviewed changes](https://github.com/rollup/plugins/pull/1949/changes)

[[ emersion on 2026-02-04 (27 days ago) ]]


## Comment 7
▸ 

[packages/typescript/src/options/tsconfig.ts](https://github.com/rollup/plugins/pull/1949/files#diff-6ecfc1f9278a1047a5ea41728957d156541d8ac8045357641f77edb5e105bdd4) Outdated

```
  123 123   }
  124 124  
  125     - const configCache = new Map() as typescript.ESMap<string, ExtendedConfigCacheEntry>;
      125 + const configCache = new Map() as Map<string, ExtendedConfigCacheEntry>;
```

Nit: could we avoid the cast here by using `new Map<string, ExtendedConfigCacheEntry>()` instead?

Thanks, I missed that when changing it

[[ emersion on 2026-02-04 (27 days ago) ]]


## Comment 8
**[emersion](https://github.com/emersion)** reviewed

[View reviewed changes](https://github.com/rollup/plugins/pull/1949/changes)

[[ emersion on 2026-02-04 (27 days ago) ]]


## Comment 9
Looks good apart from this minor warning-related comment!

[[ emersion ]]


## Comment 10

[[ unknown ]]


## Comment 11
These new changes look good! Can you squash them into the commits that introduced what they're fixing?

[[ emersion on 2026-02-05 (25 days ago) ]]


## Comment 12
[ychavoya](https://github.com/ychavoya) [force-pushed](https://github.com/rollup/plugins/compare/c69a0819bd51711bb09bb7a9e8b6be8c6c4b1381..54649a331e04c78196eb9819433486d53361b817) the arbitrary-extensions branch from [`c69a081`](https://github.com/rollup/plugins/commit/c69a0819bd51711bb09bb7a9e8b6be8c6c4b1381) to [`54649a3`](https://github.com/rollup/plugins/commit/54649a331e04c78196eb9819433486d53361b817) [Compare](https://github.com/rollup/plugins/compare/c69a0819bd51711bb09bb7a9e8b6be8c6c4b1381..54649a331e04c78196eb9819433486d53361b817)

[[ ychavoya on 2026-02-05 (25 days ago) ]]


## Comment 13
Done, I squashed the changes into the typescript upgrade, so now there are only the 3 commits I initially added. Let me know if you want them combined as well

[[ ychavoya on 2026-02-05 (25 days ago) ]]


## Comment 14
**[emersion](https://github.com/emersion)** approved these changes

[View reviewed changes](https://github.com/rollup/plugins/pull/1949/changes)

[[ emersion on 2026-02-05 (25 days ago) ]]


## Comment 15
LGTM!

[[ emersion ]]


## Comment 16

[[ unknown ]]


## Comment 17
@shellscape, would you mind having a look?

[[ emersion on 2026-02-05 (25 days ago) ]]


## Comment 18
@emersion I would advise not adding an approving review to PRs in repos which you do not maintain.

@CharlieHelps please do a thorough review of this PR to determine if it's ready to merge. Look at the diff, reviews, comments, and referenced issues/docs/links to build a complete understanding. Then respond with a comment that includes a list of MUST fix items that must be fixed before the the PR is merged, and a list of IMPROVEMENTS that shouldn't block the merge but may be quick improvements or things that could be addressed in a follow up PR. The MUST fix items should explain exactly what's wrong and what needs to change to resolve the problem. Both should be numbered lists and the IMPROVEMENTS list should continue counting up from the MUST list. It's OK if there are no IMPROVEMENTS or MUST fix items, you can just omit the lists.

[[ shellscape on 2026-02-15 (15 days ago) ]]


## Comment 19
Thanks for the PR — the `.d.<ext>.ts` handling matches TypeScript’s `allowArbitraryExtensions` behavior.

**MUST fix**

1. **Fix failing Linux CI (`Validate Monorepo`)**. The PR is currently red (e.g. Node v20 job): [https://github.com/rollup/plugins/actions/runs/21718266321/job/63704024881](https://github.com/rollup/plugins/actions/runs/21718266321/job/63704024881).
   Locally, `pnpm --filter "...[origin/master]" ci:coverage` fails because the AVA runner times out / never exits (eventually OOM). On this branch it looks like the plugin is leaving a large number of live `FSWatcher` handles behind after a normal `rollup()` build (even without Rollup watch mode), which keeps the process alive.
   **Change needed:** ensure the TS watch program / file watchers are _not_ left running for non-watch builds (e.g. don’t create a watch program when `this.meta.watchMode` is false, and/or dispose/close the program in a hook that runs during `bundle.generate()` such as `generateBundle`/`buildEnd`, since the tests don’t call `bundle.close()`).
2. **Track down the `TS1110: Type expected` diagnostic shown in the failing run** (`RollupError: @rollup/plugin-typescript TS1110: Type expected.`). Please identify which file triggers it and adjust module resolution/arbitrary-extension handling so TS consumes the `*.d.<ext>.ts` declaration (and doesn’t try to parse the arbitrary extension source itself).

**IMPROVEMENTS**
3. Consider addressing the open `TS5110` warning discussion by tweaking the fixture/tsconfig to avoid emitting the warning (rather than asserting on it), so the test output stays clean: [#1949 (comment)](https://github.com/rollup/plugins/pull/1949#discussion_r2762883780).
4. Small typing cleanup from the review thread: prefer `new Map<string, ExtendedConfigCacheEntry>()` over casting, if you touch that area again: [#1949 (comment)](https://github.com/rollup/plugins/pull/1949#discussion_r2762888220).
5. Tiny TS nit in the new fixture: use `number` instead of `Number` in `module.d.custom.ts`.
6. The new assertion that checks `bundle.cache.modules` is a bit indirect; consider also asserting the build succeeds without warnings/errors for that import to keep the test resilient.

[[ charliecreates on 2026-02-15 (15 days ago) ]]


## Comment 20
[charliecreates](https://github.com/apps/charliecreates) bot mentioned this pull request

[charlie: test #1963](https://github.com/rollup/plugins/issues/1963)

Closed

[[ charliecreates on 2026-02-15 (15 days ago) ]]


## Comment 21
▸ 

### This comment was marked as off-topic.

#### **[emersion](https://github.com/emersion)**

Member

@shellscape I thought my reviews were welcome according to [#1905 (comment)](https://github.com/rollup/plugins/pull/1905#issuecomment-3453994323)

If not, no problem at all, just means less work for me :)

(I do wonder though why I've been added as org member.)

[[ emersion on 2026-02-15 (15 days ago) ]]


## Comment 22
▸ 

### This comment was marked as off-topic.

#### **[shellscape](https://github.com/shellscape)**

Collaborator

@emersion providing your takes on the changes yes, approvals as a non-maintainer not so much.

[[ shellscape on 2026-02-16 (14 days ago) ]]


## Comment 23
▸ 

### This comment was marked as off-topic.

#### **[emersion](https://github.com/emersion)**

Member

Would you mind explaining why? An approval is a clear statement that I've reviewed the changes, and GitHub makes it clear that the approval doesn't unlock the merge (the checkmark is greyed out).

I will refrain from approving in the future.

[[ emersion on 2026-02-16 (14 days ago) ]]


## Comment 24
▸ 

### This comment was marked as off-topic.

#### **[shellscape](https://github.com/shellscape)**

Collaborator

> Would you mind explaining why?

Mostly confusion. Contribs submitting PRs see an approval from userland (non-maintainers) and wonder why it's not moving forward, when those approvals have little/no bearing on whether a PR will get merged. Peer reviews are great, but I'd keep them limited to `Comment` unless you're a maintainer.

I looked into why you're in the org, and you're on the Plugin Contributors team, which is a small team of people who occasionally contribute with limited permissions on the org.

Going to hide these as off-topic in the PR just to clean it up.

[[ shellscape on 2026-02-16 (14 days ago) ]]


## Comment 25
@ychavoya please have a look at this review [#1949 (comment)](https://github.com/rollup/plugins/pull/1949#issuecomment-3906358016) and address the must-fix items.

[[ shellscape on 2026-03-04 (in 2 days) ]]


## Comment 26
[ychavoya](https://github.com/ychavoya) added 9 commits

[[ ychavoya on 2026-03-05 (in 3 days) ]]


## Comment 27
[fix(typescript): avoid resolving definition files with arbitrary exte…](https://github.com/rollup/plugins/pull/1949/commits/50e745efca3fc6af7105a390cdd6ea72dd88bd43 "fix(typescript): avoid resolving definition files with arbitrary extensions")

:::details
…nsions
:::

[[ ychavoya on 2026-03-05 (in 3 days) ]]


## Comment 28
[build(typescript): bump typescript dev dependency to v5](https://github.com/rollup/plugins/pull/1949/commits/9dc295ecf9db6bc8639f450131a02d45b21a6d67 "build(typescript): bump typescript dev dependency to v5")

[[ ychavoya on 2026-03-05 (in 3 days) ]]


## Comment 29
[test(typescript): add test for arbitrary extensions](https://github.com/rollup/plugins/pull/1949/commits/c5f258cdb5ea05c37b98a687c5d9df991dd5cf71 "test(typescript): add test for arbitrary extensions")

[[ ychavoya on 2026-03-05 (in 3 days) ]]


## Comment 30
[fix(typescript): correct rollup version to match with full releases](https://github.com/rollup/plugins/pull/1949/commits/b2b1a292cb0a489178238180177a0b84a2ef04e3 "fix(typescript): correct rollup version to match with full releases")

[[ ychavoya on 2026-03-05 (in 3 days) ]]


## Comment 31
[refactor: reuse code](https://github.com/rollup/plugins/pull/1949/commits/ede6ecdc2fb42a00b3a9ab901cc8465dc75c2d20 "refactor: reuse code")

[[ ychavoya on 2026-03-05 (in 3 days) ]]


## Comment 32
[chore: update .tsbuildinfo](https://github.com/rollup/plugins/pull/1949/commits/15574629ccd4bcc899c08257847684cb236fa142 "chore: update .tsbuildinfo")

[[ ychavoya on 2026-03-05 (in 3 days) ]]


## Comment 33
[test(typescript): fix tests related to rollup's new logging](https://github.com/rollup/plugins/pull/1949/commits/750ee7f0d89aa3038ffbea83ec6a5a96bef05e9d "test(typescript): fix tests related to rollup's new logging")

:::details
See [rollup/rollup#5424](https://github.com/rollup/rollup/pull/5424)
:::

[[ ychavoya on 2026-03-05 (in 3 days) ]]


## Comment 34
[test(typescript): update test to not have declare type](https://github.com/rollup/plugins/pull/1949/commits/d42dd01abe42c1f9b59fe18101a810b0048d0dc0 "test(typescript): update test to not have declare type")

[[ ychavoya on 2026-03-05 (in 3 days) ]]


## Comment 35
[style(typescript): change type to primitive in test](https://github.com/rollup/plugins/pull/1949/commits/a9530db653e3c780ff8b1696ef98a4b24a47c9fb "style(typescript): change type to primitive in test")

[[ ychavoya on 2026-03-05 (in 3 days) ]]


## Comment 36
[ychavoya](https://github.com/ychavoya) [force-pushed](https://github.com/rollup/plugins/compare/54649a331e04c78196eb9819433486d53361b817..a9530db653e3c780ff8b1696ef98a4b24a47c9fb) the arbitrary-extensions branch from [`54649a3`](https://github.com/rollup/plugins/commit/54649a331e04c78196eb9819433486d53361b817) to [`a9530db`](https://github.com/rollup/plugins/commit/a9530db653e3c780ff8b1696ef98a4b24a47c9fb) [Compare](https://github.com/rollup/plugins/compare/54649a331e04c78196eb9819433486d53361b817..a9530db653e3c780ff8b1696ef98a4b24a47c9fb)

[[ ychavoya on 2026-03-05 (in 3 days) ]]


## Comment 37
@shellscape The timeout error is also present in master, though it doesn't always run out of memory, especially outside of CI. However I managed to fix it :)

The problem was due to different `rollup` versions inside of `packages/typescript` and in the root. This is because version `^4.0.0-24` in the typescript package did not match with `4.x.x` versions (due to the `-24`), so it was stuck on that pre-release version while the root had a release version `4.52.5`. This caused a specific type (`RollupBuild`) to not match type definitions, which apparently got some test files to silently fail but never exit (and ava passed without running them after a while).

Note that this same problem of two different versions of rollup `^4.0.0-24` and `4.x.x` is also present on other packages. I will create a separate PR to fix the rest of the packages (or one per package if you prefer)

Most other issues the AI found should also be fixed, let me know if anything else needs changes!

[[ ychavoya on 2026-03-05 (in 3 days) ]]

<!-- XLET-END -->

