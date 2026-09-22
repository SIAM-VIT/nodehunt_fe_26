import type React from "react";
import { cn } from "@/lib/utils";

interface DarkGradientBgProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * VS Code Dark+ Theme Background:
 * 1. Deep VS Code Editor background (#1e1e1e)
 * 2. Subtle editor grid (subtle 32px line matrix reminiscent of editor guide columns)
 * 3. Soft VS Code status accent glow (#007acc at 5% opacity)
 */
export function DarkGradientBg({ children, className }: DarkGradientBgProps) {
  return (
    <div className={cn("relative min-h-screen w-full bg-[#1e1e1e] text-[#d4d4d4] overflow-hidden", className)}>
      {/* Background Graphic Layers */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Subtle VS Code editor grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Soft top ambient blue glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 0%, rgba(0, 122, 204, 0.12) 0%, transparent 60%)",
          }}
        />

        {/* Soft vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, transparent 40%, rgba(20, 20, 20, 0.6) 100%)",
          }}
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
