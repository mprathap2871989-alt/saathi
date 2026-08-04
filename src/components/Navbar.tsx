// src/components/Navbar.tsx

import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center group-hover:bg-emerald-800 transition-colors">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <span className="font-bold text-emerald-800 text-xl tracking-tight">saathi</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-1">
          <NavLink href="/community">Community</NavLink>
          <NavLink href="/guidelines">Guidelines</NavLink>

          <SignedIn>
            <NavLink href="/profile">Profile</NavLink>
            <Link href="/create"
              className="ml-2 px-4 py-1.5 bg-emerald-700 text-white text-sm font-medium rounded-full hover:bg-emerald-800 transition-colors flex items-center gap-1.5">
              <Plus size={14} /> Share Story
            </Link>
            <div className="ml-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="ml-2 px-4 py-1.5 border border-stone-300 text-gray-700 text-sm font-medium rounded-full hover:bg-stone-50 transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-1.5 bg-emerald-700 text-white text-sm font-medium rounded-full hover:bg-emerald-800 transition-colors flex items-center gap-1.5">
                <Plus size={14} /> Share Story
              </button>
            </SignUpButton>
          </SignedOut>
        </div>

        {/* Mobile: just the share button and user button */}
        <div className="flex sm:hidden items-center gap-2">
          <SignedIn>
            <Link href="/create"
              className="p-2 bg-emerald-700 text-white rounded-full hover:bg-emerald-800 transition-colors">
              <Plus size={18} />
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="px-3 py-1.5 bg-emerald-700 text-white text-sm font-medium rounded-full">
                Join
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:bg-stone-100 hover:text-gray-900 transition-colors">
      {children}
    </Link>
  );
}
