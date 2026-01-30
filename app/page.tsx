"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PokeListResult = { name: string; url: string };
type PokeListResponse = { results: PokeListResult[] };

export default function Page() {
  const [allNames, setAllNames] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000");
        if (!res.ok) throw new Error(`PokeAPI error: ${res.status}`);

        const data = (await res.json()) as PokeListResponse;
        const names = data.results.map((r) => r.name);
        if (!cancelled) setAllNames(names);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const top3 = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allNames.filter((n) => n.includes(q)).slice(0, 3);
  }, [allNames, query]);

  function pick(name: string) {
    setQuery(name);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "Enter") {
      if (top3.length > 0) pick(top3[0]);
      else setOpen(false);
    }
  }

  useEffect(() => {
    function onDocMouseDown(ev: MouseEvent) {
      const el = wrapRef.current;
      if (!el) return;
      if (!el.contains(ev.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

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
          <div
            className="w-[360px] max-[820px]:w-full max-[820px]:max-w-[360px] h-[340px] rounded-2xl border border-white/10 bg-gradient-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-3.5"
            aria-label="Image"
          >
            <div className="h-full rounded-[14px] border border-white/10 bg-[radial-gradient(700px_400px_at_50%_30%,rgba(255,255,255,0.1),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.18))] grid place-items-center relative overflow-hidden">
              <div className="w-[220px] h-[220px] rounded-[40px] bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.18),transparent_55%),rgba(0,0,0,0.28)] border border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.35)]" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5">
            <button className="border-none rounded-full py-2.5 px-3.5 bg-black/[0.22] text-[#e8eefc] border border-white/12 text-white hover:bg-black/30">
              Type
            </button>
            <button className="border-none rounded-full py-2.5 px-3.5 bg-black/[0.22] text-[#e8eefc] border border-white/12 text-white hover:bg-black/30">
              Secondary Type
            </button>
            <button className="border-none rounded-full py-2.5 px-3.5 bg-black/[0.22] text-[#e8eefc] border border-white/12 text-white hover:bg-black/30">
              Evolution Stage
            </button>
            <button className="border-none rounded-full py-2.5 px-3.5 bg-black/[0.22] text-[#e8eefc] border border-white/12 text-white hover:bg-black/30">
              Gen
            </button>
          </div>

          <div
            className="w-full max-w-[760px] rounded-2xl border border-white/10 bg-gradient-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-3.5"
            aria-label="Picker"
            ref={wrapRef}
          >
            <div className="flex justify-between gap-2.5 mb-2.5">
              <div className="text-white">Your guess</div>
              <div className="text-[#9aa6c3] text-xs">
                {loading ? "Loading Pokédex…" : "Start typing to search"}
              </div>
            </div>

            <div className="h-12 rounded-[14px] border border-white/[0.14] bg-gradient-to-b from-white/10 to-black/[0.18] grid grid-cols-[54px_1fr_120px] items-center overflow-hidden">
              <div
                className="w-[34px] h-[34px] rounded-full relative ml-3 shadow-[0_10px_18px_rgba(0,0,0,0.35)] overflow-hidden border border-white/[0.14]"
                aria-hidden="true"
              >
                <div className="absolute inset-x-0 top-0 bottom-1/2 bg-gradient-to-b from-[#e5484d] to-[#c6282d]" />
                <div className="absolute inset-x-0 top-1/2 bottom-0 bg-white/[0.88]" />
                <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 bg-black/[0.85]" />
                <div className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 border-2 border-black/[0.85]" />
              </div>

              <input
                className="w-full h-full bg-transparent border-none outline-none text-[#e8eefc] font-bold text-sm px-2.5 placeholder:text-[rgba(154,166,195,0.7)]"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
                placeholder={loading ? "Loading..." : "Type a Pokémon name"}
                spellCheck={false}
                autoComplete="off"
              />

              <button
                className="h-full border-none text-white text-white/95 bg-gradient-to-b from-[#22c55e] to-[#16a34a] border-l border-white/12 select-none"
                onClick={() => setOpen((o) => !o)}
              >
                Guess
              </button>
            </div>

            {open && query.trim().length > 0 && (
              <div
                className="mt-2.5 rounded-[14px] overflow-hidden border border-white/10 bg-[rgba(15,23,42,0.92)]"
                aria-label="Results"
              >
                {top3.length === 0 ? (
                  <div className="py-2.5 px-3 border-t border-white/[0.06] flex items-center gap-2.5 first:border-t-0 text-[#9aa6c3]">
                    No matches
                  </div>
                ) : (
                  top3.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className="w-full bg-transparent border-none py-2.5 px-3 border-t border-white/[0.06] flex items-center gap-2.5 first:border-t-0 hover:bg-white/[0.06] focus:outline-none focus:bg-white/[0.08] cursor-pointer text-inherit font-inherit text-left"
                      onClick={() => pick(name)}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-[rgba(229,72,77,0.9)] shadow-[0_0_0_2px_rgba(255,255,255,0.12)_inset]"
                        aria-hidden="true"
                      />
                      {name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div
            className="w-full max-w-[760px] rounded-2xl border border-white/10 bg-gradient-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-3.5 mt-0"
            aria-label="Attempts"
          >
            <div className="flex justify-between gap-2.5 mb-2.5">
              <div className="text-white">Attempts</div>
              <div className="text-[#9aa6c3] text-xs">2 / 5 used</div>
            </div>

            <div className="flex gap-3.5 py-1 px-0.5 justify-start">
              <div className="w-[22px] h-[22px] rotate-45 rounded-[3px] border border-white/[0.18] bg-red/[0.8] shadow-[0_10px_18px_rgba(0,0,0,0.3)] bg-[rgba(229,72,77,0.25)] border-[rgba(229,72,77,0.55)]" />
              <div className="w-[22px] h-[22px] rotate-45 rounded-[3px] border border-white/[0.18] bg-red/[0.8] shadow-[0_10px_18px_rgba(0,0,0,0.3)] bg-[rgba(229,72,77,0.25)] border-[rgba(229,72,77,0.55)]" />
              <div className="w-[22px] h-[22px] rotate-45 rounded-[3px] border border-white/[0.18] bg-white/[0.4] shadow-[0_10px_18px_rgba(0,0,0,0.3)]" />
              <div className="w-[22px] h-[22px] rotate-45 rounded-[3px] border border-white/[0.18] bg-white/[0.4] shadow-[0_10px_18px_rgba(0,0,0,0.3)]" />
              <div className="w-[22px] h-[22px] rotate-45 rounded-[3px] border border-white/[0.18] bg-white/[0.4] shadow-[0_10px_18px_rgba(0,0,0,0.3)]" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
