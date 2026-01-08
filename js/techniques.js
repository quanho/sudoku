// js/techniques.js
// Advanced solving techniques with proper candidate elimination

import { getCandidates } from "./candidates.js";

/**
 * Apply Locked Candidates (Pointing Pairs/Triples)
 * Returns true if any eliminations were made
 */
export function applyLockedCandidates(grid, candidates) {
  let changed = false;
  
  for (let br = 0; br < 9; br += 3) {
    for (let bc = 0; bc < 9; bc += 3) {
      for (let v = 1; v <= 9; v++) {
        const positions = [];
        
        for (let r = br; r < br + 3; r++) {
          for (let c = bc; c < bc + 3; c++) {
            if (grid[r][c] === 0 && candidates[r][c].has(v)) {
              positions.push({ r, c });
            }
          }
        }
        
        if (positions.length === 0 || positions.length > 3) continue;
        
        // Check if all positions are in same row
        const sameRow = positions.every(p => p.r === positions[0].r);
        if (sameRow) {
          const row = positions[0].r;
          for (let c = 0; c < 9; c++) {
            const inBox = c >= bc && c < bc + 3;
            if (!inBox && grid[row][c] === 0 && candidates[row][c].has(v)) {
              candidates[row][c].delete(v);
              changed = true;
            }
          }
        }
        
        // Check if all positions are in same column
        const sameCol = positions.every(p => p.c === positions[0].c);
        if (sameCol) {
          const col = positions[0].c;
          for (let r = 0; r < 9; r++) {
            const inBox = r >= br && r < br + 3;
            if (!inBox && grid[r][col] === 0 && candidates[r][col].has(v)) {
              candidates[r][col].delete(v);
              changed = true;
            }
          }
        }
      }
    }
  }
  
  return changed;
}

/**
 * Apply Naked Pair elimination
 * Returns true if any eliminations were made
 */
export function applyNakedPair(grid, candidates) {
  let changed = false;
  
  // Check rows
  for (let r = 0; r < 9; r++) {
    const cells = [];
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0 && candidates[r][c].size === 2) {
        cells.push({ r, c, cand: getCandidates(candidates, r, c) });
      }
    }
    
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const c1 = cells[i];
        const c2 = cells[j];
        if (c1.cand[0] === c2.cand[0] && c1.cand[1] === c2.cand[1]) {
          for (let c = 0; c < 9; c++) {
            if (c !== c1.c && c !== c2.c && grid[r][c] === 0) {
              if (candidates[r][c].delete(c1.cand[0])) changed = true;
              if (candidates[r][c].delete(c1.cand[1])) changed = true;
            }
          }
        }
      }
    }
  }
  
  // Check columns
  for (let c = 0; c < 9; c++) {
    const cells = [];
    for (let r = 0; r < 9; r++) {
      if (grid[r][c] === 0 && candidates[r][c].size === 2) {
        cells.push({ r, c, cand: getCandidates(candidates, r, c) });
      }
    }
    
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const c1 = cells[i];
        const c2 = cells[j];
        if (c1.cand[0] === c2.cand[0] && c1.cand[1] === c2.cand[1]) {
          for (let r = 0; r < 9; r++) {
            if (r !== c1.r && r !== c2.r && grid[r][c] === 0) {
              if (candidates[r][c].delete(c1.cand[0])) changed = true;
              if (candidates[r][c].delete(c1.cand[1])) changed = true;
            }
          }
        }
      }
    }
  }
  
  // Check boxes
  for (let br = 0; br < 9; br += 3) {
    for (let bc = 0; bc < 9; bc += 3) {
      const cells = [];
      for (let r = br; r < br + 3; r++) {
        for (let c = bc; c < bc + 3; c++) {
          if (grid[r][c] === 0 && candidates[r][c].size === 2) {
            cells.push({ r, c, cand: getCandidates(candidates, r, c) });
          }
        }
      }
      
      for (let i = 0; i < cells.length; i++) {
        for (let j = i + 1; j < cells.length; j++) {
          const c1 = cells[i];
          const c2 = cells[j];
          if (c1.cand[0] === c2.cand[0] && c1.cand[1] === c2.cand[1]) {
            for (let r = br; r < br + 3; r++) {
              for (let c = bc; c < bc + 3; c++) {
                if ((r !== c1.r || c !== c1.c) && (r !== c2.r || c !== c2.c) && grid[r][c] === 0) {
                  if (candidates[r][c].delete(c1.cand[0])) changed = true;
                  if (candidates[r][c].delete(c1.cand[1])) changed = true;
                }
              }
            }
          }
        }
      }
    }
  }
  
  return changed;
}

/**
 * Apply X-Wing elimination
 * Returns true if any eliminations were made
 */
