import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="shell nav-inner flex items-center justify-between w-full">
        {/* Left End: SIAM-VIT Logo expanded */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
          aria-label="SIAM-VIT Home"
        >
          <div className="relative h-11 w-36 flex items-center justify-center p-1 rounded-md bg-[#252526] border border-[#3e3e42]">
            <Image
              src="/siamvit-logo-white.png"
              alt="SIAM-VIT"
              width={140}
              height={40}
              className="object-contain w-full h-full"
              priority
            />
          </div>
        </Link>

        {/* Right End: NODEHUNT Expanded Title & Navigation */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-mono tracking-widest font-extrabold text-[#4fc1ff] hover:text-[#9cdcfe] text-xl sm:text-2xl transition-colors"
          >
            NODEHUNT
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hidden sm:inline-block px-3.5 py-1.5 rounded-md text-xs font-mono text-[#858585] hover:text-[#d4d4d4] hover:bg-[#252526] transition-colors"
            >
              Organizer Admin
            </Link>
            <Link
              href="/join"
              className="px-4 py-2 rounded-md bg-[#007acc] hover:bg-[#1f8ad2] text-white font-mono text-xs sm:text-sm font-semibold tracking-wider transition-all shadow-md shadow-[#007acc]/25"
            >
              Enter Arena →
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
