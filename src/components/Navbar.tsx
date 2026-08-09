// src/components/Navbar.tsx

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import { Plus } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-stone-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-700 text-white rounded-full flex items-center justify-center font-bold">
            S
          </div>
          <span className="text-xl font-semibold text-stone-900">saathi</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-1">
          <NavLink href="/community">Community</NavLink>
          <NavLink href="/guidelines">Guidelines</NavLink>

          <Show when="signed-in">
            <NavLink href="/profile">Profile</NavLink>

            <Link
              href="/create"
              className="ml-2 px-4 py-1.5 bg-emerald-700 text-white text-sm font-medium rounded-full hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} /> Share Story
            </Link>

            <div className="ml-2">
              <UserButton />
            </div>
          </Show>

          <Show when="signed-out">
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
          </Show>
        </div>

        {/* Mobile: just the share button and user button */}
        <div className="flex sm:hidden items-center gap-2">
          <Show when="signed-in">
            <Link
              href="/create"
              className="p-2 bg-emerald-700 text-white rounded-full hover:bg-emerald-800 transition-colors"
            >
              <Plus size={18} />
            </Link>

            <UserButton />
          </Show>

          <Show when="signed-out">
            <SignUpButton mode="modal">
              <button className="px-3 py-1.5 bg-emerald-700 text-white text-sm font-medium rounded-full">
                Join
              </button>
            </SignUpButton>
          </Show>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm text-stone-700 hover:text-emerald-700 transition-colors"
    >
      {children}
    </Link>
  );
}