// js/ui.js
import { isValidMove } from "./solver.js";
import { isValidMove as isValidMove6x6 } from "./solver6x6.js";
import { generateSudoku } from "./generator.js";
import { generate6x6Sudoku } from "./generator6x6.js";
import { findHumanHint } from "./hint.js";
import { findHumanHint6x6 } from "./hint6x6.js";

const gridEl = document.getElementById("grid");
const coachEl = document.getElementById("coach");
const newGameBtn = document.getElementById("newGame");
const eraseBtn = document.getElementById("erase");
const undoBtn = document.getElementById("undo");
const hintBtn = document.getElementById("hint");
const gridSizeSelect = document.getElementById("gridSize");
const keypadEl = document.getElementById("keypad");
const timerEl = document.getElementById("timer");
let hintPeers = null; // Set của "r,c"
let gridSize = 9; // Current grid size (6 or 9)
let highlightedNumber = null; // Track which number is being highlighted
let shownEliminationHints = new Set(); // Track shown elimination hints to avoid repeating

// Timer variables
let timerSeconds = 0;
let timerInterval = null;

hintBtn.addEventListener("click", () => {
  const hint = gridSize === 6 ? findHumanHint6x6(puzzle) : findHumanHint(puzzle);

  if (!hint) {
    coachEl.textContent = "No hint found. You may need advanced techniques or the puzzle is complete!";
    hintPeers = null;
    render();
    return;
  }

  // Handle elimination techniques (locked_candidates, naked_pair, hidden_pair, x_wing, y_wing)
  const eliminationTechniques = ["locked_candidates", "naked_pair", "hidden_pair", "x_wing", "y_wing"];
  
  if (eliminationTechniques.includes(hint.type)) {
    coachEl.innerHTML = hint.message;
    hintPeers = null;
    
    // Render first to ensure cells exist with data attributes
    render();
    
    // Then add highlights
    // Highlight pincers/cells (cells containing the pattern) in green
    if (hint.pincers) {
      hint.pincers.forEach(p => {
        const el = document.querySelector(`[data-r="${p.r}"][data-c="${p.c}"]`);
        if (el) el.classList.add('hint-pincer');
      });
    }
    
    if (hint.cells) {
      hint.cells.forEach(c => {
        const el = document.querySelector(`[data-r="${c.r}"][data-c="${c.c}"]`);
        if (el) el.classList.add('hint-pincer');
      });
    }
    
    // Highlight targets (cells to eliminate from) in red
    if (hint.targets) {
      hint.targets.forEach(t => {
        const el = document.querySelector(`[data-r="${t.r}"][data-c="${t.c}"]`);
        if (el) el.classList.add('hint-target');
      });
    }
    
    return;
  }

  // For direct placement techniques (naked_single, hidden_single)
  selected = { r: hint.r, c: hint.c };
  hintPeers = hint.peers || null;        // <- important

  // If you want hint to fill automatically, enable this line:
  // setCellValue(hint.v);

  // If you want hint to only suggest, not auto-fill:
  coachEl.innerHTML = hint.message;
  render();
});

let puzzle = makeEmpty();
let given = makeEmptyBool();
let selected = { r: 0, c: 0 };
let undoStack = [];

// Demo puzzle (0 là ô trống). Bạn sẽ thay bằng generator sau.
const DEMO = [
  [0, 0, 0, 2, 6, 0, 7, 0, 1],
  [6, 8, 0, 0, 7, 0, 0, 9, 0],
  [1, 9, 0, 0, 0, 4, 5, 0, 0],

  [8, 2, 0, 1, 0, 0, 0, 4, 0],
  [0, 0, 4, 6, 0, 2, 9, 0, 0],
  [0, 5, 0, 0, 0, 3, 0, 2, 8],

  [0, 0, 9, 3, 0, 0, 0, 7, 4],
  [0, 4, 0, 0, 5, 0, 0, 3, 6],
  [7, 0, 3, 0, 1, 8, 0, 0, 0],
];

function makeEmpty() { 
  return Array.from({ length: gridSize }, () => Array(gridSize).fill(0)); 
}

function makeEmptyBool() { 
  return Array.from({ length: gridSize }, () => Array(gridSize).fill(false)); 
}

