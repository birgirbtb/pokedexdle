import Link from "next/link";

export default function HistoryPage() {
  return (
    // Full viewport height, center the app container horizontally
    <main className="min-h-screen flex justify-center items-start p-4.5">
      {/* Main glass container */}
      <div
        className="
          relative w-full max-w-[1100px]
          rounded-[18px] overflow-hidden
          bg-gradient-to-b from-white/[0.06] to-white/[0.03]
          border border-white/10
          shadow-[0_22px_55px_rgba(0,0,0,0.45)]
          backdrop-blur-[10px]
        "
      >
        {/* Header bar */}
        <header
          className="
            relative
            bg-[linear-gradient(90deg,rgba(229,72,77,0.18),rgba(59,130,246,0.14)),rgba(15,23,42,0.55)]
            border-b border-white/10
          "
        >
          {/* Left/Right header layout */}
          <div className="flex items-center justify-between gap-4 p-4">
            {/* Left: brand goes back to home */}
            <Link href="/" className="block">
              <div>
                <div className="text-white inline-block py-1.5 px-3 rounded-full bg-black/25 border border-white/12">
                  Pokedexle
                </div>
                <div className="text-[#9aa6c3] text-[13px]">Guess the Pokémon</div>
              </div>
            </Link>

            {/* Right: Login (replace later with LogOut/user if you want) */}
            <Link href="/login">
              <button
                type="button"
                className="
                  border border-white/[0.14] bg-black/10
                  text-[#e8eefc]
                  py-2.5 px-3.5 rounded-xl
                  font-bold
                  hover:bg-black/20
                  active:translate-y-px
                "
              >
                Login
              </button>
            </Link>
          </div>

          {/* Center: back button (absolute = truly centered) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/">
              <button
                type="button"
                className="
                  px-5 py-2.5 rounded-xl
                  font-extrabold
                  border border-white/14
                  bg-black/30 text-[#e8eefc]
                  hover:bg-black/40
                  active:translate-y-px
                  select-none
                "
              >
                Back to Game
              </button>
            </Link>
          </div>
        </header>

        {/* Page content padding */}
        <section className="p-6">
          <h1 className="text-white text-2xl font-extrabold">Guess History</h1>

          {/* Outer history panel */}
          <div
            className="
              mt-4
              rounded-2xl
              border border-white/10
              bg-black/20
              shadow-[0_10px_26px_rgba(0,0,0,0.35)]
              p-5
            "
          >
            {/* Rows container */}
            <div className="flex flex-col gap-4">
              {/* ===== Row: Day 12 ===== */}
              <div className="flex items-center gap-6">
                {/* Left label */}
                <div className="w-28 text-[#9aa6c3]">Day 12</div>

                {/* Result squares row */}
                <div className="flex gap-2">
                  {/* Wrong */}
                  <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
                  {/* Wrong */}
                  <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
                  {/* Wrong */}
                  <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
                  {/* Wrong */}
                  <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
                  {/* Correct */}
                  <div className="w-7 h-7 rounded-md bg-emerald-500/70 border border-emerald-400/50" />
                </div>
              </div>

              {/* ===== Row: Day 11 ===== */}
              <div className="flex items-center gap-6">
                <div className="w-28 text-[#9aa6c3]">Day 11</div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
                  <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
                  <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
                  <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
                  <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
                  <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
                </div>
              </div>

              {/* ===== Row: Day 10 ===== */}
              <div className="flex items-center gap-6">
                <div className="w-28 text-[#9aa6c3]">Day 10</div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/70 border border-emerald-400/50" />
                </div>
              </div>

              {/* ===== Row: Day 9 (not played / muted) ===== */}
              <div className="flex items-center gap-6 opacity-60">
                <div className="w-28 text-[#9aa6c3]">Day 9</div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10" />
                </div>
              </div>
            </div>

            {/* Legend under the panel */}
            <div className="mt-6 flex flex-wrap gap-6 text-[#9aa6c3]">
              {/* Correct */}
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-md bg-emerald-500/70 border border-emerald-400/50" />
                <span>Correct</span>
              </div>

              {/* Wrong */}
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-md bg-red-500/70 border border-red-400/50" />
                <span>Wrong</span>
              </div>

              {/* Not played */}
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-md bg-white/5 border border-white/10" />
                <span>Not played</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
