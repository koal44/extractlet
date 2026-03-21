
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- Code search results -->
<!-- https://github.com/search?q=browser.storage.local&type=code -->

## Search

26k files · Page 1 of 5

- Query: `browser.storage.local`
- Type: `code`

## Filter by

- Code (26k)
- Repositories (3k)
- Issues (691)
- Pull requests (378)
- Discussions (16)
- Users (0)
- Commits (63k)
- Packages (0)
- Wikis (21)
- Topics (0)
- Marketplace (0)

## Languages

- JavaScript
- Markdown
- TypeScript
- Text
- Org

## Repositories

- aaronraimist/DontFuckWithPaste
- foxyproxy/browser-extension
- kubuzetto/behind
- l10nelw/winger
- law-chain-hot/websocket-devtools

## Paths

- Corpus/
- doc/auth/
- docs/
- firefox/
- lib/

## Results

### [dfwp.js](https://github.com/aaronraimist/DontFuckWithPaste/blob/8cb68e1a99d098d1dfe99d35ef4657d668e56738/dfwp.js#L13)  
`aaronraimist/DontFuckWithPaste` · JavaScript · 1 hit  
```
10   if (DFWP.browser.storage.sync) {
11     DFWP.storage = DFWP.browser.storage.sync;
12   } else {
13     DFWP.storage = DFWP.browser.storage.local;
14   }
15
16   DFWP.Rule = class Rule {
```  
1 other identical match

### [PRIVACY.md](https://github.com/law-chain-hot/websocket-devtools/blob/dda4c99ef3deba68a52f863e1604acb668bba4f5/PRIVACY.md?plain=1#L26)  
`law-chain-hot/websocket-devtools` · Markdown · 3 hits  
```
26 - **chrome.storage.local** (Chrome) / **browser.storage.local** (Edge): For extension settings and preferences
40 …ored locally in your browser using browser storage APIs (chrome.storage.local in Chrome, browser.storage.local in Edge)
46 - **Storage**: Stored locally using browser storage APIs (chrome.storage.local in Chrome, browser.storage.local in Edge)
```

