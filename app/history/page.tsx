import Link from "next/link";

export default function HistoryPage() {
  return (
    <main className="min-h-screen flex justify-center items-start p-[18px]">
      <div className="w-full max-w-[1100px] rounded-[18px] overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] shadow-[0_22px_55px_rgba(0,0,0,0.45)] backdrop-blur-[10px]">

        {/* Header */}
        <header className="relative border-b border-white/10 bg-[linear-gradient(90deg,rgba(229,72,77,0.18),rgba(59,130,246,0.14)),rgba(15,23,42,0.55)]">
          <div className="flex items-center justify-between gap-4 p-4">
            {/* Brand */}
            <div>
              <div className="text-white inline-block py-1.5 px-3 rounded-full bg-black/25 border border-white/12">
                Pokedexle
              </div>
              <div className="text-[#9aa6c3] text-[13px]">
                History
              </div>
            </div>

            {/* Back button */}
            <Link
              href="/"
              className="px-4 py-2 rounded-xl font-extrabold
                         border border-white/14 bg-black/30
                         text-[#e8eefc] hover:bg-black/40
                         active:translate-y-px select-none"
            >
              Back to Game
            </Link>
          </div>
        </header>

        {/* ================= HISTORY ================= */}
        <section className="p-[18px] flex flex-col gap-4">
          <h1 className="text-white text-lg font-extrabold">
            Guess History
          </h1>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 flex flex-col gap-3">

            {/* One row = one day */}

            <div className="flex items-center gap-3">
              <div className="w-20 text-xs text-[#9aa6c3]">Day 12</div>
              <div className="flex gap-1.5">
                <div className="w-5 h-5 rounded-sm bg-green-500/40 border border-green-500/60" />
                <div className="w-5 h-5 rounded-sm bg-green-500/40 border border-green-500/60" />
                <div className="w-5 h-5 rounded-sm bg-red-500/40 border border-red-500/60" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-20 text-xs text-[#9aa6c3]">Day 11</div>
              <div className="flex gap-1.5">
                <div className="w-5 h-5 rounded-sm bg-red-500/40 border border-red-500/60" />
                <div className="w-5 h-5 rounded-sm bg-red-500/40 border border-red-500/60" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-20 text-xs text-[#9aa6c3]">Day 10</div>
              <div className="flex gap-1.5">
                <div className="w-5 h-5 rounded-sm bg-green-500/40 border border-green-500/60" />
              </div>
            </div>

            {/* Did not play */}
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-20 text-xs text-[#9aa6c3]">Day 9</div>
              <div className="flex gap-1.5">
                <div className="w-5 h-5 rounded-sm bg-white/10 border border-white/20" />
              </div>
            </div>

          </div>

          {/* Legend */}
          <div className="flex gap-4 text-xs text-[#9aa6c3]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-green-500/40 border border-green-500/60" />
              Correct
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-red-500/40 border border-red-500/60" />
              Wrong
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-white/10 border border-white/20" />
              Not played
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
