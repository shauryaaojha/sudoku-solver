"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SudokuGrid from "@/components/SudokuGrid";
import {
  Board,
  SolveStep,
  SolverMode,
  solveSudokuWithSteps,
  PRESETS,
  countEmpty,
} from "@/lib/solver";

type LogEntry = { text: string; type: string; depth: number };

const presetOptions = [
  { key: "easy", label: "Easy", hint: "Balanced starting grid" },
  { key: "medium", label: "Medium", hint: "More open branches" },
  { key: "hard", label: "Hard", hint: "Deep search pressure" },
  { key: "aibreaker", label: "AI Breaker", hint: "Stress-test recursion" },
];

export default function VisualizerPage() {
  const [baseBoard, setBaseBoard] = useState<Board>(PRESETS.easy.map((r) => [...r]));
  const [selectedPreset, setSelectedPreset] = useState("Easy");
  const [solverMode, setSolverMode] = useState<SolverMode>("classic");
  const [givenCells, setGivenCells] = useState<boolean[][]>(
    PRESETS.easy.map((r) => r.map((c) => c !== 0))
  );
  const [steps, setSteps] = useState<SolveStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(22);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const originalBoard = useRef<Board>(PRESETS.easy.map((r) => [...r]));
  const currentStepData = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
  const board = currentStepData?.board ?? baseBoard;
  const recursionDepth = currentStepData?.depth ?? 0;
  const statesExplored = currentStepData?.statesExplored ?? 0;
  const activeCell =
    currentStepData && currentStepData.action !== "solved"
      ? { row: currentStepData.row, col: currentStepData.col }
      : null;
  const activeCellAction = currentStepData?.action ?? null;
  const isSolved = currentStepData?.action === "solved";
  const logEntries = buildLogEntries(steps, currentStep);

  const totalCells = 81;
  const filledCells = board.flat().filter((c) => c !== 0).length;
  const coverage = Math.round((filledCells / totalCells) * 100);
  const emptyCells = countEmpty(baseBoard);
  const progressLabel =
    steps.length > 0 && currentStep >= 0 ? `${currentStep + 1}/${steps.length}` : "0/0";

  const getDelay = useCallback(() => {
    return Math.max(180, Math.round(1900 - (speed / 100) * 1650));
  }, [speed]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logEntries]);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          if (prev + 1 >= steps.length - 1) {
            setIsPlaying(false);
          }
          return prev + 1;
        });
      }, getDelay());
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, steps, getDelay, currentStep]);

  const handleSolve = () => {
    const generatedSteps = solveSudokuWithSteps(
      originalBoard.current.map((r) => [...r]),
      solverMode
    );

    setSteps(generatedSteps);
    setCurrentStep(-1);

    setTimeout(() => {
      setCurrentStep(0);
      setIsPlaying(true);
    }, 100);
  };

  const handleStepThrough = () => {
    if (steps.length === 0) {
      const generatedSteps = solveSudokuWithSteps(
        originalBoard.current.map((r) => [...r]),
        solverMode
      );
      setSteps(generatedSteps);
      setCurrentStep(0);
    } else if (currentStep < steps.length - 1) {
      setIsPlaying(false);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStep(-1);
  };

  const loadPreset = (key: string) => {
    const preset = PRESETS[key];
    if (!preset) return;

    handleReset();
    const newBoard = preset.map((r) => [...r]);
    originalBoard.current = newBoard;
    setBaseBoard(newBoard.map((r) => [...r]));
    const match = presetOptions.find((option) => option.key === key);
    setSelectedPreset(match?.label ?? "Custom");
    setGivenCells(preset.map((r) => r.map((c) => c !== 0)));
  };

  const getStatusText = () => {
    if (isSolved) return "Solved. All row, column, and box constraints hold.";
    if (isPlaying) {
      return `Running ${solverMode === "fast" ? "the faster MRV solver" : "classic backtracking"} at depth ${recursionDepth} across ${statesExplored} explored states.`;
    }
    if (steps.length > 0 && currentStep >= 0) {
      return `Paused on step ${currentStep + 1} of ${steps.length}. Resume, step, or reset from this point.`;
    }
    return `Ready to execute in ${solverMode === "fast" ? "fast" : "classic"} mode. ${emptyCells} empty cells remain in the selected puzzle.`;
  };

  const getLogTone = (type: string) => {
    switch (type) {
      case "place":
        return "text-white bg-white/10";
      case "backtrack":
        return "text-amber-100 bg-white/5";
      case "solved":
        return "text-emerald-200 bg-emerald-400/10";
      case "init":
        return "text-zinc-500";
      default:
        return "text-zinc-300";
    }
  };

  const currentActionText = getCurrentActionText(currentStepData);
  const visibleLogEntries = logEntries.slice(-8);

  return (
    <section className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
        <section className="panel-card rounded-[2rem] px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.24em] text-[var(--accent)]">
                Sudoku Solver
              </p>
              <h1 className="text-4xl font-extrabold tracking-[-0.05em] text-zinc-950 sm:text-5xl">
                Visualize Sudoku solving with recursion and backtracking
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                Watch the solver choose an empty cell, test digits, place valid
                values, and backtrack when a branch fails. The board, current
                recursive state, and step history stay visible together so the
                algorithm is easier to follow.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <MetricCard label="Preset" value={selectedPreset} helper={`${emptyCells} empty`} />
              <MetricCard
                label="Mode"
                value={solverMode === "fast" ? "Fast" : "Classic"}
                helper={solverMode === "fast" ? "MRV + bitmasks" : "basic DFS"}
              />
              <MetricCard label="Progress" value={progressLabel} helper="recorded steps" />
              <MetricCard
                label="States"
                value={
                  statesExplored >= 1000
                    ? `${(statesExplored / 1000).toFixed(1)}k`
                    : `${statesExplored}`
                }
                helper="states explored"
              />
              <MetricCard label="Coverage" value={`${coverage}%`} helper="filled cells" />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
          <aside className="xl:sticky xl:top-28 xl:self-start">
            <div className="panel-card rounded-[2rem] p-6">
              <div className="flex flex-col gap-8">
                <div>
                  <SectionLabel label="Algorithm" />
                  <div className="mt-4 rounded-2xl border border-zinc-200/80 bg-white/70 p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <ModeButton
                        label="Classic"
                        description="First empty cell"
                        active={solverMode === "classic"}
                        onClick={() => {
                          setSolverMode("classic");
                          handleReset();
                        }}
                      />
                      <ModeButton
                        label="Fast"
                        description="MRV + bitmasks"
                        active={solverMode === "fast"}
                        onClick={() => {
                          setSolverMode("fast");
                          handleReset();
                        }}
                      />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                      {solverMode === "fast"
                        ? "Fast mode chooses the most constrained empty cell first and tracks row, column, and box occupancy with bitmasks."
                        : "Classic mode scans the board left to right and is easier to study as a plain recursive backtracking solver."}
                    </p>
                  </div>
                </div>

                <div>
                  <SectionLabel label="Presets" />
                  <div className="mt-4 grid gap-3">
                    {presetOptions.map((preset) => (
                      <button
                        key={preset.key}
                        onClick={() => loadPreset(preset.key)}
                        className="rounded-2xl border border-zinc-200/80 bg-white/70 px-4 py-4 text-left transition hover:border-[var(--border-strong)] hover:bg-white"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-extrabold tracking-[-0.03em] text-zinc-950">
                            {preset.label}
                          </span>
                          <span className="text-[0.64rem] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
                            load
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          {preset.hint}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <SectionLabel label="Execution" />
                  <div className="mt-4 grid gap-3">
                    <ActionButton
                      label={isPlaying ? "Running..." : "Solve Puzzle"}
                      icon="play_arrow"
                      onClick={handleSolve}
                      disabled={isPlaying}
                      primary
                    />
                    <ActionButton
                      label="Step Through"
                      icon="step_into"
                      onClick={handleStepThrough}
                    />
                    <ActionButton label="Reset Board" icon="refresh" onClick={handleReset} />
                  </div>
                </div>

                <div>
                  <SectionLabel label="Playback Speed" />
                  <div className="mt-4 rounded-2xl border border-zinc-200/80 bg-white/70 p-4">
                    <div className="mb-3 flex justify-between text-[0.64rem] font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">
                      <span>Slow</span>
                      <span>Fast</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--background-strong)] accent-[var(--accent)]"
                    />
                    <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
                      <span>Delay</span>
                      <span className="font-mono text-zinc-950">{getDelay()} ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-6">
            <section className="panel-card rounded-[2rem] p-5 sm:p-8">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <SectionLabel label="Visualizer" />
                  <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-zinc-950">
                    Board canvas
                  </h2>
                </div>
                <div className="inline-flex items-center gap-3 self-start rounded-full border border-zinc-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--muted)]">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isSolved
                        ? "bg-emerald-500"
                        : isPlaying
                          ? "animate-pulse bg-[var(--accent)]"
                          : "bg-zinc-300"
                    }`}
                  />
                  <span>{getStatusText()}</span>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-zinc-200/80 bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:p-6">
                <SudokuGrid
                  board={board}
                  givenCells={givenCells}
                  activeCell={activeCell}
                  activeCellAction={activeCellAction}
                />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard
                label="Recursion Depth"
                value={String(recursionDepth).padStart(3, "0")}
                detail="Current stack depth"
              />
              <StatCard
                label="States Explored"
                value={
                  statesExplored >= 1000
                    ? `${(statesExplored / 1000).toFixed(1)}k`
                    : `${statesExplored}`
                }
                detail="Search states processed"
              />
              <StatCard
                label="Grid Coverage"
                value={`${coverage}%`}
                detail={`${filledCells} of ${totalCells} cells filled`}
              />
            </section>
          </div>

          <aside className="xl:sticky xl:top-28 xl:self-start">
            <section className="terminal-card rounded-[2rem] p-5 text-zinc-100 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-zinc-700" />
                  <span className="h-3 w-3 rounded-full bg-zinc-700" />
                  <span className="h-3 w-3 rounded-full bg-zinc-700" />
                </div>
                <span className="text-[0.64rem] font-extrabold uppercase tracking-[0.22em] text-zinc-500">
                  Recursion Log
                </span>
              </div>

              <div className="mb-5 rounded-2xl border border-white/8 bg-white/[0.06] p-4">
                <SectionLabel label="Current Step" dark />
                <p className="mt-3 text-sm leading-6 text-white">{currentActionText.title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {currentActionText.detail}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-zinc-300">
                  <div className="rounded-xl bg-white/[0.04] px-2 py-2">
                    depth {String(recursionDepth).padStart(2, "0")}
                  </div>
                  <div className="rounded-xl bg-white/[0.04] px-2 py-2">
                    step {steps.length > 0 && currentStep >= 0 ? currentStep + 1 : 0}
                  </div>
                  <div className="rounded-xl bg-white/[0.04] px-2 py-2">
                    {getDelay()} ms
                  </div>
                </div>
              </div>

              <div
                ref={logContainerRef}
                className="max-h-[28rem] min-h-[24rem] space-y-2 overflow-y-auto pr-1 font-mono text-xs leading-5"
              >
                {visibleLogEntries.length === 0 ? (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 text-zinc-500">
                    Awaiting execution command.
                  </div>
                ) : (
                  visibleLogEntries.map((entry, i) => (
                    <div
                      key={`${entry.text}-${i}`}
                      className={`flex items-start gap-3 rounded-xl px-3 py-2 ${
                        i === visibleLogEntries.length - 1
                          ? `${getLogTone(entry.type)} ring-1 ring-white/15`
                          : getLogTone(entry.type)
                      }`}
                    >
                      <span className="shrink-0 text-zinc-600">
                        {String(logEntries.length - visibleLogEntries.length + i + 1).padStart(
                          3,
                          "0"
                        )}
                      </span>
                      <span className="break-all">
                        {entry.depth > 0 && (
                          <span className="mr-2 text-zinc-500">
                            d{String(entry.depth).padStart(2, "0")}
                          </span>
                        )}
                        {entry.text}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                <SectionLabel label="System Status" dark />
                <p className="mt-3 text-sm leading-6 text-zinc-300">{getStatusText()}</p>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </section>
  );
}

function SectionLabel({
  label,
  dark = false,
}: {
  label: string;
  dark?: boolean;
}) {
  return (
    <span
      className={`text-[0.68rem] font-extrabold uppercase tracking-[0.22em] ${
        dark ? "text-zinc-500" : "text-[var(--muted)]"
      }`}
    >
      {label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-3">
      <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-extrabold tracking-[-0.04em] text-zinc-950">{value}</p>
      <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{helper}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="panel-card rounded-[1.6rem] p-5">
      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-zinc-950">{value}</p>
      <p className="mt-2 text-sm font-semibold text-[var(--muted)]">{detail}</p>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled = false,
  primary = false,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
        primary
          ? "bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-500"
          : "border border-zinc-200/80 bg-white/75 text-zinc-900 hover:bg-white disabled:bg-zinc-100 disabled:text-zinc-400"
      }`}
    >
      <span>{label}</span>
      <span className="material-symbols-outlined text-[1.1rem]">{icon}</span>
    </button>
  );
}

