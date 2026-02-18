"use client";

/* -------------------------------------------------------------------------- */
/*                                 GameClient                                 */
/* -------------------------------------------------------------------------- */
/*
  Main interactive client-side component.

  Covers:
  - Attempts + win/lose state
  - Submitting guesses (createGuess/endGame) when NOT unlimited
  - Win/Lose dialog (Radix)
  - Responsive layout (mobile stacks, desktop 3 columns)
  - Previous guesses panel
  - Pokémon image reveal logic
  - Stats panel
  - Hints + SearchPokemon
  - Admin debug buttons
  - Unlimited mode controls
*/

import { useState } from "react"; // React state
import Link from "next/link"; // Next navigation
import Image from "next/image"; // Next optimized images
import SearchPokemon from "./SearchPokemon"; // Search UI
import Hints from "./Hints"; // Hints UI
import Pokedex from "pokedex-promise-v2"; // Types
import * as Dialog from "@radix-ui/react-dialog"; // ✅ Correct Radix Dialog import
import { Cross2Icon } from "@radix-ui/react-icons"; // Dialog close icon
import { createGuess, endGame, getUserGame } from "@/lib/actions/guess"; // Server actions
import type { UserStats } from "@/lib/actions/stats"; // Stats type
import { ChartLine, Clock, Infinity } from "lucide-react"; // Icons

/* ------------------------------- Prop Types -------------------------------- */

type Props = {
  pokemon: Pokedex.Pokemon | null; // Correct Pokémon (server-provided)
  generation: string | null; // Generation string (server-provided)
  maxAttempts?: number; // Guess limit
  game?: Awaited<ReturnType<typeof getUserGame>>; // Existing user game for today
  nextGuessAt: string; // Cooldown timestamp (daily mode)
  stats?: UserStats | null; // User stats (optional)
  isAdmin: boolean; // Admin flag for debug controls
  isUnlimited?: boolean; // Unlimited mode flag
};

/* ------------------------------ Component ---------------------------------- */

