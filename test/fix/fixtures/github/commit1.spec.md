
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- Meta: Add prepare script for Safari (#5491) · refined-github/refined-github@22d6470 · GitHub -->
<!-- https://github.com/refined-github/refined-github/commit/22d6470b311c9cb4e26a55b3b674e648897ff67e -->

[refined-github](https://github.com/refined-github) / **[refined-github](https://github.com/refined-github/refined-github)** Public

# Commit 22d6470

fregante · authored on 2022-03-16 (4 years ago)

Meta: Add prepare script for Safari ([#5491](https://github.com/refined-github/refined-github/pull/5491))

main (#5491) · 1 parent 6c8f0f1

8 files changed · +50 -19 lines changed

## Files changed

- .gitignore
- build
  - prepare-safari-release.sh
- package.json
- safari
  - Config.xcconfig
- source
  - icon.png
  - manifest.json
  - options.html
- webpack.config.ts

### .gitignore

+1 -1

```
      @@ -1,6 +1,6 @@
1 1   node_modules
2 2   yarn.lock
3   - distribution/build
  3 + distribution
4 4   test/web-ext-profile
5 5   !test/web-ext-profile/.gitkeep
6 6   .cache
```

### build/prepare-safari-release.sh

+29

```
      @@ -0,0 +1,29 @@
  1 + #! /bin/bash
  2 +
  3 + # Automatically exit on error
  4 + set -e
  5 +
  6 + CONFIG_FILE=./safari/LocalOverrides.xcconfig
  7 +
  8 + TAG=$(git describe --tags --abbrev=0)
  9 +
 10 + if [[ $(git describe --tags) != "$TAG" ]]; then
 11 + 	echo You’re ahead of the latest tag. Run:
 12 + 	echo git checkout "$TAG"
 13 + 	exit 1
 14 + fi
 15 +
 16 + PROJECT_VERSION=$(sed -n 's/^CURRENT_PROJECT_VERSION = \(.*\)/\1/p' < $CONFIG_FILE)
 17 + NEXT_PROJECT_VERSION=$((PROJECT_VERSION + 1))
 18 +
 19 + echo "Will bump the project version" "$PROJECT_VERSION"
 20 +
 21 + trash distribution
 22 + npm run build
 23 + npx dot-json distribution/manifest.json version "$TAG"
 24 +
 25 + sed -i '' '/MARKETING_VERSION/d' $CONFIG_FILE
 26 + sed -i '' '/CURRENT_PROJECT_VERSION/d' $CONFIG_FILE
 27 +
 28 + echo "MARKETING_VERSION = $TAG" >> $CONFIG_FILE
 29 + echo "CURRENT_PROJECT_VERSION = $NEXT_PROJECT_VERSION" >> $CONFIG_FILE
```

### package.json

+1 -1

```
        @@ -11,7 +11,7 @@
11 11   		"lint:css": "stylelint \"source/**/*.css\"",
12 12   		"lint:js": "xo",
13 13   		"pack:safari": "xcodebuild -project 'safari/Refined GitHub.xcodeproj' -scheme 'Refined GitHub (macOS)'",
14    - 		"start:safari": "open 'safari/build/Release/Refined GitHub.app'",
   14 + 		"prepare:safari": "bash build/prepare-safari-release.sh",
15 15   		"test": "run-p ava lint:* build:* test:features",
16 16   		"test:features": "node --loader ts-node/esm \"build/verify-features.ts\"",
17 17   		"watch": "run-p watch:* --continue-on-error",
```

### safari/Config.xcconfig

+2 -2

```
      @@ -1,4 +1,4 @@
1   - MARKETING_VERSION = 22.2.13
2   - CURRENT_PROJECT_VERSION = 18
  1 + MARKETING_VERSION = 0.0.0
  2 + CURRENT_PROJECT_VERSION = 1
3 3  
4 4   #include? "LocalOverrides.xcconfig"
```

### distribution/icon.png → source/icon.png

File renamed without changes.

### distribution/manifest.json → source/manifest.json

+6 -6

```
        @@ -35,8 +35,8 @@
35 35   	"background": {
36 36   		"persistent": false,
37 37   		"scripts": [
38    - 			"build/browser-polyfill.js",
39    - 			"build/background.js"
   38 + 			"browser-polyfill.js",
   39 + 			"background.js"
40 40   		]
41 41   	},
42 42   	"content_scripts": [
        @@ -47,15 +47,15 @@
47 47   				"https://gist.github.com/*"
48 48   			],
49 49   			"css": [
50    - 				"build/refined-github.css"
   50 + 				"refined-github.css"
51 51   			],
52 52   			"js": [
53    - 				"build/browser-polyfill.js",
54    - 				"build/refined-github.js"
   53 + 				"browser-polyfill.js",
   54 + 				"refined-github.js"
55 55   			]
56 56   		}
57 57   	],
58 58   	"web_accessible_resources": [
59    - 		"build/resolve-conflicts.js"
   59 + 		"resolve-conflicts.js"
60 60   	]
61 61   }
```

### distribution/options.html → source/options.html

+3 -3

```
        @@ -2,7 +2,7 @@
 2  2   <meta charset="utf-8">
 3  3   <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
 4  4   <title>Refined GitHub options</title>
 5    - <link rel="stylesheet" href="build/options.css">
    5 + <link rel="stylesheet" href="options.css">
 6  6   <form id="options-form" class="detail-view-container">
 7  7   	<p>
 8  8   		<strong>Information</strong><br>
        @@ -88,5 +88,5 @@
88 88   	<div class="js-features"></div>
89 89  
90 90   </form>
91    - <script src="build/browser-polyfill.js"></script>
92    - <script src="build/options.js"></script>
   91 + <script src="browser-polyfill.js"></script>
   92 + <script src="options.js"></script>
```

### webpack.config.ts

+8 -6

```
        @@ -21,15 +21,16 @@ const config: Configuration = {
21 21   		'background',
22 22   		'options',
23 23   		'resolve-conflicts',
24    - 	].map(name => [name, `./source/${name}`])),
   24 + 	].map(name => [name, `./${name}`])),
   25 + 	context: path.resolve('source'),
25 26   	output: {
26    - 		path: path.resolve('distribution/build'),
   27 + 		path: path.resolve('distribution'),
27 28   	},
28 29   	module: {
29 30   		rules: [
30 31   			{
31 32   				test: /[/\\]readme\.md$/,
32    - 				loader: './build/readme.loader.cts',
   33 + 				loader: '../build/readme.loader.cts',
33 34   			},
34 35   			{
35 36   				test: /\.tsx?$/,
        @@ -51,9 +52,10 @@ const config: Configuration = {
51 52   	plugins: [
52 53   		new MiniCssExtractPlugin(),
53 54   		new CopyWebpackPlugin({
54    - 			patterns: [{
55    - 				from: resolvePackage('webextension-polyfill'),
56    - 			}],
   55 + 			patterns: [
   56 + 				resolvePackage('webextension-polyfill'),
   57 + 				'*.+(html|json|png)',
   58 + 			],
57 59   		}),
58 60   		new SizePlugin({writeFile: false}),
59 61   	],
```

<!-- XLET-END -->

