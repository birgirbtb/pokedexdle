// -----------------------------
// GameFrame.tsx
// -----------------------------
// This component wraps the entire game UI in a consistent "app shell":
// - Glass container background
// - Header (brand + auth + optional centered header button)
// - Content area (children)
//
// NOTE: This is an async Server Component (no "use client") because it reads Supabase auth on the server.

import type { ReactNode } from "react"; // React type used for children + optional header content
import Link from "next/link"; // Next.js client-side navigation
import LogOut from "../(auth)/components/LogOut"; // Your logout button/component (used when user is logged in)
import { createClient } from "@/lib/supabase/server"; // Server-side Supabase client (reads cookies/session)

// Props accepted by the frame:
// - children: whatever page content you want displayed inside the frame
// - headerCenter: optional element (usually a button) shown centered in the header
type AppFrameProps = {
  children: ReactNode;
  headerCenter?: ReactNode;
};

// Main layout wrapper for the game pages
export default async function GameFrame({
  children,
  headerCenter,
}: AppFrameProps) {
  // Create a server Supabase client that can read the user's session cookies
  const supabase = await createClient();

  // Fetch the current logged-in user (or null if not logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    // Main page container:
    // - min-h-[100dvh] makes the layout fit the visible screen height on mobile browsers
    // - centers the glass container horizontally
    // - aligns to top on mobile, but vertically centers on desktop (sm and up)
    <main className="min-h-[100dvh] flex justify-center items-start sm:items-center px-3 py-4 sm:px-6 sm:py-6">
      {/* The glass "app" container:
          - max width controls overall layout width
          - border + blur + gradient give the glassmorphism look
      */}
      <div className="relative w-full max-w-275 rounded-[18px] overflow-hidden bg-linear-to-b from-white/6 to-white/3 border border-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.45)] backdrop-blur-[10px]">
        {/* Header container:
            - gradient background + bottom border
            - contains brand, auth controls, and optional centered element
        */}
        <header className="relative bg-[linear-gradient(90deg,rgba(229,72,77,0.18),rgba(59,130,246,0.14)),rgba(15,23,42,0.55)] border-b border-white/10">
          {/* Header inner padding */}
          <div className="p-4">
            {/* Header layout:
                - Mobile (default): vertical stack (column)
                - Desktop (sm+): horizontal row with space-between
            */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              {/* Left side: Brand / Title */}
              <div className="shrink-0">
                {/* Brand pill */}
                <div className="text-white inline-block py-1.5 px-3 rounded-full bg-black/25 border border-white/12">
                  Pokédexdle
                </div>

                {/* Subtitle */}
                <div className="text-[#9aa6c3] text-[13px]">
                  Guess the Pokémon
                </div>
              </div>

              {/* Mobile-only center area:
                  - Only rendered if headerCenter is provided
                  - sm:hidden ensures it only appears on small screens
              */}
              {headerCenter && (
                <div className="flex justify-center sm:hidden">
                  {/* Constrains the button width on mobile to avoid huge full-width buttons */}
                  <div className="w-full max-w-[260px]">{headerCenter}</div>
                </div>
              )}

              {/* Right side: Auth controls (email + login/logout) */}
              <div className="shrink-0 flex flex-col gap-1 sm:items-end">
                {/* If user exists, show their email */}
                {user && (
                  <p className="text-white text-sm font-semibold break-all sm:break-normal">
                    {user.email}
                  </p>
                )}

                {/* If logged in, show LogOut component; otherwise show Login button */}
                {user ? (
                  <LogOut />
                ) : (
                  <Link href="/login">
                    {/* Button:
                        - min-h-[44px] ensures a good mobile tap target
                        - hover/active/focus styles for usability
                    */}
                    <button className="min-h-[44px] border border-white/[0.14] bg-black/10 text-[#e8eefc] py-2.5 px-3.5 rounded-xl font-bold cursor-pointer hover:bg-black/20 active:translate-y-px focus:outline-none focus:ring-2 focus:ring-white/20">
                      Login
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Desktop-only center element:
              - hidden on mobile (hidden sm:block)
              - absolutely centered within the header
              - only rendered if headerCenter exists
          */}
          {headerCenter && (
            <div className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {headerCenter}
            </div>
          )}
        </header>

        {/* Main content area:
            - Responsive padding
            - Centers children vertically in a column flow
            - gap controls spacing between child sections inside the page
        */}
        <section className="px-3 pb-4 pt-4 sm:p-4.5 flex flex-col items-center gap-3.5">
          {/* Page content injected from parent */}
          {children}
        </section>
      </div>
    </main>
  );
}
