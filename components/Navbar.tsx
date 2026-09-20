import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="shell nav-inner">
        <Link className="brand flex items-center gap-2.5 group" href="/" aria-label="NodeHunt home">
          <div className="relative h-7 w-20 flex items-center justify-center overflow-hidden rounded bg-white/[0.04] p-0.5 border border-white/[0.08] group-hover:border-[#b43426]/50 transition-colors">
            <Image
              src="/siamvit-logo-white.png"
              alt="SIAM-VIT"
              width={80}
              height={26}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <span className="font-mono tracking-wider font-bold text-white text-sm">NODEHUNT</span>
        </Link>
        <div className="nav-links">
          <Link href="/game">Arena</Link>
          <Link href="/results">Results</Link>
          <Link href="/admin">Admin</Link>
          <Link className="nav-cta" href="/join">Enter Arena</Link>
        </div>
      </div>
    </nav>
  );
}
