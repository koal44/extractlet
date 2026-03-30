
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- fix: netrify image validation by fkatsuhiro · Pull Request #16027 · withastro/astro · GitHub -->
<!-- https://github.com/withastro/astro/pull/16027/files -->

[withastro](https://github.com/withastro) / **[astro](https://github.com/withastro/astro)** Public

# fix: netrify image validation #16027 · Open

fkatsuhiro wants to merge 7 commits into `withastro:main` from `fkatsuhiro:fix/netrify-image-validation`  
+80 −2 lines changed

## Files changed (8)

- .changeset
  - easy-dingos-retire.md
- packages
  - astro/src/assets
    - index.ts
  - integrations/netlify
    - src
      - image-service.ts
    - test/static
      - fixtures/image-missing-dimension
        - astro.config.mjs 
        - package.json 
        - src/pages
          - index.astro
      - image-missing-dimension.test.js
- pnpm-lock.yaml

### .changeset/easy-dingos-retire.md

+5 -0

```
     @@ -0,0 +1,5 @@
 1 + ---
 2 + '@astrojs/netlify': patch
 3 + ---
 4 +
 5 + fix(netlify): enforce validation for remote image dimensions
```

#### Comments near R5

##### **ematipico** (Member) • 2026-03-26 (12 hours ago)

Please write a better changeset: [https://contribute.docs.astro.build/docs-for-code-changes/changesets/#tips-and-examples](https://contribute.docs.astro.build/docs-for-code-changes/changesets/#tips-and-examples)

### packages/astro/src/assets/index.ts

+1 -1

```
      @@ -1,4 +1,4 @@
1 1   export { getConfiguredImageService, getImage } from './internal.js';
2   - export { baseService, isLocalService } from './services/service.js';
  2 + export { baseService, isLocalService, verifyOptions } from './services/service.js';
3 3   export { hashTransform, propsToFilename } from './utils/hash.js';
4 4   export type { LocalImageProps, RemoteImageProps } from './types.js';
```

### packages/integrations/netlify/src/image-service.ts

+3 -1

```
        @@ -1,5 +1,5 @@
 1  1   import type { ExternalImageService } from 'astro';
 2    - import { baseService } from 'astro/assets';
    2 + import { baseService, verifyOptions } from 'astro/assets';
 3  3   import { isESMImportedImage } from 'astro/assets/utils';
 4  4   import { AstroError } from 'astro/errors';
 5  5  
        @@ -51,6 +51,8 @@ const service: ExternalImageService = {
51 51   	getHTMLAttributes: baseService.getHTMLAttributes,
52 52   	getSrcSet: baseService.getSrcSet,
53 53   	validateOptions(options) {
   54 + 		verifyOptions(options);
   55 +
54 56   		if (options.format && !SUPPORTED_FORMATS.includes(options.format)) {
55 57   			throw new AstroError(
56 58   				`Unsupported image format "${options.format}"`,
```

### packages/integrations/netlify/test/static/fixtures/image-missing-dimension/astro.config.mjs

+12 -0

```
      @@ -0,0 +1,12 @@
  1 + import { defineConfig } from 'astro/config';
  2 + import netlify from '@astrojs/netlify';
  3 +
  4 + export default defineConfig({
  5 +   adapter: netlify(),
  6 +   output: 'static',
  7 +   image: {
  8 +     service: {
  9 +       entrypoint: 'astro/assets/services/sharp'
 10 +     }
 11 +   }
 12 + });
```

### packages/integrations/netlify/test/static/fixtures/image-missing-dimension/package.json

+9 -0

```
     @@ -0,0 +1,9 @@
 1 + {
 2 +   "name": "image-missing-dimention",
 3 +   "type": "module",
 4 +   "private": true,
 5 +   "dependencies": {
 6 +     "astro": "workspace:*",
 7 +     "@astrojs/netlify": "workspace:*"
 8 +   }
 9 + }
```

### packages/integrations/netlify/test/static/fixtures/image-missing-dimension/src/pages/index.astro

+8 -0

```
     @@ -0,0 +1,8 @@
 1 + ---
 2 + import { Image } from 'astro:assets';
 3 + ---
 4 +
 5 + <Image
 6 + 	src="https://images.unsplash.com/photo-1567674867291-b2595ac53ab4"
 7 + 	alt="Astro"
 8 + />
```

### packages/integrations/netlify/test/static/image-missing-dimension.test.js

+33 -0

```
      @@ -0,0 +1,33 @@
  1 + import * as assert from 'node:assert/strict';
  2 + import { describe, it } from 'node:test';
  3 + import { loadFixture } from '../../../../astro/test/test-utils.js';
  4 +
  5 + describe('Image validation when is not size specification in netlify.', () => {
  6 + 	it('throw on missing dimension in static build', async () => {
  7 + 		const fixture = await loadFixture({
  8 + 			root: new URL('./fixtures/image-missing-dimension/', import.meta.url)
  9 + 		});
 10 +
 11 + 		let error = null;
 12 + 		try{
 13 + 			await fixture.build();
 14 + 		} catch (e) {
 15 + 			error = e;
 16 + 			console.error("Caught Error Name:", e.name);
 17 + 		}
 18 +
 19 + 		// The build should fail if mandatory dimensions are missing
 20 + 		assert.notEqual(
 21 + 			error,
 22 + 			null,
 23 + 			`Build succeeded, but it should have failed due to missing dimensions.`
 24 + 		)
 25 +
 26 + 		// check the error image about missing image dimension
 27 + 		assert.match(
 28 + 			error.name,
 29 + 			/MissingImageDimension/,
 30 + 			`Build failed but not with the expected "MissingImageDimension"`
 31 + 		)
 32 + 	})
 33 + })
```

#### Comment on lines +12 to +31

##### **ematipico** (Member) • 2026-03-26 (12 hours ago)

Suggested change

```
12 - 		try{
13 - 			await fixture.build();
14 - 		} catch (e) {
15 - 			error = e;
16 - 			console.error("Caught Error Name:", e.name);
17 - 		}
18 -
19 - 		// The build should fail if mandatory dimensions are missing
20 - 		assert.notEqual(
21 - 			error,
22 - 			null,
23 - 			`Build succeeded, but it should have failed due to missing dimensions.`
24 - 		)
25 -
26 - 		// check the error image about missing image dimension
27 - 		assert.match(
28 - 			error.name,
29 - 			/MissingImageDimension/,
30 - 			`Build failed but not with the expected "MissingImageDimension"`
31 - 		)
12 + 		try {
13 + 			await fixture.build();
14 + 			assert.fail();
15 + 		} catch (e) {
16 + 			// check the error image about missing image dimension
17 + 			assert.match(
18 + 				e.name,
19 + 				/MissingImageDimension/,
20 + 				`Build failed but not with the expected "MissingImageDimension"`
21 + 			)
22 + 		}
```

What do you think of this? Better right?

### pnpm-lock.yaml

+9 -0

Some generated files are not rendered by default. Learn more about how customized files appear on GitHub.

<!-- XLET-END -->

