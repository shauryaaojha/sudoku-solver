# Sudoku Solver

Sudoku Solver is a Next.js project focused on one main idea: visualizing how a Sudoku puzzle is solved using recursion and backtracking.

Instead of only showing the final solved grid, this project lets people follow the actual decision process of the algorithm:

- finding the next empty cell
- trying candidate numbers
- placing valid values
- backtracking when a branch fails
- reaching the solved base case

Repository: [github.com/shauryaaojha/sudoku-solver](https://github.com/shauryaaojha/sudoku-solver)

## What the project includes

### 1. Visualizer
The homepage is the main experience of the project.

It shows:

- a Sudoku board
- recursion depth
- explored states
- playback controls
- a readable recursion log
- a current-step explanation panel

This makes it easier to understand what the recursive solver is doing at each moment.

### 2. Manual Input
The manual input page lets users enter their own Sudoku puzzle and solve it directly.

This is useful for:

- testing custom boards
- checking whether a puzzle is valid
- comparing the entered puzzle with the solved result

### 3. Theory Page
The theory page explains the actual logic used in the codebase.

It covers:

- Sudoku as a constrained search problem
- the `isValid` function
- first-empty-cell backtracking
- time and space complexity
- how the visualizer maps solver events to UI events

## How the solver works

The solver uses classic depth-first recursive backtracking.

High-level flow:

1. Find the next empty cell in the board.
2. Try digits `1` through `9`.
3. For each digit, check whether it is valid in the row, column, and 3x3 box.
4. If valid, place it and recurse.
5. If the recursive branch fails, clear the cell and try the next digit.
6. If no empty cell remains, the puzzle is solved.

This project intentionally keeps the algorithm simple and educational instead of heavily optimized.

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## Project structure

```text
src/
  app/
    page.tsx          # Visualizer homepage
    input/page.tsx    # Manual puzzle input
    theory/page.tsx   # Theory and explanation
    layout.tsx        # Shared app shell
    globals.css       # Global styling
  components/
    Navbar.tsx
    Footer.tsx
    SudokuGrid.tsx
  lib/
    solver.ts         # Core solver + step recording
```

## Getting started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Why this project is useful

Many Sudoku solvers only focus on getting the answer. This project is more useful for learning because it shows the reasoning path of the algorithm.

It is a good project for:

- students learning recursion
- understanding backtracking visually
- demonstrating constraint checking
- showing how recursive search behaves on real puzzles

## Future improvements

- stronger solving heuristics
- richer visual highlights for row, column, and box checks
- side-by-side comparison between recursion and optimized strategies
- puzzle import/export

## Author

Shaurya Ojha

GitHub: [@shauryaaojha](https://github.com/shauryaaojha)
