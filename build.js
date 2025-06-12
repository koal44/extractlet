const fs = require('fs');
const terser = require('terser');
const jsStringEscape = require('js-string-escape');

if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}
if (!fs.existsSync('test')) {
    fs.mkdirSync('test');
}

// create example.js from example.html
const exampleHtml = fs.readFileSync('test/example.htm', 'utf8');
const exampleEscaped = jsStringEscape(exampleHtml);
const exampleJsContent = "const exampleHtml = \"" + exampleEscaped + "\";";
fs.writeFileSync('test/example_html_string.js', exampleJsContent);
console.log('Example HTML converted to example.js successfully.');

const scraper = fs.readFileSync('src/stackexchange_scraper.js', 'utf8');

// build bookmarklet.js
// this is for https://gist.github.com/koal44/77102fb777f9e3eb820db2a342ef965d
const bookmarklet = `
// Stack Exchange Q&A Scraper (Bookmarklet version)
// Extracts question, answers, and comments from Stack Exchange pages
// Author: koal44
// License: MIT
// Usage: Save as bookmarklet, visit any StackExchange page and open the bookmark.

javascript:(function() {
${scraper};
runBookmarklet();
})();
`;

fs.writeFileSync('dist/bookmarklet.js', bookmarklet);
console.log('Bookmarklet built successfully.');

// build bookmarklet.min.js (minified version)
(async () => {
    const minified = await terser.minify(scraper, {
        compress: true,
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
})();
