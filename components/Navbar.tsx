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

        {/* Right End: NODEHUNT Expanded Title at the other end */}
        <Link
          href="/"
          className="font-mono tracking-widest font-extrabold text-[#4fc1ff] hover:text-[#9cdcfe] text-xl sm:text-2xl transition-colors"
        >
          NODEHUNT
        </Link>
      </div>
    </nav>
  );
}
