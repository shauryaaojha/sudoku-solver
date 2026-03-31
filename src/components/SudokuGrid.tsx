"use client";

import { Board } from "@/lib/solver";

interface SudokuGridProps {
  board: Board;
  givenCells?: boolean[][];
  activeCell?: { row: number; col: number } | null;
  activeCellAction?: "try" | "place" | "backtrack" | "solved" | null;
}

export default function SudokuGrid({
  board,
  givenCells,
  activeCell,
  activeCellAction,
}: SudokuGridProps) {
  function getCellClasses(row: number, col: number): string {
    const classes: string[] = [
      "flex",
      "aspect-square",
      "items-center",
      "justify-center",
      "border-b",
      "border-r",
      "border-zinc-200",
      "text-base",
      "font-bold",
      "transition-all",
      "duration-150",
      "sm:text-xl",
      "lg:text-2xl",
    ];

    if (col === 8) classes.push("border-r-0");
    if (row === 8) classes.push("border-b-0");

    if ((col + 1) % 3 === 0 && col < 8) classes.push("!border-r-2", "!border-r-zinc-500");
    if ((row + 1) % 3 === 0 && row < 8) classes.push("!border-b-2", "!border-b-zinc-500");

    if (givenCells?.[row]?.[col]) {
      classes.push("bg-stone-50", "text-zinc-950");
    } else {
      classes.push("bg-white", "text-zinc-700");
    }

    if (activeCell && activeCell.row === row && activeCell.col === col) {
      if (activeCellAction === "backtrack") {
        classes.push("!bg-amber-100", "!text-zinc-950");
      } else if (activeCellAction === "try") {
        classes.push("!bg-[var(--accent-soft)]", "!text-zinc-950");
      } else if (activeCellAction === "place") {
        classes.push("!bg-zinc-950", "!text-white", "shadow-inner");
      }
    }

    return classes.join(" ");
  }

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div className="overflow-hidden rounded-[1.5rem] border-[3px] border-zinc-950 bg-white shadow-[0_20px_40px_rgba(24,24,27,0.08)]">
        <div className="grid grid-cols-9">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div key={`${r}-${c}`} className={getCellClasses(r, c)}>
                {cell !== 0 ? cell : ""}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
