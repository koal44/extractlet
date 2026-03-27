
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- Stop emitFile() from running in dev mode in the astro:scripts plugin by matthewp · Pull Request #16067 · withastro/astro · GitHub -->
<!-- https://github.com/withastro/astro/pull/16067/files -->

[withastro](https://github.com/withastro) / **[astro](https://github.com/withastro/astro)** Public

# Stop emitFile() from running in dev mode in the astro:scripts plugin #16067 · Closed

matthewp wants to merge 1 commit into `main` from `fix/16026-emit-file-serve-mode`  
+11 −0 lines changed

## Files changed (2)

- .changeset
  - fix-emit-file-serve-mode-warning.md
- packages/astro/src/vite-plugin-scripts
  - index.ts

### .changeset/fix-emit-file-serve-mode-warning.md

+5 -0

```
     @@ -0,0 +1,5 @@
 1 + ---
 2 + 'astro': patch
 3 + ---
 4 +
 5 + Fixes a spurious Vite warning about `emitFile()` not being supported in serve mode during `astro dev`
```

### packages/astro/src/vite-plugin-scripts/index.ts

+6 -0

```
        @@ -14,9 +14,14 @@ export const PAGE_SCRIPT_ID = `${SCRIPT_ID_PREFIX}${'page' as InjectedScriptStag
14 14   export const PAGE_SSR_SCRIPT_ID = `${SCRIPT_ID_PREFIX}${'page-ssr' as InjectedScriptStage}.js`;
15 15  
16 16   export default function astroScriptsPlugin({ settings }: { settings: AstroSettings }): VitePlugin {
   17 + 	let isBuild = false;
17 18   	return {
18 19   		name: 'astro:scripts',
19 20  
   21 + 		config(_config, env) {
   22 + 			isBuild = env.command === 'build';
   23 + 		},
   24 +
20 25   		resolveId: {
21 26   			filter: {
22 27   				id: new RegExp(`^${SCRIPT_ID_PREFIX}`),
        @@ -58,6 +63,7 @@ export default function astroScriptsPlugin({ settings }: { settings: AstroSettin
58 63   			},
59 64   		},
60 65   		buildStart() {
   66 + 			if (!isBuild) return;
61 67   			const hasHydrationScripts = settings.scripts.some((s) => s.stage === 'before-hydration');
62 68   			if (
63 69   				hasHydrationScripts &&
```

#### Comments near R66

##### **ematipico** (Member) • 2026-03-24 (2 days ago) • edited

I encountered this, but to me this is more of a bug in vite. The docs say that this hook should trigger with the build. Are we doing something different to trigger this hook?

##### **matthewp** (Contributor, Author) • 2026-03-24 (2 days ago)

It triggers during dev too, see [https://github.com/vitejs/vite/blob/130ef31b4863d25008db2206a4aa855b4935ebcd/packages/vite/src/node/plugin.ts#L186-L189](https://github.com/vitejs/vite/blob/130ef31b4863d25008db2206a4aa855b4935ebcd/packages/vite/src/node/plugin.ts#L186-L189)

##### **ematipico** (Member) • 2026-03-24 (2 days ago)

Yeah but the docs say otherwise: [https://rolldown.rs/reference/Interface.FunctionPluginHooks#buildstart](https://rolldown.rs/reference/Interface.FunctionPluginHooks#buildstart)

> Called on each [rolldown()](https://rolldown.rs/reference/Function.rolldown) build.

##### **matthewp** (Contributor, Author) • 2026-03-25 (yesterday)

Docs lie, here's where it happens in dev: [https://github.com/vitejs/vite/blob/v7.3.1/packages/vite/src/node/server/index.ts#L986-L989](https://github.com/vitejs/vite/blob/v7.3.1/packages/vite/src/node/server/index.ts#L986-L989)

<!-- XLET-END -->

