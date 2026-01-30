"use client";

import { useState, useRef, useEffect } from "react";
import { searchPokemon } from "@/app/actions/pokemon";

type Pokemon = {
  name: string;
};

export default function SearchPokemon() {
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState<Pokemon[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const performSearch = async () => {
      if (searchInput.trim().length === 0) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      try {
        const results = await searchPokemon(searchInput);
        setResults(results);
        setShowDropdown(true);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  const handleSelectPokemon = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setSearchInput(pokemon.name);
    setShowDropdown(false);
  };

  const handleGuess = () => {
    if (selectedPokemon) {
      console.log("Guessing:", selectedPokemon.name);
      // Game logic goes here
    }
  };

  return (
    <div
      className="w-full max-w-[760px] rounded-2xl border border-white/10
                 bg-gradient-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)]
                 shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-3.5"
      aria-label="Picker"
    >
      {/* Header */}
      <div className="flex justify-between gap-2.5 mb-2.5">
        <div className="text-white font-medium">Your guess</div>
        <div className="text-[#9aa6c3] text-xs">Start typing to search</div>
      </div>

      {/* Input bar */}
      <div
        className="h-12 rounded-[14px] border border-white/[0.14]
                   bg-gradient-to-b from-white/10 to-black/[0.18]
                   grid grid-cols-[54px_1fr_120px] items-center overflow-hidden"
      >
        {/* Pokéball icon */}
        <div
          className="w-[34px] h-[34px] rounded-full relative ml-3
                     shadow-[0_10px_18px_rgba(0,0,0,0.35)]
                     overflow-hidden border border-white/[0.14]"
          aria-hidden="true"
        >
          <div className="absolute inset-x-0 top-0 bottom-1/2 bg-gradient-to-b from-[#e5484d] to-[#c6282d]" />
          <div className="absolute inset-x-0 top-1/2 bottom-0 bg-white/[0.88]" />
          <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 bg-black/[0.85]" />
          <div className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border-2 border-black/[0.85]" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onFocus={() => searchInput && setShowDropdown(true)}
          placeholder="Search Pokémon..."
          spellCheck={false}
          autoComplete="off"
          className="w-full h-full bg-transparent border-none outline-none
                     px-2.5 text-sm font-bold text-[#e8eefc]
                     placeholder:text-[rgba(154,166,195,0.7)]"
        />

        {/* Guess button */}
        <button
          type="button"
          onClick={handleGuess}
          className="h-full border-l border-white/12
                     bg-gradient-to-b from-[#22c55e] to-[#16a34a]
                     text-white font-extrabold select-none
                     active:translate-y-px"
        >
          Guess
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && results.length > 0 && (
        <div
          className="mt-2.5 rounded-[14px] overflow-hidden
                     border border-white/10
                     bg-[rgba(15,23,42,0.92)]"
        >
          {results.map((pokemon) => (
            <button
              key={pokemon.name}
              type="button"
              onClick={() => handleSelectPokemon(pokemon)}
              className="w-full flex items-center gap-2.5
                         py-2.5 px-3 text-left
                         border-t border-white/[0.06] first:border-t-0
                         hover:bg-white/[0.06] focus:outline-none
                         cursor-pointer"
            >
              <span
                className="w-2.5 h-2.5 rounded-full
                           bg-[rgba(229,72,77,0.9)]
                           shadow-[0_0_0_2px_rgba(255,255,255,0.12)_inset]"
                aria-hidden="true"
              />
              <span className="text-[#e8eefc]">
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </span>
            </button>
          ))}

          {results.length >= 3 && (
            <div className="py-2.5 px-3 border-t border-white/[0.06] text-[#9aa6c3]">
              …more results
            </div>
          )}
        </div>
      )}
    </div>
  );
}
