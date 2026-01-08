#!/bin/bash
# Script to minify all JavaScript files

echo "Minifying JavaScript files..."

# Create dist directory if it doesn't exist
mkdir -p dist/js

# Minify each JS file
npx terser js/solver.js -c -m -o dist/js/solver.js
npx terser js/solver6x6.js -c -m -o dist/js/solver6x6.js
npx terser js/generator.js -c -m -o dist/js/generator.js
npx terser js/generator6x6.js -c -m -o dist/js/generator6x6.js
npx terser js/hint.js -c -m -o dist/js/hint.js
npx terser js/hint6x6.js -c -m -o dist/js/hint6x6.js
npx terser js/difficulty-rater.js -c -m -o dist/js/difficulty-rater.js
npx terser js/candidates.js -c -m -o dist/js/candidates.js
npx terser js/techniques.js -c -m -o dist/js/techniques.js
npx terser js/ui.js -c -m -o dist/js/ui.js

# Copy HTML and CSS to dist
cp index.html dist/
cp style.css dist/

# Update HTML to use minified files (already uses correct paths)
echo "Done! Minified files are in dist/ folder"
echo "File sizes:"
echo "Original js/: $(du -sh js/ | cut -f1)"
echo "Minified dist/js/: $(du -sh dist/js/ | cut -f1)"
