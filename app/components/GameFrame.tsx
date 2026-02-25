// -----------------------------------------------------------------------------
// GameFrame.tsx
// -----------------------------------------------------------------------------
// App-wide layout frame for the game pages.
// - Glass container shell
// - Header (brand, optional centered button, auth)
// - Page content (children)
// -----------------------------------------------------------------------------

import type { ReactNode } from "react";
import Link from "next/link";
import LogOut from "../(auth)/components/LogOut";
import { createClient } from "@/lib/supabase/server";

// Props accepted by the frame
type AppFrameProps = {
  children: ReactNode;
  headerCenter?: ReactNode;
};

export default async function GameFrame({
  children,
  headerCenter,
}: AppFrameProps) {
  // Create a server-side Supabase client (cookie-based auth)
  const supabase = await createClient();

  // Read current user (if logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    // Full viewport height (dvh handles mobile browser bars better than vh)
    // relative -> allows OUTSIDE-the-panel background visuals to position correctly
    <main className="relative min-h-[100dvh] flex justify-center items-start sm:items-center px-3 py-4 sm:px-6 sm:py-6 overflow-hidden">
      {/* -------------------------------------------------------------------- */}
      {/* Main glass container                                                  */}
      {/* -------------------------------------------------------------------- */}
      <div className="relative z-10 w-full max-w-275 rounded-[18px] overflow-hidden bg-linear-to-b from-white/6 to-white/3 border border-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.45)] backdrop-blur-[10px]">
        {/* ------------------------------------------------------------------ */}
        {/* Header                                                             */}
        {/* ------------------------------------------------------------------ */}
        <header className="relative z-10 bg-[linear-gradient(90deg,rgba(229,72,77,0.18),rgba(59,130,246,0.14)),rgba(15,23,42,0.55)] border-b border-white/10">
          {/* Header padding wrapper */}
          <div className="p-4">
            {/* Mobile: stacked, Desktop: single row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              {/* Brand */}
              <div className="shrink-0">
                <div className="text-white inline-block py-1.5 px-3 rounded-full bg-black/25 border border-white/12">
                  Pokédexdle
                </div>
                <div className="text-[#9aa6c3] text-[13px]">
                  Guess the Pokémon
                </div>
              </div>

              {/* Mobile headerCenter row */}
              {headerCenter && (
                <div className="flex justify-center sm:hidden">
                  <div className="w-full max-w-[260px]">{headerCenter}</div>
                </div>
              )}

              {/* Auth */}
              <div className="shrink-0 flex flex-col gap-1 sm:items-end">
                {user && (
                  <p className="text-white text-sm font-semibold break-all sm:break-normal">
                    {user.email}
                  </p>
                )}

                {user ? (
                  <LogOut />
                ) : (
                  <Link href="/login">
                    <button className="min-h-[44px] border border-white/[0.14] bg-black/10 text-[#e8eefc] py-2.5 px-3.5 rounded-xl font-bold cursor-pointer hover:bg-black/20 active:translate-y-px focus:outline-none focus:ring-2 focus:ring-white/20">
                      Login
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Desktop headerCenter (true center) */}
          {headerCenter && (
            <div className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {headerCenter}
            </div>
          )}
        </header>

        {/* ------------------------------------------------------------------ */}
        {/* Page content                                                       */}
        {/* ------------------------------------------------------------------ */}
        <section className="relative z-10 px-3 pb-4 pt-4 sm:p-4.5 flex flex-col items-center gap-3.5">
          {children}
        </section>
      </div>
    </main>
  );
}