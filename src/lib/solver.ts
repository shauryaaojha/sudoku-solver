export type Board = number[][];

export type SolverMode = "classic" | "fast";

export interface SolveStep {
  row: number;
  col: number;
  value: number;
  action: "try" | "place" | "backtrack" | "solved";
  board: Board;
  depth: number;
  statesExplored: number;
}

type Position = [number, number];

const FULL_MASK = 0b1111111110;

function boxIndex(row: number, col: number): number {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

function digitMask(num: number): number {
  return 1 << num;
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function isValid(board: Board, row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }

  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }

  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }

  return true;
}

function findEmpty(board: Board): Position | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return [r, c];
    }
  }
  return null;
}

function createUsageMasks(board: Board): {
  rowMasks: number[];
  colMasks: number[];
  boxMasks: number[];
} {
  const rowMasks = Array(9).fill(0);
  const colMasks = Array(9).fill(0);
  const boxMasks = Array(9).fill(0);

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = board[row][col];
      if (value === 0) continue;

      const mask = digitMask(value);
      rowMasks[row] |= mask;
      colMasks[col] |= mask;
      boxMasks[boxIndex(row, col)] |= mask;
    }
  }

  return { rowMasks, colMasks, boxMasks };
}

function getCandidateMask(
  rowMasks: number[],
  colMasks: number[],
  boxMasks: number[],
  row: number,
  col: number
): number {
  const usedMask = rowMasks[row] | colMasks[col] | boxMasks[boxIndex(row, col)];
  return FULL_MASK & ~usedMask;
}

function maskToDigits(mask: number): number[] {
  const digits: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (mask & digitMask(num)) digits.push(num);
  }
  return digits;
}

function bitCount(mask: number): number {
  let value = mask;
  let count = 0;
  while (value > 0) {
    value &= value - 1;
    count++;
  }
  return count;
}

function findBestEmptyCell(
  board: Board,
  rowMasks: number[],
  colMasks: number[],
  boxMasks: number[]
): { row: number; col: number; candidates: number[] } | null {
  let best: { row: number; col: number; candidates: number[] } | null = null;
  let bestCount = Number.POSITIVE_INFINITY;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== 0) continue;

      const candidateMask = getCandidateMask(rowMasks, colMasks, boxMasks, row, col);
      const candidateCount = bitCount(candidateMask);

      if (candidateCount === 0) {
        return { row, col, candidates: [] };
      }

      if (candidateCount < bestCount) {
        best = { row, col, candidates: maskToDigits(candidateMask) };
        bestCount = candidateCount;

        if (bestCount === 1) return best;
      }
    }
  }

  return best;
}

function placeDigit(
  board: Board,
  rowMasks: number[],
  colMasks: number[],
  boxMasks: number[],
  row: number,
  col: number,
  value: number
) {
  const mask = digitMask(value);
  board[row][col] = value;
  rowMasks[row] |= mask;
  colMasks[col] |= mask;
  boxMasks[boxIndex(row, col)] |= mask;
}

function removeDigit(
  board: Board,
  rowMasks: number[],
  colMasks: number[],
  boxMasks: number[],
  row: number,
  col: number,
  value: number
) {
  const mask = digitMask(value);
  board[row][col] = 0;
  rowMasks[row] &= ~mask;
  colMasks[col] &= ~mask;
  boxMasks[boxIndex(row, col)] &= ~mask;
}

export function solveSudokuWithSteps(
  initialBoard: Board,
  mode: SolverMode = "classic"
): SolveStep[] {
  return mode === "fast"
    ? solveSudokuWithStepsFast(initialBoard)
    : solveSudokuWithStepsClassic(initialBoard);
}

function solveSudokuWithStepsClassic(initialBoard: Board): SolveStep[] {
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

function solveSudokuWithStepsFast(initialBoard: Board): SolveStep[] {
  const steps: SolveStep[] = [];
  const board = cloneBoard(initialBoard);
  const { rowMasks, colMasks, boxMasks } = createUsageMasks(board);
  let statesExplored = 0;
  let depth = 0;

  function solve(): boolean {
    const nextCell = findBestEmptyCell(board, rowMasks, colMasks, boxMasks);
    if (!nextCell) {
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

    const { row, col, candidates } = nextCell;
    if (candidates.length === 0) {
      return false;
    }

    depth++;

    for (const num of candidates) {
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

      placeDigit(board, rowMasks, colMasks, boxMasks, row, col, num);

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

      removeDigit(board, rowMasks, colMasks, boxMasks, row, col, num);
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

    depth--;
    return false;
  }

  solve();
  return steps;
}

export function solveSudoku(board: Board, mode: SolverMode = "classic"): Board | null {
  return mode === "fast" ? solveSudokuFast(board) : solveSudokuClassic(board);
}

function solveSudokuClassic(board: Board): Board | null {
  const workingBoard = cloneBoard(board);

  function solve(): boolean {
    const empty = findEmpty(workingBoard);
    if (!empty) return true;

    const [row, col] = empty;
    for (let num = 1; num <= 9; num++) {
      if (isValid(workingBoard, row, col, num)) {
        workingBoard[row][col] = num;
        if (solve()) return true;
        workingBoard[row][col] = 0;
      }
    }
    return false;
  }

  return solve() ? workingBoard : null;
}

function solveSudokuFast(board: Board): Board | null {
  const workingBoard = cloneBoard(board);
  const { rowMasks, colMasks, boxMasks } = createUsageMasks(workingBoard);

  function solve(): boolean {
    const nextCell = findBestEmptyCell(workingBoard, rowMasks, colMasks, boxMasks);
    if (!nextCell) return true;

    const { row, col, candidates } = nextCell;
    if (candidates.length === 0) return false;

    for (const value of candidates) {
      placeDigit(workingBoard, rowMasks, colMasks, boxMasks, row, col, value);
      if (solve()) return true;
      removeDigit(workingBoard, rowMasks, colMasks, boxMasks, row, col, value);
    }

    return false;
  }

  return solve() ? workingBoard : null;
}

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

export function countEmpty(board: Board): number {
  let count = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) count++;
    }
  }
  return count;
}

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
