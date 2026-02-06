"use client";

import { useState } from "react";
import Image from "next/image";
import SearchPokemon from "./SearchPokemon";
import Hints from "./Hints";
import Pokedex from "pokedex-promise-v2";
import { Dialog } from "radix-ui";
import { Cross2Icon } from "@radix-ui/react-icons";
import { DialogTrigger } from "@radix-ui/react-dialog";

const P = new Pokedex();

type Props = {
  pokemon: Pokedex.Pokemon | null;
  generation: string | null;
  correctPokemon: string;
  maxAttempts: number;
};

export default function GameClient({
  pokemon: initialPokemon,
  generation: initialGeneration,
  correctPokemon: initialCorrectPokemon,
  maxAttempts = 6,
}: Props) {
  const [pokemon] = useState(initialPokemon);
  const [generation] = useState(initialGeneration);
  const [correctPokemon] = useState(initialCorrectPokemon.charAt(0).toUpperCase() + initialCorrectPokemon.slice(1));
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [open, setOpen] = useState(false);
  const [previousGuesses, setPreviousGuesses] = useState<string[]>([]);

  const showImage = revealedHints >= maxAttempts - 1 || won;

  function handleGuess(isCorrect: boolean, guessName: string) { 
  if (gameOver || won) return;

  setPreviousGuesses((prev) => [...prev, guessName]);
  const nextAttempts = attemptsUsed + 1;
  setAttemptsUsed(nextAttempts);

  if (isCorrect) {
    setWon(true);

    setTimeout(() => {
      setOpen(true)

    }, 800);

    return;
  }

  const nextHints = Math.min(revealedHints + 1, maxAttempts - 1);
  setRevealedHints(nextHints);

  if (nextAttempts >= maxAttempts) {
    setGameOver(true);

    setTimeout(() => {
      setOpen(true)
    }, 800);
  }
}

function handleAutoWin() {
  if (gameOver || won) return;
  setWon(true);
  setTimeout(() => setOpen(true), 200);
}

function handleAutoLose() {
  if (gameOver || won) return;
  setGameOver(true);
  setAttemptsUsed(maxAttempts);
  setTimeout(() => setOpen(true), 200);
}


  return (
    <>
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm data-[state=open]:animate-overlayShow z-40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-gradient-to-b from-[rgba(17,28,51,0.98)] to-[rgba(15,23,42,0.98)] shadow-2xl p-8 flex flex-col items-center gap-4 z-50"
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <Cross2Icon width={22} height={22} />
          </button>
          <Dialog.Title className="text-2xl font-extrabold text-white text-center mb-2">
            {won && (
              <>
                <span className="block text-green-400 mb-1">🎉 Well done!</span>
                <span>The answer was <span className="font-bold text-yellow-300">{correctPokemon}</span></span>
              </>
            )}
            {gameOver && !won && (
              <>
                <span className="block text-rose-400 mb-1">❌ Nice try!</span>
                <span>The correct answer was <span className="font-bold text-yellow-300">{correctPokemon}</span></span>
              </>
            )}
          </Dialog.Title>
          <div className="w-full flex flex-col items-center gap-2 mt-2">
            <button
              className="mt-2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-rose-500 text-white font-bold shadow hover:scale-105 transition-transform"
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

          <div />
        </div>

        {/* HINTS */}
        <Hints
          pokemon={pokemon}
          generation={generation}
          revealedHints={revealedHints}
        />

        {/* DEBUG: Auto Win / Auto Lose (for development) */}
        <div className="w-full max-w-190 mt-2 flex justify-center gap-3">
          <button
            onClick={handleAutoWin}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-bold shadow hover:scale-105 transition-transform"
          >
            Auto Win
          </button>
          <button
            onClick={handleAutoLose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white font-bold shadow hover:scale-105 transition-transform"
          >
            Auto Lose
          </button>
        </div>

        {/* SEARCH */}
        <SearchPokemon
          correctPokemon={correctPokemon}
          maxAttempts={maxAttempts}
          onGuess={handleGuess}
        />
      </div>
    </div>
      </>
  );
}
