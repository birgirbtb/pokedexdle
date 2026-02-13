"use client";

import { useState } from "react";
import Image from "next/image";
import SearchPokemon from "./SearchPokemon";
import Hints from "./Hints";
import Pokedex from "pokedex-promise-v2";
import { Dialog } from "radix-ui";
import { Cross2Icon } from "@radix-ui/react-icons";
import { createGuess, endGame, getUserGame } from "@/lib/actions/guess";
import type { UserStats } from "@/lib/actions/stats";

type Props = {
  pokemon: Pokedex.Pokemon | null;
  generation: string | null;
  maxAttempts?: number;
  game?: Awaited<ReturnType<typeof getUserGame>>;
  nextGuessAt: string;
  stats?: UserStats | null;
  isAdmin: boolean;
};

export default function GameClient({
  pokemon,
  generation,
  maxAttempts = 6,
  game,
  nextGuessAt,
  stats,
  isAdmin,
}: Props) {
  const [attemptsUsed, setAttemptsUsed] = useState(game?.guesses.length || 0);
  const [won, setWon] = useState(game?.won || false);
  const [previousGuesses, setPreviousGuesses] = useState<string[]>(
    game?.guesses
      .slice()
      .sort((a, b) => a.attempt_number - b.attempt_number)
      .map((guess) => guess.guess_name) || [],
  );
  const [open, setOpen] = useState(false);

  const gameOver = attemptsUsed >= maxAttempts && !won;
  const showImage = attemptsUsed >= maxAttempts - 1 || won;

  async function handleGuess(guessName: string) {
    if (gameOver || won) return;

    setPreviousGuesses((prev) => [...prev, guessName]);
    const nextAttempts = attemptsUsed + 1;
    setAttemptsUsed(nextAttempts);

    await createGuess(guessName);

    if (guessName.toLowerCase() === pokemon?.name.toLowerCase()) {
      // User guessed correctly
      setWon(true);

      setTimeout(() => {
        setOpen(true);
      }, 500);

      await endGame(true);

      return;
    }

    if (nextAttempts >= maxAttempts) {
      // Game over, reveal correct answer
      setTimeout(() => {
        setOpen(true);
      }, 500);

      await endGame(false);
    }
  }

  function handleAutoWin() {
    if (gameOver || won) return;
    setWon(true);
    setTimeout(() => setOpen(true), 200);
  }

  function handleAutoLose() {
    if (gameOver || won) return;
    setAttemptsUsed(maxAttempts);
    setTimeout(() => setOpen(true), 200);
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm data-[state=open]:animate-overlayShow z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-105 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.98)] to-[rgba(15,23,42,0.98)] shadow-2xl p-8 flex flex-col items-center gap-4 z-50">
            <button
              className="absolute top-4 right-4 cursor-pointer text-white/60 hover:text-white transition-colors"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <Cross2Icon width={22} height={22} />
            </button>
            <Dialog.Title className="text-2xl font-extrabold text-white text-center mb-2">
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
      <div className="w-full flex justify-center">
        {/* MAIN CONTAINER */}
        <div className="w-full max-w-6xl flex flex-col items-center gap-6">
          {/* IMAGE + PREVIOUS GUESSES */}
          <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center">
            {/* PREVIOUS GUESSES */}
            <div className="flex justify-end pr-6">
              <div className="w-40 rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] p-4">
                <div className="text-white font-medium mb-2">
                  Previous Guesses
                </div>

                {previousGuesses.length === 0 ? (
                  <div className="text-[#9aa6c3] text-sm">None yet</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {previousGuesses.map((guess, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-white/10 border border-white/10 py-0 px-3 text-sm font-semibold text-center text-white"
                      >
                        {guess.charAt(0).toUpperCase() + guess.slice(1)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* IMAGE */}
            <div className="flex justify-center">
              <div className="w-96 h-96 rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] grid place-items-center">
                {showImage &&
                pokemon?.sprites?.other?.["official-artwork"]?.front_default ? (
                  <Image
                    src={
                      pokemon.sprites.other["official-artwork"].front_default
                    }
                    alt={pokemon.name}
                    width={360}
                    height={360}
                  />
                ) : (
                  <span className="text-white text-6xl font-extrabold">?</span>
                )}
              </div>
            </div>

            <div className="flex justify-start pl-6">
              <div className="w-40 rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] p-4">
                <div className="text-white font-medium mb-2">Your Stats</div>

                {stats ? (
                  <div className="flex flex-col gap-2 text-sm">
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
                ) : (
                  <div className="text-[#9aa6c3] text-sm">
                    Login to track stats
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* HINTS */}
          <Hints
            pokemon={pokemon}
            generation={generation}
            revealedHints={won ? maxAttempts : attemptsUsed}
          />

          {/* DEBUG: Auto Win / Auto Lose (for development) */}
          {isAdmin && (
            <div className="w-full max-w-190 mt-2 flex justify-center gap-3">
              <button
                onClick={handleAutoWin}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-[#22c55e] to-[#16a34a] text-white font-bold shadow hover:scale-105 transition-transform"
              >
                Auto Win
              </button>
              <button
                onClick={handleAutoLose}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-[#ef4444] to-[#dc2626] text-white font-bold shadow hover:scale-105 transition-transform"
              >
                Auto Lose
              </button>
            </div>
          )}

          {/* SEARCH */}
          <SearchPokemon
            maxAttempts={maxAttempts}
            attemptsUsed={attemptsUsed}
            onGuess={handleGuess}
            disabled={gameOver || won}
            nextGuessAt={nextGuessAt}
          />
        </div>
      </div>
    </>
  );
}
