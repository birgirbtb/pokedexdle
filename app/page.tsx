import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Pokedex from "pokedex-promise-v2";
import GameFrame from "./components/GameFrame";
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

  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("admin")
      .eq("id", user.id)
      .single();
    isAdmin = data?.admin || false;
  }

  const pokemonData = await getTodaysPokemon();

  let pokemon: Pokedex.Pokemon & { evolutionStage?: number };
  let generation: string;

  if (!pokemonData) {
    return <div className="text-white">No pokemon data available</div>;
  }

  const correctPokemon = pokemonData.pokemon_name;
  const availableOn = pokemonData.available_on;
  const nextGuessAt = new Date(`${availableOn}T00:00:00.000Z`);
  nextGuessAt.setUTCDate(nextGuessAt.getUTCDate() + 1);

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

  const game = user ? await getUserGame() : null;

  return (
    <GameFrame
      headerCenter={
        <Link href="/history">
          <button className="border border-white/[0.14] bg-black/10 text-[#e8eefc] py-2.5 px-3.5 rounded-xl font-bold cursor-pointer">
            History
          </button>
        </Link>
      }
    >
      <GameClient
        pokemon={pokemon}
        generation={generation}
        game={game}
        nextGuessAt={nextGuessAt.toISOString()}
        isAdmin={isAdmin}
      />
    </GameFrame>
  );
}
