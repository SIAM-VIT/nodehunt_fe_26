
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="shell nav-inner">
        <Link className="brand" href="/" aria-label="NodeHunt home">
          <span className="brand-mark">N</span>
          <span>NODEHUNT</span>
        </Link>
        <div className="nav-links">
          <Link href="/#about">About</Link>
          <Link href="/#gameplay">Gameplay</Link>
          <Link href="/#graph">Graph</Link>
          <Link href="/results">Results</Link>
          <Link href="/admin">Admin</Link>
          <Link className="nav-cta" href="/join">Start Hunt</Link>
        </div>
      </div>
    </nav>
  );
}


