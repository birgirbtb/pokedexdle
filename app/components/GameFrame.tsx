// -----------------------------------------------------------------------------
// GameFrame.tsx
// -----------------------------------------------------------------------------
// App-wide layout frame for the game pages.
// - Glass container shell
// - Header (brand, optional centered button, auth)
// - Background visuals (extra desktop-only pokéballs OUTSIDE the panel)
// - Background visuals (your desktop-only pokéball INSIDE the panel)
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

// Small reusable pokéball visual (pure JSX)
// NOTE: Used for the 5 extra OUTSIDE-the-panel pokéballs
function PokeBallOutline({
  className,
  size = 140,
  opacity = 0.14,
  blueSpeed = 5,
  redSpeed = 5,
  blueAlpha = 0.9,
  redAlpha = 0.85,
  glowBlue = 0.28,
  glowRed = 0.24,
  ring = 5,
}: {
  className: string; // Positioning + responsive visibility
  size?: number; // Width/height in px
  opacity?: number; // Overall pokéball opacity
  blueSpeed?: number; // Seconds per full spin
  redSpeed?: number; // Seconds per full spin (reverse)
  blueAlpha?: number; // Tracer brightness (0..1)
  redAlpha?: number; // Tracer brightness (0..1)
  glowBlue?: number; // Glow strength (0..1)
  glowRed?: number; // Glow strength (0..1)
  ring?: number; // Ring thickness for the tracer mask
}) {
  // Inline size style (keeps Tailwind classes simpler)
  const sizeStyle = { width: `${size}px`, height: `${size}px` };

  return (
    // Wrapper handles placement; children are the pokéball drawing
    <div className={className}>
      {/* Size box */}
      <div className="relative" style={sizeStyle}>
        {/* Outer circle */}
        <div
          className="absolute inset-0 rounded-full border border-white/20"
          style={{ opacity }}
        />

        {/* Horizontal seam */}
        <div
          className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/20"
          style={{ opacity }}
        />

        {/* Center button ring */}
        <div
          className="absolute left-1/2 top-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20"
          style={{ opacity }}
        />

        {/* Center button core */}
        <div
          className="absolute left-1/2 top-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10"
          style={{ opacity }}
        />

        {/* Blue tracer */}
        <div
          className="
            absolute inset-0 rounded-full
            motion-safe:animate-spin
          "
          style={{
            opacity,
            animationDuration: `${blueSpeed}s`,
            background: `conic-gradient(from 0deg, transparent 0 84%, rgba(56,189,248,${blueAlpha}) 88%, transparent 100%)`,
            filter: `drop-shadow(0 0 8px rgba(56,189,248,${glowBlue}))`,
            WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 calc(100% - ${ring}px))`,
            mask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 calc(100% - ${ring}px))`,
          }}
        />

        {/* Red tracer (reverse) */}
        <div
          className="
            absolute inset-0 rounded-full
            motion-safe:animate-spin
          "
          style={{
            opacity,
            animationDuration: `${redSpeed}s`,
            background: `conic-gradient(from 180deg, transparent 0 83%, rgba(244,63,94,${redAlpha}) 87%, transparent 100%)`,
            filter: `drop-shadow(0 0 8px rgba(244,63,94,${glowRed}))`,
            WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 calc(100% - ${ring}px))`,
            mask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 calc(100% - ${ring}px))`,
          }}
        />
      </div>
    </div>
  );
}

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
      {/* OUTSIDE THE PANEL: 6 DESKTOP-ONLY POKÉBALLS                          */}
      {/* -------------------------------------------------------------------- */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
        {/* 1) Top-left */}
        <PokeBallOutline
          className="absolute left-[7%] top-[10%] -translate-x-1/2 -translate-y-1/2"
          size={170}
          opacity={0.75}
        />

        {/* 2) Bottom-left */}
        <PokeBallOutline
          className="absolute left-[7%] top-[80%] -translate-x-1/2 -translate-y-1/2"
          size={170}
          opacity={0.75}
        />

        {/* 3) Top-right */}
        <PokeBallOutline
          className="absolute left-[93%] top-[10%] -translate-x-1/2 -translate-y-1/2"
          size={170}
          opacity={0.75}
        />

        {/* 5) Bottom-right */}
        <PokeBallOutline
          className="absolute left-[93%] top-[80%] -translate-x-1/2 -translate-y-1/2"
          size={170}
          opacity={0.75}
        />

        {/* Soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_50%_40%,rgba(0,0,0,0),rgba(0,0,0,0.55))]" />
      </div>

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