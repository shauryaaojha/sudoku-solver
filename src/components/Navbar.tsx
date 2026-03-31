"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Visualizer", shortLabel: "Grid" },
  { href: "/input", label: "Manual Input", shortLabel: "Input" },
  { href: "/theory", label: "Theory", shortLabel: "Theory" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="shell-container">
        <nav className="site-nav">
          <Link href="/" className="site-brand" aria-label="Sudoku Solver home">
            <Image
              src="/logo.png"
              alt="Sudoku Solver"
              width={497}
              height={128}
              priority
              className="site-brand-logo"
            />
          </Link>

          <div className="site-nav-links" aria-label="Primary navigation">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={isActive ? "site-nav-link is-active" : "site-nav-link"}
                >
                  <span className="hidden sm:inline">{link.label}</span>
                  <span className="sm:hidden">{link.shortLabel}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
