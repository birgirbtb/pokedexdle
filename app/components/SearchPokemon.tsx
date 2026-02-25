"use client";

/* -------------------------------------------------------------------------- */
/*                               SearchPokemon                                */
/* -------------------------------------------------------------------------- */
/*
  Search + Guess UI
  - Input
  - Dropdown results
  - Guess button
  - Cooldown overlay
  - Attempts indicator
  - Small animated Pokéball icon inside the search bar
*/

import { useEffect, useRef, useState } from "react"; // React hooks
import { searchPokemon } from "@/lib/actions/pokemon"; // Server action for suggestions
import { SlideDown } from "./Animated"; // Smooth dropdown open/close animation

/* ---------------------------- Data Type Shapes ---------------------------- */

interface Pokemon {
  name: string;
  url: string;
}

interface Props {
  maxAttempts?: number;
  attemptsUsed: number;
  onGuess: (guessName: string) => Promise<void>;
  disabled?: boolean;
  nextGuessAt?: string;
  won?: boolean;
}

/* ------------------------------ Component --------------------------------- */

export default function SearchPokemon({
  maxAttempts = 6,
  attemptsUsed,
  onGuess,
  disabled = false,
  nextGuessAt,
  won = false,
}: Props) {
  /* -------------------------------- State -------------------------------- */

  // Current text typed by user
  const [searchInput, setSearchInput] = useState("");

  // Results from server action
  const [results, setResults] = useState<Pokemon[]>([]);

  // Dropdown visibility toggle
  const [showDropdown, setShowDropdown] = useState(false);

  // Selected pokemon from dropdown (required to guess)
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  // Tracks if user is actively typing (controls search effect)
  const [isTyping, setIsTyping] = useState(false);

  // Cooldown overlay text while disabled (daily mode)
  const [cooldownText, setCooldownText] = useState<string | null>(null);

  /* --------------------------------- Refs -------------------------------- */

  // Allows us to blur the input after selecting (mobile keyboard)
  const inputRef = useRef<HTMLInputElement>(null);

  /* ------------------------- Debounced Search Effect ---------------------- */

  useEffect(() => {
    // If user isn't typing or input is empty, clear and close
    if (!isTyping || !searchInput.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // Debounce the search requests
    const timeout = setTimeout(async () => {
      const data = await searchPokemon(searchInput); // Fetch matches
      setResults(data); // Store
      setShowDropdown(true); // Show dropdown
    }, 300);

    // Cleanup debounce timer
    return () => clearTimeout(timeout);
  }, [searchInput, isTyping]);

  /* --------------------------- Cooldown Timer ----------------------------- */

  useEffect(() => {
    // If enabled OR missing nextGuessAt, remove cooldown text
    if (!disabled || !nextGuessAt) {
      setCooldownText(null);
      return;
    }

    // Disabled mode should close dropdown + stop typing mode
    setShowDropdown(false);
    setIsTyping(false);

    // Parse target time
    const target = new Date(nextGuessAt).getTime();

    // Guard invalid date
    if (Number.isNaN(target)) {
      setCooldownText(null);
      return;
    }

    // Build HH:MM:SS countdown string
    const updateCooldown = () => {
      const remainingMs = Math.max(0, target - Date.now());
      const totalSeconds = Math.ceil(remainingMs / 1000);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setCooldownText(
        `Next guess in ${String(hours).padStart(2, "0")}:${String(
          minutes,
        ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      );
    };

    // Initial render
    updateCooldown();

    // Tick every second
    const interval = setInterval(updateCooldown, 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, [disabled, nextGuessAt]);

  /* ---------------------------- Guess Handler ----------------------------- */

  const handleGuess = async () => {
    // Stop if disabled
    if (disabled) return;

    // Require a selection
    if (!selectedPokemon) return;

    // Send to parent handler
    await onGuess(selectedPokemon.name);

    // Reset state after guess
    setSearchInput("");
    setSelectedPokemon(null);
    setShowDropdown(false);
    setIsTyping(false);
  };

  /* ------------------------------- Render --------------------------------- */

  return (
    // Card container
    <div className="w-full max-w-190 rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-3.5">
      {/* Header row */}
      <div className="flex justify-between gap-2.5 mb-2.5">
        <div className="text-white font-medium">Your guess</div>
        <div className="text-[#9aa6c3] text-xs">Start typing to search</div>
      </div>

      {/* Input row (icon + input + button) */}
      <div
        className={[
          "relative",
          "h-12",
          "rounded-[14px]",
          "border",
          "border-white/[0.14]",
          "bg-linear-to-b",
          "from-white/10",
          "to-black/18",
          "grid",
          "grid-cols-[54px_1fr_120px]",
          "items-center",
          "overflow-hidden",
          disabled ? "opacity-60" : "",
        ].join(" ")}
        aria-disabled={disabled}
      >
        {/* ------------------------------------------------------------------ */}
        {/* Small OUTLINE + TRACERS Pokéball  */}
        {/* ------------------------------------------------------------------ */}
        <div
          className="
            relative
            w-[34px] h-[34px]
            ml-3
            pointer-events-none
            opacity-[0.95]
          "
          aria-hidden="true"
        >
          {/* Outer circle outline */}
          <div className="absolute inset-0 rounded-full border border-white/30" />

          {/* Horizontal seam */}
          <div className="absolute left-[2px] right-[2px] top-1/2 h-px -translate-y-1/2 bg-white/25" />

          {/* Center button ring */}
          <div className="absolute left-1/2 top-1/2 w-[10px] h-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />

          {/* Center button core */}
          <div className="absolute left-1/2 top-1/2 w-[5px] h-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15" />

          {/* Tracer 1 (forward spin) */}
          <div
            className="
              absolute inset-0 rounded-full
              motion-safe:animate-spin
              [animation-duration:22s]
              [background:conic-gradient(from_0deg,transparent_0_84%,rgba(56,189,248,1)_88%,transparent_100%)]
              [filter:drop-shadow(0_0_6px_rgba(56,189,248,0.35))]
              [-webkit-mask:radial-gradient(farthest-side,transparent_calc(100%_-_3px),#000_calc(100%_-_3px))]
              [mask:radial-gradient(farthest-side,transparent_calc(100%_-_3px),#000_calc(100%_-_3px))]
            "
          />

          {/* Tracer 2 (reverse spin) */}
          <div
            className="
              absolute inset-0 rounded-full
              motion-safe:animate-spin
              [animation-duration:30s]
              [animation-direction:reverse]
              [background:conic-gradient(from_180deg,transparent_0_83%,rgba(244,63,94,1)_87%,transparent_100%)]
              [filter:drop-shadow(0_0_6px_rgba(244,63,94,0.30))]
              [-webkit-mask:radial-gradient(farthest-side,transparent_calc(100%_-_3px),#000_calc(100%_-_3px))]
              [mask:radial-gradient(farthest-side,transparent_calc(100%_-_3px),#000_calc(100%_-_3px))]
            "
          />
        </div>

        {/* Text input */}
        <input
          ref={inputRef}
          value={searchInput}
          onChange={(e) => {
            if (disabled) return; // Ignore typing if disabled
            setSearchInput(e.target.value); // Update input text
            setIsTyping(true); // Enable search effect
            setShowDropdown(true); // Open dropdown while typing
          }}
          placeholder="Search Pokémon..."
          disabled={disabled}
          className="w-full h-full bg-transparent border-none outline-none px-2.5 text-sm font-bold text-[#e8eefc] placeholder:text-[rgba(154,166,195,0.7)] disabled:cursor-not-allowed"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Guess button */}
        <button
          onClick={handleGuess}
          disabled={disabled}
          className="h-full border-l border-white/12 bg-linear-to-b from-[#22c55e] to-[#16a34a] text-white font-bold cursor-pointer select-none active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
        >
          Guess
        </button>

        {/* Cooldown overlay */}
        {disabled && cooldownText && (
          <div className="absolute inset-0 grid place-items-center text-xs font-semibold text-[#e8eefc] bg-[rgba(15,23,42,0.75)]">
            {cooldownText}
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Dropdown (animated SlideDown)                                        */}
      {/* -------------------------------------------------------------------- */}
      <SlideDown show={showDropdown && results.length > 0 && !disabled}>
        <div className="mt-2.5 rounded-[14px] overflow-hidden border border-white/10 bg-[rgba(15,23,42,0.92)]">
          {results.slice(0, 3).map((pokemon) => (
            <div
              key={pokemon.name}
              onClick={() => {
                setSelectedPokemon(pokemon); // Set selection
                setSearchInput(pokemon.name); // Fill input
                setShowDropdown(false); // Close dropdown
                setIsTyping(false); // Stop search effect
                inputRef.current?.blur(); // Close keyboard on mobile
              }}
              className="w-full flex items-center gap-2.5 py-2.5 px-3 text-left border-t border-white/6 first:border-t-0 hover:bg-white/6 cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[rgba(229,72,77,0.9)] shadow-[0_0_0_2px_rgba(255,255,255,0.12)_inset]" />
              <span className="text-[#e8eefc]">
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </SlideDown>

      {/* Attempts row */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-3">
          {Array.from({ length: maxAttempts }).map((_, i) => (
            <div
              key={i}
              className={[
                "w-5.5",
                "h-5.5",
                "rotate-45",
                "rounded-[3px]",
                "border",
                "shadow-[0_10px_18px_rgba(0,0,0,0.3)]",
                i < attemptsUsed
                  ? i === attemptsUsed - 1 && won
                    ? "bg-green-500 border-white/18"
                    : "bg-red-500 border-white/18"
                  : "bg-white/80 border-white/18",
              ].join(" ")}
            />
          ))}
        </div>

        <div className="text-[#9aa6c3] text-xs font-medium">
          {attemptsUsed} / {maxAttempts} attempts used
        </div>
      </div>
    </div>
  );
}