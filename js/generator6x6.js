// js/generator6x6.js - Generator for 6x6 Sudoku puzzles

import { cloneGrid, solveInPlace, countSolutions } from "./solver6x6.js";

function makeEmpty6x6() {
  return Array.from({ length: 6 }, () => Array(6).fill(0));
}

function shuffledCells6x6() {
  const cells = Array.from({ length: 36 }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells;
}

function targetClues6x6(difficulty) {
  switch (difficulty) {
    case "expert": return 12; // Very few clues
    case "hard":   return 14;
    case "medium": return 16;
    case "easy":   return 18; // More clues for easier puzzle
    default:       return 16;
  }
}

export function generate6x6Sudoku(difficulty = "medium") {
  const maxAttempts = 20;
  const startTime = Date.now();
  const timeoutMs = 10000; // 10 seconds
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (Date.now() - startTime > timeoutMs) break;
    
    // 1) Generate complete solved board
    const solution = makeEmpty6x6();
    if (!solveInPlace(solution)) continue;

    // 2) Remove numbers to create puzzle with unique solution
    const puzzle = cloneGrid(solution);
    const cells = shuffledCells6x6();
    const minClues = targetClues6x6(difficulty);
    let clues = 36;

    for (const idx of cells) {
      if (clues <= minClues) break;

      const r = Math.floor(idx / 6);
      const c = idx % 6;
      const backup = puzzle[r][c];

      puzzle[r][c] = 0;
      // Check solution uniqueness
      if (countSolutions(cloneGrid(puzzle), 2) !== 1) {
        puzzle[r][c] = backup;
      } else {
        clues--;
      }
    }

    return { 
      puzzle, 
      solution,
      clues,
      timeMs: Date.now() - startTime
    };
  }
  
  // Fallback
  const solution = makeEmpty6x6();
  solveInPlace(solution);
  const puzzle = cloneGrid(solution);
  const cells = shuffledCells6x6();
  const minClues = targetClues6x6(difficulty);
  let clues = 36;
  
  for (const idx of cells) {
    if (clues <= minClues) break;
    const r = Math.floor(idx / 6), c = idx % 6;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    if (countSolutions(cloneGrid(puzzle), 2) !== 1) puzzle[r][c] = backup;
    else clues--;
  }
  
  return { puzzle, solution, clues, timeMs: Date.now() - startTime };
}
