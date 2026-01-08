// js/difficulty-rater.js
import { cloneGrid } from "./solver.js";
import { initializeCandidates, setValue, isSolved } from "./candidates.js";
import { 
  applyLockedCandidates, 
  applyNakedPair, 
  applyHiddenPair, 
  applyXWing, 
  applyYWing 
} from "./techniques.js";

/**
 * Simulate solving a puzzle step by step to rate difficulty based on required techniques.
 */
export function rateDifficulty(puzzle) {
  const grid = cloneGrid(puzzle);
  const candidates = initializeCandidates(grid);
  
  const techniques = {
    nakedSingle: 0,
    hiddenSingle: 0,
    lockedCandidates: 0,
    nakedPair: 0,
    hiddenPair: 0,
    xWing: 0,
    yWing: 0,
    guessing: 0
  };
  
  let maxIterations = 400; 
  let iteration = 0;
  
  while (!isSolved(grid) && iteration < maxIterations) {
    iteration++;
    let foundMove = false;
    
    // 1. Naked Single (Easiest)
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0 && candidates[r][c].size === 1) {
          const value = Array.from(candidates[r][c])[0];
          setValue(grid, candidates, r, c, value);
          techniques.nakedSingle++;
          foundMove = true;
          break;
        }
      }
      if (foundMove) break;
    }
    if (foundMove) continue;
    
    // 2. Hidden Single
    const hs = findHiddenSingleWithCandidates(grid, candidates);
    if (hs) {
      setValue(grid, candidates, hs.r, hs.c, hs.v);
      techniques.hiddenSingle++;
      continue;
    }
    
    // 3. Locked Candidates (Pointing/Claiming)
    if (applyLockedCandidates(grid, candidates)) {
      techniques.lockedCandidates++;
      continue;
    }
    
    // 4. Naked Pair
    if (applyNakedPair(grid, candidates)) {
      techniques.nakedPair++;
      continue;
    }

    // 5. Hidden Pair (New)
    if (applyHiddenPair(grid, candidates)) {
      techniques.hiddenPair++;
      continue;
    }
    
    // 6. X-Wing
    if (applyXWing(grid, candidates)) {
      techniques.xWing++;
      continue;
    }

    // 7. Y-Wing (New - Advanced technique)
    if (applyYWing(grid, candidates)) {
      techniques.yWing++;
      continue;
    }
    
    // If no logical techniques apply, must resort to guessing (Backtracking)
    techniques.guessing++;
    break; 
  }
  
  // Calculate score based on new weights
  const score = 
    techniques.nakedSingle * 1 +
    techniques.hiddenSingle * 2 +
    techniques.lockedCandidates * 6 +
    techniques.nakedPair * 10 +
    techniques.hiddenPair * 12 +
    techniques.xWing * 20 +
    techniques.yWing * 25 +
    techniques.guessing * 50;
  
  return {
    score,
    techniques,
    rating: getRating(score, techniques)
  };
}

function findHiddenSingleWithCandidates(grid, candidates) {
  // Logic to check Row, Column, Box to find number that appears only once in unit
  for (let r = 0; r < 9; r++) {
    for (let v = 1; v <= 9; v++) {
      let positions = [];
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0 && candidates[r][c].has(v)) positions.push(c);
      }
      if (positions.length === 1) return { r, c: positions[0], v };
    }
  }
  // (Similar for Col and Box...)
  // ... (keep your old logic for finding Hidden Single)
  return null;
}

function getRating(score, techniques) {
  // Redefine levels
  if (techniques.yWing > 0 || techniques.guessing > 0) return "expert";
  if (techniques.xWing > 0 || techniques.hiddenPair > 0) return "hard";
  if (techniques.nakedPair > 0 || techniques.lockedCandidates > 0 || techniques.hiddenSingle >= 10) return "medium";
  return "easy";
}

export function matchesDifficulty(puzzle, targetDifficulty) {
  const { rating } = rateDifficulty(puzzle);
  return rating === targetDifficulty;
}