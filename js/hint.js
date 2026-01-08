// js/hint.js
import { initializeCandidates } from "./candidates.js";

/**
 * Main function: Find hints from easy to hard
 * Priority: Direct placement hints first, then elimination hints
 */
export function findHumanHint(grid) {
  const candidates = initializeCandidates(grid);

  // === PHASE 1: Direct Placement Hints (always show these first) ===
  
  // 1. Naked Single
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
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

  // 2. Hidden Single (Search in rows, columns, boxes)
  const hs = findHiddenSingleHint(grid, candidates);
  if (hs) return hs;

  // === PHASE 2: Elimination Hints (only when no placement hints available) ===
  
  // 3. Locked Candidates (Pointing/Claiming)
  const locked = findLockedCandidatesHint(grid, candidates);
  if (locked) return locked;

  // 4. Naked Pair
  const nPair = findNakedPairHint(grid, candidates);
  if (nPair) return nPair;

  // 5. Hidden Pair
  const hPair = findHiddenPairHint(grid, candidates);
  if (hPair) return hPair;

  // 6. X-Wing
  const xWing = findXWingHint(grid, candidates);
  if (xWing) return xWing;

  // 7. Y-Wing
  const yWing = findYWingHint(grid, candidates);
  if (yWing) return yWing;

  return null;
}

/**
 * DETAILED HINT LOGIC FUNCTIONS
 */

function findHiddenSingleHint(grid, candidates) {
  for (let v = 1; v <= 9; v++) {
    // Check rows
    for (let r = 0; r < 9; r++) {
      let positions = [];
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0 && candidates[r][c].has(v)) positions.push({r, c});
      }
      if (positions.length === 1) {
        return { type: "hidden_single", r: positions[0].r, c: positions[0].c, v, 
          message: `Hidden Single: Cell (row ${positions[0].r+1}, col ${positions[0].c+1}) → fill <strong style="color: #1565C0; background: #E3F2FD; padding: 2px 8px; border-radius: 4px; font-size: 1.15em;">${v}</strong> (only place in row ${r+1}).` };
      }
    }
    
    // Check columns
    for (let c = 0; c < 9; c++) {
      let positions = [];
      for (let r = 0; r < 9; r++) {
        if (grid[r][c] === 0 && candidates[r][c].has(v)) positions.push({r, c});
      }
      if (positions.length === 1) {
        return { type: "hidden_single", r: positions[0].r, c: positions[0].c, v, 
          message: `Hidden Single: Cell (row ${positions[0].r+1}, col ${positions[0].c+1}) → fill <strong style="color: #1565C0; background: #E3F2FD; padding: 2px 8px; border-radius: 4px; font-size: 1.15em;">${v}</strong> (only place in column ${c+1}).` };
      }
    }
    
    // Check boxes
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        let positions = [];
        for (let dr = 0; dr < 3; dr++) {
          for (let dc = 0; dc < 3; dc++) {
            const r = br * 3 + dr;
            const c = bc * 3 + dc;
            if (grid[r][c] === 0 && candidates[r][c].has(v)) positions.push({r, c});
          }
        }
        if (positions.length === 1) {
          return { type: "hidden_single", r: positions[0].r, c: positions[0].c, v, 
            message: `Hidden Single: Cell (row ${positions[0].r+1}, col ${positions[0].c+1}) → fill <strong style="color: #1565C0; background: #E3F2FD; padding: 2px 8px; border-radius: 4px; font-size: 1.15em;">${v}</strong> (only place in box ${br*3 + bc+1}).` };
        }
      }
    }
  }
  return null;
}


function findLockedCandidatesHint(grid, candidates) {
  for (let v = 1; v <= 9; v++) {
    for (let br = 0; br < 9; br += 3) {
      for (let bc = 0; bc < 9; bc += 3) {
        let pos = [];
        for (let r = br; r < br + 3; r++) {
          for (let c = bc; c < bc + 3; c++) {
            if (grid[r][c] === 0 && candidates[r][c].has(v)) pos.push({r, c});
          }
        }
        if (pos.length >= 2 && pos.length <= 3) {
          const sameRow = pos.every(p => p.r === pos[0].r);
          if (sameRow) {
            const r = pos[0].r;
            let targets = [];
            for (let c = 0; c < 9; c++) {
              if ((c < bc || c >= bc + 3) && grid[r][c] === 0 && candidates[r][c].has(v)) targets.push({r, c});
            }
            if (targets.length > 0) return { type: "locked_candidates", pincers: pos, targets, message: `Locked Candidates: Number <strong style="color: #1565C0; background: #E3F2FD; padding: 2px 8px; border-radius: 4px; font-size: 1.15em;">${v}</strong> is locked in <span style="color: #4caf50; font-weight: bold;">green cells</span> (within one box). Therefore, <span style="color: #e53935; font-weight: bold;">red cells</span> in the same row/column cannot contain ${v}. <em style="color: #666; display: block; margin-top: 8px;">💡 After mentally eliminating these candidates, look for cells with only one remaining option. If no simple moves exist, more advanced techniques may be needed.</em>` };
          }
        }
      }
    }
  }
  return null;
}

