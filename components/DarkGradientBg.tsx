import type React from "react";
import { cn } from "@/lib/utils";

interface DarkGradientBgProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Elegant dark background featuring:
 * 1. Pure obsidian/black base (#050505)
 * 2. Muted, subtle rusty-crimson atmospheric streaks (warm muted red instead of dark cyan)
 *    concentrated near top/edges and fading gently so it does NOT dominate the black space
 * 3. Crisp, balanced dot matrix grid (neither too hard nor too faint) with 24px pitch
 * 4. Gentle vignette and depth overlay
 */
export function DarkGradientBg({ children, className }: DarkGradientBgProps) {
  return (
    <div className={cn("relative min-h-screen w-full bg-[#050505] text-[#ededed] overflow-hidden", className)}>
      {/* Background Graphic Layers */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Base dark radial falloff */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(100% 100% at 0% 0%, rgb(28, 16, 15) 0%, rgb(5, 5, 5) 100%)",
            maskImage: "radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 85%, rgba(0, 0, 0, 0) 100%)",
            WebkitMaskImage: "radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 85%, rgba(0, 0, 0, 0) 100%)",
          }}
        >
          {/* Layer 1: Skewed muted rusty streak (45 deg) */}
          <div
            className="absolute inset-0 opacity-14"
            style={{
              background: "linear-gradient(rgb(180, 52, 38) 0%, rgba(180, 52, 38, 0) 100%)",
              maskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 36%, rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0) 97%)",
              WebkitMaskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 36%, rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />

          {/* Layer 2: Skewed secondary muted rust streak */}
          <div
            className="absolute inset-0 opacity-12"
            style={{
              background: "linear-gradient(rgb(195, 62, 45) 0%, rgba(195, 62, 45, 0) 100%)",
              maskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 11%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0.55) 41%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0) 97%)",
              WebkitMaskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 11%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0.55) 41%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />

          {/* Layer 3: Soft ambient reddish falloff */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: "linear-gradient(rgb(160, 44, 32) 0%, rgba(160, 44, 32, 0) 100%)",
              maskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 9%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 28%, rgba(0, 0, 0, 0.424) 40%, rgb(0, 0, 0) 48%, rgba(0, 0, 0, 0.267) 54%, rgba(0, 0, 0, 0.13) 78%, rgb(0, 0, 0) 88%, rgba(0, 0, 0) 97%)",
              WebkitMaskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 9%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 28%, rgba(0, 0, 0, 0.424) 40%, rgb(0, 0, 0) 48%, rgba(0, 0, 0, 0.267) 54%, rgba(0, 0, 0, 0.13) 78%, rgb(0, 0, 0) 88%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />

          {/* Layer 4: Distant edge highlights */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: "linear-gradient(rgb(175, 48, 35) 0%, rgba(175, 48, 35, 0) 100%)",
              maskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 17%, rgba(0, 0, 0, 0.55) 26%, rgb(0, 0, 0) 35%, rgba(0, 0, 0, 0.47) 47%, rgba(0, 0, 0, 0.13) 69%, rgb(0, 0, 0) 79%, rgba(0, 0, 0) 97%)",
              WebkitMaskImage: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 17%, rgba(0, 0, 0, 0.55) 26%, rgb(0, 0, 0) 35%, rgba(0, 0, 0, 0.47) 47%, rgba(0, 0, 0, 0.13) 69%, rgb(0, 0, 0) 79%, rgba(0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
        </div>

        {/* Balanced Dot Matrix Pattern: Crisp, clean, neither too harsh nor invisible */}
        <div
          className="absolute inset-0 opacity-22"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.65) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Dark Vignette: Keeps center & bottom predominantly deep black */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 40%, transparent 20%, rgba(5, 5, 5, 0.7) 70%, rgb(5, 5, 5) 100%)",
          }}
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
