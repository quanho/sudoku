// js/solver.js
export function isValidMove(grid, r, c, v) {
  for (let i = 0; i < 9; i++) {
    if (i !== c && grid[r][i] === v) return false;
    if (i !== r && grid[i][c] === v) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let rr = br; rr < br + 3; rr++) {
    for (let cc = bc; cc < bc + 3; cc++) {
      if ((rr !== r || cc !== c) && grid[rr][cc] === v) return false;
    }
  }
  return true;
}

export function cloneGrid(grid) {
  return grid.map((row) => row.slice());
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function findBestCell(grid) {
  // MRV: choose empty cell with fewest candidates
  let best = null;
  let bestCandidates = null;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) continue;

      const cand = [];
      for (let v = 1; v <= 9; v++) {
        if (isValidMove(grid, r, c, v)) cand.push(v);
      }
      if (cand.length === 0) return { r, c, candidates: [] }; // dead end

      if (!best || cand.length < bestCandidates.length) {
        best = { r, c };
        bestCandidates = cand;
        if (cand.length === 1) return { r, c, candidates: cand };
      }
    }
  }

  if (!best) return null; // solved
  return { r: best.r, c: best.c, candidates: bestCandidates };
}

export function solveInPlace(grid) {
  const cell = findBestCell(grid);
  if (cell === null) return true; // solved
  const { r, c } = cell;
  const candidates = shuffled(cell.candidates);
  if (candidates.length === 0) return false;

  for (const v of candidates) {
    grid[r][c] = v;
    if (solveInPlace(grid)) return true;
    grid[r][c] = 0;
  }
  return false;
}

export function countSolutions(grid, limit = 2) {
  const cell = findBestCell(grid);
  if (cell === null) return 1; // found 1 solution
  const { r, c } = cell;
  const candidates = cell.candidates; // no need to shuffle for counting
  if (candidates.length === 0) return 0;

  let total = 0;
  for (const v of candidates) {
    grid[r][c] = v;
    total += countSolutions(grid, limit);
    grid[r][c] = 0;
    if (total >= limit) break;
  }
  return total;
}
