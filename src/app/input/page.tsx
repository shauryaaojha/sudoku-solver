"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Board,
  PRESETS,
  SolverMode,
  solveSudoku,
  validateBoard,
  countEmpty,
} from "@/lib/solver";

export default function ManualInputPage() {
  const router = useRouter();
  const [board, setBoard] = useState<Board>(
    Array.from({ length: 9 }, () => Array(9).fill(0))
  );
  const [solverMode, setSolverMode] = useState<SolverMode>("classic");
  const [error, setError] = useState<string | null>(null);
  const [solvedBoard, setSolvedBoard] = useState<Board | null>(null);

  const handleCellChange = (row: number, col: number, value: string) => {
    const num = parseInt(value);
    const newBoard = board.map((r) => [...r]);
    if (value === "" || value === "0") {
      newBoard[row][col] = 0;
    } else if (num >= 1 && num <= 9) {
      newBoard[row][col] = num;
    }
    setBoard(newBoard);
    setSolvedBoard(null);
    setError(null);
  };

  const handleSolve = () => {
    const boardCopy = board.map((r) => [...r]);
    if (!validateBoard(boardCopy)) {
      setError("Invalid puzzle — conflicting digits detected.");
      return;
    }

    if (countEmpty(boardCopy) === 81) {
      setError("Grid is empty. Enter some numbers first.");
      return;
    }

    const solution = solveSudoku(boardCopy, solverMode);
    if (solution) {
      setSolvedBoard(solution);
      setError(null);
    } else {
      setError("No solution exists for this configuration.");
    }
  };

  const handleClear = () => {
    setBoard(Array.from({ length: 9 }, () => Array(9).fill(0)));
    setSolvedBoard(null);
    setError(null);
  };

  const loadPreset = (key: string) => {
    const preset = PRESETS[key];
    if (preset) {
      setBoard(preset.map((r) => [...r]));
      setSolvedBoard(null);
      setError(null);
    }
  };

  const getCellClasses = (row: number, col: number): string => {
    const classes: string[] = [
      "w-full",
      "h-full",
      "aspect-[1/1]",
      "text-center",
      "text-lg",
      "md:text-2xl",
      "font-medium",
      "transition-all",
      "duration-150",
      "border-r",
      "border-b",
      "border-zinc-200",
      "outline-none",
      "focus:bg-zinc-50"
    ];

    if (col === 8) classes.push("border-r-0");
    if (row === 8) classes.push("border-b-0");

    if ((col + 1) % 3 === 0 && col < 8) classes.push("!border-r-zinc-400 !border-r-2");
    if ((row + 1) % 3 === 0 && row < 8) classes.push("!border-b-zinc-400 !border-b-2");

    if (solvedBoard && board[row][col] === 0 && solvedBoard[row][col] !== 0) {
      classes.push("bg-zinc-100/50 text-zinc-500");
    } else if (board[row][col] !== 0) {
      classes.push("bg-zinc-50/50 text-zinc-900 font-semibold");
    } else {
      classes.push("bg-transparent text-zinc-900");
    }

    return classes.join(" ");
  };

  const displayBoard = solvedBoard || board;

  return (
    <div className="pb-24 px-4 w-full max-w-5xl mx-auto pt-8 flex flex-col lg:flex-row gap-8">
      {/* Input Section */}
      <div className="lg:w-2/3 flex flex-col gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900">
            Manual Input
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-2">
            Precision-grid entry for algorithmic processing
          </p>
        </div>

        {/* Sudoku Input Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 flex justify-center items-center">
          <div className="grid grid-cols-9 w-full max-w-sm border-2 border-zinc-400 rounded-xl overflow-hidden">
            {displayBoard.map((row, r) =>
              row.map((cell, c) => (
                <input
                  key={`${r}-${c}`}
                  type="number"
                  min="1"
                  max="9"
                  value={cell !== 0 ? cell : ""}
                  onChange={(e) => handleCellChange(r, c, e.target.value)}
                  className={getCellClasses(r, c)}
                  readOnly={solvedBoard !== null}
                />
              ))
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Algorithm Mode
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Switch between the basic recursive solver and the faster MRV-based solver.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSolverMode("classic")}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  solverMode === "classic"
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                Classic
              </button>
              <button
                onClick={() => setSolverMode("fast")}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  solverMode === "fast"
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                Fast
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <button
            onClick={handleSolve}
            className="px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-md"
          >
            Solve ({solverMode === "fast" ? "Fast" : "Classic"})
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
          >
            Clear Grid
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
          >
            Open in Visualizer →
          </button>
        </div>
      </div>

      {/* Right Sidebar — Presets */}
      <div className="lg:w-1/3 flex flex-col gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">
            Complexity Presets
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { key: "easy", label: "Level 01", name: "Easy", desc: "Structural baseline for beginner logic." },
              { key: "medium", label: "Level 02", name: "Medium", desc: "Enhanced entropy requirements." },
              { key: "hard", label: "Level 03", name: "Hard", desc: "Sparse data sets for heuristic analysis." },
            ].map(preset => (
              <button
                key={preset.key}
                onClick={() => loadPreset(preset.key)}
                className="flex flex-col items-start p-4 rounded-xl border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 transition-all text-left bg-white"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                  {preset.label}
                </span>
                <span className="text-base font-bold text-zinc-900 tracking-tight">
                  {preset.name}
                </span>
                <span className="text-xs text-zinc-500 mt-1">
                  {preset.desc}
                </span>
              </button>
            ))}

            {/* AI Breaker */}
            <button
              onClick={() => loadPreset("aibreaker")}
              className="flex flex-col items-start p-4 rounded-xl border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-sm text-left"
            >
              <div className="flex justify-between items-center w-full mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Critical Node
                </span>
                <span className="material-symbols-outlined text-[16px] text-yellow-400">bolt</span>
              </div>
              <span className="text-base font-bold tracking-tight">
                AI Breaker
              </span>
              <span className="text-xs text-zinc-400 mt-1">
                Logical contradictions to test efficiency.
              </span>
            </button>
          </div>
        </div>

        {/* Quote Card */}
        <div className="bg-zinc-100 rounded-2xl border border-zinc-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-zinc-300"></div>
          <p className="text-sm italic text-zinc-600 leading-relaxed pl-2">
            &ldquo;The grid is a vessel for recursive logic. Every digit
            placed is a collapsed superposition of 1 through 9.&rdquo;
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-4 pl-2">
            Archivist Notes v4.2
          </p>
        </div>
      </div>
    </div>
  );
}
