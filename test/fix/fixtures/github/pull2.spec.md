
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- sessions with sdk by joshspicer · Pull Request #295817 · microsoft/vscode · GitHub -->
<!-- https://github.com/microsoft/vscode/pull/295817 -->

## Initial Post
~~launch with `code --sessions-utility-process`~~

related [https://github.com/microsoft/vscode-internalbacklog/issues/6848](https://github.com/microsoft/vscode-internalbacklog/issues/6848)

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 1
[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI review requested due to automatic review settings

[[ Copilot on 2026-02-17 (13 days ago) ]]


## Comment 2
[joshspicer](https://github.com/joshspicer) changed the title ~~Josh/sessions with sdk~~ ++sessions with sdk++

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 3
**Copilot** [started reviewing](https://github.com/microsoft/vscode/agents/pull/295817?session_id=f7590deb-695d-495f-b6b2-a50c9a70494b "View session") on behalf of [joshspicer](https://github.com/joshspicer)

[[ unknown on 2026-02-17 (13 days ago) ]]


## Comment 4
[vs-code-engineering](https://github.com/apps/vs-code-engineering) bot assigned [joshspicer](https://github.com/joshspicer)

[[ vs-code-engineering on 2026-02-17 (13 days ago) ]]


## Comment 5
▸ 

### This comment was marked as outdated.

[Sign in to view](https://github.com/login?return_to=https://github.com/microsoft/vscode/pull/295817)

[xlet: thread content not loaded; load on GitHub]

[[ unknown ]]


## Comment 6
[joshspicer](https://github.com/joshspicer) added 8 commits

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 7
[copilot-sdk: add dependency and build infrastructure](https://github.com/microsoft/vscode/pull/295817/commits/02720134f6dd9209c0c446ff2b71cfb1549c9c53)

:::details
Add @github/copilot-sdk 0.1.23 as a production dependency. The SDK ships
per-platform native CLI binaries (@github/copilot-darwin-arm64, etc.) that
require build system support:

- .moduleignore: strip copilot prebuilds/ripgrep/clipboard for other platforms
- gulpfile.vscode.ts: filter wrong-arch platform packages, ASAR-unpack binaries
- darwin/create-universal-app.ts: copy missing arch package for universal merger
- darwin/sign.ts: custom entitlements for the copilot CLI binary
- darwin/verify-macho.ts: skip copilot binaries in arch verification
- next/index.ts: add copilotSdkHost as a utility process entry point
:::

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 8
[copilot-sdk: add --sessions-sdk CLI flag and environment service](https://github.com/microsoft/vscode/pull/295817/commits/24bd5cfcf8bc7e2ef972a181f5e81a80db60a3b5)

:::details
Add 'sessions-sdk' to NativeParsedArgs and the OPTIONS descriptor so it
can be passed on the command line (e.g. ./scripts/code.sh --sessions-sdk).

Add isSessionsSdkWindow to IWorkbenchEnvironmentService so renderer code
can check whether the SDK backend is active. Browser returns false; native
reads from the window configuration.
:::

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 9
[copilot-sdk: add platform service layer](https://github.com/microsoft/vscode/pull/295817/commits/7b5a4570fc44e23d771af00eb9648c13c6c405dc)

:::details
Three-layer architecture for the Copilot SDK integration:

1. common/copilotSdkService.ts — ICopilotSdkService interface with session
   CRUD, messaging, events, model listing, and auth. All IPC types defined
   here so both main and renderer can reference them.

2. electron-main/copilotSdkStarter.ts — CopilotSdkMainService that lazily
   spawns a UtilityProcess on first use, connects via MessagePort, and
   exposes an IServerChannel. Follows the pty host pattern.

3. node/copilotSdkHost.ts — Utility process entry point that wraps the
   @github/copilot-sdk CopilotClient. Implements ICopilotSdkService so
   ProxyChannel.fromService() auto-generates the IPC channel. Resolves
   the bundled CLI binary, builds a clean env, and forwards all events.
:::

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 10
[copilot-sdk: add SDK chat widget and session list UI](https://github.com/microsoft/vscode/pull/295817/commits/abce2c0ecddbb5b0bdef1e131af5a9f66f385133)

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 11
[copilot-sdk: wire up main process and gate behind --sessions-sdk](https://github.com/microsoft/vscode/pull/295817/commits/1b4ef47e50a5490e04dc13ef3eee5ce973d42dc5)

:::details
Register CopilotSdkMainService and its IPC channel in the main process,
gated behind args[sessions-sdk] so no utility process is spawned or DI
service created during normal VS Code usage.

- app.ts: conditional DI registration + channel setup + window open logic
- chat.contribution.ts: register SdkChatViewPane when isSessionsSdkWindow
- sessions.desktop.main.ts: import copilotSdkService renderer proxy
:::

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 12
[Align sessions utility process naming](https://github.com/microsoft/vscode/pull/295817/commits/ca9154d717b4046786fb96897acb1f176dc609f9)

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 13
[Adopt sessions utility process flag](https://github.com/microsoft/vscode/pull/295817/commits/91c48fa7cf4416227e1f2607f9b7f6eb6255076e)

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 14
[Merge branch 'main' of github.com:microsoft/vscode into josh/sessions…](https://github.com/microsoft/vscode/pull/295817/commits/96440905fdc4e710f9e45a69f6fa41336336f111 "Merge branch 'main' of github.com:microsoft/vscode into josh/sessions-with-sdk")

:::details
…-with-sdk
:::

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 15
[joshspicer](https://github.com/joshspicer) [force-pushed](https://github.com/microsoft/vscode/compare/fc19eff9618ef514a5a6bfc410318a656fbfb8b0..96440905fdc4e710f9e45a69f6fa41336336f111) the josh/sessions-with-sdk branch from [`fc19eff`](https://github.com/microsoft/vscode/commit/fc19eff9618ef514a5a6bfc410318a656fbfb8b0) to [`9644090`](https://github.com/microsoft/vscode/commit/96440905fdc4e710f9e45a69f6fa41336336f111) [Compare](https://github.com/microsoft/vscode/compare/fc19eff9618ef514a5a6bfc410318a656fbfb8b0..96440905fdc4e710f9e45a69f6fa41336336f111)

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 16
[joshspicer](https://github.com/joshspicer) requested a review from [Copilot](https://github.com/apps/copilot-pull-request-reviewer)

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 17
**Copilot** [started reviewing](https://github.com/microsoft/vscode/agents/pull/295817?session_id=ba6b6584-47f4-4d41-9f05-43fd0d1903c4 "View session") on behalf of [joshspicer](https://github.com/joshspicer)

[[ unknown on 2026-02-17 (13 days ago) ]]


## Comment 18
**[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** reviewed

[View reviewed changes](https://github.com/microsoft/vscode/pull/295817/files/96440905fdc4e710f9e45a69f6fa41336336f111)

[[ Copilot on 2026-02-17 (13 days ago) ]]


## Comment 19
## Pull request overview

Copilot reviewed 34 out of 35 changed files in this pull request and generated 14 comments.

[[ Copilot ]]


## Comment 20
▸ 

[src/vs/platform/copilotSdk/node/copilotSdkHost.ts](https://github.com/microsoft/vscode/pull/295817/files/96440905fdc4e710f9e45a69f6fa41336336f111#diff-e04baee5e74f0f0462264a33ee5e8adcee8b229baf4e2680f7ec23bbb923b3b0) Outdated

Comment on lines 371 to 381

```
  371 + 	private _attachSessionEvents(session: CopilotSession): void {
  372 + 		const sessionId = session.sessionId;
  373 +
  374 + 		session.on((event: SessionEvent) => {
  375 + 			this._onSessionEvent.fire({
  376 + 				sessionId,
  377 + 				type: event.type as ICopilotSessionEvent['type'],
  378 + 				data: (event as { data?: Record<string, unknown> }).data ?? {},
  379 + 			});
  380 + 		});
  381 + 	}
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI**

Session events are attached in `_attachSessionEvents` but there's no mechanism to remove these listeners when a session is destroyed. This creates a memory leak as session objects and their event handlers will never be garbage collected. The listeners should be stored in a DisposableStore per session and disposed when the session is destroyed.

▸ 

[src/vs/sessions/contrib/sessions/browser/sessionsViewPane.ts](https://github.com/microsoft/vscode/pull/295817/files/96440905fdc4e710f9e45a69f6fa41336336f111#diff-550a58e950e06e5c4ce84dd510c533f81d70f5708d501ea41f071356dceac83e)

Comment on lines 285 to 292

```
  285 + 	private async _deleteSdkSession(sessionId: string): Promise<void> {
  286 + 		try { await this.copilotSdkService.deleteSession(sessionId); } catch { /* best-effort */ }
  287 + 		if (this._sdkSelectedSessionId === sessionId) {
  288 + 			this._sdkSelectedSessionId = undefined;
  289 + 			const chatPane = this.viewsService.getViewWithId<SdkChatViewPane>(SdkChatViewId);
  290 + 			chatPane?.widget?.newSession();
  291 + 		}
  292 + 		this._refreshSdkSessionList();
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-17 (13 days ago)](#discussion_r2818785440)

The delete operation at line 286 doesn't prompt the user for confirmation. Deleting a session could result in permanent data loss. Consider adding a confirmation dialog, especially since this is a UI action triggered by a button click.

▸ 

[src/vs/sessions/services/copilotSdk/node/copilotSdkHost.ts](https://github.com/microsoft/vscode/pull/295817/files/96440905fdc4e710f9e45a69f6fa41336336f111#diff-6c7ad505eb29f64a8351f7d8a54fccecb756ece60bc0ed8cebe625c2f420ded9)

```
  348 + 	// --- Authentication ---
  349 +
  350 + 	async setGitHubToken(token: string): Promise<void> {
  351 + 		this._githubToken = token;
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-17 (13 days ago)](#discussion_r2818785455)

The GitHub token is stored in plain text in the `_githubToken` field and passed to the SDK. Consider whether this needs to be handled more securely, such as using the existing credential store services in VS Code rather than keeping it in memory.

Suggested change

```
  352 - 		this._githubToken = token;
  352 + 		const client = await this._ensureClient();
  353 + 		await client.setGitHubToken(token);
```

▸ 

[build/darwin/create-universal-app.ts](https://github.com/microsoft/vscode/pull/295817/files/96440905fdc4e710f9e45a69f6fa41336336f111#diff-6e3bf673b5cd62ad9dd6f1c5d4ec6311c411461dcc4ac1172b97b0c22147946a)

Comment on lines 32 to 52

```
  32 + 	for (const plat of copilotPlatforms) {
  33 + 		const relPath = path.join('Contents', 'Resources', 'app', 'node_modules', '@github', `copilot-${plat}`);
  34 + 		const inX64 = path.join(x64AppPath, relPath);
  35 + 		const inArm64 = path.join(arm64AppPath, relPath);
  36 + 		if (fs.existsSync(inX64) && !fs.existsSync(inArm64)) {
  37 + 			console.log(`Copying missing copilot-${plat} to arm64 build`);
  38 + 			execSync(`cp -R ${JSON.stringify(inX64)} ${JSON.stringify(inArm64)}`);
  39 + 		} else if (fs.existsSync(inArm64) && !fs.existsSync(inX64)) {
  40 + 			console.log(`Copying missing copilot-${plat} to x64 build`);
  41 + 			execSync(`cp -R ${JSON.stringify(inArm64)} ${JSON.stringify(inX64)}`);
  42 + 		}
  43 + 		const relPathU = path.join('Contents', 'Resources', 'app', 'node_modules.asar.unpacked', '@github', `copilot-${plat}`);
  44 + 		const inX64U = path.join(x64AppPath, relPathU);
  45 + 		const inArm64U = path.join(arm64AppPath, relPathU);
  46 + 		if (fs.existsSync(inX64U) && !fs.existsSync(inArm64U)) {
  47 + 			fs.mkdirSync(path.dirname(inArm64U), { recursive: true });
  48 + 			execSync(`cp -R ${JSON.stringify(inX64U)} ${JSON.stringify(inArm64U)}`);
  49 + 		} else if (fs.existsSync(inArm64U) && !fs.existsSync(inX64U)) {
  50 + 			fs.mkdirSync(path.dirname(inX64U), { recursive: true });
  51 + 			execSync(`cp -R ${JSON.stringify(inArm64U)} ${JSON.stringify(inX64U)}`);
  52 + 		}
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-17 (13 days ago)](#discussion_r2818785467)

The `execSync` calls in lines 38 and 48 use JSON.stringify for shell escaping, which is not safe on all platforms. On Windows, this won't properly escape paths with spaces or special characters. Use a proper shell escaping library or Node.js's `fs.cpSync` instead.

▸ 

[package.json](https://github.com/microsoft/vscode/pull/295817/files/96440905fdc4e710f9e45a69f6fa41336336f111#diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519)

```
  85 85       "@vscode/iconv-lite-umd": "0.7.1",
  86 86       "@vscode/native-watchdog": "^1.4.6",
  87 87       "@vscode/policy-watcher": "^1.3.2",
     88 +     "@github/copilot-sdk": "0.1.23",
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-17 (13 days ago)](#discussion_r2818785489)

The `@github/copilot-sdk` package requires Node.js >= 24.0.0 (line 1139 in package-lock.json), but VS Code currently ships with and supports Node.js versions lower than 24. This will cause a runtime incompatibility. Verify that the utility process uses Node 24+ or request a version of the SDK compatible with the Node version VS Code uses.

Suggested change

```
  92 -     "@github/copilot-sdk": "0.1.23",
  92 +     "@github/copilot-sdk": "0.1.22",
```

▸ [xlet: 4 hidden conversations; load on GitHub]

▸ 

[src/vs/sessions/services/copilotSdk/node/copilotSdkHost.ts](https://github.com/microsoft/vscode/pull/295817/files/96440905fdc4e710f9e45a69f6fa41336336f111#diff-6c7ad505eb29f64a8351f7d8a54fccecb756ece60bc0ed8cebe625c2f420ded9)

Comment on lines +118 to +126

```
  118 + 			this._client = new sdk.CopilotClient({
  119 + 				autoStart: true,
  120 + 				autoRestart: true,
  121 + 				useStdio: true,
  122 + 				...(cliPath ? { cliPath } : {}),
  123 + 				env: cliEnv,
  124 + 				...(this._githubToken ? { githubToken: this._githubToken } : {}),
  125 + 			});
  126 + 			this._onProcessOutput.fire({ stream: 'stderr', data: '[SDK] CopilotClient created, calling start()...' });
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-17 (13 days ago)](#discussion_r2818785557)

The utility process is started with `autoStart: true` and `autoRestart: true` but there's no backoff or rate limiting if it crashes repeatedly. This could lead to a crash loop that consumes resources. Consider implementing exponential backoff or limiting restart attempts.

▸ 

[src/vs/sessions/contrib/copilotSdk/browser/widget/sdkChatWidget.ts](https://github.com/microsoft/vscode/pull/295817/files/96440905fdc4e710f9e45a69f6fa41336336f111#diff-4f328eaaae7ff3c25005e1802ad5c5505426ce73cfe41db3bd1801a83fbf3568)

Comment on lines +270 to +274

```
  270 + 		const preferred = models.find(m => m.id === 'claude-sonnet-4') ?? models.find(m => m.id === 'gpt-4.1') ?? models[0];
  271 + 		if (preferred) {
  272 + 			this._modelSelect.value = preferred.id;
  273 + 			this._modelLabel.textContent = preferred.name ?? preferred.id;
  274 + 		}
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-17 (13 days ago)](#discussion_r2818785576)

The model preference logic at line 270 looks for 'claude-sonnet-4' first, then 'gpt-4.1', but these model IDs may not exist in the available models list. Consider making this configurable or checking actual model availability rather than hardcoding specific model names that may change over time.

▸ 

[src/vs/sessions/contrib/copilotSdk/browser/widget/sdkChatWidget.ts](https://github.com/microsoft/vscode/pull/295817/files/96440905fdc4e710f9e45a69f6fa41336336f111#diff-4f328eaaae7ff3c25005e1802ad5c5505426ce73cfe41db3bd1801a83fbf3568)

Comment on lines +307 to +312

```
  307 + 	private _addFolderToHistory(path: string): void {
  308 + 		const history = this._getFolderHistory().filter(p => p !== path);
  309 + 		history.unshift(path);
  310 + 		if (history.length > SdkChatWidget.MAX_FOLDER_HISTORY) { history.length = SdkChatWidget.MAX_FOLDER_HISTORY; }
  311 + 		this._storageService.store(SdkChatWidget.FOLDER_HISTORY_KEY, JSON.stringify(history), StorageScope.PROFILE, StorageTarget.USER);
  312 + 	}
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-17 (13 days ago)](#discussion_r2818785589)

The folderHistory management functions don't validate that the path is actually a directory or that it's accessible. Consider adding validation before storing paths to prevent showing invalid entries to the user.

▸ 

[src/vs/sessions/contrib/sessions/browser/sessionsViewPane.ts](https://github.com/microsoft/vscode/pull/295817/files/96440905fdc4e710f9e45a69f6fa41336336f111#diff-550a58e950e06e5c4ce84dd510c533f81d70f5708d501ea41f071356dceac83e)

Comment on lines 150 to 154

```
  150 + 		// SDK session lifecycle updates
  151 + 		if (this._useSdk) {
  152 + 			this._register(this.copilotSdkService.onSessionLifecycle(() => this._refreshSdkSessionList()));
  153 + 			this._register(this._sdkListDisposables);
  154 + 		}
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-17 (13 days ago)](#discussion_r2818785601)

The `_sdkListDisposables` store is registered in the constructor but is cleared and reused in `_renderSdkSessionList`. This pattern is correct, but the disposables added to this store won't be automatically disposed when the parent object is disposed unless `clear()` is called. Consider calling `clear()` in the dispose method or using a fresh store each time.

▸ 

[src/vs/sessions/contrib/sessions/browser/sessionsViewPane.ts](https://github.com/microsoft/vscode/pull/295817/files/96440905fdc4e710f9e45a69f6fa41336336f111#diff-550a58e950e06e5c4ce84dd510c533f81d70f5708d501ea41f071356dceac83e)

Comment on lines 295 to 305

```
  295 + 	private _relativeTime(date: Date): string {
  296 + 		const diffMs = Date.now() - date.getTime();
  297 + 		const diffMins = Math.floor(diffMs / 60000);
  298 + 		if (diffMins < 1) { return localize('justNow', "just now"); }
  299 + 		if (diffMins < 60) { return localize('minutesAgo', "{0}m ago", diffMins); }
  300 + 		const diffHours = Math.floor(diffMins / 60);
  301 + 		if (diffHours < 24) { return localize('hoursAgo', "{0}h ago", diffHours); }
  302 + 		const diffDays = Math.floor(diffHours / 24);
  303 + 		if (diffDays < 7) { return localize('daysAgo', "{0}d ago", diffDays); }
  304 + 		return date.toLocaleDateString();
  305 + 	}
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-17 (13 days ago)](#discussion_r2818785615)

The `_relativeTime` function doesn't handle future dates gracefully. If `date` is in the future (e.g., due to clock skew), `diffMs` will be negative and the function will show incorrect results like "-5m ago". Consider adding a check for negative differences and handling them appropriately.

[[ Copilot on 2026-02-17 (13 days ago) ]]


## Comment 21
[joshspicer](https://github.com/joshspicer) added 2 commits

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 22
[code review](https://github.com/microsoft/vscode/pull/295817/commits/abecd693388f366ff48f854fd6824a6c36c37279)

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 23
[merge](https://github.com/microsoft/vscode/pull/295817/commits/d823b474c95e4a3667d6b33fde4c5ea1b0bacf94)

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 24
[joshspicer](https://github.com/joshspicer) requested a review from [Copilot](https://github.com/apps/copilot-pull-request-reviewer)

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 25
**Copilot** [started reviewing](https://github.com/microsoft/vscode/agents/pull/295817?session_id=ccf5cb41-9d4d-4b2a-a3e9-d175d50d1ebe "View session") on behalf of [joshspicer](https://github.com/joshspicer)

[[ unknown on 2026-02-17 (13 days ago) ]]


## Comment 26
**[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** reviewed

[View reviewed changes](https://github.com/microsoft/vscode/pull/295817/files/d823b474c95e4a3667d6b33fde4c5ea1b0bacf94)

[[ Copilot on 2026-02-17 (13 days ago) ]]


## Comment 27
## Pull request overview

Copilot reviewed 34 out of 35 changed files in this pull request and generated 6 comments.

[[ Copilot ]]


## Comment 28
▸ 

[src/vs/sessions/contrib/sessions/browser/sessionsViewPane.ts](https://github.com/microsoft/vscode/pull/295817/files/d823b474c95e4a3667d6b33fde4c5ea1b0bacf94#diff-550a58e950e06e5c4ce84dd510c533f81d70f5708d501ea41f071356dceac83e)

Comment on lines +261 to +266

```
  261 + 			deleteBtn.title = localize('deleteSession', "Delete Session");
  262 + 			DOM.append(deleteBtn, $('span')).classList.add(...ThemeIcon.asClassNameArray(Codicon.trash));
  263 + 			this._sdkListDisposables.add(DOM.addDisposableListener(deleteBtn, 'click', (e) => {
  264 + 				DOM.EventHelper.stop(e);
  265 + 				this._deleteSdkSession(session.sessionId);
  266 + 			}));
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI**

The delete icon button relies on `title` only; please add an accessible name (e.g. `aria-label`) and consider stopping propagation/handling keyboard interaction consistently so screen readers and keyboard users can discover and activate the delete action reliably.

Suggested change

```
  203 - 			deleteBtn.title = localize('deleteSession', "Delete Session");
  204 - 			DOM.append(deleteBtn, $('span')).classList.add(...ThemeIcon.asClassNameArray(Codicon.trash));
  205 - 			this._sdkListDisposables.add(DOM.addDisposableListener(deleteBtn, 'click', (e) => {
  206 - 				DOM.EventHelper.stop(e);
  207 - 				this._deleteSdkSession(session.sessionId);
  208 - 			}));
  203 + 			deleteBtn.title = localize('deleteSession', "Delete Session");
  204 + 			deleteBtn.setAttribute('aria-label', localize('deleteSession', "Delete Session"));
  205 + 			deleteBtn.type = 'button';
  206 + 			DOM.append(deleteBtn, $('span')).classList.add(...ThemeIcon.asClassNameArray(Codicon.trash));
  207 + 			this._sdkListDisposables.add(DOM.addDisposableListener(deleteBtn, 'click', (e) => {
  208 + 				DOM.EventHelper.stop(e);
  209 + 				this._deleteSdkSession(session.sessionId);
  210 + 			}));
  211 + 			this._sdkListDisposables.add(DOM.addDisposableListener(deleteBtn, 'keydown', (e: KeyboardEvent) => {
  212 + 				if (e.key === 'Enter' || e.key === ' ') {
  213 + 					e.preventDefault();
  214 + 					DOM.EventHelper.stop(e);
  215 + 					this._deleteSdkSession(session.sessionId);
  216 + 				}
  217 + 			}));
```

▸ 

[src/vs/sessions/contrib/copilotSdk/browser/widget/sdkContentPartRenderer.ts](https://github.com/microsoft/vscode/pull/295817/files/d823b474c95e4a3667d6b33fde4c5ea1b0bacf94#diff-c827696e0e6cb3275eac13760bcb8a3ee1ffce8e79f18aa45740398db78514a4)

Comment on lines +171 to +189

```
  171 + 		'edit': 'Edit file',
  172 + 		'read': 'Read file',
  173 + 		'write': 'Write file',
  174 + 		'read_file': 'Read file',
  175 + 		'write_file': 'Write file',
  176 + 		'edit_file': 'Edit file',
  177 + 		'create_file': 'Create file',
  178 + 		'create': 'Create file',
  179 + 		'multi_edit': 'Edit files',
  180 + 		'list_directory': 'List directory',
  181 + 		'run_command': 'Run command',
  182 + 		'run_terminal_command': 'Run command',
  183 + 		'search': 'Search',
  184 + 		'grep_search': 'Search files',
  185 + 		'file_search': 'Find files',
  186 + 		'semantic_search': 'Semantic search',
  187 + 		'delete': 'Delete',
  188 + 		'browser_action': 'Browser action',
  189 + 		'get_errors': 'Check errors',
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-17 (13 days ago)](#discussion_r2819414286)

These tool labels are user-facing but are hard-coded English strings. Please externalize them via `localize(...)` (or derive them from existing localized chat/tool UI labels) so they participate in localization and remain consistent with the rest of the workbench.

Suggested change

```
  171 - 		'edit': 'Edit file',
  172 - 		'read': 'Read file',
  173 - 		'write': 'Write file',
  174 - 		'read_file': 'Read file',
  175 - 		'write_file': 'Write file',
  176 - 		'edit_file': 'Edit file',
  177 - 		'create_file': 'Create file',
  178 - 		'create': 'Create file',
  179 - 		'multi_edit': 'Edit files',
  180 - 		'list_directory': 'List directory',
  181 - 		'run_command': 'Run command',
  182 - 		'run_terminal_command': 'Run command',
  183 - 		'search': 'Search',
  184 - 		'grep_search': 'Search files',
  185 - 		'file_search': 'Find files',
  186 - 		'semantic_search': 'Semantic search',
  187 - 		'delete': 'Delete',
  188 - 		'browser_action': 'Browser action',
  189 - 		'get_errors': 'Check errors',
  171 + 		'edit': localize('sdk.toolLabel.edit', "Edit file"),
  172 + 		'read': localize('sdk.toolLabel.read', "Read file"),
  173 + 		'write': localize('sdk.toolLabel.write', "Write file"),
  174 + 		'read_file': localize('sdk.toolLabel.readFile', "Read file"),
  175 + 		'write_file': localize('sdk.toolLabel.writeFile', "Write file"),
  176 + 		'edit_file': localize('sdk.toolLabel.editFile', "Edit file"),
  177 + 		'create_file': localize('sdk.toolLabel.createFile', "Create file"),
  178 + 		'create': localize('sdk.toolLabel.create', "Create file"),
  179 + 		'multi_edit': localize('sdk.toolLabel.multiEdit', "Edit files"),
  180 + 		'list_directory': localize('sdk.toolLabel.listDirectory', "List directory"),
  181 + 		'run_command': localize('sdk.toolLabel.runCommand', "Run command"),
  182 + 		'run_terminal_command': localize('sdk.toolLabel.runTerminalCommand', "Run command"),
  183 + 		'search': localize('sdk.toolLabel.search', "Search"),
  184 + 		'grep_search': localize('sdk.toolLabel.grepSearch', "Search files"),
  185 + 		'file_search': localize('sdk.toolLabel.fileSearch', "Find files"),
  186 + 		'semantic_search': localize('sdk.toolLabel.semanticSearch', "Semantic search"),
  187 + 		'delete': localize('sdk.toolLabel.delete', "Delete"),
  188 + 		'browser_action': localize('sdk.toolLabel.browserAction', "Browser action"),
  189 + 		'get_errors': localize('sdk.toolLabel.getErrors', "Check errors"),
```

▸ 

[src/vs/sessions/contrib/copilotSdk/browser/copilotSdkDebugPanel.ts](https://github.com/microsoft/vscode/pull/295817/files/d823b474c95e4a3667d6b33fde4c5ea1b0bacf94#diff-a8c1ed71c33741728f36f8f027d303deca35161e934c07fa41d161315d4e7ac2)

Comment on lines +50 to +56

```
  50 + 		// Header
  51 + 		const header = dom.append(this.element, $('.debug-panel-header'));
  52 + 		dom.append(header, $('span')).textContent = 'Copilot SDK RPC Debug';
  53 + 		const clearBtn = dom.append(header, $('button')) as HTMLButtonElement;
  54 + 		clearBtn.textContent = 'Clear';
  55 + 		clearBtn.style.cssText = 'margin-left:auto;font-size:11px;padding:2px 8px;background:var(--vscode-button-secondaryBackground);color:var(--vscode-button-secondaryForeground);border:none;border-radius:3px;cursor:pointer;';
  56 + 		this._register(dom.addDisposableListener(clearBtn, 'click', () => {
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-17 (13 days ago)](#discussion_r2819414299)

This debug panel UI introduces multiple hard-coded, user-visible strings (e.g. header/title and button labels). Even if intended as a temporary/debug feature, these strings still surface in-product when the flag is enabled; please externalize them with `localize(...)` for consistency and to avoid shipping non-localized UI.

▸ 

[build/gulpfile.vscode.ts](https://github.com/microsoft/vscode/pull/295817/files/d823b474c95e4a3667d6b33fde4c5ea1b0bacf94#diff-ccdd55130be6f89fd19598561b54ce885e483dfa6f782b93b50e95b28196b77f)

```
  442 455   				'**/node-pty/lib/shared/conout.js',
  443 456   				'**/*.wasm',
  444 457   				'**/@vscode/vsce-sign/bin/*',
      458 + 				'**/@github/copilot-*/**',
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-17 (13 days ago)](#discussion_r2819414310)

The ASAR unpack pattern `**/@github/copilot-*/**` will unpack entire platform packages, which can significantly increase unpacked size and packaging time. If only the CLI executable needs to be unpacked, consider narrowing this to the specific binary path(s) (e.g. `**/@github/copilot-*/copilot*`) and keep the rest inside the ASAR.

Suggested change

```
  459 - 				'**/@github/copilot-*/**',
  459 + 				'**/@github/copilot-*/copilot*',
```

▸ 

[build/darwin/create-universal-app.ts](https://github.com/microsoft/vscode/pull/295817/files/d823b474c95e4a3667d6b33fde4c5ea1b0bacf94#diff-6e3bf673b5cd62ad9dd6f1c5d4ec6311c411461dcc4ac1172b97b0c22147946a) Outdated

Comment on lines 32 to 51

```
  32 + 	for (const plat of copilotPlatforms) {
  33 + 		const relPath = path.join('Contents', 'Resources', 'app', 'node_modules', '@github', `copilot-${plat}`);
  34 + 		const inX64 = path.join(x64AppPath, relPath);
  35 + 		const inArm64 = path.join(arm64AppPath, relPath);
  36 + 		if (fs.existsSync(inX64) && !fs.existsSync(inArm64)) {
  37 + 			console.log(`Copying missing copilot-${plat} to arm64 build`);
  38 + 			execSync(`cp -R ${JSON.stringify(inX64)} ${JSON.stringify(inArm64)}`);
  39 + 		} else if (fs.existsSync(inArm64) && !fs.existsSync(inX64)) {
  40 + 			console.log(`Copying missing copilot-${plat} to x64 build`);
  41 + 			execSync(`cp -R ${JSON.stringify(inArm64)} ${JSON.stringify(inX64)}`);
  42 + 		}
  43 + 		const relPathU = path.join('Contents', 'Resources', 'app', 'node_modules.asar.unpacked', '@github', `copilot-${plat}`);
  44 + 		const inX64U = path.join(x64AppPath, relPathU);
  45 + 		const inArm64U = path.join(arm64AppPath, relPathU);
  46 + 		if (fs.existsSync(inX64U) && !fs.existsSync(inArm64U)) {
  47 + 			fs.mkdirSync(path.dirname(inArm64U), { recursive: true });
  48 + 			execSync(`cp -R ${JSON.stringify(inX64U)} ${JSON.stringify(inArm64U)}`);
  49 + 		} else if (fs.existsSync(inArm64U) && !fs.existsSync(inX64U)) {
  50 + 			fs.mkdirSync(path.dirname(inX64U), { recursive: true });
  51 + 			execSync(`cp -R ${JSON.stringify(inArm64U)} ${JSON.stringify(inX64U)}`);
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-17 (13 days ago)](#discussion_r2819414321)

Using `execSync('cp -R ...')` here makes the build depend on shelling out and is more brittle across environments (spaces, permissions, missing `cp`, error handling). Prefer `fs.cpSync`/`fs.promises.cp` with `{ recursive: true }` and explicit error handling so the universal build step is safer and easier to maintain.

Suggested change

```
  · - 	for (const plat of copilotPlatforms) {
  · - 		const relPath = path.join('Contents', 'Resources', 'app', 'node_modules', '@github', `copilot-${plat}`);
  · - 		const inX64 = path.join(x64AppPath, relPath);
  · - 		const inArm64 = path.join(arm64AppPath, relPath);
  · - 		if (fs.existsSync(inX64) && !fs.existsSync(inArm64)) {
  · - 			console.log(`Copying missing copilot-${plat} to arm64 build`);
  · - 			execSync(`cp -R ${JSON.stringify(inX64)} ${JSON.stringify(inArm64)}`);
  · - 		} else if (fs.existsSync(inArm64) && !fs.existsSync(inX64)) {
  · - 			console.log(`Copying missing copilot-${plat} to x64 build`);
  · - 			execSync(`cp -R ${JSON.stringify(inArm64)} ${JSON.stringify(inX64)}`);
  · - 		}
  · - 		const relPathU = path.join('Contents', 'Resources', 'app', 'node_modules.asar.unpacked', '@github', `copilot-${plat}`);
  · - 		const inX64U = path.join(x64AppPath, relPathU);
  · - 		const inArm64U = path.join(arm64AppPath, relPathU);
  · - 		if (fs.existsSync(inX64U) && !fs.existsSync(inArm64U)) {
  · - 			fs.mkdirSync(path.dirname(inArm64U), { recursive: true });
  · - 			execSync(`cp -R ${JSON.stringify(inX64U)} ${JSON.stringify(inArm64U)}`);
  · - 		} else if (fs.existsSync(inArm64U) && !fs.existsSync(inX64U)) {
  · - 			fs.mkdirSync(path.dirname(inX64U), { recursive: true });
  · - 			execSync(`cp -R ${JSON.stringify(inArm64U)} ${JSON.stringify(inX64U)}`);
  · +
  · + 	const copyRecursiveSync = (source: string, destination: string): void => {
  · + 		try {
  · + 			fs.cpSync(source, destination, { recursive: true });
  · + 		} catch (error) {
  · + 			console.error(`Failed to copy ${source} to ${destination}:`, error);
  · + 			throw error;
  · + 		}
  · + 	};
  · +
  · + 	for (const plat of copilotPlatforms) {
  · + 		const relPath = path.join('Contents', 'Resources', 'app', 'node_modules', '@github', `copilot-${plat}`);
  · + 		const inX64 = path.join(x64AppPath, relPath);
  · + 		const inArm64 = path.join(arm64AppPath, relPath);
  · + 		if (fs.existsSync(inX64) && !fs.existsSync(inArm64)) {
  · + 			console.log(`Copying missing copilot-${plat} to arm64 build`);
  · + 			copyRecursiveSync(inX64, inArm64);
  · + 		} else if (fs.existsSync(inArm64) && !fs.existsSync(inX64)) {
  · + 			console.log(`Copying missing copilot-${plat} to x64 build`);
  · + 			copyRecursiveSync(inArm64, inX64);
  · + 		}
  · + 		const relPathU = path.join('Contents', 'Resources', 'app', 'node_modules.asar.unpacked', '@github', `copilot-${plat}`);
  · + 		const inX64U = path.join(x64AppPath, relPathU);
  · + 		const inArm64U = path.join(arm64AppPath, relPathU);
  · + 		if (fs.existsSync(inX64U) && !fs.existsSync(inArm64U)) {
  · + 			fs.mkdirSync(path.dirname(inArm64U), { recursive: true });
  · + 			copyRecursiveSync(inX64U, inArm64U);
  · + 		} else if (fs.existsSync(inArm64U) && !fs.existsSync(inX64U)) {
  · + 			fs.mkdirSync(path.dirname(inX64U), { recursive: true });
  · + 			copyRecursiveSync(inArm64U, inX64U);
```

▸ 

[src/vs/sessions/contrib/sessions/browser/sessionsViewPane.ts](https://github.com/microsoft/vscode/pull/295817/files/d823b474c95e4a3667d6b33fde4c5ea1b0bacf94#diff-550a58e950e06e5c4ce84dd510c533f81d70f5708d501ea41f071356dceac83e)

Comment on lines +231 to +236

```
  231 + 		for (const session of this._sdkSessions) {
  232 + 			const item = DOM.append(this._sdkListContainer, $('.sdk-session-item'));
  233 + 			item.tabIndex = 0;
  234 + 			item.setAttribute('role', 'listitem');
  235 + 			item.setAttribute('data-session-id', session.sessionId);
  236 + 			if (session.sessionId === this._sdkSelectedSessionId) { item.classList.add('selected'); }
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-17 (13 days ago)](#discussion_r2819414332)

The SDK sessions list renders clickable `div` elements with `role="listitem"`, but there’s no parent `role="list"` and selection state is only represented via CSS class. For accessibility, please use an actual list structure (or add `role="list"` on the container) and expose selection via `aria-selected` (and/or use a button element / `role="button"` for the clickable row).

[[ Copilot on 2026-02-17 (13 days ago) ]]


## Comment 29
[fix fs usage](https://github.com/microsoft/vscode/pull/295817/commits/057e8424a6926a3a4d2acfe23cd20ebe374e58e4)

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 30
## Code Review — All Threads Addressed

All actionable feedback has been fixed. Resolving threads now.

### ✅ Fixed (16 threads)

- `_sdkListDisposables` redundant `_register` → removed
- CLI resolve fail continues silently → added `throw`
- `window.confirm()` → `IDialogService.confirm()`
- `execSync` unsafe → `fs.cpSync({ recursive: true })`
- Markdown renderer results leak → `WeakMap<HTMLElement, DisposableStore>`
- Bracket notation `configuration['sessions-sdk']` → proper `.isSessionsUtilityProcess`
- `process.stderr.write` never restored → `_originalStderrWrite` field + restore in `stop()`
- Non-null assertion on `_worktreePath` → local variable capture
- `split('/')` not cross-platform → `_labelForPath()` with `paths.basename()`
- Singleton `_instance` not cleared → override `dispose()` clears it
- Session event listeners leak → per-session `DisposableStore`
- Delete without confirmation → `dialogService.confirm()`
- Silent catch on session destroy → now logs via `_onProcessOutput`
- Delete button accessibility → `aria-label`, `type="button"`, keydown handler
- ASAR unpack glob too broad → narrowed to `copilot-*/copilot*`
- Session list `role="list"` + `aria-selected` → added
- `_relativeTime` future dates → `diffMs <= 0` guard
- `_ensureClient` race condition → promise-based lock
- Tool labels not localized → all use `localize(...)`
- Debug panel strings not localized → all use `localize(...)`

### 🔇 Won't Fix / False Positive (5 threads)

- SDK Node.js version: false positive, works fine
- Timeout message mismatch: 30s matches 30000ms
- `allow-any-unicode-next-line`: valid VS Code hygiene directive
- `autoRestart` backoff: handled by SDK internally
- Hardcoded model preferences: intentional experiment default
- Folder history validation: low priority, paths from picker/SDK

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 31
[Merge branch 'main' into josh/sessions-with-sdk](https://github.com/microsoft/vscode/pull/295817/commits/481e91ab26f92066410de7778b1e10422d185fcb)

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 32
[joshspicer](https://github.com/joshspicer) requested a review from [Copilot](https://github.com/apps/copilot-pull-request-reviewer)

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 33
**Copilot** [started reviewing](https://github.com/microsoft/vscode/agents/pull/295817?session_id=67b6503f-a961-4574-ab33-5d2998acc8dc "View session") on behalf of [joshspicer](https://github.com/joshspicer)

[[ unknown on 2026-02-17 (13 days ago) ]]


## Comment 34
**[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** reviewed

[View reviewed changes](https://github.com/microsoft/vscode/pull/295817/files/481e91ab26f92066410de7778b1e10422d185fcb)

[[ Copilot on 2026-02-17 (13 days ago) ]]


## Comment 35
## Pull request overview

Copilot reviewed 34 out of 35 changed files in this pull request and generated 3 comments.

▸ Comments suppressed due to low confidence (1)

**src/vs/platform/copilotSdk/node/copilotSdkHost.ts:398**

- `_attachSessionEvents()` unconditionally creates a new `DisposableStore` and overwrites `_sessionDisposables` for `sessionId` without disposing any existing store. If `resumeSession()` is called multiple times for the same session, this will leak listeners. Dispose the existing store (if any) before replacing it.

```
	private _attachSessionEvents(session: CopilotSession): void {
		const sessionId = session.sessionId;
		const store = new DisposableStore();
		const listener = session.on((event: SessionEvent) => {
			this._onSessionEvent.fire({
				sessionId,
				type: event.type as ICopilotSessionEvent['type'],
				data: (event as { data?: Record<string, unknown> }).data ?? {},
			});
		});
		store.add(typeof listener === 'function' ? toDisposable(listener) : listener);
		this._sessionDisposables.set(sessionId, store);
	}
```

[[ Copilot ]]


## Comment 36
▸ 

[src/vs/sessions/services/copilotSdk/node/copilotSdkHost.ts](https://github.com/microsoft/vscode/pull/295817/files/481e91ab26f92066410de7778b1e10422d185fcb#diff-6c7ad505eb29f64a8351f7d8a54fccecb756ece60bc0ed8cebe625c2f420ded9)

[xlet: thread content not loaded; load on GitHub]

▸ 

[src/vs/sessions/contrib/copilotSdk/browser/widget/sdkChatModel.ts](https://github.com/microsoft/vscode/pull/295817/files/481e91ab26f92066410de7778b1e10422d185fcb#diff-1d4fb891b2dbf6e9f65bd1deedc132f93f7735637aadbaafabcdeeb55f32d597)

Comment on lines 163 to 168

```
  163 + 			case 'session.compaction_start':
  164 + 				return this._addProgressToAssistantTurn('Compacting context...');
  165 +
  166 + 			case 'session.compaction_complete':
  167 + 				return this._addProgressToAssistantTurn('Context compacted');
  168 +
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI**

Progress messages "Compacting context..." and "Context compacted" are user-visible but not localized. Please wrap them in `localize(...)` (or route them through an existing localized message set) so they can be translated.

▸ 

[src/vs/sessions/contrib/copilotSdk/browser/widget/sdkChatWidget.ts](https://github.com/microsoft/vscode/pull/295817/files/481e91ab26f92066410de7778b1e10422d185fcb#diff-4f328eaaae7ff3c25005e1802ad5c5505426ce73cfe41db3bd1801a83fbf3568)

```
  176 + 				const terminalGroupService = accessor.get(ITerminalGroupService);
  177 + 				terminalService.createTerminal({ config: { cwd: URI.file(worktreePath) } }).then(instance => {
  178 + 					if (instance) { terminalService.setActiveInstance(instance); }
  179 + 					terminalGroupService.showPanel(true);
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-17 (13 days ago)](#discussion_r2819502261)

The terminal creation promise isn’t handled (`createTerminal(...).then(...)` without a rejection handler). If terminal creation fails, this can surface as an unhandled rejection from a UI event. Please add explicit error handling (e.g. `.catch(onUnexpectedError)` or equivalent pattern used in this codebase).

Suggested change

```
  176 - 					terminalGroupService.showPanel(true);
  176 + 					terminalGroupService.showPanel(true);
  177 + 				}).catch(error => {
  178 + 					this._logService.error(error);
```

[[ Copilot on 2026-02-17 (13 days ago) ]]


## Comment 37
[joshspicer](https://github.com/joshspicer) added 2 commits

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 38
[implement auto generation from copiot sdk d.ts and layer of abstraction](https://github.com/microsoft/vscode/pull/295817/commits/4592ab1bf23ea1b82a3174363bfe980e0a898463)

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 39
[resolve code review](https://github.com/microsoft/vscode/pull/295817/commits/1c27c3b44088881a5d7b33243e83923d2c1f52c7)

[[ joshspicer on 2026-02-17 (13 days ago) ]]


## Comment 40
**[roblourens](https://github.com/roblourens)** previously approved these changes

[View reviewed changes](https://github.com/microsoft/vscode/pull/295817/files/8baa674e456bf5fc32732b61e5c85cf90f9add91)

[[ roblourens on 2026-02-18 (12 days ago) ]]


## Comment 41

[[ unknown ]]


## Comment 42
[joshspicer](https://github.com/joshspicer) requested a review from [DonJayamanne](https://github.com/DonJayamanne)

[[ joshspicer on 2026-02-18 (12 days ago) ]]


## Comment 43
**[bpasero](https://github.com/bpasero)** requested changes

[View reviewed changes](https://github.com/microsoft/vscode/pull/295817/files/8baa674e456bf5fc32732b61e5c85cf90f9add91)

[[ bpasero on 2026-02-20 (11 days ago) ]]


## Comment 44
I left some initial high level feedback for the areas I felt I can provide it and ignored changes to `vs/sessions` for now and also did not yet drill into the utility process specifics.

I want @deepak1556 to comment on the build changes, the entitlements and the platform specific modules. Is the SDK really built natively for different platforms? I was hoping for a JS library, but maybe that is not the case.

On a high level I feel the direction of mixing both the architectural change (to move to utility process) and introducing entire new UI components for chat (which are not compatible to the old UI) the wrong approach. I would like us to:

- have 1 PR with the architectural change of a utility process and using SDK compatible with the old UI
- have 1 PR with exploring to recreate the chat rendering UI on top of the architectural changes

[[ bpasero on 2026-02-20 (11 days ago) ]]


## Comment 45
▸ 

[src/vs/workbench/services/environment/browser/environmentService.ts](https://github.com/microsoft/vscode/pull/295817/files/8baa674e456bf5fc32732b61e5c85cf90f9add91#diff-10a490793cdf946af52b08b20f65e837f9344c564486152f3479c1d802e065ed) Outdated

[xlet: thread content not loaded; load on GitHub]

▸ 

[src/vs/workbench/services/environment/common/environmentService.ts](https://github.com/microsoft/vscode/pull/295817/files/8baa674e456bf5fc32732b61e5c85cf90f9add91#diff-afef50076e509f44f6362cd22bed30b249b00dd56dbcdc15c1cd33aa01f2c7ca) Outdated

```
  36 36   	readonly skipWelcome: boolean;
  37 37   	readonly disableWorkspaceTrust: boolean;
  38 38   	readonly isSessionsWindow: boolean;
     39 + 	readonly isSessionsUtilityProcess: boolean;
```

Why would a workbench be a sessions utility process???

▸ 

[src/vs/workbench/services/environment/electron-browser/environmentService.ts](https://github.com/microsoft/vscode/pull/295817/files/8baa674e456bf5fc32732b61e5c85cf90f9add91#diff-606a69dffd023e82747f7c6e0bbf3226dae1ec9f6dda1eef1f586509d958ec7e) Outdated

```
  155 155   	get isSessionsWindow(): boolean { return !!this.configuration.isSessionsWindow; }
  156 156  
      157 + 	@memoize
      158 + 	get isSessionsUtilityProcess(): boolean { return !!this.configuration.isSessionsUtilityProcess; }
```

Why would a workbench be a sessions utility process???

▸ 

[src/vs/workbench/common/contextkeys.ts](https://github.com/microsoft/vscode/pull/295817/files/8baa674e456bf5fc32732b61e5c85cf90f9add91#diff-b077a0fab41876dd0072bccdc089131ee70d3e2702d942126d43ed0ad715a1ab) Outdated

[xlet: thread content not loaded; load on GitHub]

▸ 

[src/vs/workbench/browser/contextkeys.ts](https://github.com/microsoft/vscode/pull/295817/files/8baa674e456bf5fc32732b61e5c85cf90f9add91#diff-64eb3fefaf9a02d7e63604ead0dd0b4e6c2b880a06ca0de595268a78e32fc650) Outdated

[xlet: thread content not loaded; load on GitHub]

▸ [xlet: 3 hidden conversations; load on GitHub]

▸ 

[src/vs/platform/windows/electron-main/windowsMainService.ts](https://github.com/microsoft/vscode/pull/295817/files/8baa674e456bf5fc32732b61e5c85cf90f9add91#diff-6699b46d11f5bb08b4c30462c6f7d025cfa02d6268dbf2f7d10bf08bbf011828) Outdated

[xlet: thread content not loaded; load on GitHub]

▸ 

[src/vs/platform/copilotSdk/common/copilotSdkService.ts](https://github.com/microsoft/vscode/pull/295817/files/8baa674e456bf5fc32732b61e5c85cf90f9add91#diff-5cbdc6baacd3772bb044afaa9fd8983880374b4627c832c99a69234026bab82b)

```
   9 +
  10 + // #region Service Identifiers
  11 +
  12 + export const ICopilotSdkService = createDecorator<ICopilotSdkService>('copilotSdkService');
```

As long as this is an exploration I would suggest to move the `platform/copilotSDK` package into the `vs/sessions` folder.

▸ 

[src/vs/code/electron-main/app.ts](https://github.com/microsoft/vscode/pull/295817/files/8baa674e456bf5fc32732b61e5c85cf90f9add91#diff-ce90ef6ffd304cc541efa8135dc4878c7b61889d2b2d5ef69e196af6cea7647b) Outdated

```
  1131 1133   		services.set(IUtilityProcessWorkerMainService, new SyncDescriptor(UtilityProcessWorkerMainService, undefined, true));
  1132 1134  
       1135 + 		// Copilot SDK (utility process host) -- only when --sessions-utility-process is active
       1136 + 		if (this.environmentMainService.args['sessions-utility-process']) {
```

Make this a setting.

▸ 

[src/vs/code/electron-main/app.ts](https://github.com/microsoft/vscode/pull/295817/files/8baa674e456bf5fc32732b61e5c85cf90f9add91#diff-ce90ef6ffd304cc541efa8135dc4878c7b61889d2b2d5ef69e196af6cea7647b) Outdated

```
  1299      - 		// Embedded app launches directly into the sessions window
  1300      - 		if ((process as INodeProcess).isEmbeddedApp) {
       1312 + 		// Open sessions window if requested
       1313 + 		if ((process as INodeProcess).isEmbeddedApp || args['sessions-utility-process']) {
```

This is outdated, we have the `--sessions` CLI flag back in `main`.

due to merge conflicts

▸ 

[src/vs/code/electron-main/app.ts](https://github.com/microsoft/vscode/pull/295817/files/8baa674e456bf5fc32732b61e5c85cf90f9add91#diff-ce90ef6ffd304cc541efa8135dc4878c7b61889d2b2d5ef69e196af6cea7647b) Outdated

[xlet: thread content not loaded; load on GitHub]

[[ bpasero on 2026-02-20 (11 days ago) ]]


## Comment 46
[Merge branch 'main' into josh/sessions-with-sdk](https://github.com/microsoft/vscode/pull/295817/commits/6ff5b71b882f6a81594f038e60f233389fe236c3)

[[ bpasero on 2026-02-20 (11 days ago) ]]


## Comment 47
[bpasero](https://github.com/bpasero) dismissed [roblourens](https://github.com/roblourens)’s [stale review](#pullrequestreview-3821211211) via

[[ bpasero on 2026-02-20 (11 days ago) ]]


## Comment 48
[bpasero](https://github.com/bpasero) added 6 commits

[[ bpasero on 2026-02-20 (11 days ago) ]]


## Comment 49
[feedback](https://github.com/microsoft/vscode/pull/295817/commits/3bda41c22304d9131a315c8d5fa7e63ee6b6f04c)

[[ bpasero on 2026-02-20 (11 days ago) ]]


## Comment 50
[feedback](https://github.com/microsoft/vscode/pull/295817/commits/24134c3c8bc6dfcd0d0daecb545dbfc0ce178f11)

[[ bpasero on 2026-02-20 (11 days ago) ]]


## Comment 51
[refactor](https://github.com/microsoft/vscode/pull/295817/commits/478f81446689833465f901a3308c6d28c90a0f2e)

[[ bpasero on 2026-02-20 (11 days ago) ]]


## Comment 52
[fix css reference](https://github.com/microsoft/vscode/pull/295817/commits/a6a5e2d96f39507979326253712422fda92a5cbf)

[[ bpasero on 2026-02-20 (11 days ago) ]]


## Comment 53
[.](https://github.com/microsoft/vscode/pull/295817/commits/6dc2411f1ea6dff3a109358648db4876804d44ae)

[[ bpasero on 2026-02-20 (10 days ago) ]]


## Comment 54
[fix it](https://github.com/microsoft/vscode/pull/295817/commits/0fdb2ef1a7692963e5ed278822290d8b31a60f2e)

[[ bpasero on 2026-02-20 (10 days ago) ]]


## Comment 55
[bpasero](https://github.com/bpasero) requested a review from [Copilot](https://github.com/apps/copilot-pull-request-reviewer)

[[ bpasero on 2026-02-20 (10 days ago) ]]


## Comment 56
**Copilot** [started reviewing](https://github.com/microsoft/vscode/agents/pull/295817?session_id=3a1aebec-ebcf-4473-a749-e548c77b76a8 "View session") on behalf of [bpasero](https://github.com/bpasero)

[[ unknown on 2026-02-20 (10 days ago) ]]


## Comment 57
**[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** reviewed

[View reviewed changes](https://github.com/microsoft/vscode/pull/295817/files/0fdb2ef1a7692963e5ed278822290d8b31a60f2e)

[[ Copilot on 2026-02-20 (10 days ago) ]]


## Comment 58
## Pull request overview

Copilot reviewed 33 out of 36 changed files in this pull request and generated 1 comment.

[[ Copilot ]]


## Comment 59
▸ 

[src/vs/sessions/contrib/copilotSdk/browser/widget/sdkChatWidget.ts](https://github.com/microsoft/vscode/pull/295817/files/0fdb2ef1a7692963e5ed278822290d8b31a60f2e#diff-4f328eaaae7ff3c25005e1802ad5c5505426ce73cfe41db3bd1801a83fbf3568)

[xlet: thread content not loaded; load on GitHub]

[[ unknown ]]


## Comment 60
[leaks](https://github.com/microsoft/vscode/pull/295817/commits/08d444a8ef605e9d867d98a363894cae06449757)

[[ bpasero on 2026-02-20 (10 days ago) ]]


## Comment 61
[bpasero](https://github.com/bpasero) requested a review from [Copilot](https://github.com/apps/copilot-pull-request-reviewer)

[[ bpasero on 2026-02-20 (10 days ago) ]]


## Comment 62
**Copilot** [started reviewing](https://github.com/microsoft/vscode/agents/pull/295817?session_id=04c4d8e9-6229-4c67-a024-5126e7884a6e "View session") on behalf of [bpasero](https://github.com/bpasero)

[[ unknown on 2026-02-20 (10 days ago) ]]


## Comment 63
**[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** reviewed

[View reviewed changes](https://github.com/microsoft/vscode/pull/295817/files/08d444a8ef605e9d867d98a363894cae06449757)

[[ Copilot on 2026-02-20 (10 days ago) ]]


## Comment 64
## Pull request overview

Copilot reviewed 33 out of 36 changed files in this pull request and generated 5 comments.

[[ Copilot ]]


## Comment 65
▸ 

[src/vs/sessions/contrib/copilotSdk/browser/widget/sdkChatWidget.ts](https://github.com/microsoft/vscode/pull/295817/files/08d444a8ef605e9d867d98a363894cae06449757#diff-4f328eaaae7ff3c25005e1802ad5c5505426ce73cfe41db3bd1801a83fbf3568)

Comment on lines +625 to +626

```
  625 + 		this._textarea.style.height = 'auto';
  626 + 		this._textarea.style.height = `${Math.min(this._textarea.scrollHeight, 200)}px`;
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI**

The textarea auto-resize logic calculates height synchronously based on `scrollHeight`, which can cause layout thrashing if called frequently (e.g., on every keystroke). Consider debouncing this operation or using `requestAnimationFrame` to batch layout updates.

Suggested change

```
  638 - 		this._textarea.style.height = 'auto';
  639 - 		this._textarea.style.height = `${Math.min(this._textarea.scrollHeight, 200)}px`;
  638 + 		const textarea = this._textarea;
  639 + 		const textareaWithState = textarea as unknown as { _resizeRaf?: number } & HTMLTextAreaElement;
  640 +
  641 + 		if (textareaWithState._resizeRaf !== undefined) {
  642 + 			return;
  643 + 		}
  644 +
  645 + 		textareaWithState._resizeRaf = window.requestAnimationFrame(() => {
  646 + 			textareaWithState._resizeRaf = undefined;
  647 + 			textarea.style.height = 'auto';
  648 + 			textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  649 + 		});
```

▸ 

[src/vs/sessions/services/copilotSdk/node/copilotSdkHost.ts](https://github.com/microsoft/vscode/pull/295817/files/08d444a8ef605e9d867d98a363894cae06449757#diff-6c7ad505eb29f64a8351f7d8a54fccecb756ece60bc0ed8cebe625c2f420ded9)

```
  170 + 				this._onProcessOutput.fire({ stream: 'stderr', data: text.trimEnd() });
  171 + 			}
  172 + 			return this._originalStderrWrite!(chunk, ...args as [BufferEncoding?, ((err?: Error | null) => void)?]);
  173 + 		};
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-20 (10 days ago)](#discussion_r2833208107)

Monkey-patching `process.stderr.write` is risky and could interfere with other code or error reporting. If the SDK client fails to start after this patch is applied, error messages may be duplicated or lost. Consider registering this stderr interception as a disposable and ensure it's properly restored in all error paths (line 157 sets `_client = undefined` but doesn't restore stderr).

Suggested change

```
  177 - 		};
  177 + 		};
  178 + 		// Ensure stderr is restored when the client is disposed.
  179 + 		this._clientDisposables.add(toDisposable(() => {
  180 + 			if (this._originalStderrWrite) {
  181 + 				process.stderr.write = this._originalStderrWrite;
  182 + 			}
  183 + 		}));
```

▸ 

[src/vs/sessions/services/copilotSdk/node/copilotSdkHost.ts](https://github.com/microsoft/vscode/pull/295817/files/08d444a8ef605e9d867d98a363894cae06449757#diff-6c7ad505eb29f64a8351f7d8a54fccecb756ece60bc0ed8cebe625c2f420ded9) Outdated

Comment on lines 148 to 151

```
  148 + 			const timeoutPromise = new Promise<never>((_, reject) =>
  149 + 				setTimeout(() => reject(new Error('SDK client.start() timed out after 30 seconds')), 30000)
  150 + 			);
  151 + 			await Promise.race([startPromise, timeoutPromise]);
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-20 (10 days ago)](#discussion_r2833208119)

The timeout promise (line 148-150) creates a timer that's never cancelled if `startPromise` resolves first, causing the timer to leak. Use `Promise.race` with proper cleanup or wrap in a utility that cancels the losing promise's resources.

Suggested change

```
  · - 			const timeoutPromise = new Promise<never>((_, reject) =>
  · - 				setTimeout(() => reject(new Error('SDK client.start() timed out after 30 seconds')), 30000)
  · - 			);
  · - 			await Promise.race([startPromise, timeoutPromise]);
  · + 			let timeoutHandle: NodeJS.Timeout | undefined;
  · + 			const timeoutPromise = new Promise<never>((_, reject) => {
  · + 				timeoutHandle = setTimeout(() => reject(new Error('SDK client.start() timed out after 30 seconds')), 30000);
  · + 			});
  · + 			try {
  · + 				await Promise.race([startPromise, timeoutPromise]);
  · + 			} finally {
  · + 				if (timeoutHandle) {
  · + 					clearTimeout(timeoutHandle);
  · + 				}
  · + 			}
```

Fixed — same as above. `clearTimeout` in `finally` block.

▸ 

[src/vs/sessions/contrib/sessions/browser/sessionsViewPane.ts](https://github.com/microsoft/vscode/pull/295817/files/08d444a8ef605e9d867d98a363894cae06449757#diff-550a58e950e06e5c4ce84dd510c533f81d70f5708d501ea41f071356dceac83e)

Comment on lines 239 to 245

```
  239 + 		try { await this.copilotSdkService.deleteSession(sessionId); } catch { /* best-effort */ }
  240 + 		if (this._sdkSelectedSessionId === sessionId) {
  241 + 			this._sdkSelectedSessionId = undefined;
  242 + 			const chatPane = this.viewsService.getViewWithId<SdkChatViewPane>(SdkChatViewId);
  243 + 			chatPane?.widget?.newSession();
  244 + 		}
  245 + 		this._refreshSdkSessionList();
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-20 (10 days ago)](#discussion_r2833208135)

After deleting a session (line 239), the widget immediately calls `newSession()` if the deleted session was selected (lines 240-244), then calls `_refreshSdkSessionList()` (line 245). This creates a race condition: if `newSession()` is async and takes time, the session list refresh might render before the new session UI is ready, causing visual inconsistencies. Consider awaiting `newSession()` or ensuring proper sequencing.

▸ 

[src/vs/code/electron-main/app.ts](https://github.com/microsoft/vscode/pull/295817/files/08d444a8ef605e9d867d98a363894cae06449757#diff-ce90ef6ffd304cc541efa8135dc4878c7b61889d2b2d5ef69e196af6cea7647b)

Comment on lines +1299 to +1300

```
  1299 + 			const copilotSdkMainService = accessor.get(ICopilotSdkMainService);
  1300 + 			mainProcessElectronServer.registerChannel(CopilotSdkChannel, copilotSdkMainService.getServerChannel());
```

### **[Copilot](https://github.com/apps/copilot-pull-request-reviewer) AI** [2026-02-20 (10 days ago)](#discussion_r2833208144)

The service registration (lines 1136-1138) and channel registration (lines 1298-1301) both check the same configuration flag independently. If the configuration changes between service initialization and channel registration, or if `accessor.get(ICopilotSdkMainService)` is called when the service wasn't registered, this will throw. Consider consolidating the logic or adding a guard to handle the case where the service isn't available.

Suggested change

```
  1299 - 			const copilotSdkMainService = accessor.get(ICopilotSdkMainService);
  1300 - 			mainProcessElectronServer.registerChannel(CopilotSdkChannel, copilotSdkMainService.getServerChannel());
  1299 + 			let copilotSdkMainService: ICopilotSdkMainService | undefined;
  1300 + 			try {
  1301 + 				copilotSdkMainService = accessor.get(ICopilotSdkMainService);
  1302 + 			} catch {
  1303 + 				copilotSdkMainService = undefined;
  1304 + 			}
  1305 + 			if (copilotSdkMainService) {
  1306 + 				mainProcessElectronServer.registerChannel(CopilotSdkChannel, copilotSdkMainService.getServerChannel());
  1307 + 			}
```

[[ Copilot on 2026-02-20 (10 days ago) ]]


## Comment 66
[refactor](https://github.com/microsoft/vscode/pull/295817/commits/cf33c65b8ab1ad7fb7c5c1c571e66c48b0b60b22)

[[ bpasero on 2026-02-20 (10 days ago) ]]


## Comment 67
**[bpasero](https://github.com/bpasero)** requested changes

[View reviewed changes](https://github.com/microsoft/vscode/pull/295817/files/cf33c65b8ab1ad7fb7c5c1c571e66c48b0b60b22)

[[ bpasero on 2026-02-20 (10 days ago) ]]


## Comment 68
Many unresolved Copilot code feedback comments and 1 comment from me.

[[ bpasero ]]


## Comment 69
▸ 

[src/vs/sessions/services/copilotSdk/node/copilotSdkHost.ts](https://github.com/microsoft/vscode/pull/295817/files/08d444a8ef605e9d867d98a363894cae06449757#diff-6c7ad505eb29f64a8351f7d8a54fccecb756ece60bc0ed8cebe625c2f420ded9)

```
  392 + 	server.registerChannel(CopilotSdkChannel, channel);
  393 + 	process.stderr.write(`[CopilotSdkHost] Channel '${CopilotSdkChannel}' registered on server\n`);
  394 +
  395 + 	process.once('exit', () => {
```

Are we certain this works? At this moment the process is stopping and you are calling a long running operation?

[[ bpasero on 2026-02-20 (10 days ago) ]]


## Comment 70
[bpasero](https://github.com/bpasero) and others added 5 commits

[[ bpasero on 2026-02-20 (10 days ago) ]]


## Comment 71
[teardown on exit or crash](https://github.com/microsoft/vscode/pull/295817/commits/4d6986e0cda85df1d419102ea14432e31541d328)

[[ bpasero on 2026-02-20 (10 days ago) ]]


## Comment 72
[fix: SDK host race condition, timer leak, exception cleanup, widget d…](https://github.com/microsoft/vscode/pull/295817/commits/48b0b3be000c7fce9bf22a1374e41ab35829bab0 "fix: SDK host race condition, timer leak, exception cleanup, widget disposal guard")

:::details
…isposal guard
:::

[[ joshspicer ]]


## Comment 73
[merge conflicts](https://github.com/microsoft/vscode/pull/295817/commits/ff1347002a684a6a955d1448247e4813ac1a773c)

[[ joshspicer ]]


## Comment 74
[code review bot](https://github.com/microsoft/vscode/pull/295817/commits/b57f9e64740d3ad2a5cb10682dfd59b8ab7e29d5)

[[ joshspicer ]]


## Comment 75
[dmg changes](https://github.com/microsoft/vscode/pull/295817/commits/6fef58cfbebb6e85233d8089a80c8d7d61021032)

[[ joshspicer ]]


## Comment 76
**[deepak1556](https://github.com/deepak1556)** reviewed

[View reviewed changes](https://github.com/microsoft/vscode/pull/295817/files/6fef58cfbebb6e85233d8089a80c8d7d61021032)

[[ deepak1556 on 2026-02-20 (10 days ago) ]]


## Comment 77
Sorry for the late review, the comments can be addressed as followup

[[ deepak1556 ]]


## Comment 78
▸ 

[build/azure-pipelines/darwin/copilot-cli-entitlements.plist](https://github.com/microsoft/vscode/pull/295817/files/6fef58cfbebb6e85233d8089a80c8d7d61021032#diff-301d6d3128613649b23f09c96e9dd458a7696e4fd6b03620059773bbce8f37a7) Outdated

```
   8 +     <true/>
   9 +     <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  10 +     <true/>
  11 +     <key>com.apple.security.automation.apple-events</key>
```

Is the apple events needed ?

```
% codesign -d --entitlements :- ~/Downloads/copilot
Executable=/Users/demohan/Downloads/copilot
warning: Specifying ':' in the path is deprecated and will not work in a future release
<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "https://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>com.apple.security.cs.allow-jit</key><true/><key>com.apple.security.cs.allow-unsigned-executable-memory</key><true/><key>com.apple.security.cs.disable-library-validation</key><true/></dict></plist>
```

For the other 3 the utility process is already signed with the same set [https://github.com/microsoft/vscode/blob/main/build/azure-pipelines/darwin/helper-plugin-entitlements.plist](https://github.com/microsoft/vscode/blob/main/build/azure-pipelines/darwin/helper-plugin-entitlements.plist) , so copliot cli launched from the process should inherit it by default.

Tl:dr, if the apple events is not needed can we remove this entitlement file in favor inheritance.

▸ 

[build/darwin/create-universal-app.ts](https://github.com/microsoft/vscode/pull/295817/files/6fef58cfbebb6e85233d8089a80c8d7d61021032#diff-6e3bf673b5cd62ad9dd6f1c5d4ec6311c411461dcc4ac1172b97b0c22147946a)

```
  48 + 		} else if (fs.existsSync(inArm64U) && !fs.existsSync(inX64U)) {
  49 + 			fs.mkdirSync(path.dirname(inX64U), { recursive: true });
  50 + 			fs.cpSync(inArm64U, inX64U, { recursive: true });
  51 + 		}
```

Hmm can you remove the platform specific suffix and keep it as `@github/copilot` then we would just merge the binaries without having to do the above workaround.

▸ 

[src/vs/platform/copilotSdk/electron-main/copilotSdkStarter.ts](https://github.com/microsoft/vscode/pull/295817/files/6fef58cfbebb6e85233d8089a80c8d7d61021032#diff-1f764fe17e0660ea5cc31489196a492fab903e658712020ac59f1c6edcb64a0c) Outdated

```
  75 + 				type: 'copilotSdkHost',
  76 + 				name: 'copilot-sdk-host',
  77 + 				entryPoint: 'vs/sessions/services/copilotSdk/node/copilotSdkHost',
  78 + 				args: ['--logsPath', this._environmentMainService.logsHome.with({ scheme: Schemas.file }).fsPath, '--disable-gpu'],
```

why `--disable-gpu` ?

▸ 

[src/vs/sessions/services/copilotSdk/node/copilotSdkHost.ts](https://github.com/microsoft/vscode/pull/295817/files/6fef58cfbebb6e85233d8089a80c8d7d61021032#diff-6c7ad505eb29f64a8351f7d8a54fccecb756ece60bc0ed8cebe625c2f420ded9) Outdated

Comment on lines 123 to 124

```
  123 + 		delete cliEnv['__CFBundleIdentifier'];
  124 + 		delete cliEnv['APP_SANDBOX_CONTAINER_ID'];
```

`APP_SANDBOX_CONTAINER_ID` is for apps from mac app store relying on the mac container sandbox, which our app doesn't, can be removed

[[ deepak1556 on 2026-02-20 (10 days ago) ]]


## Comment 79
[build code review](https://github.com/microsoft/vscode/pull/295817/commits/bd2efddc8f35f55e2d9899cd50a55e63be71e8fc)

[[ joshspicer ]]


## Comment 80
[austindyoung](https://github.com/austindyoung) mentioned this pull request

[[mirror] microsoft/vscode#295817 sessions with sdk austindyoung/vscode-driftfence-mirror-fork#152](https://github.com/austindyoung/vscode-driftfence-mirror-fork/pull/152)

Open

[[ austindyoung on 2026-02-26 (5 days ago) ]]


## Comment 81
[rzhao271](https://github.com/rzhao271) modified the milestones: [February 2026](https://github.com/microsoft/vscode/milestone/357), [March 2026](https://github.com/microsoft/vscode/milestone/376)

[[ rzhao271 on 2026-02-27 (3 days ago) ]]

<!-- XLET-END -->