export function applyXWing(grid, candidates) {
  let changed = false;
  
  for (let v = 1; v <= 9; v++) {
    // Check row-based X-Wing
    const rowData = [];
    for (let r = 0; r < 9; r++) {
      const cols = [];
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0 && candidates[r][c].has(v)) {
          cols.push(c);
        }
      }
      if (cols.length === 2) {
        rowData.push({ r, cols });
      }
    }
    
    for (let i = 0; i < rowData.length; i++) {
      for (let j = i + 1; j < rowData.length; j++) {
        const r1 = rowData[i];
        const r2 = rowData[j];
        if (r1.cols[0] === r2.cols[0] && r1.cols[1] === r2.cols[1]) {
          const c1 = r1.cols[0];
          const c2 = r1.cols[1];
          
          for (let r = 0; r < 9; r++) {
            if (r !== r1.r && r !== r2.r) {
              if (grid[r][c1] === 0 && candidates[r][c1].delete(v)) changed = true;
              if (grid[r][c2] === 0 && candidates[r][c2].delete(v)) changed = true;
            }
          }
        }
      }
    }
    
    // Check column-based X-Wing
    const colData = [];
    for (let c = 0; c < 9; c++) {
      const rows = [];
      for (let r = 0; r < 9; r++) {
        if (grid[r][c] === 0 && candidates[r][c].has(v)) {
          rows.push(r);
        }
      }
      if (rows.length === 2) {
        colData.push({ c, rows });
      }
    }
    
    for (let i = 0; i < colData.length; i++) {
      for (let j = i + 1; j < colData.length; j++) {
        const c1 = colData[i];
        const c2 = colData[j];
        if (c1.rows[0] === c2.rows[0] && c1.rows[1] === c2.rows[1]) {
          const r1 = c1.rows[0];
          const r2 = c1.rows[1];
          
          for (let c = 0; c < 9; c++) {
            if (c !== c1.c && c !== c2.c) {
              if (grid[r1][c] === 0 && candidates[r1][c].delete(v)) changed = true;
              if (grid[r2][c] === 0 && candidates[r2][c].delete(v)) changed = true;
            }
          }
        }
      }
    }
  }
  
  return changed;
}

/**
 * Apply Hidden Pair elimination
 * Find 2 numbers that appear in exactly 2 cells of 1 row/column/box
 */
export function applyHiddenPair(grid, candidates) {
  let changed = false;

  const units = [];
  // Collect rows, columns, boxes into an array for unified checking
  for (let i = 0; i < 9; i++) {
    const row = [], col = [], box = [];
    for (let j = 0; j < 9; j++) {
      row.push({ r: i, c: j });
      col.push({ r: j, c: i });
      const br = Math.floor(i / 3) * 3 + Math.floor(j / 3);
      const bc = (i % 3) * 3 + (j % 3);
      box.push({ r: br, c: bc });
    }
    units.push(row, col, box);
  }

  for (const unit of units) {
    // Count frequency of each number (1-9) in unit
    const posMap = Array.from({ length: 10 }, () => []);
    for (const { r, c } of unit) {
      if (grid[r][c] === 0) {
        candidates[r][c].forEach(v => posMap[v].push({ r, c }));
      }
    }

    // Find pairs of numbers with same 2 unique positions
    for (let v1 = 1; v1 <= 9; v1++) {
      if (posMap[v1].length !== 2) continue;
      for (let v2 = v1 + 1; v2 <= 9; v2++) {
        if (posMap[v2].length === 2 && 
            posMap[v1][0].r === posMap[v2][0].r && posMap[v1][0].c === posMap[v2][0].c &&
            posMap[v1][1].r === posMap[v2][1].r && posMap[v1][1].c === posMap[v2][1].c) {
          
          // Remove candidates OTHER than v1, v2 in these 2 cells
          [posMap[v1][0], posMap[v1][1]].forEach(({ r, c }) => {
            for (const v of candidates[r][c]) {
              if (v !== v1 && v !== v2) {
                candidates[r][c].delete(v);
                changed = true;
              }
            }
          });
        }
      }
    }
  }
  return changed;
}

/**
 * Apply Y-Wing (XY-Wing) elimination
 * @returns {boolean} true if any changes were made
 */
export function applyYWing(grid, candidates) {
  let changed = false;
  const bivalueCells = [];

  // 1. Find all cells with exactly 2 candidates
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0 && candidates[r][c].size === 2) {
        bivalueCells.push({ r, c, cands: Array.from(candidates[r][c]) });
      }
    }
  }

  // 2. Iterate through each cell as "Pivot" (Root)
  for (let i = 0; i < bivalueCells.length; i++) {
    const pivot = bivalueCells[i];
    const [A, B] = pivot.cands;

    // 3. Find 2 "Pincers" (Wings) cells
    const pincers = bivalueCells.filter(cell => {
      if (cell === pivot) return false;
      const isVisible = cell.r === pivot.r || cell.c === pivot.c || 
                        (Math.floor(cell.r/3) === Math.floor(pivot.r/3) && Math.floor(cell.c/3) === Math.floor(pivot.c/3));
      if (!isVisible) return false;
      
      // Wing must contain (A and C) or (B and C)
      const hasA = cell.cands.includes(A);
      const hasB = cell.cands.includes(B);
      return (hasA || hasB) && !(hasA && hasB); // Must have 1 common constant and 1 new constant (C)
    });

    for (let j = 0; j < pincers.length; j++) {
      for (let k = j + 1; k < pincers.length; k++) {
        const p1 = pincers[j];
        const p2 = pincers[k];

        // Find common candidate C between 2 wings
        const allPincerCands = [...p1.cands, ...p2.cands];
        const counts = {};
        allPincerCands.forEach(v => counts[v] = (counts[v] || 0) + 1);
        
        // C is the number that appears in both wings but not in Pivot
        const C = Object.keys(counts).find(v => counts[v] === 2 && parseInt(v) !== A && parseInt(v) !== B);
        if (!C) continue;
        const valC = parseInt(C);

        // 4. Remove C from cells that see both wings
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (grid[r][c] === 0 && candidates[r][c].has(valC)) {
              const seesP1 = (r === p1.r || c === p1.c || (Math.floor(r/3) === Math.floor(p1.r/3) && Math.floor(c/3) === Math.floor(p1.c/3)));
              const seesP2 = (r === p2.r || c === p2.c || (Math.floor(r/3) === Math.floor(p2.r/3) && Math.floor(c/3) === Math.floor(p2.c/3)));
              
              if (seesP1 && seesP2 && (r !== p1.r || c !== p1.c) && (r !== p2.r || c !== p2.c) && (r !== pivot.r || c !== pivot.c)) {
                candidates[r][c].delete(valC);
                changed = true;
              }
            }
          }
        }
      }
    }
  }
  return changed;
}
