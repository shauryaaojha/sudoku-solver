import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell-container">
        <div className="site-footer-panel">
          <div className="site-footer-brand">
            <span className="site-footer-kicker">Sudoku Solver</span>
            <p className="site-footer-copy">
              Visualize how Sudoku is solved using recursion and backtracking,
              then study the exact logic behind each step.
            </p>
          </div>

          <div className="site-footer-links">
            <div>
              <span className="site-footer-heading">Navigate</span>
              <div className="site-footer-list">
                <Link href="/">Visualizer</Link>
                <Link href="/input">Manual Input</Link>
                <Link href="/theory">Theory</Link>
              </div>
            </div>

            <div>
              <span className="site-footer-heading">GitHub</span>
              <div className="site-footer-list">
                <a
                  href="https://github.com/shauryaaojha/sudoku-solver"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/shauryaaojha/sudoku-solver
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
