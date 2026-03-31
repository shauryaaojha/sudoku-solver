"use client";

import Link from "next/link";

const sections = [
  { id: "model", label: "Problem Model" },
  { id: "isvalid", label: "isValid Check" },
  { id: "algorithm", label: "Algorithm Flow" },
  { id: "complexity", label: "Complexity" },
  { id: "visualizer", label: "Visualizer Mapping" },
  { id: "limits", label: "Limits and Extensions" },
];

export default function TheoryPage() {
  return (
    <section className="px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
        <header className="panel-card rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_320px]">
            <div>
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.24em] text-[var(--accent)]">
                Theory Notes
              </p>
              <h1 className="font-serif mt-4 max-w-4xl text-5xl font-semibold leading-none tracking-[-0.04em] text-zinc-950 sm:text-6xl lg:text-7xl">
                How this Sudoku solver actually works
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                This project uses a classic depth-first backtracking solver. It
                does not rely on dancing links, exact cover transforms, or
                advanced human-style heuristics. The theory below matches the
                implementation in the codebase and explains what the visualizer
                is showing step by step in a format that is easier to scan.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-zinc-200/80 bg-white/75 p-6">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">
                At a Glance
              </p>
              <dl className="mt-5 space-y-4">
                <TheoryMetric label="Search strategy" value="Depth-first search" />
                <TheoryMetric label="Constraint checks" value="Row, column, 3x3 box" />
                <TheoryMetric label="Empty-cell rule" value="First empty cell found" />
                <TheoryMetric label="Core decision point" value="isValid(board, row, col, num)" />
              </dl>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-28 xl:self-start">
            <div className="panel-card rounded-[2rem] p-6">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">
                On This Page
              </p>
              <nav className="mt-5 flex flex-col gap-3">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-2xl border border-transparent px-4 py-3 text-sm font-bold text-zinc-700 transition hover:border-zinc-200 hover:bg-white/70 hover:text-zinc-950"
                  >
                    {section.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-6">
            <article id="model" className="panel-card rounded-[2rem] p-6 sm:p-8">
              <SectionEyebrow>Problem Model</SectionEyebrow>
              <h2 className="font-serif mt-3 text-4xl font-semibold tracking-[-0.04em] text-zinc-950">
                Sudoku as a constrained search problem
              </h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_320px]">
                <div className="space-y-5 text-base leading-8 text-zinc-700">
                  <p>
                    A Sudoku board is a 9 by 9 grid. In this codebase, the board
                    is stored as a two-dimensional array of numbers, and the
                    value <code className="rounded bg-stone-100 px-1.5 py-0.5">0</code>{" "}
                    means the cell is empty.
                  </p>
                  <p>
                    A valid completed board must satisfy three rules at every
                    filled cell: the digit must be unique in its row, unique in
                    its column, and unique inside its 3 by 3 subgrid. Those are
                    the only constraints this solver enforces, and they are
                    checked explicitly in the <code className="rounded bg-stone-100 px-1.5 py-0.5">isValid</code>{" "}
                    function.
                  </p>
                  <p>
                    Solving the puzzle means searching for a sequence of digit
                    placements that turns every zero into a legal value without
                    violating any of those constraints.
                  </p>
                </div>

                <div className="rounded-[1.6rem] border border-zinc-200/80 bg-white/80 p-5">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">
                    Board Representation
                  </p>
                  <pre className="mt-4 overflow-x-auto rounded-2xl bg-zinc-950 px-4 py-4 text-sm leading-7 text-zinc-200">
                    <code>{`type Board = number[][]
// 0 means empty

[
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  ...
]`}</code>
                  </pre>
                </div>
              </div>
            </article>

            <article id="isvalid" className="panel-card rounded-[2rem] p-6 sm:p-8">
              <SectionEyebrow>Constraint Check</SectionEyebrow>
              <h2 className="font-serif mt-3 text-4xl font-semibold tracking-[-0.04em] text-zinc-950">
                What the isValid function is doing
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-700">
                Every recursive guess passes through <code className="rounded bg-stone-100 px-1.5 py-0.5">isValid</code>.
                The function decides whether a candidate digit can be placed in a
                specific cell without breaking Sudoku rules. If this check fails,
                the solver does not recurse on that candidate.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <RuleCard
                  title="Row check"
                  text="Scan the current row. If the same digit already exists there, the move is invalid."
                />
                <RuleCard
                  title="Column check"
                  text="Scan the current column. A repeated digit means the placement must be rejected."
                />
                <RuleCard
                  title="3x3 box check"
                  text="Compute the starting row and column of the box, then scan the nine cells in that subgrid."
                />
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                <pre className="overflow-x-auto rounded-[1.6rem] bg-zinc-950 px-5 py-5 text-sm leading-7 text-zinc-200">
                  <code>{`function isValid(board, row, col, num) {
  for each cell in row:
    if cell == num -> false

  for each cell in column:
    if cell == num -> false

  for each cell in 3x3 box:
    if cell == num -> false

  return true
}`}</code>
                </pre>

                <div className="rounded-[1.6rem] border border-zinc-200/80 bg-white/80 p-5">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">
                    Why this matters
                  </p>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-700">
                    <p>
                      <code className="rounded bg-stone-100 px-1.5 py-0.5">isValid</code> is the pruning step.
                      It prevents the solver from exploring branches that are
                      already broken.
                    </p>
                    <p>
                      Without it, the recursion would still try combinations, but
                      it would waste huge amounts of time descending into states
                      that violate Sudoku rules immediately.
                    </p>
                    <p>
                      In the visualizer, every <code className="rounded bg-stone-100 px-1.5 py-0.5">try</code>{" "}
                      action is followed by this check. Only successful checks
                      produce a <code className="rounded bg-stone-100 px-1.5 py-0.5">place</code>{" "}
                      action.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <article id="algorithm" className="panel-card rounded-[2rem] p-6 sm:p-8">
              <SectionEyebrow>Algorithm Flow</SectionEyebrow>
              <h2 className="font-serif mt-3 text-4xl font-semibold tracking-[-0.04em] text-zinc-950">
                First-empty-cell backtracking
              </h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_360px]">
                <div className="space-y-5 text-base leading-8 text-zinc-700">
                  <p>
                    The solver performs a depth-first search. It scans the board
                    from top-left to bottom-right until it finds the first empty
                    cell. That search order matters because it defines the shape
                    of the recursion tree.
                  </p>
                  <p>
                    Once an empty cell is found, the solver tries digits 1
                    through 9 in order. For each candidate, it checks whether the
                    digit is legal under the row, column, and subgrid rules. If
                    the candidate is valid, it places the digit and recurses.
                  </p>
                  <p>
                    If a recursive call eventually reaches a dead end, the solver
                    undoes the placement, returns to the previous call, and tries
                    the next digit. That undo step is backtracking.
                  </p>
                  <p>
                    The base case is simple: if there is no empty cell left, the
                    board is complete and the search returns success.
                  </p>
                </div>

                <div className="rounded-[1.6rem] border border-zinc-200/80 bg-white/80 p-5">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">
                    Pseudocode
                  </p>
                  <pre className="mt-4 overflow-x-auto rounded-2xl bg-zinc-950 px-4 py-4 text-sm leading-7 text-zinc-200">
                    <code>{`solve(board):
  cell = findEmpty(board)
  if cell == null:
    return true

  row, col = cell

  for digit from 1 to 9:
    if isValid(board, row, col, digit):
      board[row][col] = digit

      if solve(board):
        return true

      board[row][col] = 0

  return false`}</code>
                  </pre>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-4">
                <StepCard
                  number="01"
                  title="Find"
                  text="Locate the next empty cell in row-major order."
                />
                <StepCard
                  number="02"
                  title="Try"
                  text="Test digits 1 through 9 against the constraints."
                />
                <StepCard
                  number="03"
                  title="Recurse"
                  text="Place a valid digit and continue solving the rest."
                />
                <StepCard
                  number="04"
                  title="Backtrack"
                  text="Undo the move if that branch cannot finish the board."
                />
              </div>
            </article>

            <article id="complexity" className="panel-card rounded-[2rem] p-6 sm:p-8">
              <SectionEyebrow>Complexity</SectionEyebrow>
              <h2 className="font-serif mt-3 text-4xl font-semibold tracking-[-0.04em] text-zinc-950">
                Why the solver can still become expensive
              </h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px]">
                <div className="space-y-5 text-base leading-8 text-zinc-700">
                  <p>
                    Let <em>m</em> be the number of empty cells. In the worst
                    case, each empty cell may branch into up to nine choices, so
                    the search tree has exponential size. A common upper-bound
                    description is:
                  </p>
                  <div className="rounded-[1.5rem] border border-zinc-200/80 bg-white/85 px-6 py-6 text-center">
                    <p className="font-serif text-4xl font-semibold tracking-[-0.04em] text-zinc-950">
                      O(9<sup>m</sup>)
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
                      Worst-case search over the remaining empty cells
                    </p>
                  </div>
                  <p>
                    That bound is intentionally pessimistic. Real puzzles prune
                    many branches early because invalid placements are rejected
                    before the recursion goes deeper. Even so, this implementation
                    does not use advanced heuristics such as minimum remaining
                    values, constraint propagation, or exact-cover reductions, so
                    difficult boards can still force a large search.
                  </p>
                  <p>
                    Space complexity is much smaller than the full search tree. A
                    single recursive path holds at most one frame per empty cell,
                    so the call stack is O(m). The visualizer version stores board
                    snapshots for each recorded step, which adds extra memory for
                    animation and logging.
                  </p>
                </div>

                <div className="rounded-[1.6rem] border border-zinc-200/80 bg-[var(--background-strong)]/65 p-5">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">
                    Correct Takeaways
                  </p>
                  <ul className="mt-4 space-y-4 text-sm leading-7 text-zinc-700">
                    <li>The project uses plain recursive backtracking.</li>
                    <li>Constraint checks are local, not heuristic-driven.</li>
                    <li>Hard puzzles are slow because branch count can explode.</li>
                    <li>The visualizer adds overhead because it records snapshots.</li>
                  </ul>
                </div>
              </div>
            </article>

            <article id="visualizer" className="panel-card rounded-[2rem] p-6 sm:p-8">
              <SectionEyebrow>Visualizer Mapping</SectionEyebrow>
              <h2 className="font-serif mt-3 text-4xl font-semibold tracking-[-0.04em] text-zinc-950">
                What the animation is showing on screen
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-700">
                The theory page should help a person understand the visualizer at
                a glance, so the mapping below ties the UI labels directly to the
                recursive events happening in the solver.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <VisualizerCard
                  title="try"
                  text="A candidate digit is being considered for the current empty cell."
                />
                <VisualizerCard
                  title="place"
                  text="The digit passed validation and was written into the board."
                />
                <VisualizerCard
                  title="backtrack"
                  text="A previous placement led to failure, so the cell is cleared."
                />
                <VisualizerCard
                  title="solved"
                  text="No empty cell remained, so the recursive search terminated successfully."
                />
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-zinc-200/80 bg-zinc-950 px-6 py-6 text-zinc-100">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-zinc-500">
                  Step Recording in This Project
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-white/[0.04] p-4 text-sm leading-7 text-zinc-300">
                    Every recorded step stores the board snapshot, row, column,
                    candidate value, recursion depth, and explored-state count.
                  </div>
                  <div className="rounded-2xl bg-white/[0.04] p-4 text-sm leading-7 text-zinc-300">
                    That recorded sequence is why the app can replay the solving
                    process instead of only jumping from puzzle to answer.
                  </div>
                </div>
              </div>
            </article>

            <article id="limits" className="panel-card rounded-[2rem] p-6 sm:p-8">
              <SectionEyebrow>Limits and Extensions</SectionEyebrow>
              <h2 className="font-serif mt-3 text-4xl font-semibold tracking-[-0.04em] text-zinc-950">
                What this solver does not do yet
              </h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="space-y-5 text-base leading-8 text-zinc-700">
                  <p>
                    The current solver is correct and easy to understand, which
                    makes it a good teaching implementation. But it is not tuned
                    for maximum speed.
                  </p>
                  <p>
                    The largest performance improvement would come from choosing
                    the next cell more intelligently. For example, selecting the
                    empty cell with the fewest legal candidates usually shrinks
                    the search tree much faster than scanning left to right.
                  </p>
                  <p>
                    Additional improvements could include bitmasks for row,
                    column, and box occupancy, or a constraint-propagation stage
                    before recursion begins.
                  </p>
                </div>

                <div className="rounded-[1.6rem] border border-zinc-200/80 bg-white/80 p-5">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">
                    Reasonable Next Upgrades
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-zinc-700">
                    <li>Choose the most constrained empty cell first.</li>
                    <li>Track candidates with bitsets instead of rescanning rows.</li>
                    <li>Separate solver logic from step-recording overhead.</li>
                    <li>Add optional heuristic annotations to the visualizer.</li>
                  </ul>
                </div>
              </div>
            </article>

            <section className="panel-card rounded-[2rem] p-8 text-center sm:p-10">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.24em] text-[var(--accent)]">
                Explore the Solver
              </p>
              <h3 className="font-serif mt-4 text-4xl font-semibold tracking-[-0.04em] text-zinc-950">
                Read the theory, then watch it execute
              </h3>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--muted)]">
                The visualizer and manual-input pages now sit on the same layout
                system, so the theory section can act as a real companion to the
                solver rather than a disconnected landing page.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/"
                  className="rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
                >
                  Open Visualizer
                </Link>
                <Link
                  href="/input"
                  className="rounded-2xl border border-zinc-200 bg-white px-6 py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-50"
                >
                  Open Manual Input
                </Link>
              </div>
            </section>
          </div>
        </section>
      </div>
    </section>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-[var(--accent)]">
      {children}
    </p>
  );
}

function TheoryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-zinc-200/80 pb-4 last:border-b-0 last:pb-0">
      <dt className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-[var(--muted)]">
        {label}
      </dt>
      <dd className="mt-2 text-lg font-bold tracking-[-0.03em] text-zinc-950">{value}</dd>
    </div>
  );
}

function StepCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-200/80 bg-white/80 p-5">
      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-[var(--accent)]">
        {number}
      </p>
      <h3 className="mt-3 text-lg font-extrabold tracking-[-0.03em] text-zinc-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-7 text-zinc-700">{text}</p>
    </div>
  );
}

function VisualizerCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-200/80 bg-white/80 p-5">
      <p className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-zinc-700">{text}</p>
    </div>
  );
}

function RuleCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-200/80 bg-[var(--background-strong)]/55 p-5">
      <h3 className="text-lg font-extrabold tracking-[-0.03em] text-zinc-950">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-zinc-700">{text}</p>
    </div>
  );
}
