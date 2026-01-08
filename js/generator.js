// js/generator.js
import { cloneGrid, solveInPlace, countSolutions } from "./solver.js";
import { rateDifficulty } from "./difficulty-rater.js";

function makeEmpty() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function shuffledCells() {
  const cells = Array.from({ length: 81 }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells;
}

/**
 * Adjust target number of clues (filled cells).
 * Fewer clues increase the likelihood of requiring advanced techniques.
 */
function targetClues(difficulty) {
  switch (difficulty) {
    case "expert": return 24; // 22-24 clues: Very hard, requires X-Wing/Y-Wing
    case "hard":   return 26; // 25-27 clues: Requires Naked/Hidden Pairs
    case "medium": return 32; // 30-34 clues
    case "easy":   return 38; // 36-40 clues
    default:       return 30;
  }
}

export function generateSudoku(difficulty = "medium") {
  // Increase attempts for hard levels to ensure finding the right technique structure
  const maxAttempts = difficulty === "expert" || difficulty === "hard" ? 100 : 30;
  const startTime = Date.now();
  const timeoutMs = 15000; // 15 seconds
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (Date.now() - startTime > timeoutMs) break;
    
    // 1) Generate complete solved board
    const solution = makeEmpty();
    if (!solveInPlace(solution)) continue;

    // 2) Remove numbers to create puzzle with unique solution
    const puzzle = cloneGrid(solution);
    const cells = shuffledCells();
    const minClues = targetClues(difficulty);
    let clues = 81;

    for (const idx of cells) {
      if (clues <= minClues) break;

      const r = Math.floor(idx / 9);
      const c = idx % 9;
      const backup = puzzle[r][c];

      puzzle[r][c] = 0;
      // Check solution uniqueness
      if (countSolutions(cloneGrid(puzzle), 2) !== 1) {
        puzzle[r][c] = backup;
      } else {
        clues--;
      }
    }

    // 3) Rate difficulty based on new advanced techniques
    const info = rateDifficulty(puzzle);
    
    // Strict checking logic to ensure generator meets standards
    let isGoodMatch = false;
    if (difficulty === "expert") {
      // Expert must require Y-Wing or X-Wing
      isGoodMatch = info.techniques.yWing > 0 || info.techniques.xWing > 0;
    } else if (difficulty === "hard") {
      // Hard must require at least Naked/Hidden Pairs or Locked Candidates
      isGoodMatch = info.techniques.nakedPair > 0 || info.techniques.hiddenPair > 0 || info.techniques.lockedCandidates > 0;
    } else {
      isGoodMatch = info.rating === difficulty;
    }

    // If meets standards or reached max attempts, return result
    if (isGoodMatch || attempt === maxAttempts - 1) {
      return { 
        puzzle, 
        solution,
        actualDifficulty: info.rating,
        clues,
        techniques: info.techniques,
        score: info.score,
        attempts: attempt + 1,
        timeMs: Date.now() - startTime
      };
    }
  }
  
  // If no perfect puzzle found, run once more with lower minClues
  return fallbackGenerator(difficulty, startTime);
}

function fallbackGenerator(difficulty, startTime) {
  const solution = makeEmpty();
  solveInPlace(solution);
  const puzzle = cloneGrid(solution);
  const cells = shuffledCells();
  const minClues = targetClues(difficulty);
  let clues = 81;
  
  for (const idx of cells) {
    if (clues <= minClues) break;
    const r = Math.floor(idx / 9), c = idx % 9;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    if (countSolutions(cloneGrid(puzzle), 2) !== 1) puzzle[r][c] = backup;
    else clues--;
  }
  
  const info = rateDifficulty(puzzle);
  return {
    puzzle, solution,
    actualDifficulty: info.rating,
    clues, techniques: info.techniques,
    score: info.score,
    timeMs: Date.now() - startTime
  };
}