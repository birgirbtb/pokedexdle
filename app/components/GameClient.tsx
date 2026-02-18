"use client";

/* -------------------------------------------------------------------------- */
/*                                 GameClient                                 */
/* -------------------------------------------------------------------------- */
/*
  This is the main interactive client-side component for the game UI.
  It is responsible for:
  - Tracking attempt count and win/lose state
  - Sending guesses to the server (createGuess/endGame)
  - Rendering:
    - Win/Lose dialog (Radix)
    - Previous guesses panel
    - Pokémon image (hidden until late game / win)
    - Player stats panel
    - Hints
    - Search input (SearchPokemon component)
    - Optional admin debug controls
*/

import { useState } from "react"; // Client state hooks
import Image from "next/image"; // Optimized image rendering (Next.js)
import SearchPokemon from "./SearchPokemon"; // Search + dropdown + "Guess" button UI
import Hints from "./Hints"; // Hints UI (revealed based on attempts)
import Pokedex from "pokedex-promise-v2"; // Pokémon typings and helper library
import { Dialog } from "radix-ui"; // Radix UI Dialog primitives
import { Cross2Icon } from "@radix-ui/react-icons"; // Close icon for dialog
import { createGuess, endGame, getUserGame } from "@/lib/actions/guess"; // Server actions for storing guesses + game result
import type { UserStats } from "@/lib/actions/stats"; // Stats type for props

/* ------------------------------- Prop Types -------------------------------- */
/*
  pokemon: the correct Pokémon object for today (server-provided)
  generation: generation string for hint logic (server-provided)
  maxAttempts: number of guesses allowed (default 6)
  game: user game state fetched from server (previous guesses, won state)
  nextGuessAt: timestamp string for when user can guess next (used by SearchPokemon)
  stats: user stats fetched from server (optional; only for logged-in users)
  isAdmin: whether admin debug buttons should show
*/
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchPokemon from "./SearchPokemon";
import Hints from "./Hints";
import Pokedex from "pokedex-promise-v2";
import { Dialog } from "radix-ui";
import { Cross2Icon } from "@radix-ui/react-icons";
import { createGuess, endGame, getUserGame } from "@/lib/actions/guess";
import type { UserStats } from "@/lib/actions/stats";
import { ChartLine, Clock, Infinity } from 'lucide-react';

type Props = {
  pokemon: Pokedex.Pokemon | null;
  generation: string | null;
  maxAttempts?: number;
  game?: Awaited<ReturnType<typeof getUserGame>>;
  nextGuessAt: string;
  stats?: UserStats | null;
  isAdmin: boolean;
  isUnlimited?: boolean;
};