function findNakedPairHint(grid, candidates) {
  // Logic: Find 2 cells in same unit with same 2 candidates
  for (let r = 0; r < 9; r++) {
    for (let c1 = 0; c1 < 9; c1++) {
      if (grid[r][c1] === 0 && candidates[r][c1].size === 2) {
        for (let c2 = c1 + 1; c2 < 9; c2++) {
          if (grid[r][c2] === 0 && candidates[r][c2].size === 2) {
            const cands1 = Array.from(candidates[r][c1]);
            const cands2 = Array.from(candidates[r][c2]);
            if (cands1[0] === cands2[0] && cands1[1] === cands2[1]) {
              // Check if any other cells in row contain one of these two numbers
              let targets = [];
              for (let c = 0; c < 9; c++) {
                if (c !== c1 && c !== c2 && grid[r][c] === 0 && (candidates[r][c].has(cands1[0]) || candidates[r][c].has(cands1[1]))) {
                  targets.push({r, c});
                }
              }
              if (targets.length > 0) return { 
                type: "naked_pair", 
                cells: [{r, c: c1}, {r, c: c2}], 
                targets, 
                message: `Naked Pair: Two cells (row ${r+1}, cols ${c1+1} & ${c2+1}) contain the pair {<strong style="color: #1565C0; background: #E3F2FD; padding: 2px 6px; border-radius: 3px;">${cands1[0]}</strong>, <strong style="color: #1565C0; background: #E3F2FD; padding: 2px 6px; border-radius: 3px;">${cands1[1]}</strong>}. <span style="color: #4caf50; font-weight: bold;">Green cells</span> lock these two numbers, so <span style="color: #e53935; font-weight: bold;">red cells</span> in the same row cannot contain them. <em style="color: #666; display: block; margin-top: 8px;">💡 After eliminating these candidates mentally, look for cells with only one remaining option.</em>` 
              };
            }
          }
        }
      }
    }
  }
  return null;
}


function findXWingHint(grid, candidates) {
  for (let v = 1; v <= 9; v++) {
    let rows = [];
    for (let r = 0; r < 9; r++) {
      let cols = [];
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0 && candidates[r][c].has(v)) cols.push(c);
      }
      if (cols.length === 2) rows.push({ r, cols });
    }

    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        if (rows[i].cols[0] === rows[j].cols[0] && rows[i].cols[1] === rows[j].cols[1]) {
          const c1 = rows[i].cols[0], c2 = rows[i].cols[1];
          let targets = [];
          for (let r = 0; r < 9; r++) {
            if (r !== rows[i].r && r !== rows[j].r) {
              if (grid[r][c1] === 0 && candidates[r][c1].has(v)) targets.push({r, c: c1});
              if (grid[r][c2] === 0 && candidates[r][c2].has(v)) targets.push({r, c: col2});
            }
          }
          if (targets.length > 0) return { type: "x_wing", corners: [{r: rows[i].r, c: c1}, {r: rows[i].r, c: c2}, {r: rows[j].r, c: c1}, {r: rows[j].r, c: c2}], value: v, message: `X-Wing: Number ${v} forms a rectangle. Remove ${v} from red cells in columns.` };
        }
      }
    }
  }
  return null;
}


function findYWingHint(grid, candidates) {
  const bivalueCells = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0 && candidates[r][c].size === 2) 
        bivalueCells.push({ r, c, cands: Array.from(candidates[r][c]) });
    }
  }

  for (const pivot of bivalueCells) {
    const [A, B] = pivot.cands;
    const pincers = bivalueCells.filter(cell => {
      if (cell.r === pivot.r && cell.c === pivot.c) return false;
      const sees = (cell.r === pivot.r || cell.c === pivot.c || (Math.floor(cell.r/3) === Math.floor(pivot.r/3) && Math.floor(cell.c/3) === Math.floor(pivot.c/3)));
      return sees && ((cell.cands.includes(A) || cell.cands.includes(B)) && !(cell.cands.includes(A) && cell.cands.includes(B)));
    });

    for (let i = 0; i < pincers.length; i++) {
      for (let j = i + 1; j < pincers.length; j++) {
        const p1 = pincers[i], p2 = pincers[j];
        const common = p1.cands.find(v => p2.cands.includes(v) && v !== A && v !== B);
        if (common) {
          return { type: "y_wing", pivot, pincers: [p1, p2], message: `Y-Wing: Pivot cell (${pivot.r+1},${pivot.c+1}) connects two wings. Remove ${common} from intersecting cells.` };
        }
      }
    }
  }
  return null;
}