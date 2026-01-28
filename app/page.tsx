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
        const names = data.results.map(r => r.name);
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
    return allNames
      .filter(n => n.includes(q))
      .slice(0, 3);
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
    <main className="page">
      <div className="app">
        <header className="topbar">
          <div className="topbarInner">
            <div className="brand">
              <div className="brandTitle">Pokedexle</div>
              <div className="brandSub">Guess the Pokémon</div>
            </div>

            <div className="auth">
              <button className="btn btnGhost">Login</button>
              <button className="btn btnPrimary">Log Out</button>
            </div>
          </div>
        </header>

        <section className="content">
          <div className="card imageCard" aria-label="Image">
            <div className="imageInner">
              <div className="imageSilhouette" />
            </div>
          </div>

          <div className="hintRow">
            <button className="chip">Type</button>
            <button className="chip">Secondary Type</button>
            <button className="chip">Evolution Stage</button>
            <button className="chip">Gen</button>
          </div>

          <div className="card pickerCard" aria-label="Picker" ref={wrapRef}>
            <div className="pickerTop">
              <div className="pickerLabel">Your guess</div>
              <div className="pickerHint">
                {loading ? "Loading Pokédex…" : "Start typing to search"}
              </div>
            </div>

            <div className="pickerBar">
              <div className="pokeIcon" aria-hidden="true">
                <div className="pokeTop" />
                <div className="pokeMid" />
                <div className="pokeBot" />
                <div className="pokeCore" />
              </div>

              <input
                className="guessInput"
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

              <button className="guessBtn" onClick={() => setOpen(o => !o)}>
                Guess
              </button>
            </div>

            {open && query.trim().length > 0 && (
              <div className="dropdown" aria-label="Results">
                {top3.length === 0 ? (
                  <div className="ddItem muted">No matches</div>
                ) : (
                  top3.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className="ddItem ddBtn"
                      onClick={() => pick(name)}
                    >
                      <span className="dot" aria-hidden="true" />
                      {name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="attemptsBlock" aria-label="Attempts">
            <div className="attemptsTop">
              <div className="attemptsLabel">Attempts</div>
              <div className="attemptsMeta">2 / 5 used</div>
            </div>

            <div className="attempts">
              <div className="diamond filled" />
              <div className="diamond filled" />
              <div className="diamond" />
              <div className="diamond" />
              <div className="diamond" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