function loadPuzzle(puz) {
  puzzle = puz.map(row => row.slice());
  given = puz.map(row => row.map(v => v !== 0));
  undoStack = [];
  shownEliminationHints = new Set(); // Reset hints tracking
  highlightedNumber = null;
  startTimer();
  render();
  coachEl.textContent = "Tip: look for cells with only one option (naked single).";
}

function startTimer() {
  // Reset và bắt đầu timer mới
  timerSeconds = 0;
  updateTimerDisplay();
  
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  timerEl.textContent = `Time: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function isPuzzleComplete() {
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (puzzle[r][c] === 0) return false;
    }
  }
  return true;
}

function showCelebration() {
  stopTimer();
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  coachEl.innerHTML = `🎉 <strong>Congratulations!</strong> You won! 🎊<br>Time: ${timeStr}`;
  
  // Play victory sound
  playVictorySound();
  
  // Create confetti effect
  createConfetti();
}

function playVictorySound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Epic triumphant melody with flourishes (~2.6 seconds)
    const melody = [
      // Opening fanfare with flourish
      { freq: 523.25, time: 0.00, duration: 0.19 }, // C5
      { freq: 659.25, time: 0.10, duration: 0.12 }, // E5 (grace note)
      { freq: 783.99, time: 0.16, duration: 0.19 }, // G5
      { freq: 1046.50, time: 0.31, duration: 0.24 }, // C6

      { freq: 987.77, time: 0.58, duration: 0.14 }, // B5
      { freq: 1046.50, time: 0.68, duration: 0.24 }, // C6

      // Build-up with excitement
      { freq: 1174.66, time: 0.94, duration: 0.19 }, // D6
      { freq: 1318.51, time: 1.10, duration: 0.19 }, // E6
      { freq: 1568.00, time: 1.25, duration: 0.29 }, // G6
      { freq: 1760.00, time: 1.45, duration: 0.15 }, // A6 (extra high note!)

      // Direct to triumphant finale
      { freq: 1318.51, time: 1.57, duration: 0.19 }, // E6
      { freq: 1568.00, time: 1.73, duration: 0.24 }, // G6
      { freq: 2093.00, time: 1.94, duration: 0.67 }, // C7 (glorious finale!)
    ];
    
    // Stronger bass line
    const bass = [
      { freq: 130.81, time: 0, duration: 0.57 },
      { freq: 196.00, time: 0.52, duration: 0.57 },
      { freq: 261.63, time: 1.05, duration: 0.57 },
      { freq: 196.00, time: 1.57, duration: 0.57 },
      { freq: 130.81, time: 2.09, duration: 1.05 },
    ];
    
    // Richer chord progression
    const chords = [
      { freqs: [523.25, 659.25, 783.99, 1046.50], time: 0, duration: 0.48 },    // Full C chord
      { freqs: [783.99, 987.77, 1174.66, 1568.00], time: 0.52, duration: 0.48 }, // Full G chord
      { freqs: [523.25, 659.25, 1046.50, 1318.51], time: 1.05, duration: 0.48 }, // Rich C chord
      { freqs: [783.99, 987.77, 1174.66, 1568.00], time: 1.57, duration: 0.48 }, // Full G chord
      { freqs: [523.25, 659.25, 783.99, 1046.50, 1318.51], time: 2.09, duration: 1.05 }, // Massive C chord!
    ];
    
    // Play melody
    melody.forEach(note => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = note.freq;
      oscillator.type = 'sine'; // Smoothest wave
      
      const startTime = audioContext.currentTime + note.time;
      
      // Slightly louder for more triumphant sound
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.22, startTime + 0.05);
      gainNode.gain.setValueAtTime(0.22, startTime + note.duration - 0.1);
      gainNode.gain.linearRampToValueAtTime(0, startTime + note.duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + note.duration);
    });
    
    // Play bass
    bass.forEach(note => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = note.freq;
      oscillator.type = 'sine'; // Deep bass
      
      const startTime = audioContext.currentTime + note.time;
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + note.duration);
    });
    
    // Play chords
    chords.forEach(chord => {
      chord.freqs.forEach(freq => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'square'; // Bright, energetic sound
        
        const startTime = audioContext.currentTime + chord.time;
        gainNode.gain.setValueAtTime(0.08, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + chord.duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + chord.duration);
      });
    });
    
  } catch (e) {
    console.log('Audio not supported:', e);
  }
}

function createConfetti() {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'];
  const confettiCount = 200;  // Confetti for celebration
  const streamerCount = 30;   // Streamers
  const musicDuration = 2600; // 2.6 seconds celebration
  
  // Create confetti pieces - spread evenly over 2 seconds
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = '0s';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      document.body.appendChild(confetti);
      
      // Remove after animation
      setTimeout(() => confetti.remove(), 5000);
    }, (i / confettiCount) * musicDuration);
  }
  
  // Create streamers/ribbons - spread evenly over 2 seconds
  for (let i = 0; i < streamerCount; i++) {
    setTimeout(() => {
      const streamer = document.createElement('div');
      streamer.className = 'streamer';
      streamer.style.left = Math.random() * 100 + '%';
      streamer.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      streamer.style.animationDelay = '0s';
      streamer.style.animationDuration = (Math.random() * 1.5 + 2.5) + 's';
      document.body.appendChild(streamer);
      
      // Remove after animation
      setTimeout(() => streamer.remove(), 5000);
    }, (i / streamerCount) * musicDuration);
  }
}

function render() {
  gridEl.innerHTML = "";
  gridEl.setAttribute('data-size', gridSize);
  
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const d = document.createElement("div");
      d.className = "cell";
      d.dataset.r = r;
      d.dataset.c = c;

      if (given[r][c]) d.classList.add("given");
      if (selected.r === r && selected.c === c) d.classList.add("selected");
      
      // Box borders - different for 6x6 vs 9x9
      if (gridSize === 9) {
        if (r === 2 || r === 5) d.classList.add("r3");
        if (c === 2 || c === 5) d.classList.add("c3");
      } else if (gridSize === 6) {
        if (r === 1 || r === 3) d.classList.add("r2");
        if (c === 2) d.classList.add("c3");
      }

      // highlight peers
      const key = `${r},${c}`;
      if (hintPeers && hintPeers.has(key)) {
        d.classList.add("peer");
        if (puzzle[r][c] !== 0) d.classList.add("blocker"); // có số => “đang chặn”
      }

      const v = puzzle[r][c];
      d.textContent = v === 0 ? "" : String(v);
      
      // Highlight all cells with the same number when clicked from keypad
      if (highlightedNumber !== null && v === highlightedNumber) {
        d.classList.add("highlight-number");
      }

      d.addEventListener("click", () => {
        selected = { r, c };
        hintPeers = null;     // click tay thì tắt highlight hint
        highlightedNumber = null; // clear number highlight when clicking cell
        render();
      });

      gridEl.appendChild(d);
    }
  }
  
  // Update keypad - hide buttons for numbers that are complete
  updateKeypad();
}

function updateKeypad() {
  // Count how many times each number appears in the grid
  const counts = {};
  for (let n = 1; n <= gridSize; n++) {
    counts[n] = 0;
  }
  
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const v = puzzle[r][c];
      if (v !== 0) counts[v]++;
    }
  }
  
  // Hide buttons for complete numbers (use visibility to keep position)
  const buttons = keypadEl.querySelectorAll('button');
  buttons.forEach(btn => {
    const num = parseInt(btn.dataset.n);
    if (counts[num] >= gridSize) {
      btn.style.visibility = 'hidden';
    } else {
      btn.style.visibility = 'visible';
    }
  });
}


function setCellValue(v) {
  const { r, c } = selected;
  
  const prev = puzzle[r][c];
  
  // If erase (v === 0), always erase the cell
  if (v === 0) {
    highlightedNumber = null;
    if (prev === 0) return; // Already empty, nothing to erase
    
    undoStack.push({ r, c, prev });
    puzzle[r][c] = 0;
    coachEl.textContent = "Cell erased.";
    render();
    return;
  }
  
  // If cell has any number (given or user-filled), clicking keypad highlights that number
  if (prev !== 0) {
    highlightedNumber = v;
    render();
    return;
  }
  
  // Cell is empty - fill it with the number
  highlightedNumber = null;
  
  if (prev === v) return;

  // Check if move is valid before placing
  const validateFn = gridSize === 6 ? isValidMove6x6 : isValidMove;
  if (!validateFn(puzzle, r, c, v)) {
    coachEl.textContent = "Invalid: this number conflicts with row/col/box.";
    return;
  }

  undoStack.push({ r, c, prev });
  puzzle[r][c] = v;
  
  // Check if puzzle is complete
  if (isPuzzleComplete()) {
    render();
    setTimeout(() => showCelebration(), 300);
  } else {
    coachEl.textContent = "Good. Continue looking for cells with few options.";
    render();
  }
}

eraseBtn.addEventListener("click", () => setCellValue(0));

undoBtn.addEventListener("click", () => {
  const last = undoStack.pop();
  if (!last) return;
  puzzle[last.r][last.c] = last.prev;
  render();
});

const difficultyEl = document.getElementById("difficulty");

// Grid size change handler
gridSizeSelect.addEventListener("change", () => {
  gridSize = parseInt(gridSizeSelect.value);
  
  // Update keypad
  keypadEl.innerHTML = "";
  keypadEl.setAttribute('data-size', gridSize);
  
  for (let n = 1; n <= gridSize; n++) {
    const btn = document.createElement("button");
    btn.dataset.n = n;
    btn.textContent = n;
    btn.addEventListener("click", () => setCellValue(n));
    keypadEl.appendChild(btn);
  }
  
  coachEl.textContent = `Switched to ${gridSize}×${gridSize} mode. Click "New game" to start.`;
});

newGameBtn.addEventListener("click", () => {
  const diff = difficultyEl.value;
  
  console.log(`New game clicked: ${gridSize}x${gridSize}, difficulty: ${diff}`);
  
  // Show loading state
  newGameBtn.disabled = true;
  newGameBtn.textContent = "Generating...";
  coachEl.textContent = `Generating ${gridSize}×${gridSize} ${diff} puzzle...`;
  
  // Generate in next tick to allow UI update
  setTimeout(() => {
    try {
      console.log(`Calling generator for ${gridSize}x${gridSize}...`);
      const result = gridSize === 6 
        ? generate6x6Sudoku(diff)
        : generateSudoku(diff);
      
      console.log(`Generated puzzle:`, result);
      
      // Display difficulty info in console
      if (gridSize === 9) {
        const diffInfo = result.actualDifficulty === diff 
          ? `✓ ${diff.charAt(0).toUpperCase() + diff.slice(1)} puzzle` 
          : `⚠ Generated ${result.actualDifficulty} puzzle (requested ${diff})`;
        
        const t = result.techniques || {};
        const techInfo = `${result.clues} clues | NS:${t.nakedSingle||0} HS:${t.hiddenSingle||0} LC:${t.lockedCandidates||0}`;
        
        console.log(`${diffInfo} | ${techInfo} | Score: ${result.score||0} | ${result.timeMs}ms`);
      } else {
        console.log(`6×6 ${diff} | ${result.clues} clues | ${result.timeMs}ms`);
      }
      
      loadPuzzle(result.puzzle);
      
      // Show brief success message
      coachEl.textContent = `${gridSize}×${gridSize} ${diff.charAt(0).toUpperCase() + diff.slice(1)} puzzle generated. Good luck!`;
    } catch (error) {
      console.error("Generation error:", error);
      console.error("Stack trace:", error.stack);
      coachEl.textContent = "Error generating puzzle. Please try again.";
    } finally {
      newGameBtn.disabled = false;
      newGameBtn.textContent = "New game";
    }
  }, 10);
});


// Initialize keypad
for (let n = 1; n <= gridSize; n++) {
  const btn = document.createElement("button");
  btn.dataset.n = n;
  btn.textContent = n;
  btn.addEventListener("click", () => setCellValue(n));
  keypadEl.appendChild(btn);
}

// init - Generate a new random puzzle instead of loading the demo
const initialDifficulty = document.getElementById("difficulty").value || "medium";
const initialPuzzle = gridSize === 6 ? generate6x6Sudoku(initialDifficulty) : generateSudoku(initialDifficulty);
loadPuzzle(initialPuzzle.puzzle);