/* ------------------------------ Component ---------------------------------- */
export default function GameClient({
  pokemon,
  generation,
  maxAttempts = 6, // Default attempts if caller doesn’t provide it
  game,
  nextGuessAt,
  stats,
  isAdmin,
  isUnlimited = false,
}: Props) {
  /* ------------------------------- State ----------------------------------- */

  // Tracks how many attempts have been used so far.
  // If the server already has guesses for this user today, initialize from there.
  const [attemptsUsed, setAttemptsUsed] = useState(game?.guesses.length || 0);

  // Tracks whether the user has already won today.
  // If the server already knows the user won, initialize from there.
  const [won, setWon] = useState(game?.won || false);

  // List of previous guesses (strings), sorted by attempt number.
  // Used to render the "Previous Guesses" card.
  const [previousGuesses, setPreviousGuesses] = useState<string[]>(
    game?.guesses
      .slice() // Copy array so we can sort without mutating original
      .sort((a, b) => a.attempt_number - b.attempt_number) // Ensure guesses are in attempt order
      .map((guess) => guess.guess_name) || [], // Extract just the guessed Pokémon names
  );

  // Controls whether the win/lose dialog is open.
  const [open, setOpen] = useState(false);

  /* --------------------------- Derived Flags ------------------------------- */

  // True if user has used all attempts and has not won.
  const gameOver = attemptsUsed >= maxAttempts && !won;

  // True when we should reveal the Pokémon artwork.
  // In this design: show when the user is on the final attempt or has already won.
  const showImage = attemptsUsed >= maxAttempts - 1 || won;

  /* ------------------------------ Handlers --------------------------------- */

  // Called by SearchPokemon when the user presses Guess / selects a Pokémon.
  async function handleGuess(guessName: string) {
    // Prevent guessing if game is already over or already won
    if (gameOver || won) return;

    // Update UI immediately (optimistic UI)
    setPreviousGuesses((prev) => [...prev, guessName]);

    // Increment attempts used
    const nextAttempts = attemptsUsed + 1;
    setAttemptsUsed(nextAttempts);

    // Only save to database if not in unlimited mode
    if (!isUnlimited) {
      await createGuess(guessName);
    }
    // Persist the guess on the server
    await createGuess(guessName);

    // Check if guess matches the correct Pokémon
    if (guessName.toLowerCase() === pokemon?.name.toLowerCase()) {
      // Mark as won in local state
      setWon(true);

      // Open dialog shortly after (small delay for UI polish)
      setTimeout(() => {
        setOpen(true);
      }, 500);

      // Only save to database if not in unlimited mode
      if (!isUnlimited) {
        await endGame(true);
      }

      // Persist the win result on the server
      await endGame(true);
      return;
    }

    // If this was the final allowed attempt and still wrong => game over
    if (nextAttempts >= maxAttempts) {
      // Open dialog shortly after
      setTimeout(() => {
        setOpen(true);
      }, 500);

      // Only save to database if not in unlimited mode
      if (!isUnlimited) {
        await endGame(false);
      }
      // Persist the loss on the server
      await endGame(false);
    }
  }

  // Admin-only: instantly sets a win state and opens dialog
  function handleAutoWin() {
    if (gameOver || won) return;
    setWon(true);
    setTimeout(() => setOpen(true), 200);
  }

  // Admin-only: instantly sets attempts to max and opens dialog
  function handleAutoLose() {
    if (gameOver || won) return;
    setAttemptsUsed(maxAttempts);
    setTimeout(() => setOpen(true), 200);
  }

  /* ------------------------------- Render ---------------------------------- */
  return (
    <>
      {/* ---------------------------------------------------------------------- */}
      {/*                           WIN / LOSE DIALOG                            */}
      {/* ---------------------------------------------------------------------- */}
      {/* Radix Dialog:
         - open: controlled via state
         - onOpenChange: allows clicking overlay / close button to dismiss
      */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          {/* Dark overlay behind dialog */}
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm data-[state=open]:animate-overlayShow z-40" />

          {/* Dialog content panel */}
          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[92vw] max-w-105 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.98)] to-[rgba(15,23,42,0.98)] shadow-2xl p-6 sm:p-8 flex flex-col items-center gap-4 z-50">
            {/* Close button (top-right) */}
            <button
              className="absolute top-4 right-4 cursor-pointer text-white/60 hover:text-white transition-colors"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <Cross2Icon width={22} height={22} />
            </button>

            {/* Dialog title / message */}
            <Dialog.Title className="text-xl sm:text-2xl font-extrabold text-white text-center mb-2">
              {/* WIN message */}
              {won && (
                <>
                  <span className="block text-green-400 mb-1">🎉 Well done!</span>
                  <span>
                    The answer was{" "}
                    <span className="font-bold text-yellow-300">
                      {/* Capitalize Pokémon name */}
                      {pokemon?.name?.charAt(0).toUpperCase()}
                      {pokemon?.name?.slice(1)}
                    </span>
                  </span>
                </>
              )}

              {/* LOSE message */}
              {gameOver && !won && (
                <>
                  <span className="block text-rose-400 mb-1">❌ Nice try!</span>
                  <span>
                    The correct answer was{" "}
                    <span className="font-bold text-yellow-300">
                      {/* Capitalize Pokémon name */}
                      {pokemon?.name?.charAt(0).toUpperCase()}
                      {pokemon?.name?.slice(1)}
                    </span>
                  </span>
                </>
              )}
            </Dialog.Title>
            <div className="w-full flex flex-col items-center gap-4 mt-4">
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
                        : 0}
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
              <div className="flex gap-3 w-full justify-center">
                <button
                  className="mt-2 px-6 py-2 rounded-xl bg-linear-to-r cursor-pointer from-blue-500 to-rose-500 text-white font-bold shadow hover:scale-105 transition-transform"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
                {isUnlimited && (gameOver || won) && (
                  <button
                    className="mt-2 px-6 py-2 rounded-xl bg-linear-to-r cursor-pointer from-green-500 to-emerald-500 text-white font-bold shadow hover:scale-105 transition-transform"
                    onClick={() => window.location.reload()}
                  >
                    Play Again
                  </button>
                )}
              </div>

            {/* Dialog actions */}
            <div className="w-full flex flex-col items-center gap-2 mt-2">
              <button
                className="mt-2 px-6 py-2 rounded-xl bg-linear-to-r cursor-pointer from-blue-500 to-rose-500 text-white font-bold shadow hover:scale-105 transition-transform"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ---------------------------------------------------------------------- */}
      {/*                              MAIN LAYOUT                               */}
      {/* ---------------------------------------------------------------------- */}
      <div className="w-full flex justify-center">
        {/* Main width container for the page content */}
        <div className="w-full max-w-6xl flex flex-col items-center gap-4 sm:gap-6">
          {/* ------------------------------------------------------------------ */}
          {/*                         TOP AREA (3 PANELS)                          */}
          {/* ------------------------------------------------------------------ */}
          {/* Layout behavior:
             - Mobile: stacked cards (vertical flow)
             - Desktop: 3-column grid (Previous | Image | Stats)
          */}
          <div className="w-full flex flex-col gap-4 lg:grid lg:grid-cols-[220px_384px_220px] lg:items-center lg:justify-center lg:gap-6">
            {/* ---------------------------- Previous --------------------------- */}
            <div className="order-2 lg:order-1 flex justify-center lg:justify-end">
              <div className="w-full max-w-[420px] lg:w-[220px] rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] p-4">
                <div className="text-white font-medium mb-2">
                  Previous Guesses
                </div>

                {/* Empty state */}
                {previousGuesses.length === 0 ? (
                  <div className="text-[#9aa6c3] text-sm">None yet</div>
                ) : (
                  // Scrollable list (prevents very long lists from pushing content down)
                  <div className="flex flex-col gap-2 max-h-[220px] overflow-auto pr-1">
                    {previousGuesses.map((guess, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-white/10 border border-white/10 py-1 px-3 text-sm font-semibold text-center text-white"
                      >
                        {/* Capitalize guess name */}
                        {guess.charAt(0).toUpperCase() + guess.slice(1)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* IMAGE */}
            <div className="flex flex-col justify-center items-center gap-4">
              <div className="w-96 h-96 rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] grid place-items-center">
            {/* ------------------------------ Image ---------------------------- */}
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="w-full max-w-[420px] lg:w-[384px] aspect-square rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] grid place-items-center overflow-hidden">
                {/* If we are allowed to show the Pokémon image, render it */}
                {showImage &&
                pokemon?.sprites?.other?.["official-artwork"]?.front_default ? (
                  <Image
                    src={pokemon.sprites.other["official-artwork"].front_default}
                    alt={pokemon.name}
                    width={360}
                    height={360}
                    className="w-[85%] h-[85%] object-contain"
                    priority
                  />
                ) : (
                  // Otherwise show a placeholder question mark
                  <span className="text-white text-6xl sm:text-7xl font-extrabold">
                    ?
                  </span>
                )}
              </div>
              {isUnlimited && (gameOver || won) && (
                <button
                  className="px-6 py-2 rounded-xl bg-linear-to-r cursor-pointer from-green-500 to-emerald-500 text-white font-bold shadow hover:scale-105 transition-transform"
                  onClick={() => window.location.reload()}
                >
                  Play Again
                </button>
              )}
            </div>

            <div className="flex justify-start pl-6">
              <div className="w-40 rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] p-4 flex flex-col gap-3">
                <button
                  onClick={() => setOpen(true)}
                  className="w-full px-3 py-2 rounded-xl text-white font-bold hover:bg-white/20 transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
                >
                  <ChartLine/>
                  Stats
                </button>
                <Link href={isUnlimited ? "/" : "/unlimited"} className="w-full">
                  <button className="w-full px-3 py-2 rounded-xl text-white font-bold hover:bg-white/20 transition-colors cursor-pointer text-sm flex items-center justify-center gap-2">
                    {isUnlimited ? (
                      <>
                        <Clock/>
                        Daily Puzzle
                      </>
                    ) : (
                      <>
                        <Infinity/> 
                        Unlimited
                      </>
                    )}
                  </button>
                </Link>
            {/* ------------------------------ Stats ---------------------------- */}
            <div className="order-3 lg:order-3 flex justify-center lg:justify-start">
              <div className="w-full max-w-[420px] lg:w-[220px] rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] p-4">
                <div className="text-white font-medium mb-2">Your Stats</div>

                {/* Show real stats if available */}
                {stats ? (
                  <div className="grid grid-cols-2 gap-2 text-sm lg:flex lg:flex-col lg:gap-2">
                    {/* Wins */}
                    <div className="flex items-center justify-between text-[#9aa6c3]">
                      <span>Wins</span>
                      <span className="text-white font-semibold">
                        {stats.totalWins}
                      </span>
                    </div>

                    {/* Games */}
                    <div className="flex items-center justify-between text-[#9aa6c3]">
                      <span>Games</span>
                      <span className="text-white font-semibold">
                        {stats.totalGames}
                      </span>
                    </div>

                    {/* Current streak */}
                    <div className="flex items-center justify-between text-[#9aa6c3]">
                      <span>Streak</span>
                      <span className="text-white font-semibold">
                        {stats.currentStreak}
                      </span>
                    </div>

                    {/* Best streak */}
                    <div className="flex items-center justify-between text-[#9aa6c3]">
                      <span>Best</span>
                      <span className="text-white font-semibold">
                        {stats.bestStreak}
                      </span>
                    </div>
                  </div>
                ) : (
                  // Logged-out / missing stats state
                  <div className="text-[#9aa6c3] text-sm">
                    Login to track stats
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Pokemon Name */}
          {(won || gameOver) && pokemon?.name && (
            <div className="rounded-full py-2.5 px-3.5 bg-black/22 border border-white/12 text-white hover:bg-black/30">
              <div className="text-4xl font-extrabold text-yellow-300 tracking-wide drop-shadow-lg">
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </div>
          </div>
          )}
          {/* HINTS */}
          <Hints
            pokemon={pokemon}
            generation={generation}
            revealedHints={won ? maxAttempts : attemptsUsed}
          />

          {/* ------------------------------------------------------------------ */}
          {/*                                  HINTS                              */}
          {/* ------------------------------------------------------------------ */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-[760px]">
              <Hints
                pokemon={pokemon}
                generation={generation}
                // If user has won, reveal all hints.
                // Otherwise reveal up to attemptsUsed.
                revealedHints={won ? maxAttempts : attemptsUsed}
              />
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/*                           ADMIN DEBUG BUTTONS                        */}
          {/* ------------------------------------------------------------------ */}
          {/* Only shown to admin users */}
          {isAdmin && (
            <div className="w-full max-w-190 mt-2 flex flex-wrap justify-center gap-3">
              {/* Force win */}
              <button
                onClick={handleAutoWin}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-linear-to-r from-[#22c55e] to-[#16a34a] text-white font-bold shadow hover:scale-105 transition-transform"
              >
                Auto Win
              </button>

              {/* Force lose */}
              <button
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
                // Limits and state
                maxAttempts={maxAttempts}
                attemptsUsed={attemptsUsed}
                disabled={gameOver || won}
                nextGuessAt={nextGuessAt}
            won={won}
                // Callback used to submit a guess (sends name back to this component)
                onGuess={handleGuess}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
