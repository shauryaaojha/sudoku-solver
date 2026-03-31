/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sudoku Solver | Backtracking Visualizer",
  description:
    "Sudoku solver with visualizer, manual input, and theory notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app-shell">
          <Navbar />
          <div className="app-shell__body">
            <div className="app-shell__content">{children}</div>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
