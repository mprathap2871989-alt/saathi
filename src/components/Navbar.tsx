"use client";

// src/components/Navbar.tsx

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { Plus } from "lucide-react";

export default function Navbar() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <nav className="border-b border-stone-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-700 text-white rounded-full flex items-center justify-center font-bold">
            S
          </div>

          <span className="text-xl font-semibold text-stone-900">
            solacial
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-1">
          <NavLink href="/community">Community</NavLink>
          <NavLink href="/guidelines">Guidelines</NavLink>

          {isLoaded && (
            <>
              {isSignedIn ? (
                <>
                  {/* Private Help */}
                  <NavLink href="/help">Need Help?</NavLink>

                  <NavLink href="/profile">Profile</NavLink>

                  <Link
                    href="/create"
                    className="ml-2 px-4 py-1.5 bg-emerald-700 text-white text-sm font-medium rounded-full hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    Share Story
                  </Link>

                  <div className="ml-3">
                    <UserButton />
                  </div>
                </>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="ml-2 px-4 py-1.5 border border-stone-300 text-gray-700 text-sm font-medium rounded-full hover:bg-stone-50 transition-colors"
                    >
                      Sign In
                    </button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <button
                      type="button"
                      className="ml-2 px-4 py-1.5 bg-emerald-700 text-white text-sm font-medium rounded-full hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      Join Solacial
                    </button>
                  </SignUpButton>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex sm:hidden items-center gap-2">
          {isLoaded && (
            <>
              {isSignedIn ? (
                <>
                  {/* Private Help */}
                  <Link
                    href="/help"
                    className="px-3 py-1.5 border border-stone-200 text-stone-700 text-sm font-medium rounded-full hover:bg-stone-50 hover:text-emerald-700 transition-colors"
                  >
                    Help
                  </Link>

                  <Link
                    href="/create"
                    className="p-2 bg-emerald-700 text-white rounded-full hover:bg-emerald-800 transition-colors"
                    aria-label="Share your story"
                  >
                    <Plus size={18} />
                  </Link>

                  <UserButton />
                </>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="px-3 py-1.5 border border-stone-300 text-gray-700 text-sm font-medium rounded-full"
                    >
                      Sign In
                    </button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-emerald-700 text-white text-sm font-medium rounded-full"
                    >
                      Join
                    </button>
                  </SignUpButton>
                </>
              )}
            </>
          )}
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