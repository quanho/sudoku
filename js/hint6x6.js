// js/hint6x6.js - Simple hints for 6x6 Sudoku

function initializeCandidates6x6(grid) {
  const candidates = [];
  for (let r = 0; r < 6; r++) {
    candidates[r] = [];
    for (let c = 0; c < 6; c++) {
      if (grid[r][c] !== 0) {
        candidates[r][c] = new Set();
      } else {
        const poss = new Set([1, 2, 3, 4, 5, 6]);
        
        // Remove from row
        for (let cc = 0; cc < 6; cc++) {
          if (grid[r][cc] !== 0) poss.delete(grid[r][cc]);
        }
        
        // Remove from column
        for (let rr = 0; rr < 6; rr++) {
          if (grid[rr][c] !== 0) poss.delete(grid[rr][c]);
        }
        
        // Remove from 3x2 box
        const boxRow = Math.floor(r / 2) * 2;
        const boxCol = Math.floor(c / 3) * 3;
        for (let dr = 0; dr < 2; dr++) {
          for (let dc = 0; dc < 3; dc++) {
            if (grid[boxRow + dr][boxCol + dc] !== 0) {
              poss.delete(grid[boxRow + dr][boxCol + dc]);
            }
          }
        }
        
        candidates[r][c] = poss;
      }
    }
  }
  return candidates;
}

export function findHumanHint6x6(grid) {
  const candidates = initializeCandidates6x6(grid);

  // 1. Naked Single
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (grid[r][c] === 0 && candidates[r][c].size === 1) {
        const v = Array.from(candidates[r][c])[0];
        return {
          type: "naked_single",
          r, c, v,
          message: `Naked Single: Cell (row ${r + 1}, col ${c + 1}) → fill <strong style="color: #1565C0; background: #E3F2FD; padding: 2px 8px; border-radius: 4px; font-size: 1.15em;">${v}</strong>.`
        };
      }
    }
  }

  // 2. Hidden Single in rows
  for (let v = 1; v <= 6; v++) {
    for (let r = 0; r < 6; r++) {
      let positions = [];
      for (let c = 0; c < 6; c++) {
        if (grid[r][c] === 0 && candidates[r][c].has(v)) positions.push({r, c});
      }
      if (positions.length === 1) {
        return { 
          type: "hidden_single", 
          r: positions[0].r, 
          c: positions[0].c, 
          v, 
          message: `Hidden Single: Cell (row ${positions[0].r+1}, col ${positions[0].c+1}) → fill <strong style="color: #1565C0; background: #E3F2FD; padding: 2px 8px; border-radius: 4px; font-size: 1.15em;">${v}</strong> (only place in row ${r+1}).` 
        };
      }
    }
    
    // Hidden Single in columns
    for (let c = 0; c < 6; c++) {
      let positions = [];
      for (let r = 0; r < 6; r++) {
        if (grid[r][c] === 0 && candidates[r][c].has(v)) positions.push({r, c});
      }
      if (positions.length === 1) {
        return { 
          type: "hidden_single", 
          r: positions[0].r, 
          c: positions[0].c, 
          v, 
          message: `Hidden Single: Cell (row ${positions[0].r+1}, col ${positions[0].c+1}) → fill <strong style="color: #1565C0; background: #E3F2FD; padding: 2px 8px; border-radius: 4px; font-size: 1.15em;">${v}</strong> (only place in column ${c+1}).` 
        };
      }
    }
    
    // Hidden Single in boxes
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 2; bc++) {
        let positions = [];
        for (let dr = 0; dr < 2; dr++) {
          for (let dc = 0; dc < 3; dc++) {
            const r = br + dr;
            const c = bc * 3 + dc;
            if (grid[r][c] === 0 && candidates[r][c].has(v)) positions.push({r, c});
          }
        }
        if (positions.length === 1) {
          return { 
            type: "hidden_single", 
            r: positions[0].r, 
            c: positions[0].c, 
            v, 
            message: `Hidden Single: Cell (row ${positions[0].r+1}, col ${positions[0].c+1}) → fill <strong style="color: #1565C0; background: #E3F2FD; padding: 2px 8px; border-radius: 4px; font-size: 1.15em;">${v}</strong> (only place in box).` 
          };
        }
      }
    }
  }

  return null;
}
