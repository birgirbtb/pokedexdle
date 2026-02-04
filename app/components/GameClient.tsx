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
  const [pokemon, setPokemon] = useState(initialPokemon);
  const [generation, setGeneration] = useState(initialGeneration);
  const [correctPokemon, setCorrectPokemon] = useState(initialCorrectPokemon);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [open, setOpen] = useState(false);

  const showImage = revealedHints >= maxAttempts - 1 || won;

  async function fetchNewPokemon() {
    try {
      const allPokemon = await P.getPokemonsList({ limit: 1025 });
      const randomIndex = Math.floor(Math.random() * allPokemon.results.length);
      const randomName = allPokemon.results[randomIndex].name;

      const speciesData = await P.getPokemonSpeciesByName(randomName);
      const newGeneration = speciesData.generation.name;

      const newPokemon = await P.getPokemonByName(randomName);

      const evoRes = await fetch(speciesData.evolution_chain.url);
      const evoChain = await evoRes.json();
      let stage = 1;
      let current = evoChain.chain;
      while (current) {
        if (current.species.name === randomName) {
          break;
        }
        current = current.evolves_to?.[0];
        stage++;
      }
      newPokemon.evolutionStage = stage;

      setPokemon(newPokemon);
      setGeneration(newGeneration);
      setCorrectPokemon(randomName);
      setAttemptsUsed(0);
      setRevealedHints(0);
      setGameOver(false);
      setWon(false);
    } catch (err) {
      console.error("Error fetching new Pokémon:", err);
    }
  }

  function handleGuess(isCorrect: boolean) {
    if (gameOver || won) return;

    const nextAttempts = attemptsUsed + 1;
    setAttemptsUsed(nextAttempts);

    if (isCorrect) {
      setWon(true);

      setTimeout(() => {
        setOpen(true)
        window.location.reload();
      }, 1000);
    } else {
      const nextHints = Math.min(revealedHints + 1, maxAttempts - 1);
      setRevealedHints(nextHints);

      if (nextAttempts >= maxAttempts) {
        setGameOver(true);

        setTimeout(() => {
          setOpen(true)
          window.location.reload();
        }, 1000);
      }
    }
  }

  return (
    <>
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-blackA6 data-[state=open]:animate-overlayShow" />
			  <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray1 p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow">
        <h1>hello</h1>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
      {/* IMAGE BLOCK */}
      <div className="w-90 h-85 rounded-2xl border border-white/10 bg-linear-to-b from-[rgba(17,28,51,0.92)] to-[rgba(15,23,42,0.92)] p-3.5">
        <div className="h-full grid place-items-center rounded-[14px] border border-white/10 relative overflow-hidden">
          {showImage &&
            pokemon?.sprites?.other?.["official-artwork"]?.front_default && (
              <Image
                src={pokemon.sprites.other["official-artwork"].front_default}
                alt={pokemon.name}
                width={400}
                height={400}
                className="animate-fade-in"
              />
            )}

          {!showImage && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-white text-6xl font-extrabold select-none">
                ?
              </span>
            </div>
          )}
        </div>
      </div>

      {/* HINTS */}
      <Hints
        pokemon={pokemon}
        generation={generation}
        revealedHints={revealedHints}
      />

      {/* SEARCH */}
      <SearchPokemon
        correctPokemon={correctPokemon}
        maxAttempts={maxAttempts}
        onGuess={(isCorrect) => handleGuess(isCorrect)}
      />
    </>
  );
}
