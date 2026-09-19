"use client";

import { useEffect, useState } from "react";
import { FaCode, FaDatabase, FaGitAlt, FaJava, FaJs, FaPython, FaReact } from "react-icons/fa";

type Tile = {
  label: string;
  kind: "icon" | "text" | "ghost";
  x: number;
  y: number;
  size: "sm" | "md" | "lg";
  delay: number;
};

const TILES: Tile[] = [
  { label: "JS", kind: "icon", x: 30, y: 9, size: "lg", delay: -1 },
  { label: "TS", kind: "text", x: 57, y: 17, size: "md", delay: -3 },
  { label: "C", kind: "text", x: 72, y: 12, size: "lg", delay: -5 },
  { label: "Swift", kind: "text", x: 88, y: 22, size: "md", delay: -7 },
  { label: "Java", kind: "icon", x: 90, y: 39, size: "lg", delay: -2 },
  { label: "Haskell", kind: "text", x: 98, y: 67, size: "md", delay: -4 },
  { label: "Ruby", kind: "text", x: 81, y: 86, size: "md", delay: -6 },
  { label: "C++", kind: "text", x: 14, y: 70, size: "lg", delay: -8 },
  { label: "React", kind: "icon", x: 8, y: 42, size: "lg", delay: -5 },
  { label: "Git", kind: "icon", x: 27, y: 84, size: "md", delay: -3 },
  { label: "Python", kind: "icon", x: 44, y: 38, size: "lg", delay: -2 },
  { label: "DB", kind: "icon", x: 46, y: 17, size: "xl" as "lg", delay: -9 },
  { label: "", kind: "ghost", x: 17, y: 24, size: "md", delay: -2 },
  { label: "", kind: "ghost", x: 33, y: 63, size: "lg", delay: -7 },
  { label: "", kind: "ghost", x: 75, y: 66, size: "lg", delay: -1 },
  { label: "", kind: "ghost", x: 96, y: 89, size: "md", delay: -5 },
];

function TileIcon({ label }: { label: string }) {
  if (label === "JS") return <FaJs />;
  if (label === "Python") return <FaPython />;
  if (label === "Java") return <FaJava />;
  if (label === "React") return <FaReact />;
  if (label === "Git") return <FaGitAlt />;
  if (label === "DB") return <FaDatabase />;
  return <FaCode />;
}

export function FloatingTechBackground() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      setPos({ x, y });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="tech-bg" aria-hidden="true">
      <div className="hero-ambient hero-ambient-one" />
      <div className="hero-ambient hero-ambient-two" />
      <div className="hero-ambient hero-ambient-three" />
      {TILES.map((tile, index) => {
        const depth = (index % 5) + 1;
        return (
          <span
            key={`${tile.label || "ghost"}-${index}`}
            className={`tech-logo-tile tile-${tile.size} ${tile.kind === "ghost" ? "is-ghost" : ""}`}
            style={{
              left: `${tile.x}%`,
              top: `${tile.y}%`,
              animationDelay: `${tile.delay}s`,
              transform: `translate3d(${pos.x * depth * 9}px, ${pos.y * depth * 7}px, 0)`,
            }}
          >
            {tile.kind === "ghost" ? null : tile.kind === "icon" ? <TileIcon label={tile.label} /> : <span>{tile.label}</span>}
          </span>
        );
      })}
    </div>
  );
}
