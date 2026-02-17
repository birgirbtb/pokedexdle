"use client";

/* -------------------------------------------------------------------------- */
/*                               SearchPokemon                                */
/* -------------------------------------------------------------------------- */
/*
  This component provides the "Guess" UI:
  - A text input for searching Pokémon names
  - A dropdown with up to 3 matching results
  - A Guess button that submits the selected Pokémon
  - A cooldown overlay (when guessing is disabled)
  - An attempts indicator (diamond squares)

  External dependencies:
  - searchPokemon(...) server action: returns a list of Pokémon name results
  - onGuess(...) callback: provided by parent (GameClient) to record a guess
*/

import { useEffect, useRef, useState } from "react"; // React hooks for state, refs, and side effects
import { searchPokemon } from "@/lib/actions/pokemon"; // Server action used to fetch Pokémon suggestions

/* ---------------------------- Data Type Shapes ---------------------------- */

// The shape of a single Pokémon option in the dropdown.
// Note: url is included because you may return it from the API (optional usage).
interface Pokemon {
  name: string;
  url: string;
}

// Props passed from the parent (GameClient).
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
  maxAttempts = 6, // Default attempts count if not passed in
  attemptsUsed,
  onGuess,
  disabled = false, // Default to enabled
  nextGuessAt,
  won = false,
}: Props) {
  /* ------------------------------- State ---------------------------------- */

  // What the user has typed into the search box
  const [searchInput, setSearchInput] = useState("");

  // Search results returned from searchPokemon(...)
  const [results, setResults] = useState<Pokemon[]>([]);

  // Controls whether the dropdown menu is visible
  const [showDropdown, setShowDropdown] = useState(false);

  // Which Pokémon is currently selected (must be set before "Guess" works)
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  // Tracks if the user is actively typing (used to avoid searching when input is programmatically set)
  const [isTyping, setIsTyping] = useState(false);

  // Text for the cooldown overlay (e.g. "Next guess in 00:12:34")
  const [cooldownText, setCooldownText] = useState<string | null>(null);

  /* ------------------------------- Refs ----------------------------------- */

  // Ref to the actual input element so we can blur it after selecting a dropdown result
  const inputRef = useRef<HTMLInputElement>(null);

  /* ------------------------- Search (Debounced) --------------------------- */
  /*
    This effect:
    - Runs whenever searchInput changes (and the user is actively typing)
    - Debounces requests by 300ms
    - Updates dropdown results + visibility
  */
  useEffect(() => {
    // If user is not typing or input is empty, clear results and close dropdown.
    if (!isTyping || !searchInput.trim()) {
      /*
        Veit ekki afhverju það byrjar að kvarta hér en þetta virkar eins og það á að gera
      */
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // Debounce timer: waits 300ms after typing stops before searching
    const timeout = setTimeout(async () => {
      // Call server action to find matching Pokémon names
      const data = await searchPokemon(searchInput);

      // Store results in state
      setResults(data);

      // Open dropdown once we have results
      setShowDropdown(true);
    }, 300);

    // Cleanup: if input changes again within 300ms, cancel previous timer
    return () => clearTimeout(timeout);
  }, [searchInput, isTyping]);

  /* --------------------------- Cooldown Timer ----------------------------- */
  /*
    This effect:
    - Runs when guessing is disabled AND we have nextGuessAt
    - Builds a live countdown string (updates every second)
    - Covers the input area with an overlay while disabled
  */
  useEffect(() => {
    // If guessing isn't disabled or we don't have a target time, remove cooldown text
    if (!disabled || !nextGuessAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCooldownText(null);
      return;
    }

    // When disabled, force-close dropdown and stop typing mode
    setShowDropdown(false);
    setIsTyping(false);

    // Convert nextGuessAt ISO string into a timestamp
    const target = new Date(nextGuessAt).getTime();

    // If date parsing failed, stop
    if (Number.isNaN(target)) {
      setCooldownText(null);
      return;
    }

    // Helper to compute "HH:MM:SS" remaining time and update the text
    const updateCooldown = () => {
      // Remaining milliseconds until target time (never below 0)
      const remainingMs = Math.max(0, target - Date.now());

      // Convert to total seconds (ceil so it doesn't show negative / weird rounding)
      const totalSeconds = Math.ceil(remainingMs / 1000);

      // Split into hours / minutes / seconds
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // Render padded string "HH:MM:SS"
      setCooldownText(
        `Next guess in ${String(hours).padStart(2, "0")}:${String(
          minutes,
        ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      );
    };

    // Update immediately once (so user sees it instantly)
    updateCooldown();

    // Then update every second
    const interval = setInterval(updateCooldown, 1000);

    // Cleanup: stop interval when component unmounts or deps change
    return () => clearInterval(interval);
  }, [disabled, nextGuessAt]);

  /* ---------------------------- Submit Guess ------------------------------ */
  /*
    Called when user presses the Guess button.
    Requirements:
    - Not disabled
    - A Pokémon must be selected from the dropdown
  */
  const handleGuess = async () => {
    // Stop if guessing is disabled
    if (disabled) return;

    // Stop if user hasn't selected a Pokémon
    if (!selectedPokemon) return;

    // Tell parent (GameClient) to handle the guess logic and server updates
    await onGuess(selectedPokemon.name);

    // Reset input and selection for the next guess
    setSearchInput("");
    setSelectedPokemon(null);

    // Close dropdown and exit typing mode
    setShowDropdown(false);
    setIsTyping(false);
  };

  /* ------------------------------ Render ---------------------------------- */
  return (
    // Outer card container for the search + attempts UI
    <div className="w-full max-w-190 rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-3.5">
      {/* ------------------------------ Header ------------------------------ */}
      <div className="flex justify-between gap-2.5 mb-2.5">
        {/* Left label */}
        <div className="text-white font-medium">Your guess</div>

        {/* Right helper text (could be replaced later with dynamic info) */}
        <div className="text-[#9aa6c3] text-xs">Start typing to search</div>
      </div>

      {/* ------------------------------ Input ------------------------------- */}
      {/* Wrapper for input + Guess button + cooldown overlay */}
      <div
        className={`relative h-12 rounded-[14px] border border-white/[0.14] bg-linear-to-b from-white/10 to-black/18 grid grid-cols-[1fr_120px] items-center overflow-hidden ${
          disabled ? "opacity-60" : ""
        }`}
        aria-disabled={disabled}
      >
        {/* Text input */}
        <input
          ref={inputRef}
          value={searchInput}
          onChange={(e) => {
            // If disabled, ignore typing entirely
            if (disabled) return;

            // Update input
            setSearchInput(e.target.value);

            // Mark that the user is typing (enables searching effect)
            setIsTyping(true);

            // Open dropdown while typing
            setShowDropdown(true);
          }}
          placeholder="Search Pokémon..."
          disabled={disabled}
          className="w-full h-full bg-transparent border-none outline-none px-3 text-sm font-bold text-[#e8eefc] placeholder:text-[rgba(154,166,195,0.7)] disabled:cursor-not-allowed"
        />

        {/* Guess button */}
        <button
          onClick={handleGuess}
          disabled={disabled}
          className="h-full border-l border-white/12 bg-linear-to-b from-[#22c55e] to-[#16a34a] text-white font-bold cursor-pointer select-none active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
        >
          Guess
        </button>

        {/* Cooldown overlay (covers input & button when disabled and we have timer text) */}
        {disabled && cooldownText && (
          <div className="absolute inset-0 grid place-items-center text-xs font-semibold text-[#e8eefc] bg-[rgba(15,23,42,0.75)]">
            {cooldownText}
          </div>
        )}
      </div>

      {/* ----------------------------- Dropdown ----------------------------- */}
      {/* Shows only when:
          - showDropdown is true
          - results exist
          - not disabled
      */}
      {showDropdown && results.length > 0 && !disabled && (
        <div className="mt-2.5 rounded-[14px] overflow-hidden border border-white/10 bg-[rgba(15,23,42,0.92)]">
          {/* Show only top 3 matches */}
          {results.slice(0, 3).map((pokemon) => (
            <div
              key={pokemon.name}
              onClick={() => {
                // Store the clicked Pokémon as the selected choice
                setSelectedPokemon(pokemon);

                // Fill input with the chosen name
                setSearchInput(pokemon.name);

                // Close dropdown and end typing mode
                setShowDropdown(false);
                setIsTyping(false);

                // Remove focus from input (helps on mobile so the keyboard collapses)
                inputRef.current?.blur();
              }}
              className="w-full flex items-center gap-2.5 py-2.5 px-3 text-left border-t border-white/6 first:border-t-0 hover:bg-white/6 cursor-pointer"
            >
              {/* Colored dot indicator */}
              <span className="w-2.5 h-2.5 rounded-full bg-[rgba(229,72,77,0.9)] shadow-[0_0_0_2px_rgba(255,255,255,0.12)_inset]" />

              {/* Pokémon name label (capitalized visually) */}
              <span className="text-[#e8eefc]">
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ----------------------------- Attempts ----------------------------- */}
      {/* Shows:
          - A row of diamonds representing attempts used / remaining
          - A text label "X / Y attempts used"
      */}
      <div className="mt-4 flex items-center justify-between">
        {/* Diamonds row */}
        <div className="flex gap-3">
          {Array.from({ length: maxAttempts }).map((_, i) => (
            <div
              key={i}
              className={`
                w-5.5 h-5.5 rotate-45 rounded-[3px] border
                ${
                  i < attemptsUsed
                    ? i === attemptsUsed - 1 && won
                      ? "bg-green-500 border-white/18 shadow-[0_10px_18px_rgba(0,0,0,0.3)]"
                      : "bg-red-500 border-white/18 shadow-[0_10px_18px_rgba(0,0,0,0.3)]"
                    : "bg-white/80 border-white/18 shadow-[0_10px_18px_rgba(0,0,0,0.3)]"
                }
              `}
            />
          ))}
        </div>

        {/* Attempts text */}
        <div className="text-[#9aa6c3] text-xs font-medium">
          {attemptsUsed} / {maxAttempts} attempts used
        </div>
      </div>
    </div>
  );
}
