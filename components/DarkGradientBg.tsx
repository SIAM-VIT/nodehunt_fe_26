import type React from "react";
import { cn } from "@/lib/utils";

interface DarkGradientBgProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Gradient Sunray & Dot Matrix Background:
 * Re-themed with the VS Code Dark+ color palette:
 * - Deep dark editor base (#181818 / #1e1e1e)
 * - 4-layer skewed diagonal sunray light beams rendered in VS Code electric blue (#007acc / #1f8ad2 / #4fc1ff)
 * - Fine balanced dot-matrix grid (24px pitch)
 * - Vignette and radial falloff for focused content clarity
 */
export function DarkGradientBg({ children, className }: DarkGradientBgProps) {
  return (
    <div className={cn("relative min-h-screen w-full bg-[#181818] text-[#d4d4d4] overflow-hidden", className)}>
      {/* Background Graphic Layers */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Base dark radial falloff */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(100% 100% at 0% 0%, rgb(18, 30, 44) 0%, rgb(24, 24, 24) 100%)",
            maskImage: "radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 85%, rgba(0, 0, 0, 0) 100%)",
            WebkitMaskImage: "radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 85%, rgba(0, 0, 0, 0) 100%)",
          }}
        >
          {/* Layer 1: Skewed sunray light beam (45 deg) - VS Code Blue */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: "linear-gradient(rgb(0, 122, 204) 0%, rgba(0, 122, 204, 0) 100%)",
              maskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 36%, rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0) 97%)",
              WebkitMaskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 36%, rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />

          {/* Layer 2: Secondary sunray beam - Light variable blue (#4fc1ff) */}
          <div
            className="absolute inset-0 opacity-16"
            style={{
              background: "linear-gradient(rgb(79, 193, 255) 0%, rgba(79, 193, 255, 0) 100%)",
              maskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 11%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0.55) 41%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0) 97%)",
              WebkitMaskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 11%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0.55) 41%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />

          {/* Layer 3: Ambient electric cyan falloff */}
          <div
            className="absolute inset-0 opacity-14"
            style={{
              background: "linear-gradient(rgb(31, 138, 210) 0%, rgba(31, 138, 210, 0) 100%)",
              maskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 9%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 28%, rgba(0, 0, 0, 0.424) 40%, rgb(0, 0, 0) 48%, rgba(0, 0, 0, 0.267) 54%, rgba(0, 0, 0, 0.13) 78%, rgb(0, 0, 0) 88%, rgba(0, 0, 0) 97%)",
              WebkitMaskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 9%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 28%, rgba(0, 0, 0, 0.424) 40%, rgb(0, 0, 0) 48%, rgba(0, 0, 0, 0.267) 54%, rgba(0, 0, 0, 0.13) 78%, rgb(0, 0, 0) 88%, rgba(0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />

          {/* Layer 4: Distant highlights beam */}
          <div
            className="absolute inset-0 opacity-12"
            style={{
              background: "linear-gradient(rgb(156, 220, 254) 0%, rgba(156, 220, 254, 0) 100%)",
              maskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 17%, rgba(0, 0, 0, 0.55) 26%, rgb(0, 0, 0) 35%, rgba(0, 0, 0, 0.47) 47%, rgba(0, 0, 0, 0.13) 69%, rgb(0, 0, 0) 79%, rgba(0, 0, 0) 97%)",
              WebkitMaskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 17%, rgba(0, 0, 0, 0.55) 26%, rgb(0, 0, 0) 35%, rgba(0, 0, 0, 0.47) 47%, rgba(0, 0, 0, 0.13) 69%, rgb(0, 0, 0) 79%, rgba(0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
        </div>

        {/* Balanced Dot Matrix Pattern */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.7) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Dark Vignette: Keeps center & bottom dark and clear */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 40%, transparent 25%, rgba(24, 24, 24, 0.75) 70%, rgb(24, 24, 24) 100%)",
          }}
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
