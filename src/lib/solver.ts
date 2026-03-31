// Sudoku board type: 9x9 grid of numbers (0 = empty)
export type Board = number[][];

// A single step in the solving process
export interface SolveStep {
  row: number;
  col: number;
  value: number; // 0 means we're clearing (backtracking)
  action: "try" | "place" | "backtrack" | "solved";
  board: Board; // snapshot of the board at this step
  depth: number;
  statesExplored: number;
}

// Check if placing `num` at (row, col) is valid
function isValid(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }

  // Check 3x3 subgrid
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }

  return true;
}

// Deep clone a board
function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

// Find the next empty cell (left-to-right, top-to-bottom)
function findEmpty(board: Board): [number, number] | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return [r, c];
    }
  }
  return null;
}

// Solve with step recording
export function solveSudokuWithSteps(initialBoard: Board): SolveStep[] {
  const steps: SolveStep[] = [];
  const board = cloneBoard(initialBoard);
  let statesExplored = 0;
  let depth = 0;

  function solve(): boolean {
    const empty = findEmpty(board);
    if (!empty) {
      steps.push({
        row: -1,
        col: -1,
        value: 0,
        action: "solved",
        board: cloneBoard(board),
        depth,
        statesExplored,
      });
      return true;
    }

    const [row, col] = empty;
    depth++;

    for (let num = 1; num <= 9; num++) {
      statesExplored++;

      steps.push({
        row,
        col,
        value: num,
        action: "try",
        board: cloneBoard(board),
        depth,
        statesExplored,
      });

      if (isValid(board, row, col, num)) {
        board[row][col] = num;

        steps.push({
          row,
          col,
          value: num,
          action: "place",
          board: cloneBoard(board),
          depth,
          statesExplored,
        });

        if (solve()) return true;

        // Backtrack
        board[row][col] = 0;
        steps.push({
          row,
          col,
          value: 0,
          action: "backtrack",
          board: cloneBoard(board),
          depth,
          statesExplored,
        });
      }
    }

    depth--;
    return false;
  }

  solve();
  return steps;
}

// Solve without steps (just get the solution)
export function solveSudoku(board: Board): Board | null {
  const b = cloneBoard(board);

  function solve(): boolean {
    const empty = findEmpty(b);
    if (!empty) return true;

    const [row, col] = empty;
    for (let num = 1; num <= 9; num++) {
      if (isValid(b, row, col, num)) {
        b[row][col] = num;
        if (solve()) return true;
        b[row][col] = 0;
      }
    }
    return false;
  }

  return solve() ? b : null;
}

// Validate a board (check for conflicts)
export function validateBoard(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val !== 0) {
        board[r][c] = 0;
        if (!isValid(board, r, c, val)) {
          board[r][c] = val;
          return false;
        }
        board[r][c] = val;
      }
    }
  }
  return true;
}

// Count empty cells
export function countEmpty(board: Board): number {
  let count = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) count++;
    }
  }
  return count;
}

// Sample puzzles
export const PRESETS: Record<string, Board> = {
  easy: [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ],
  medium: [
    [0, 0, 0, 6, 0, 0, 4, 0, 0],
    [7, 0, 0, 0, 0, 3, 6, 0, 0],
    [0, 0, 0, 0, 9, 1, 0, 8, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 5, 0, 1, 8, 0, 0, 0, 3],
    [0, 0, 0, 3, 0, 6, 0, 4, 5],
    [0, 4, 0, 2, 0, 0, 0, 6, 0],
    [9, 0, 3, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0, 1, 0, 0],
  ],
  hard: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3, 0, 8, 5],
    [0, 0, 1, 0, 2, 0, 0, 0, 0],
    [0, 0, 0, 5, 0, 7, 0, 0, 0],
    [0, 0, 4, 0, 0, 0, 1, 0, 0],
    [0, 9, 0, 0, 0, 0, 0, 0, 0],
    [5, 0, 0, 0, 0, 0, 0, 7, 3],
    [0, 0, 2, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 4, 0, 0, 0, 9],
  ],
  aibreaker: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1],
  ],
};
