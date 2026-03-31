/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sudoku Archive | Backtracking Visualizer",
  description:
    "Structured Sudoku solver UI with visualizer, manual input, and theory notes.",
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
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${manrope.variable} ${jetbrainsMono.variable} ${cormorantGaramond.variable}`}
      >
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