function ModeButton({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-3 py-3 text-left transition ${
        active
          ? "border-zinc-950 bg-zinc-950 text-white"
          : "border-zinc-200/80 bg-white/80 text-zinc-900 hover:bg-white"
      }`}
    >
      <div className="text-sm font-bold">{label}</div>
      <div className={`mt-1 text-[11px] ${active ? "text-zinc-300" : "text-[var(--muted)]"}`}>
        {description}
      </div>
    </button>
  );
}

function buildLogEntries(steps: SolveStep[], currentStep: number): LogEntry[] {
  if (steps.length === 0 || currentStep < 0) {
    return [];
  }

  const visibleSteps = steps.slice(0, currentStep + 1);
  const entries: LogEntry[] = [{ text: "Solver initialized.", type: "init", depth: 0 }];

  for (const step of visibleSteps) {
    if (step.action === "try") {
      entries.push({
        text: `solve(r:${step.row}, c:${step.col}) -> try ${step.value}`,
        type: "try",
        depth: step.depth,
      });
    } else if (step.action === "backtrack") {
      entries.push({
        text: `backtrack at (${step.row}, ${step.col}) after violation`,
        type: "backtrack",
        depth: step.depth,
      });
    } else if (step.action === "place") {
      entries.push({
        text: `place ${step.value} at (${step.row}, ${step.col})`,
        type: "place",
        depth: step.depth,
      });
    } else if (step.action === "solved") {
      entries.push({
        text: "Puzzle solved. All constraints satisfied.",
        type: "solved",
        depth: step.depth,
      });
    }
  }

  return entries.slice(-50);
}

function getCurrentActionText(step: SolveStep | null): {
  title: string;
  detail: string;
} {
  if (!step) {
    return {
      title: "Ready to start the recursive search.",
      detail:
        "Press Solve Puzzle to begin the recorded backtracking process, or use Step Through to move one recursive event at a time.",
    };
  }

  if (step.action === "try") {
    return {
      title: `Trying ${step.value} at row ${step.row + 1}, column ${step.col + 1}.`,
      detail:
        "The solver has found the next empty cell and is checking whether this candidate respects the row, column, and 3x3 box constraints.",
    };
  }

  if (step.action === "place") {
    return {
      title: `Placed ${step.value} at row ${step.row + 1}, column ${step.col + 1}.`,
      detail:
        "This candidate passed all constraint checks, so the algorithm writes it to the board and recurses deeper to solve the remaining empty cells.",
    };
  }

  if (step.action === "backtrack") {
    return {
      title: `Backtracking from row ${step.row + 1}, column ${step.col + 1}.`,
      detail:
        "A deeper recursive branch failed, so the solver clears the earlier placement and returns to the previous call to try the next possible digit.",
    };
  }

  return {
    title: "The puzzle is solved.",
    detail:
      "There are no empty cells left. The recursive search has reached its base case and the current board satisfies all Sudoku constraints.",
  };
}
