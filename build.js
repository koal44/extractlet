const fs = require('fs');
const path = require('path');
const terser = require('terser');
const jsStringEscape = require('js-string-escape');

const gistUrl = 'https://gist.github.com/koal44/77102fb777f9e3eb820db2a342ef965d';

if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}
if (!fs.existsSync('test')) {
    fs.mkdirSync('test');
}

// create example.js from example.html
const testDir = 'test';
const htmlSuffix = '.htm';
const outputSuffix = '_html_string.js';

const files = fs.readdirSync(testDir);
const jsExampleFiles = [];

for (const file of files) {
    if (!file.endsWith(htmlSuffix)) continue;

    const baseName = path.basename(file, htmlSuffix);  // e.g., 'example1'
    const inputPath = path.join(testDir, file);
    const outputPath = path.join(testDir, baseName + outputSuffix);
    const constName = baseName + 'Html';  // e.g., 'example1Html'
    jsExampleFiles.push(baseName + outputSuffix);

    const html = fs.readFileSync(inputPath, 'utf8');
    const escaped = jsStringEscape(html);
    const jsContent = `var ${constName} = "${escaped}";\n`; // use var or window[constName]
    fs.writeFileSync(outputPath, jsContent);
    console.log(`Built ${outputPath}`);
}

const jsExamplesFilesString = `const exampleFiles = ${JSON.stringify(jsExampleFiles, null, 4)};`;
fs.writeFileSync('test/example_files.js', jsExamplesFilesString);
console.log('Built test/example_files.js');


// build bookmarklet.min.js and bookmarklet.js
const scraper = fs.readFileSync('src/stackexchange_scraper.js', 'utf8');
(async () => {
    // Remove debug functions and console.log() statements
    const cleaned = scraper
        .replace(/\/\* @debug-start \*\/[\s\S]*?\/\* @debug-end \*\//g, '')
        .split('\n')
        .filter(line => !/^\s*(\/\/\s*)?(console\.)?log\(/.test(line))
        .join('\n');

    const minified = await terser.minify(scraper, {
        compress: { global_defs: { DEBUG: false }, dead_code: true }, // true
        mangle: false,
        format: {
            beautify: false,
            max_line_len: 100000,
            comments: false,
        },
    });

    if (minified.error) {
        console.error('Minification failed:', minified.error);
        process.exit(1);
    }

    // Wrap the minified code in bookmarklet wrapper again
    const bookmarklet_min = `javascript:(function(){${minified.code};runBookmarklet();})();`;

    fs.writeFileSync('dist/bookmarklet.min.js', bookmarklet_min);
    console.log('Minified bookmarklet built successfully.');

    // build bookmarklet.js
    const bookmarklet = `
/*
${gistUrl}

Stack Exchange Q&A Scraper Bookmarklet
View and copy readable StackExchange posts including original LaTeX code.

Author: koal44
License: MIT
Usage: Save the Minified Code as a bookmark, then visit any StackExchange page and click it.

--- Minified Code ---
(Paste the following line as your bookmark URL)
${bookmarklet_min}
*/

javascript:(function() {
${cleaned}
runBookmarklet();

})();`;

    fs.writeFileSync('dist/bookmarklet.js', bookmarklet);
    console.log('Bookmarklet built successfully.');
})();
