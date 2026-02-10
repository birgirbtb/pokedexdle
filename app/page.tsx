import Link from "next/link";
import LogOut from "./(auth)/components/LogOut";
import { createClient } from "@/lib/supabase/server";
import Pokedex from "pokedex-promise-v2";
import Image from "next/image";
import GameClient from "./components/GameClient";

const P = new Pokedex();

async function getEvolutionStage(pokemonName: string) {
  const speciesRes = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`,
  );
  const species = await speciesRes.json();

  const evoRes = await fetch(species.evolution_chain.url);
  const evoChain = await evoRes.json();

  let stage = 1;
  let current = evoChain.chain;

  while (current) {
    if (current.species.name === pokemonName) {
      return stage;
    }
    current = current.evolves_to?.[0];
    stage++;
  }

  return 1;
}

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const maxAttempts = 6;

  let pokemon: Pokedex.Pokemon | null = null;
  let generation: string | null = null;
  let correctPokemon: string | null = null;

  try {
    const allPokemon = await P.getPokemonsList({ limit: 1025 });
    const randomIndex = Math.floor(Math.random() * allPokemon.results.length);
    const randomPokemonName = allPokemon.results[randomIndex].name;

    correctPokemon = randomPokemonName;

    const speciesData = await P.getPokemonSpeciesByName(randomPokemonName);
    generation = speciesData.generation.name;

    pokemon = await P.getPokemonByName(randomPokemonName);

    const evolutionStage = await getEvolutionStage(randomPokemonName);
    pokemon.evolutionStage = evolutionStage;
  } catch (error) {
    console.error("Error fetching pokemon:", error);
  }

  if (!pokemon || !correctPokemon) {
    return <div className="text-white">Loading…</div>;
  }

  return (
    <main className="min-h-screen flex justify-center items-center p-4.5">
      <div className="relative w-full max-w-275 rounded-[18px] overflow-hidden bg-linear-to-b from-white/6 to-white/3 border border-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.45)] backdrop-blur-[10px]">
        <header className="relative bg-[linear-gradient(90deg,rgba(229,72,77,0.18),rgba(59,130,246,0.14)),rgba(15,23,42,0.55)] border-b border-white/10">
  <div className="flex items-center justify-between gap-4 p-4">

    {/* LEFT — Brand (goes home) */}
    <Link href="/" className="block">
      <div>
        <div className="text-white inline-block py-1.5 px-3 rounded-full bg-black/25 border border-white/12">
          Pokedexle
        </div>
        <div className="text-[#9aa6c3] text-[13px]">
          Guess the Pokémon
        </div>
      </div>
    </Link>

    {/* RIGHT — Auth */}
    <Link href="/login">
      <button className="border border-white/[0.14] bg-black/10 text-[#e8eefc] py-2.5 px-3.5 rounded-xl font-bold hover:bg-black/20">
        Login
      </button>
    </Link>
  </div>

  {/* CENTER — History */}
  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    <Link href="/history">
      <button className="px-5 py-2.5 rounded-xl font-extrabold
                         border border-white/14 bg-black/30
                         text-[#e8eefc] hover:bg-black/40
                         active:translate-y-px select-none">
        History
      </button>
    </Link>
  </div>
</header>

        <section className="p-4.5 flex flex-col items-center gap-3.5">
          <GameClient
            pokemon={pokemon}
            generation={generation}
            correctPokemon={correctPokemon}
            maxAttempts={maxAttempts}
          />
        </section>
      </div>
    </main>
  );
}