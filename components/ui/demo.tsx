import { FloatingPathsBackground } from "@/components/ui/floating-paths";

export default function FloatingPathsBackgroundExample() {
  return (
    <FloatingPathsBackground
      className="aspect-16/9 flex items-center justify-center"
      position={-1}
    >
      <div className="relative z-10 text-white font-mono text-sm">
        Floating Paths Background Preview
      </div>
    </FloatingPathsBackground>
  );
}
