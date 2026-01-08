// js/candidates.js
// Candidate tracking system for Sudoku solver

import { isValidMove } from "./solver.js";

/**
 * Initialize candidates for all empty cells
 * Returns a 9x9 array where each cell contains a Set of possible values
 */
export function initializeCandidates(grid) {
  const candidates = Array.from({ length: 9 }, () => 
    Array.from({ length: 9 }, () => new Set())
  );
  
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        for (let v = 1; v <= 9; v++) {
          if (isValidMove(grid, r, c, v)) {
            candidates[r][c].add(v);
          }
        }
      }
    }
  }
  
  return candidates;
}

/**
 * Set a value in the grid and update all candidates
 */
export function setValue(grid, candidates, r, c, value) {
  grid[r][c] = value;
  candidates[r][c].clear();
  
  // Remove this value from all peers (row, column, box)
  for (let cc = 0; cc < 9; cc++) {
    if (cc !== c) candidates[r][cc].delete(value);
  }
  
  for (let rr = 0; rr < 9; rr++) {
    if (rr !== r) candidates[rr][c].delete(value);
  }
  
  const boxR = Math.floor(r / 3) * 3;
  const boxC = Math.floor(c / 3) * 3;
  for (let rr = boxR; rr < boxR + 3; rr++) {
    for (let cc = boxC; cc < boxC + 3; cc++) {
      if (rr !== r || cc !== c) {
        candidates[rr][cc].delete(value);
      }
    }
  }
}

/**
 * Get candidates for a specific cell as an array
 */
export function getCandidates(candidates, r, c) {
  return Array.from(candidates[r][c]);
}

/**
 * Check if puzzle is solved
 */
export function isSolved(grid) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) return false;
    }
  }
  return true;
}