export default function GameClient({
  pokemon,
  generation,
  maxAttempts = 6,
  game,
  nextGuessAt,
  stats,
  isAdmin,
  isUnlimited = false,
}: Props) {
  /* -------------------------------- State --------------------------------- */

  // Attempts already used (load from server game if exists)
  const [attemptsUsed, setAttemptsUsed] = useState(game?.guesses.length || 0);

  // Whether the user has already won
  const [won, setWon] = useState(game?.won || false);

  // Previous guesses (sorted by attempt_number)
  const [previousGuesses, setPreviousGuesses] = useState<string[]>(
    game?.guesses
      .slice()
      .sort((a, b) => a.attempt_number - b.attempt_number)
      .map((guess) => guess.guess_name) || [],
  );

  // Dialog open/close state
  const [open, setOpen] = useState(false);

  /* ---------------------------- Derived Values ----------------------------- */

  // Game is over if out of attempts and not won
  const gameOver = attemptsUsed >= maxAttempts && !won;

  // Show image when near the end or if won
  const showImage = attemptsUsed >= maxAttempts - 1 || won;

  /* ------------------------------ Handlers --------------------------------- */

  // Submit a guess from SearchPokemon
  async function handleGuess(guessName: string) {
    if (gameOver || won) return;

    const isCorrect = guessName.toLowerCase() === pokemon?.name.toLowerCase();

    setPreviousGuesses((prev) => [...prev, guessName]);

    // If correct = set won FIRST
    if (isCorrect) {
      setWon(true);
    }

    const nextAttempts = attemptsUsed + 1;
    setAttemptsUsed(nextAttempts);

    // Only save to database if not in unlimited mode
    if (!isUnlimited) {
      await createGuess(guessName);
    }

    if (isCorrect) {
      // User guessed correctly
      setTimeout(() => {
        setOpen(true);
      }, 500);

      // Save guess only in daily mode
      if (!isUnlimited) {
        await endGame(true);
      }

      return;
    }

    if (nextAttempts >= maxAttempts) {
      // Game over, reveal correct answer
      setTimeout(() => {
        setOpen(true);
      }, 500);

      // Only save to database if not in unlimited mode
      if (!isUnlimited) {
        await endGame(false);
      }
    }
  }

  // Admin-only win shortcut
  function handleAutoWin() {
    if (gameOver || won) return;
    setWon(true);
    setTimeout(() => setOpen(true), 200);
  }

  // Admin-only lose shortcut
  function handleAutoLose() {
    if (gameOver || won) return;
    setAttemptsUsed(maxAttempts);
    setTimeout(() => setOpen(true), 200);
  }

  /* -------------------------------- Render -------------------------------- */

  return (
    <>
      {/* ---------------------------------------------------------------------- */}
      {/*                              WIN / LOSE DIALOG                          */}
      {/* ---------------------------------------------------------------------- */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          {/* Overlay */}
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />

          {/* Panel */}
          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[92vw] max-w-105 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.98)] to-[rgba(15,23,42,0.98)] shadow-2xl p-6 sm:p-8 flex flex-col items-center gap-4 z-50">
            {/* Close (top-right) */}
            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute top-4 right-4 cursor-pointer text-white/60 hover:text-white transition-colors"
                aria-label="Close"
              >
                <Cross2Icon width={22} height={22} />
              </button>
            </Dialog.Close>

            {/* Title */}
            <Dialog.Title className="text-xl sm:text-2xl font-extrabold text-white text-center mb-2">
              {won && (
                <>
                  <span className="block text-green-400 mb-1">
                    🎉 Well done!
                  </span>
                  <span>
                    The answer was{" "}
                    <span className="font-bold text-yellow-300">
                      {pokemon?.name?.charAt(0).toUpperCase()}
                      {pokemon?.name?.slice(1)}
                    </span>
                  </span>
                </>
              )}

              {gameOver && !won && (
                <>
                  <span className="block text-rose-400 mb-1">❌ Nice try!</span>
                  <span>
                    The correct answer was{" "}
                    <span className="font-bold text-yellow-300">
                      {pokemon?.name?.charAt(0).toUpperCase()}
                      {pokemon?.name?.slice(1)}
                    </span>
                  </span>
                </>
              )}
            </Dialog.Title>

            {/* Stats summary inside dialog (optional) */}
            {stats && (
              <div className="w-full flex flex-col gap-2 text-sm bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between text-[#9aa6c3]">
                  <span>Wins</span>
                  <span className="text-white font-semibold">
                    {stats.totalWins}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#9aa6c3]">
                  <span>Games</span>
                  <span className="text-white font-semibold">
                    {stats.totalGames}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#9aa6c3]">
                  <span>Win Rate</span>
                  <span className="text-white font-semibold">
                    {stats.totalGames > 0
                      ? ((stats.totalWins / stats.totalGames) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#9aa6c3]">
                  <span>Streak</span>
                  <span className="text-white font-semibold">
                    {stats.currentStreak}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#9aa6c3]">
                  <span>Best</span>
                  <span className="text-white font-semibold">
                    {stats.bestStreak}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 w-full justify-center">
              <button
                type="button"
                className="mt-2 px-6 py-2 rounded-xl bg-linear-to-r cursor-pointer from-blue-500 to-rose-500 text-white font-bold shadow hover:scale-105 transition-transform"
                onClick={() => setOpen(false)}
              >
                Close
              </button>

              {/* Unlimited-only replay button */}
              {isUnlimited && (gameOver || won) && (
                <button
                  type="button"
                  className="mt-2 px-6 py-2 rounded-xl bg-linear-to-r cursor-pointer from-green-500 to-emerald-500 text-white font-bold shadow hover:scale-105 transition-transform"
                  onClick={() => window.location.reload()}
                >
                  Play Again
                </button>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ---------------------------------------------------------------------- */}
      {/*                                MAIN LAYOUT                             */}
      {/* ---------------------------------------------------------------------- */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-6xl flex flex-col items-center gap-4 sm:gap-6">
          {/* ------------------------------------------------------------------ */}
          {/*                         TOP AREA (3 PANELS)                          */}
          {/* ------------------------------------------------------------------ */}
          <div className="w-full flex flex-col gap-4 lg:grid lg:grid-cols-[220px_384px_220px] lg:items-center lg:justify-center lg:gap-6">
            {/* -------------------------- Previous Guesses ---------------------- */}
            <div className="order-2 lg:order-1 flex justify-center lg:justify-end">
              <div className="w-full max-w-[420px] lg:w-[220px] rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] p-4">
                <div className="text-white font-medium mb-2">
                  Previous Guesses
                </div>

                {previousGuesses.length === 0 ? (
                  <div className="text-[#9aa6c3] text-sm">None yet</div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[220px] overflow-auto pr-1">
                    {previousGuesses.map((guess, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-white/10 border border-white/10 py-1 px-3 text-sm font-semibold text-center text-white"
                      >
                        {guess.charAt(0).toUpperCase() + guess.slice(1)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ------------------------------ Image ---------------------------- */}
            <div className="order-1 lg:order-2 flex flex-col items-center justify-center gap-3">
              <div className="w-full max-w-[420px] lg:w-[384px] aspect-square rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] grid place-items-center overflow-hidden">
                {showImage &&
                pokemon?.sprites?.other?.["official-artwork"]?.front_default ? (
                  <Image
                    src={
                      pokemon.sprites.other["official-artwork"].front_default
                    }
                    alt={pokemon.name}
                    width={360}
                    height={360}
                    className="w-[85%] h-[85%] object-contain"
                    priority
                  />
                ) : (
                  <span className="text-white text-6xl sm:text-7xl font-extrabold">
                    ?
                  </span>
                )}
              </div>

              {/* Pokémon name shown after win/lose */}
              {(won || gameOver) && pokemon?.name && (
                <div className="rounded-full py-2 px-4 bg-black/22 border border-white/12 text-white">
                  <div className="text-2xl sm:text-3xl font-extrabold text-yellow-300 tracking-wide drop-shadow-lg text-center">
                    {pokemon.name.charAt(0).toUpperCase() +
                      pokemon.name.slice(1)}
                  </div>
                </div>
              )}

              {/* Unlimited-only replay under image (optional) */}
              {isUnlimited && (gameOver || won) && (
                <button
                  type="button"
                  className="px-6 py-2 rounded-xl bg-linear-to-r cursor-pointer from-green-500 to-emerald-500 text-white font-bold shadow hover:scale-105 transition-transform"
                  onClick={() => window.location.reload()}
                >
                  Play Again
                </button>
              )}
            </div>

            {/* ------------------------------ Stats ---------------------------- */}
            <div className="order-3 lg:order-3 flex justify-center lg:justify-start">
              <div className="w-full max-w-[420px] lg:w-[220px] rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] p-4">
                {/* Buttons section (only shows if desired) */}
                <div className="flex flex-col gap-2">
                  {/* Opens the dialog to view the summary again */}
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl text-white font-bold hover:bg-white/10 transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
                  >
                    <ChartLine size={18} />
                    Stats
                  </button>

                  {/* Toggle between daily and unlimited pages */}
                  <Link
                    href={isUnlimited ? "/" : "/unlimited"}
                    className="w-full"
                  >
                    <button
                      type="button"
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl text-white font-bold hover:bg-white/10 transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
                    >
                      {isUnlimited ? (
                        <>
                          <Clock size={18} />
                          Daily Puzzle
                        </>
                      ) : (
                        <>
                          <Infinity size={18} />
                          Unlimited
                        </>
                      )}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/*                                  HINTS                              */}
          {/* ------------------------------------------------------------------ */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-[760px]">
              <Hints
                pokemon={pokemon}
                generation={generation}
                revealedHints={won ? maxAttempts : attemptsUsed}
              />
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/*                           ADMIN DEBUG BUTTONS                        */}
          {/* ------------------------------------------------------------------ */}
          {isAdmin && (
            <div className="w-full max-w-190 mt-2 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleAutoWin}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-linear-to-r from-[#22c55e] to-[#16a34a] text-white font-bold shadow hover:scale-105 transition-transform"
              >
                Auto Win
              </button>

              <button
                type="button"
                onClick={handleAutoLose}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-linear-to-r from-[#ef4444] to-[#dc2626] text-white font-bold shadow hover:scale-105 transition-transform"
              >
                Auto Lose
              </button>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/*                                  SEARCH                              */}
          {/* ------------------------------------------------------------------ */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-[760px]">
              <SearchPokemon
                maxAttempts={maxAttempts}
                attemptsUsed={attemptsUsed}
                disabled={gameOver || won}
                nextGuessAt={nextGuessAt}
                onGuess={handleGuess}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
