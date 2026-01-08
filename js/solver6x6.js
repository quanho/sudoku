// js/solver6x6.js - Solver for 6x6 Sudoku (2x3 boxes)

export function cloneGrid(grid) {
  return grid.map(row => [...row]);
}

export function isValidMove(grid, r, c, num) {
  // Check row
  for (let col = 0; col < 6; col++) {
    if (col !== c && grid[r][col] === num) return false;
  }
  
  // Check column
  for (let row = 0; row < 6; row++) {
    if (row !== r && grid[row][c] === num) return false;
  }
  
  // Check 3x2 box
  const boxRow = Math.floor(r / 2) * 2;
  const boxCol = Math.floor(c / 3) * 3;
  for (let dr = 0; dr < 2; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      const nr = boxRow + dr;
      const nc = boxCol + dc;
      if (nr !== r && nc !== c && grid[nr][nc] === num) return false;
    }
  }
  
  return true;
}

export function solveInPlace(grid) {
  const nums = [1, 2, 3, 4, 5, 6];
  // Shuffle for random generation
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }

  function backtrack(pos) {
    if (pos === 36) return true; // All cells filled
    
    const r = Math.floor(pos / 6);
    const c = pos % 6;
    
    if (grid[r][c] !== 0) return backtrack(pos + 1);
    
    for (const num of nums) {
      if (isValidMove(grid, r, c, num)) {
        grid[r][c] = num;
        if (backtrack(pos + 1)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  }
  
  return backtrack(0);
}

export function countSolutions(grid, maxCount) {
  let count = 0;
  
  function backtrack(pos) {
    if (count >= maxCount) return;
    if (pos === 36) {
      count++;
      return;
    }
    
    const r = Math.floor(pos / 6);
    const c = pos % 6;
    
    if (grid[r][c] !== 0) {
      backtrack(pos + 1);
      return;
    }
    
    for (let num = 1; num <= 6; num++) {
      if (isValidMove(grid, r, c, num)) {
        grid[r][c] = num;
        backtrack(pos + 1);
        grid[r][c] = 0;
      }
    }
  }
  
  backtrack(0);
  return count;
}
