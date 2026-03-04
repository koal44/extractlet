<!-- Extractlet · GitHub -->
<!-- [rollup-plugin-typescript] Re-enable declarationDir outside output file/dir -->
<!-- https://github.com/rollup/plugins/issues/1772 -->


## Post
- Rollup Plugin Name: rollup-plugin-typescript
- Rollup Plugin Version: 12.1.0
- Rollup Version: 4.22.4
- Operating System (or Browser): Ubuntu 22.04
- Node Version: 22.9.0
- Link to reproduction: [Bump @rollup/plugin-typescript from 11.1.6 to 12.1.0 marekdedic/rollup-plugin-htaccess#121](https://github.com/marekdedic/rollup-plugin-htaccess/pull/121)

### Expected Behavior

Enable `declarationDir` to be outside the rollup output directory, much like it was possible in v11

### Actual Behavior

Since v12, I get:

```
[!] (plugin typescript) RollupError: [plugin typescript] @rollup/plugin-typescript: Path of Typescript compiler option 'declarationDir' must be located inside the same directory as the Rollup 'file' option.
```

### Additional Information

The change I'd like to be reconsidered was introduced in [#1728](https://github.com/rollup/plugins/pull/1728). However, emitting declarations to a different place from the build output can be really useful for things like post-processing with [api-extractor](https://api-extractor.com/) - having the intermediary declarations produced by rollup be outside the final output dir makes it much easier to not accidentally include these files in the final build.

[[ marekdedic on 2024-09-23 (last year) ]]


## Comment 1
mentioned this

- [Bump @rollup/plugin-typescript from 11.1.6 to 12.1.0 marekdedic/rollup-plugin-htaccess#121](https://github.com/marekdedic/rollup-plugin-htaccess/pull/121)

[[ marekdedic on 2024-09-23 (last year) ]]


## Comment 2
Thanks for the issue. I'd like to point out that the reproduction you provided is not valid, and that's not entirely cool since we lay out exactly what is.

On the subject matter itself, [#1728](https://github.com/rollup/plugins/pull/1728) was a breaking change in how that worked and released as a major because of that. Moving forward, that's the intended behavior. What you're describing is the job of a post-processing task, which you elude to since you're using something like `api-extractor`. It would make sense that instead of error-prone output, post-processing moves build files to where they need to be in order to process them. This is extremely common in devops and deployments (much of what I do day to day).

I see a few possible paths forward for this use case:

- intelligently handle/move build files where they need to be for additional processing
- exclude appropriate files from final builds/packaging/deployment
- write a rollup plugin to handle all or some of the above, which will run after plugin-typescript
- open a PR which provides the capability you're requesting, without reintroducing problems previously associated with the capability prior to [fix(typescript)!: correctly resolve filenames of declaration files for `output.file` #1728](https://github.com/rollup/plugins/pull/1728)

This repo is almost entirely dependent on community contributions, so please understand that this may be something you have to affect to see it realized.

[[ shellscape on 2024-09-23 (last year) ]]


## Comment 3
added a commit that references this issue

[Work around](https://github.com/cmahnke/hdr-canvas/commit/8e8e6f7abb113e57a15db7e93f8d46df2d0ce959)[rollup/plugins#1772](https://github.com/rollup/plugins/issues/1772)

[8e8e6f7](https://github.com/cmahnke/hdr-canvas/commit/8e8e6f7abb113e57a15db7e93f8d46df2d0ce959)

[[ cmahnke on 2024-09-24 (last year) ]]


## Comment 4
mentioned this

- [[rollup-plugin-typescript] `declarationDir` inside same directory as `file` option #1773](https://github.com/rollup/plugins/issues/1773)

[[ mririgoyen on 2024-09-24 (last year) ]]


## Comment 5
I'd like to suggest that [#1728](https://github.com/rollup/plugins/pull/1728) has introduced behavior that may not be intended. In order to determine whether this is actually the case, the relationship between the "file" option in the OutputOptions type in the rollup.config.* file and the "outDir" and/or "declarationDir" property in compilerOptions of the tsconfig.json file needs to be clarified. I have not been able to find relevant documentation for the plugin.

The fact that the rollup configuration supports multiple output files suggests to me that there is a conceptual issue with the relationship between these properties because the declarationDir property cannot simultaneously be inside many different directories implied by multiple OutputOptions.

[[ stemcstudio on 2024-10-08 (last year) ]]


## Comment 6
your argument may be valid, but in a specific context - yours, and a few others. the full request is it was written was to solve a problem that plagued the plug-in for a very long time and affected a lot of users. to that end, it's an effective solution. it's also a breaking change, which means you don't necessarily have to adopt the new contract.

that said, I'm sure we would all be open to a new pull request which satisfied the problem as it was resolved by [#1728](https://github.com/rollup/plugins/pull/1728), and allowing for the use case which you view as correct.

if you'd like to discuss this until the cows come home, you're more than welcome to. but there's not going to be a one-size-fits-all solution unless the community steps up to make that happen.

[[ shellscape on 2024-10-08 (last year) ]]


## Comment 7
@shellscape is there an issue that explains what the original bug was that this change aimed to solve? There isn't one linked in the PR and it's not clear to me from the PR description what the bug was. You're saying it was such a widespread problem that affected so many people, but I've used the plugin for a long time and haven't experienced any issue this solves. So, it'd help to understand the larger context, in order to ensure any follow-up change is consistent with that goal.

[[ michaelfaith on 2024-10-09 (last year) ]]


## Comment 8
@marekdedic
I’m experiencing a similar issue, but only with version `v12.1.1`, not in `v12.1.0`. In my case, I want to place the declaration files in the `dist/dts` folder, while keeping the UMD and module JS files in the `dist` folder.

- Project Github Link: [@carry0987/check-box](https://github.com/carry0987/CheckBox-JS)

Here are my settings:

`tsconfig.json`

```json
{
    "compilerOptions": {
        "module": "ESNext",
        "target": "ESNext",
        "moduleResolution": "Node",
        "esModuleInterop": true,
        "importHelpers": true,
        "strict": true,
        "jsx": "react-jsx",
        "jsxImportSource": "preact",
        "declaration": true,
        "declarationDir": "dist/dts/",
        "paths": {
            "@/*": ["./src/*"]
        }
    },
    "include": [
        "src/**/*",
        "test/**/*",
        "rollup.config.ts"
    ],
    "exclude": ["node_modules", "dist", "**/__snapshots__/**/*"]
}
```

`rollup.config.ts`

```ts
import { RollupOptions } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';
import nodeResolve from '@rollup/plugin-node-resolve';
import { dts } from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';
import del from 'rollup-plugin-delete';
import { createRequire } from 'module';
import path from 'path';

const pkg = createRequire(import.meta.url)('./package.json');
const isProduction = process.env.BUILD === 'production';
const sourceFile = 'src/index.ts';

const jsConfig: RollupOptions = {
    input: sourceFile,
    output: [
        {
            file: pkg.exports['.']['umd'],
            format: 'umd',
            name: 'checkBoxjs',
            plugins: isProduction ? [terser()] : []
        }
    ],
    plugins: [
        postcss({
            extract: path.resolve(pkg.exports['./theme/checkBox.min.css']),
            minimize: true,
            sourceMap: false
        }),
        typescript(),
        tsConfigPaths(),
        nodeResolve(),
        replace({
            preventAssignment: true,
            __version__: pkg.version
        })
    ]
};

const esConfig: RollupOptions = {
    input: sourceFile,
    output: [
        {
            file: pkg.exports['.']['import'],
            format: 'es'
        }
    ],
    plugins: [
        postcss({
            inject: false,
            extract: false,
            sourceMap: false
        }),
        typescript(),
        tsConfigPaths(),
        nodeResolve(),
        replace({
            preventAssignment: true,
            __version__: pkg.version
        })
    ]
};

const dtsConfig: RollupOptions = {
    input: sourceFile,
    output: {
        file: pkg.exports['.']['types'],
        format: 'es'
    },
    external: [/\.scss$/u],
    plugins: [
        tsConfigPaths(),
        dts(),
        del({ hook: 'buildEnd', targets: ['dist/dts'] })
    ]
};

export default [jsConfig, esConfig, dtsConfig];
```

`package.json`

```json
{
  //...
  "type": "module",
  "main": "dist/checkBox.min.js",
  "module": "dist/checkBox.esm.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "umd": "./dist/checkBox.min.js",
      "import": "./dist/checkBox.esm.js",
      "types": "./dist/index.d.ts"
    },
    "./theme/checkBox.min.css": "./dist/theme/checkBox.min.css"
  },
  //...
  "devDependencies": {
    "@carry0987/utils": "^3.7.8",
    "@rollup/plugin-node-resolve": "^15.3.0",
    "@rollup/plugin-replace": "^6.0.1",
    "@rollup/plugin-terser": "^0.4.4",
    "@rollup/plugin-typescript": "^12.1.1",
    "@testing-library/preact": "^3.2.4",
    "happy-dom": "^15.7.4",
    "preact": "^10.24.3",
    "prettier": "^3.3.3",
    "rollup": "^4.24.0",
    "rollup-plugin-delete": "^2.1.0",
    "rollup-plugin-dts": "^6.1.1",
    "rollup-plugin-postcss": "^4.0.2",
    "rollup-plugin-tsconfig-paths": "^1.5.2",
    "sass": "^1.80.1",
    "tslib": "^2.8.0",
    "vitest": "^2.1.3"
  }
}
```

Do you have any suggestions on how to resolve this issue or specific settings that work between these versions? Let me know if more details are needed for troubleshooting. Thank you!

[[ carry0987 on 2024-10-17 (last year) ]]


## Comment 9
mentioned this

- [[rollup-plugin-typescript] Using a nested path for the declarationDir option always throws an error #1790](https://github.com/rollup/plugins/issues/1790)

[[ carry0987 on 2024-10-17 (last year) ]]


## Comment 10
@carry0987 In the end, I chose the solution of building types in `dist/types` with rollup, then bundling them with api-extractor and then deleting the `dist/types` folder. See [here](https://github.com/marekdedic/rollup-plugin-htaccess/blob/7cfe1f19ba7fb65ddfb21b463951f1cdcf107464/package.json#L44) for inspiration.

[[ marekdedic on 2024-10-17 (last year) ]]


## Comment 11
@michaelfaith I've add the example in my reply, let me know if more details are needed for troubleshooting.

[[ carry0987 on 2024-10-17 (last year) ]]


## Comment 12
> @carry0987 In the end, I chose the solution of building types in `dist/types` with rollup, then bundling them with api-extractor and then deleting the `dist/types` folder. See [here](https://github.com/marekdedic/rollup-plugin-htaccess/blob/7cfe1f19ba7fb65ddfb21b463951f1cdcf107464/package.json#L44) for inspiration.

Thanks ! But I still want to use pure plugin `@ollup/plugin-typescript`, since `api-extractor` is too heavy and complex for my projects.

[[ carry0987 on 2024-10-17 (last year) ]]


## Comment 13
@carry0987 Hmm, re-reading your first comment, it seems like you want to just do the thing I am doing before running api-extractor?

[[ marekdedic on 2024-10-18 (last year) ]]


## Comment 14
> @carry0987 Hmm, re-reading your first comment, it seems like you want to just do the thing I am doing before running api-extractor?

Exactly, I just want to create `index.d.ts` instead of creating multiple declaration files separately for whole project.
Everything work perfectly before v12.1.1, I'm using v12.1.0 currently.

[[ carry0987 on 2024-10-18 (last year) ]]


## Comment 15
@marekdedic @michaelfaith @shellscape

Regarding my requirement, which is not to generate default declaration files but rather to produce a single `.d.ts` file in the `dist` directory alongside the `mjs` and `cjs` files, I am considering removing the `declaration` and `declarationDir` configurations from my `tsconfig.json`. Then, I will use `rollup-plugin-dts` with `index.ts` as the source to independently generate `index.d.ts` in the `dist` directory. An additional benefit of this approach is that it eliminates the need to use `rollup-plugin-delete` to remove the `dist/dts` folder.

@marekdedic I think you can just remove `declaration` and `declarationDir` configurations like me, and using `rollup-plugin-dts` to generate individual declaration file in wherever you want.

[[ carry0987 on 2024-10-19 (last year) ]]


## Comment 16
[xlet: 5 remaining items; load on GitHub]

[[ unknown ]]


## Comment 17
mentioned this

- [build(deps-dev): bump @rollup/plugin-typescript from 12.1.0 to 12.1.1 in /flipt-client-react flipt-io/flipt-client-sdks#463](https://github.com/flipt-io/flipt-client-sdks/pull/463)

[[ erka on 2024-10-22 (last year) ]]


## Comment 18
I face the same problem like many here. My usecase is also to bundle the types of my library using `rollup-plugin-dts` but I need an entry-point `d.ts`. The only solution seems now to set `declarationDir=outDir`. But this pollutes your output folderdirectly with `d.ts` files for all `.ts`.

I'd like to have `outDir=dist`, `declarationDir=dist/types` and `output.file=dist/mylib.mjs` so I can have another rollup bundle with `input.file=dist/types/mylib.d.ts` + `rollup-plugin-dts`.

As far I understood the discussion and change in [#1728](https://github.com/rollup/plugins/pull/1728) is to prevent having types fully outside the output directory (e.g. `/dist` and `/types`). But allowing `declarationDir=dist/types` with a `output.file=dist/mylib.mjs` is not against the goals of rollup.

[plugins/packages/typescript/src/options/validate.ts](https://github.com/rollup/plugins/blob/92daef00b0da30de172868d4e0792c8686da0045/packages/typescript/src/options/validate.ts#L60-L75)

Lines 60 to 75 in [92daef0](https://github.com/rollup/plugins/commit/92daef00b0da30de172868d4e0792c8686da0045)

```js
  60  // Checks if the given path lies within Rollup output dir 
  61  if (outputOptions.dir) { 
  62    const fromRollupDirToTs = relative(outputDir, compilerOptions[dirProperty]!); 
  63    if (fromRollupDirToTs.startsWith('..')) { 
  64      context.error( 
  65        `@rollup/plugin-typescript: Path of Typescript compiler option '${dirProperty}' must be located inside Rollup 'dir' option.` 
  66      ); 
  67    } 
  68  } else { 
  69    const fromTsDirToRollup = relative(compilerOptions[dirProperty]!, outputDir); 
  70    if (fromTsDirToRollup.startsWith('..')) { 
  71      context.error( 
  72        `@rollup/plugin-typescript: Path of Typescript compiler option '${dirProperty}' must be located inside the same directory as the Rollup 'file' option.` 
  73      ); 
  74    } 
  75  } 
```

If my understanding is correct, the code above could be fixed like this:

```ts
// Checks if the given path lies within Rollup output dir const fromRollupDirToTs = relative(outputDir, compilerOptions[dirProperty]!); 
if (fromRollupDirToTs.startsWith('..')) { 
  context.error(
    outputOptions.dir 
     ? `@rollup/plugin-typescript: Path of Typescript compiler option '${dirProperty}' must be located inside Rollup 'dir' option.` 
     : `@rollup/plugin-typescript: Path of Typescript compiler option '${dirProperty}' must be located inside the same directory as the Rollup 'file' option.` 
  ); 
}
```

[[ Danielku15 on 2024-11-24 (last year) ]]


## Comment 19
Hello guys, I found a temporary way to bypass this error if your `declarationDir` is indeed nested in the output dir (working on `12.1.1`):

```js
// rollup.config.mjs
export default defineConfig([
  {
    // use array here
    input: ['src/index.ts'],
    output: {
      // not file, use dir here
      dir: 'dist',
      format: 'es',
    },
    plugins: [
      typescript(),
    ],
  },
  {
    input: 'dist/types/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    plugins: [
      dts(),
      del({
        targets: 'dist/types',
        hook: 'buildEnd',
        verbose: true,
      }),
    ],
  }
])
```

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "declaration": true,
    "declarationDir": "dist/types",
  },
  // ...
}
```

[[ vudsen on 2024-12-04 (last year) ]]


## Comment 20
mentioned this

- [chore(deps-dev): bump the dev-dependencies group across 1 directory with 22 updates rpearce/react-medium-image-zoom#785](https://github.com/rpearce/react-medium-image-zoom/pull/785)

[[ rpearce on 2024-12-08 (last year) ]]


## Comment 21
mentioned this

- [Dependency Update January 2025 ni/fast#2](https://github.com/ni/fast/pull/2)

[[ rajsite on 2025-01-16 (last year) ]]


## Comment 22
added a commit that references this issue

[Dependency Update January 2025 (](https://github.com/ni/fast/commit/7162e95ca944d4a0bdea23cd848161812b0e47ab)[#2](https://github.com/ni/fast/pull/2))

[7162e95](https://github.com/ni/fast/commit/7162e95ca944d4a0bdea23cd848161812b0e47ab)

[[ rajsite on 2025-01-16 (last year) ]]


## Comment 23
mentioned this

- [chore(deps-dev): bump @rollup/plugin-typescript from 11.1.6 to 12.1.2 Hacker0x01/react-datepicker#5282](https://github.com/Hacker0x01/react-datepicker/pull/5282)

[[ balajis-qb on 2025-01-22 (last year) ]]


## Comment 24
added a commit that references this issue

[🔧 Update the es output path to be direct child of dist/ dir](https://github.com/qburst/react-datepicker-3/commit/a03e4a609310c80844ef77827cde1174ec8b8319)

[a03e4a6](https://github.com/qburst/react-datepicker-3/commit/a03e4a609310c80844ef77827cde1174ec8b8319)

[[ balajis-qb on 2025-01-22 (last year) ]]


## Comment 25
mentioned this

- [🔧 Update the ES output path to be direct child of dist/ dir Hacker0x01/react-datepicker#5339](https://github.com/Hacker0x01/react-datepicker/pull/5339)

[[ balajis-qb on 2025-01-22 (last year) ]]


## Comment 26
added

[x⁷ ⋅ stale](https://github.com/rollup/plugins/issues?q=state:open%20label:"x⁷%20⋅%20stale")

[[ stale on 2025-04-25 (10 months ago) ]]


## Comment 27
Hey folks. This issue hasn't received any traction for 60 days, so we're going to close this for housekeeping. If this is still an ongoing issue, please do consider contributing a Pull Request to resolve it. Further discussion is always welcome even with the issue closed. If anything actionable is posted in the comments, we'll consider reopening it. [ⓘ](https://github.com/probot/stale#is-closing-stale-issues-really-a-good-idea)

[[ stale on 2025-04-26 (10 months ago) ]]


## Comment 28
closed this as [completed](https://github.com/rollup/plugins/issues?q=is:issue%20state:closed%20archived:false%20reason:completed)

[[ stale on 2025-04-26 (10 months ago) ]]


## Comment 29
mentioned this

- [Split React component library build concerns, migrate ESLint to v9 bcgov/design-system#601](https://github.com/bcgov/design-system/pull/601)

[[ ty2k on 2025-12-28 (2 months ago) ]]


## Comment 30
mentioned this

- [Migrate/igvbrowser NIAGADS/niagads-viz-monorepo#129](https://github.com/NIAGADS/niagads-viz-monorepo/pull/129)
- [rollup@4.53.3 and rollup-plugin-dts@6.2.3 version bump breaks rollup-dts-plugin configuration NIAGADS/niagads-viz-monorepo#124](https://github.com/NIAGADS/niagads-viz-monorepo/issues/124)

[[ fossilfriend on 2026-02-13 (17 days ago) ]]