### [FAQ.md](https://github.com/foxyproxy/browser-extension/blob/2eb9756159b6e4b9247a5b25f1cc8756dd91a304/FAQ.md?plain=1#L60)  
`foxyproxy/browser-extension` · Markdown · 2 hits  
````
59 ```js
60   browser.storage.local.get().then(console.log)
61 ```
65 ```js
66 browser.storage.local.get().then(pref => {
67   const data = JSON.stringify(pref, null, 2);
````

### [bg.js](https://github.com/kubuzetto/behind/blob/d42db0141f8e5dc26579b553029c4e098d559e34/bg.js#L15)  
`kubuzetto/behind` · JavaScript · 2 hits  
```
14 let checkStorage = function() {
15 	browser.storage.local.get('bypass').then(function(r) {
16 		bypassMode = r.bypass || 'off';
53 		};
54 		browser.storage.local.get('bgCbox').then(fn, () => fn({bgCbox: "t"}));
55 	}
```

### [theme.js](https://github.com/l10nelw/winger/blob/cdfd1cbf880b52610a476eb745b04f27db3f2901/theme.js#L3)  
`l10nelw/winger` · JavaScript · 1 hit  
```
3 browser.storage.local.get('theme').then(({ theme }) => document.body.classList.toggle('dark', isDark(theme)));
```

### [README.md](https://github.com/Taknok/youtube-auto-like/blob/6f48c6671d3de2e0335e22b6be5025e739f03201/README.md?plain=1#L27)  
`Taknok/youtube-auto-like` · Markdown · 1 hit  
```
27 …c` can cause issues when loaded temporarily, change it by `browser.storage.local` in **scripts/option-manager.js**.<br>
```

### [prefs.js](https://github.com/apiraino/link_cleaner/blob/4c237a3830e663f9fed1e61db5c18d1b0e2e93dc/prefs.js#L51)  
`apiraino/link_cleaner` · JavaScript · 3 hits  
```
50         console.debug("[checkStoredSettings] Could NOT read settings, will set defaults");
51         browser.storage.local.set(defaultSettings).then(function(res){
52             console.debug("[checkStoredSettings] defaults set");
63 function check_storage() {
64     browser.storage.local.get().then(function(res){
65         console.debug("[check_storage] got storage");
```  
2 other identical matches

### [ui.ts](https://github.com/icholy/ContainerScript/blob/4c1d00342c631c876fc992ccb17d39db2edce006/ui.ts#L25)  
`icholy/ContainerScript` · TypeScript · 2 hits  
```
24
25   const { script } = await browser.storage.local.get("script");
26
37     timeout = setTimeout(() => {
38       browser.storage.local.set({ script: editor.getValue() });
39     }, 300);
```

### [popup.js](https://github.com/airtower-luna/referer-mod/blob/f475b456195b7e5c52b15370a8021a8eaec06eb4/popup.js#L45)  
`airtower-luna/referer-mod` · JavaScript · 2 hits  
```
44 	setupPowerButton(mod_enabled);
45 	await browser.storage.local.set({mod_enabled: mod_enabled});
46 }
61
62 browser.storage.local.get(["mod_enabled"]).then(
63 	async (result) =>
```  
4 other identical matches

### [cache.js](https://github.com/stumbleupon/stumblebar/blob/755c9d0e8a4c85574fcb8ebabd0c249d67432b1e/cache.js#L50)  
`stumbleupon/stumblebar` · JavaScript · 2 hits  
```
49 		return new Promise(function (resolve, reject) {
50 			return browser.storage.local.get(key, function(result) {
51 				if (!key)
78 		return new Promise(function (resolve, reject) {
79 			return browser.storage.local.set(map, resolve);
80 		});
```

### [auth.js](https://github.com/steffanschlein/AutoAuth/blob/7f15c11cd96e89afdb42d0c3d4a2b9712ee6ff9f/auth.js#L57)  
`steffanschlein/AutoAuth` · JavaScript · 4 hits  
```
56
57         let gettingItem = browser.storage.local.get(hosts);
58         return gettingItem.then(credentials => {
84 function migration(details) {
85     browser.storage.local.get(null).then(credentials => {
86         Object.keys(credentials).forEach(function(host) {
```  
1 other identical match

### [main.ts](https://github.com/btzdnl/download-cleaner-lite/blob/eefbff94594316e11f5adadfaa0d08c4fcdb1747/main.ts#L96)  
`btzdnl/download-cleaner-lite` · TypeScript · 5 hits  
```
 95     const serializedList = JSON.stringify(downloadsByUrlValues);
 96     browser.storage.local.set({ [downloadsToRemoveKey]: serializedList });
 97   }
106     const result = await loadSettings();
107     await browser.storage.local.set({ [isUpdatingKey]: false });
108
```

### [info.js](https://github.com/eyedeekay/I2P-in-Private-Browsing-Mode-Firefox/blob/02502e3263fbd6c4d40a4a80ea0511b51ec4f3d1/info.js#L68)  
`eyedeekay/I2P-in-Private-Browsing-Mode-Firefox` · JavaScript · 2 hits  
```
67     try {
68       const { disable_history = false } = await browser.storage.local.get(
69         "disable_history"
85     try {
86       const { disable_referer = false } = await browser.storage.local.get(
87         "disable_referer"
```

### [mic.js](https://github.com/Picovoice/browser-extension/blob/51a298def5a8f8b2e2c6adef232ef41d7dd31824/mic.js#L68)  
`Picovoice/browser-extension` · JavaScript · 9 hits  
```
67 async function getOptionsFromStorage() {
68   const data1 = await browser.storage.local.get("wakeWord");
69   let wakeWord;
71   if (data1.wakeWord === undefined || KEYWORD_MAP[data1.wakeWord] === undefined) {
72     await browser.storage.local.set({ wakeWord: DEFAULT_WAKE_WORD });
73     wakeWord = DEFAULT_WAKE_WORD;
```

### [TODO.md](https://github.com/wgmyers/anti-social/blob/75e9e8af1578ea31165050354265c9b442344948/TODO.md?plain=1#L22)  
`wgmyers/anti-social` · Markdown · 2 hits  
````
22     ```browser.storage.local.get(null, function(items) { console.log(items); });```
25     ```var blockOnFlag = { key: true }; browser.storage.local.set({blockOnFlag});```
````  
1 other identical match

### [changes](https://github.com/dauphine-dev/drop-feeds/blob/032d064615cdce22869c47aa621114737c8939e2/changes#L85)  
`dauphine-dev/drop-feeds` · 2 hits  
```
84 1.0.3a
85 Make Drop Feeds do not crash when the API browser.storage.local.set is broken.
86 Add an option to do not notify when no feed has been updated.
90 1.0.3
91 Make Drop Feeds do not crash when the API browser.storage.local.set is broken.
92 Add an option to do not notify when no feed has been updated.
```

### [DEVELOPERS.md](https://github.com/slovensko-digital/autogram-extension/blob/42c0a8f0b0ea1633ae771f9c73e5ad582659e9f7/DEVELOPERS.md?plain=1#L67)  
`slovensko-digital/autogram-extension` · Markdown · 1 hit  
```
67 Options are saved into `browser.storage.local`
```

### [stor.js](https://github.com/garywill/multi-subs-yt/blob/fa5208539331b28da058ebd18ab6e31c666fd592/stor.js#L4)  
`garywill/multi-subs-yt` · JavaScript · 3 hits  
```
1 async function getStor(key) {
2     
3     if ( ! key)
4         return (await browser.storage.local.get());
5     else
6         return (await browser.storage.local.get())[key];
7     
```  
1 other identical match

### [docs/RUNBOOK.md](https://github.com/nitzanpap/auto-tab-groups/blob/495f412687630ad40f93367193b385c3e67ab4f2/docs/RUNBOOK.md?plain=1#L94)  
`nitzanpap/auto-tab-groups` · Markdown · 2 hits  
```
 93 **Fix:**
 94 1. Check `browser.storage.local` calls are awaited
 95 2. Verify `saveAllStorage()` is called after state changes
110 **Architecture:** This is by design - the extension uses SSOT (Single Source of Truth) pattern:
111 - All state is persisted to `browser.storage.local`
112 - On service worker restart, state is reloaded via `ensureStateLoaded()`
```

### [logger.ts](https://github.com/linuxscreen/duo-translator/blob/e36b4439a3d2f6eae860024d397eb6db57dbe977/logger.ts#L25)  
`linuxscreen/duo-translator` · TypeScript · 2 hits  
```
24         // save logs to chrome storage
25         // browser.storage.local.get({ logs: [] }).then( (result) => {
26         //     const logs = result.logs;
27         //     logs.push(logMessage);
28         //     browser.storage.local.set({ logs });
29         // });
```

<!-- XLET-END -->

