
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- Commits · xtermjs/xterm.js · GitHub -->
<!-- https://github.com/torvalds/linux/commits/master/scripts/basic/Makefile -->

[xtermjs](https://github.com/xtermjs) / **[xterm.js](https://github.com/xtermjs/xterm.js)** Public

## Breadcrumb

- Repo: `torvalds/linux`
- Ref: `master`
- Path: `scripts/basic/Makefile`

## History

### Commits on Mar 11, 2026

#### Merge pull request #5698 from ntomoya/fix/ime-middle-composition-suffix  
[26ce9bd](https://github.com/xtermjs/xterm.js/commit/26ce9bd4d396d9b86bbab8827cfae8378182fc0f)  
```
Merge pull request #5698 from ntomoya/fix/ime-middle-composition-suffix

Fix IME input when composing in the middle of the textarea
```  
Tyriar authored 2026-03-10 (9 days ago)  
12/12 checks

#### Update src/browser/input/CompositionHelper.ts  
[1c1aac0](https://github.com/xtermjs/xterm.js/commit/1c1aac0da8feaa21a31c6aef74b002f9f4a88869)  
```
Update src/browser/input/CompositionHelper.ts
```  
Tyriar authored 2026-03-10 (9 days ago)  
12/12 checks

#### Merge branch 'master' into fix/ime-middle-composition-suffix  
[beeebca](https://github.com/xtermjs/xterm.js/commit/beeebca1a4aa545f3460718cae41c5cdb1468eae)  
```
Merge branch 'master' into fix/ime-middle-composition-suffix
```  
Tyriar authored 2026-03-10 (9 days ago)

#### Merge pull request #5762 from Tyriar/5760  
[fd1e53c](https://github.com/xtermjs/xterm.js/commit/fd1e53c63ffbbf086fa4772e9cb1d773e4ad4cf9)  
```
Merge pull request #5762 from Tyriar/5760

Fix RTL breaking IME composition rendering
```  
Tyriar authored 2026-03-10 (9 days ago)  
12/12 checks

#### Merge pull request #5761 from SergioChan/fix/textarea-sync-on-resize-3390  
[18262c8](https://github.com/xtermjs/xterm.js/commit/18262c87d931a4165ddb0f7d07f18fbf8b464ae7)  
```
Merge pull request #5761 from SergioChan/fix/textarea-sync-on-resize-3390

fix: sync helper textarea position after resize
```  
Tyriar authored 2026-03-10 (9 days ago)  
12/12 checks

#### Fix RTL breaking IME composition rendering  
[2285ac6](https://github.com/xtermjs/xterm.js/commit/2285ac6ab8a88bdb3eb339fdd952af36f45c64e7)  
```
Fix RTL breaking IME composition rendering

Fixes #5760
```  
Tyriar committed 2026-03-10 (9 days ago)  
12/12 checks

#### Merge pull request #5685 from Tyriar/5377_scroll  
[af6731b](https://github.com/xtermjs/xterm.js/commit/af6731b5337e33724a2c6f4dff47015362138b09)  
```
Merge pull request #5685 from Tyriar/5377_scroll

Fix scrolling with touch
```  
Tyriar authored 2026-03-10 (9 days ago)  
12/12 checks

#### Merge branch 'master' into 5377_scroll  
[5b9b531](https://github.com/xtermjs/xterm.js/commit/5b9b53101278b8face80e8ee2a87c8a1049fb158)  
```
Merge branch 'master' into 5377_scroll
```  
Tyriar authored 2026-03-10 (9 days ago)  
12/12 checks

#### Merge pull request #5759 from SergioChan/fix/ime-sync-on-compositionstart-5734  
[b0118df](https://github.com/xtermjs/xterm.js/commit/b0118dfd3a3e07c6e48336b7af4ca209d51488ab)  
```
Merge pull request #5759 from SergioChan/fix/ime-sync-on-compositionstart-5734

fix(ime): resync textarea position when composition starts
```  
Tyriar authored 2026-03-10 (9 days ago)  
11/12 checks

#### Merge remote-tracking branch 'upstream/master' into 5377_scroll  
[6813fc1](https://github.com/xtermjs/xterm.js/commit/6813fc175ed3a15d3265ffe11b4f7eb1a327e2a4)  
```
Merge remote-tracking branch 'upstream/master' into 5377_scroll
```  
Tyriar committed 2026-03-10 (9 days ago)  
12/12 checks

#### Update src/browser/CoreBrowserTerminal.ts  
[409f049](https://github.com/xtermjs/xterm.js/commit/409f049f39beabd05f2756b3e5c5728aad6e1f53)  
```
Update src/browser/CoreBrowserTerminal.ts
```  
Tyriar authored 2026-03-10 (9 days ago)  
12/12 checks

#### Merge pull request #5758 from Tyriar/5754__5756  
[89980fc](https://github.com/xtermjs/xterm.js/commit/89980fc565c178d13588e135f8eb975f44a47712)  
```
Merge pull request #5758 from Tyriar/5754__5756

CoreMouseService -> MouseStateService, make mouse services more focused
```  
Tyriar authored 2026-03-10 (9 days ago)  
12/12 checks

#### Fix assertion, bring back triggerMouseEvent tests  
[16b5da5](https://github.com/xtermjs/xterm.js/commit/16b5da5c4c4b29704844f0f54bdce09cc413c3f5)  
```
Fix assertion, bring back triggerMouseEvent tests
```  
Tyriar committed 2026-03-10 (9 days ago)  
12/12 checks

#### Merge branch 'master' into 5754__5756  
[4812abb](https://github.com/xtermjs/xterm.js/commit/4812abb24f5c531b22c69f44cd5d31f86370dd31)  
```
Merge branch 'master' into 5754__5756
```  
Tyriar authored 2026-03-10 (9 days ago)  
8/12 checks

#### Move non-state methods into MouseService  
[5f3a464](https://github.com/xtermjs/xterm.js/commit/5f3a4646bef61a3d6bc4b3e2e93c085d47bbf76e)  
```
Move non-state methods into MouseService

Fixes #5756
```  
Tyriar committed 2026-03-10 (9 days ago)  
8/12 checks

#### Move custom mouse event handler into MouseStateService  
[d63445b](https://github.com/xtermjs/xterm.js/commit/d63445be9489eb876920b39ffa9f2e461747d541)  
```
Move custom mouse event handler into MouseStateService

Don't need to keep it in CoreBrowserTerminal
```  
Tyriar committed 2026-03-10 (9 days ago)

#### Merge pull request #5757 from Tyriar/5754  
[1400398](https://github.com/xtermjs/xterm.js/commit/1400398abbba1c6849eff034d82da556ea7753d1)  
```
Merge pull request #5757 from Tyriar/5754

Move bindMouse into MouseService
```  
Tyriar authored 2026-03-10 (9 days ago)  
12/12 checks

#### Rename CoreMouseService to MouseStateService  
[2331abe](https://github.com/xtermjs/xterm.js/commit/2331abe6bd6790291517ecff5f6de7802c3605c3)  
```
Rename CoreMouseService to MouseStateService

Part of #5756
```  
Tyriar committed 2026-03-10 (9 days ago)

#### Avoid unnecessary  
[b66128b](https://github.com/xtermjs/xterm.js/commit/b66128b239a00e76837929792defcf235645c67d)  
```
Avoid unnecessary
```  
Tyriar committed 2026-03-10 (9 days ago)  
12/12 checks

#### Fix cyclic dependency  
[c727240](https://github.com/xtermjs/xterm.js/commit/c727240f16305660217651ee76a573c4c29f6990)  
```
Fix cyclic dependency

Linkifier -> MouseService -> SelectionService -> Linkifier
```  
Tyriar committed 2026-03-10 (9 days ago)  
12/12 checks

#### Move bindMouse into MouseService  
[649ce22](https://github.com/xtermjs/xterm.js/commit/649ce22081ecc35774c5b0b0e6680ceeb7810022)  
```
Move bindMouse into MouseService

Fixes #5754
```  
Tyriar committed 2026-03-10 (9 days ago)

#### Merge pull request #5753 from Tyriar/scrollbar_warn  
[73adfdf](https://github.com/xtermjs/xterm.js/commit/73adfdfd56b411b6abcc162ba48cb9fbd071aaee)  
```
Merge pull request #5753 from Tyriar/scrollbar_warn

Suppress scrollbar warning in demo
```  
Tyriar authored 2026-03-10 (9 days ago)  
12/12 checks

#### Suppress scrollbar warning in demo  
[1fc8a46](https://github.com/xtermjs/xterm.js/commit/1fc8a4687d5d4a568e463fadab1caa608f268e79)  
```
Suppress scrollbar warning in demo
```  
Tyriar committed 2026-03-10 (9 days ago)  
12/12 checks

#### Merge pull request #5751 from Tyriar/5750  
[c29e48c](https://github.com/xtermjs/xterm.js/commit/c29e48c91718157882d4b4557e48b6512fdb641e)  
```
Merge pull request #5751 from Tyriar/5750

Fix error in loadTestLongLines
```  
Tyriar authored 2026-03-10 (9 days ago)  
12/12 checks

<!-- XLET-END -->

