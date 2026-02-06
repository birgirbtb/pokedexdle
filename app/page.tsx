import Link from "next/link";
import LogOut from "./(auth)/components/LogOut";
import { createClient } from "@/lib/supabase/server";
import Pokedex from "pokedex-promise-v2";
import GameClient from "./components/GameClient";
import { getTodaysPokemon, getUserGame } from "./actions/guess";

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

  const pokemonData = await getTodaysPokemon();

  let pokemon: Pokedex.Pokemon & { evolutionStage?: number };
  let generation: string;

  if (!pokemonData) {
    return <div className="text-white">No pokemon data available</div>;
  }

  const correctPokemon = pokemonData.pokemon_name;

  try {
    const speciesData = await P.getPokemonSpeciesByName(correctPokemon);
    generation = speciesData.generation.name;

    pokemon = await P.getPokemonByName(correctPokemon);

    const evolutionStage = await getEvolutionStage(correctPokemon);
    pokemon.evolutionStage = evolutionStage;
  } catch (error) {
    console.error("Error fetching pokemon:", error);
    return <div className="text-white">Error loading pokemon data</div>;
  }

  const game = await getUserGame();

  return (
    <main className="min-h-screen flex justify-center items-center p-4.5">
      <div className="relative w-full max-w-275 rounded-[18px] overflow-hidden bg-linear-to-b from-white/6 to-white/3 border border-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.45)] backdrop-blur-[10px]">
        <header className="bg-[linear-gradient(90deg,rgba(229,72,77,0.18),rgba(59,130,246,0.14)),rgba(15,23,42,0.55)] border-b border-white/10">
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="text-white inline-block py-1.5 px-3 rounded-full bg-black/25 border border-white/12">
                Pokedexdle
              </div>
              <div className="text-[#9aa6c3] text-[13px]">
                Guess the Pokémon
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {user && (
                <p className="text-white text-sm font-semibold">{user.email}</p>
              )}
              {user ? (
                <LogOut />
              ) : (
                <Link href="/login">
                  <button className="border border-white/[0.14] bg-black/10 text-[#e8eefc] py-2.5 px-3.5 rounded-xl font-bold">
                    Login
                  </button>
                </Link>
              )}
            </div>
          </div>
        </header>

        <section className="p-4.5 flex flex-col items-center gap-3.5">
          <GameClient
            pokemon={pokemon}
            generation={generation}
            correctPokemon={correctPokemon}
            maxAttempts={6}
          />
        </section>
      </div>
    </main>
  );
}
