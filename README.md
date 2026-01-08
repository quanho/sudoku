# Sudoku Trainer

A web-based Sudoku game with intelligent hints and multiple difficulty levels.

## Features

- **Two grid sizes:** 6×6 and 9×9
- **Four difficulty levels:** Easy, Medium, Hard, Expert
- **Smart hints** that teach solving techniques
- **Undo support** to revert mistakes
- **Timer** to track your solving speed
- **Automatic validation** to prevent invalid moves

## Controls

### Buttons

- **New game** - Generate a new puzzle with the selected grid size and difficulty
- **Undo** - Revert your last move
- **Erase** - Clear the currently selected cell
- **💡 Hint** - Get an intelligent hint that explains which solving technique to use

### Game Interface

- **Grid Size** - Choose between 6×6 (beginner-friendly) or 9×9 (classic Sudoku)
- **Difficulty** - Select puzzle complexity
- **Timer** - Shows elapsed time since puzzle start
- **Coach Panel** - Displays feedback, hints, and technique explanations

## Difficulty Levels

### Easy
- Multiple naked singles and hidden singles
- Straightforward solving path
- Good for beginners learning the basics

### Medium
- Requires basic techniques (singles, pairs)
- Some cells need logical deduction
- Suitable for casual players

### Hard
- Advanced techniques needed (pointing pairs, box-line reduction)
- Fewer givens, more challenging
- For experienced players

### Expert
- Very few givens (minimal clues)
- Multiple advanced techniques required
- Complex solving chains
- For Sudoku masters

## How to Play

1. Select grid size (6×6 or 9×9) and difficulty level
2. Click **New game** to start
3. Click on any empty cell to select it
4. Click a number on the keypad to fill the cell
5. Use **Hint** if you get stuck - it will explain the next logical step
6. Use **Erase** to clear a cell
7. Use **Undo** to revert mistakes
8. Complete the grid to win!

## Rules

- Each row must contain all numbers (1-6 for 6×6, 1-9 for 9×9)
- Each column must contain all numbers
- Each box must contain all numbers
- No number can repeat in the same row, column, or box

## Solving Techniques

The hint system teaches various Sudoku solving techniques:

- **Naked Single** - Cell with only one possible candidate
- **Hidden Single** - Number that can only go in one place in a row/col/box
- **Naked Pair/Triple** - Cells sharing the same 2 or 3 candidates
- **Pointing Pair** - Candidates in a box pointing to eliminate in a line
- **Box-Line Reduction** - Candidates in a line confined to one box

## Development

Open `index.html` in a web browser to play. No build step required.

### Files Structure

- `index.html` - Main HTML file
- `style.css` - Styling
- `js/ui.js` - User interface and game logic
- `js/generator.js` - 9×9 puzzle generator
- `js/generator6x6.js` - 6×6 puzzle generator
- `js/solver.js` - 9×9 solver and validator
- `js/solver6x6.js` - 6×6 solver and validator
- `js/hint.js` - 9×9 hint system with technique explanations
- `js/hint6x6.js` - 6×6 hint system
- `js/techniques.js` - Advanced solving techniques
- `js/candidates.js` - Candidate calculation
- `js/difficulty-rater.js` - Puzzle difficulty assessment

### Command Line Tools

#### Running Locally

Simply open the HTML file in a browser:
```bash
open index.html
# or
python3 -m http.server 8000  # Then visit http://localhost:8000
```

#### Minifying for Production

To minify JavaScript files for production deployment:

```bash
# Make script executable (first time only)
chmod +x minify.sh

# Run minification
./minify.sh
```

This will:
- Create a `dist/` folder with minified files
- Compress all JavaScript files using Terser
- Copy HTML and CSS files
- Show file size comparison

**Requirements:** Node.js and npx must be installed. The script uses `terser` for minification.

**Install terser globally (optional):**
```bash
npm install -g terser
```

#### Manual Minification

To minify individual files:
```bash
# Minify a single file
npx terser js/ui.js -c -m -o dist/js/ui.js

# Minify with source maps
npx terser js/ui.js -c -m --source-map -o dist/js/ui.js
```

**Terser options:**
- `-c` - Compress (remove dead code, optimize)
- `-m` - Mangle (shorten variable names)
- `--source-map` - Generate source maps for debugging

#### Starting a Development Server

**VS Code - Go Live (Recommended)**

If you're using VS Code, install the Live Server extension:
1. Install "Live Server" extension by Ritwick Dey
2. Right-click on `index.html` and select "Open with Live Server"
3. Browser will auto-open and reload on file changes

**Command Line Options:**

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (http-server)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## License

Open source - feel free to use and modify.
