"use client";

import { useEffect, useRef, useState } from "react";
import { searchPokemon } from "@/app/actions/pokemon";

interface Pokemon {
  name: string;
  url: string;
}

interface Props {
  correctPokemon: string;
  maxAttempts?: number;
  onGuess?: (isCorrect: boolean, guessName: string) => void;
}

export default function SearchPokemon({
  correctPokemon,
  maxAttempts = 6,
  onGuess,
}: Props) {
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState<Pokemon[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // 🔍 Search effect
  useEffect(() => {
    if (!isTyping || !searchInput.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timeout = setTimeout(async () => {
      const data = await searchPokemon(searchInput);
      setResults(data);
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput, isTyping]);

  // 🎯 Guess handler
  const handleGuess = () => {
    if (!selectedPokemon) return;

    const isCorrect =
      selectedPokemon.name.toLowerCase() === correctPokemon.toLowerCase();

    if (!isCorrect) {
      setIncorrectGuesses((prev) => Math.min(prev + 1, maxAttempts));
    }

    onGuess?.(isCorrect, selectedPokemon.name);

    setSearchInput("");
    setSelectedPokemon(null);
    setShowDropdown(false);
    setIsTyping(false);
  };

  return (
    <div className="w-full max-w-190 rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-3.5">
      {/* Header */}
      <div className="flex justify-between gap-2.5 mb-2.5">
        <div className="text-white font-medium">Your guess</div>
        <div className="text-[#9aa6c3] text-xs">Start typing to search</div>
      </div>

      {/* Input */}
      <div className="h-12 rounded-[14px] border border-white/[0.14] bg-linear-to-b from-white/10 to-black/18 grid grid-cols-[1fr_120px] items-center overflow-hidden">
        <input
          ref={inputRef}
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setIsTyping(true);
            setShowDropdown(true);
          }}
          placeholder="Search Pokémon..."
          className="w-full h-full bg-transparent border-none outline-none px-3 text-sm font-bold text-[#e8eefc] placeholder:text-[rgba(154,166,195,0.7)]"
        />

        <button
          onClick={handleGuess}
          className="h-full border-l border-white/12 bg-linear-to-b from-[#22c55e] to-[#16a34a] text-white font-bold cursor-pointer select-none active:translate-y-px"
        >
          Guess
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="mt-2.5 rounded-[14px] overflow-hidden border border-white/10 bg-[rgba(15,23,42,0.92)]">
          {results.slice(0, 3).map((pokemon) => (
            <div
              key={pokemon.name}
              onClick={() => {
                setSelectedPokemon(pokemon);
                setSearchInput(pokemon.name);
                setShowDropdown(false);
                setIsTyping(false);
                inputRef.current?.blur();
              }}
              className="w-full flex items-center gap-2.5 py-2.5 px-3 text-left border-t border-white/6 first:border-t-0 hover:bg-white/6 cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[rgba(229,72,77,0.9)] shadow-[0_0_0_2px_rgba(255,255,255,0.12)_inset]" />

              <span className="text-[#e8eefc]">
                {pokemon.name.charAt(0).toUpperCase() +
                  pokemon.name.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 💎 Attempts */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-3">
          {Array.from({ length: maxAttempts }).map((_, i) => (
            <div
              key={i}
              className={`
                w-5.5 h-5.5 rotate-45 rounded-[3px] border
                ${
                  i < incorrectGuesses
                    ? "bg-red-500 border-white/18 shadow-[0_10px_18px_rgba(0,0,0,0.3)]"
                    : "bg-white/80 border-white/18 shadow-[0_10px_18px_rgba(0,0,0,0.3)]"
                }
              `}
            />
          ))}
        </div>

        <div className="text-[#9aa6c3] text-xs font-medium">
          {incorrectGuesses} / {maxAttempts} attempts used
        </div>
      </div>
    </div>
  );
}