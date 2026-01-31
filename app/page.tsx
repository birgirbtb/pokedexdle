import SearchPokemon from "./components/SearchPokemon";

export default function Page() {
  return (
    <main className="min-h-screen flex justify-center items-start p-[18px]">
      <div className="relative w-full max-w-[1100px] rounded-[18px] overflow-hidden bg-gradient-to-b from-white/[0.06] to-white/[0.03] border border-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.45)] backdrop-blur-[10px] after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[140px] after:pointer-events-none after:z-[5] after:bg-gradient-to-b after:from-[rgba(11,18,32,0)] after:via-[rgba(11,18,32,0.65)] after:to-[rgba(11,18,32,0.95)]">
        <header className="bg-[linear-gradient(90deg,rgba(229,72,77,0.18),rgba(59,130,246,0.14)),rgba(15,23,42,0.55)] border-b border-white/10">
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="text-white tracking-[0.2px] inline-block py-1.5 px-3 rounded-full bg-black/25 border border-white/12">
                Pokedexle
              </div>
              <div className="mt-1.5 text-[#9aa6c3] text-[13px]">
                Guess the Pokémon
              </div>
            </div>

            <div className="flex gap-2.5">
              <button className="border border-white/[0.14] bg-black/10 text-[#e8eefc] py-2.5 px-3.5 rounded-xl font-extrabold select-none active:translate-y-px">
                Login
              </button>
              <button className="bg-gradient-to-b from-[#22c55e] to-[#16a34a] border border-white/[0.18] text-[#e8eefc] py-2.5 px-3.5 rounded-xl font-extrabold select-none active:translate-y-px">
                Log Out
              </button>
            </div>
          </div>
        </header>

        <section className="p-[18px] flex flex-col items-center gap-3.5">
          {/* Image */}
          <div
            className="w-[360px] max-[820px]:w-full max-[820px]:max-w-[360px] h-[340px] rounded-2xl border border-white/10 bg-gradient-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-3.5"
            aria-label="Image"
          >
            <div className="h-full rounded-[14px] border border-white/10 bg-[radial-gradient(700px_400px_at_50%_30%,rgba(255,255,255,0.1),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.18))] grid place-items-center relative overflow-hidden">
              <div className="w-[220px] h-[220px] rounded-[40px] bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.18),transparent_55%),rgba(0,0,0,0.28)] border border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.35)]" />
            </div>
          </div>

          {/* Hints */}
          <div className="flex flex-wrap justify-center gap-2.5">
            <button className="rounded-full py-2.5 px-3.5 bg-black/[0.22] border border-white/12 text-white hover:bg-black/30">
              Type
            </button>
            <button className="rounded-full py-2.5 px-3.5 bg-black/[0.22] border border-white/12 text-white hover:bg-black/30">
              Secondary Type
            </button>
            <button className="rounded-full py-2.5 px-3.5 bg-black/[0.22] border border-white/12 text-white hover:bg-black/30">
              Evolution Stage
            </button>
            <button className="rounded-full py-2.5 px-3.5 bg-black/[0.22] border border-white/12 text-white hover:bg-black/30">
              Gen
            </button>
          </div>

          <SearchPokemon />

          {/* Attempts */}
          <div
            className="w-full max-w-[760px] rounded-2xl border border-white/10 bg-gradient-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-3.5"
            aria-label="Attempts"
          >
            <div className="flex justify-between gap-2.5 mb-2.5">
              <div className="text-white">Attempts</div>
              <div className="text-[#9aa6c3] text-xs">2 / 5 used</div>
            </div>

            <div className="flex gap-3.5 py-1 px-0.5 justify-start">
              <div className="w-[22px] h-[22px] rotate-45 rounded-[3px] shadow-[0_10px_18px_rgba(0,0,0,0.3)] bg-[red] border border-[rgba(229,72,77,0.55)]" />
              <div className="w-[22px] h-[22px] rotate-45 rounded-[3px] shadow-[0_10px_18px_rgba(0,0,0,0.3)] bg-[red] border border-[rgba(229,72,77,0.55)]" />
              <div className="w-[22px] h-[22px] rotate-45 rounded-[3px] border border-white/[0.18] bg-white/[0.8] shadow-[0_10px_18px_rgba(0,0,0,0.3)]" />
              <div className="w-[22px] h-[22px] rotate-45 rounded-[3px] border border-white/[0.18] bg-white/[0.8] shadow-[0_10px_18px_rgba(0,0,0,0.3)]" />
              <div className="w-[22px] h-[22px] rotate-45 rounded-[3px] border border-white/[0.18] bg-white/[0.8] shadow-[0_10px_18px_rgba(0,0,0,0.3)]" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
