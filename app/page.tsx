/* -------------------------------------------------------------------------- */
/*                               app/page.tsx                                 */
/* -------------------------------------------------------------------------- */
/*
  Main game page.

  Responsibilities:
  - Get authenticated user (if logged in)
  - Determine if user is admin
  - Fetch today's Pokémon from database
  - Fetch Pokémon details from PokéAPI
  - Fetch user's game + stats
  - Render GameFrame layout
  - Pass all required data to GameClient
*/

/* --------------------------------- Imports -------------------------------- */

import Link from "next/link"; // Client-side navigation
import { createClient } from "@/lib/supabase/server"; // Server-side Supabase client
import Pokedex from "pokedex-promise-v2"; // PokéAPI wrapper
import GameFrame from "./components/GameFrame"; // Layout wrapper
import GameClient from "./components/GameClient"; // Main interactive client component
import { getTodaysPokemon, getUserGame } from "@/lib/actions/guess"; // Game data
import { getUserStats } from "@/lib/actions/stats"; // Stats data

/* ----------------------------- PokéAPI Instance ---------------------------- */

// Create one Pokedex instance for API calls
const P = new Pokedex();

/* -------------------------------------------------------------------------- */
/*                     Helper: Get Evolution Stage                            */
/* -------------------------------------------------------------------------- */
/*
  Fetches evolution chain for a Pokémon and determines
  which stage it belongs to (1, 2, 3, etc).
*/
async function getEvolutionStage(pokemonName: string) {
  // Fetch species data
  const speciesRes = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`,
  );
  const species = await speciesRes.json();

  // Fetch evolution chain
  const evoRes = await fetch(species.evolution_chain.url);
  const evoChain = await evoRes.json();

  // Traverse evolution chain
  let stage = 1;
  let current = evoChain.chain;

  while (current) {
    // If current matches Pokémon, return its stage
    if (current.species.name === pokemonName) {
      return stage;
    }

    // Move to next evolution
    current = current.evolves_to?.[0];
    stage++;
  }

  // Default fallback
  return 1;
}

/* -------------------------------------------------------------------------- */
/*                                Page Component                              */
/* -------------------------------------------------------------------------- */

export default async function Page() {
  /* ----------------------------- Auth Handling ----------------------------- */

  // Create Supabase server client
  const supabase = await createClient();

  // Get authenticated user (if logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* ------------------------------ Admin Check ------------------------------ */

  let isAdmin = false;

  if (user) {
    // Check profiles table for admin flag
    const { data } = await supabase
      .from("profiles")
      .select("admin")
      .eq("id", user.id)
      .single();

    isAdmin = data?.admin || false;
  }

  /* ------------------------- Get Today's Pokémon -------------------------- */

  const pokemonData = await getTodaysPokemon();

  // Strong typing for Pokémon object
  let pokemon: Pokedex.Pokemon & { evolutionStage?: number };
  let generation: string;

  // If no Pokémon data exists for today
  if (!pokemonData) {
    return <div className="text-white">No pokemon data available</div>;
  }

  // Extract DB values
  const correctPokemon = pokemonData.pokemon_name;
  const availableOn = pokemonData.available_on;

  /*
    Calculate nextGuessAt:
    - available_on is midnight UTC
    - Add 1 day to determine next playable time
  */
  const nextGuessAt = new Date(`${availableOn}T00:00:00.000Z`);
  nextGuessAt.setUTCDate(nextGuessAt.getUTCDate() + 1);

  /* --------------------------- PokéAPI Fetching ---------------------------- */

  try {
    // Fetch species info (for generation)
    const speciesData = await P.getPokemonSpeciesByName(correctPokemon);
    generation = speciesData.generation.name;

    // Fetch Pokémon full data (sprites, types, etc.)
    pokemon = await P.getPokemonByName(correctPokemon);

    // Determine evolution stage
    const evolutionStage = await getEvolutionStage(correctPokemon);
    pokemon.evolutionStage = evolutionStage;
  } catch (error) {
    console.error("Error fetching pokemon:", error);
    return <div className="text-white">Error loading pokemon data</div>;
  }

  /* -------------------------- User Game & Stats ---------------------------- */

  // Get today's game for this user (if logged in)
  const game = user ? await getUserGame() : null;

  // Get user statistics (if logged in)
  const stats = user ? await getUserStats() : null;

  /* ------------------------------ Render Page ------------------------------ */

  return (
    <GameFrame
      /*
        headerCenter renders a centered button
        inside GameFrame header.
      */
      headerCenter={
        <Link href="/history">
          <button
            type="button"
            className="
              border border-white/[0.14]
              bg-black/10
              text-[#e8eefc]
              py-2.5 px-3.5
              rounded-xl
              font-bold
              cursor-pointer
              hover:bg-black/20
              active:translate-y-px
              focus:outline-none
              focus:ring-2
              focus:ring-white/20
            "
          >
            History
          </button>
        </Link>
      }
    >
      {/* Main interactive game component */}
      <GameClient
        pokemon={pokemon}                     // Pokémon full data
        generation={generation}               // Generation string
        game={game}                           // User's game for today
        nextGuessAt={nextGuessAt.toISOString()} // Cooldown target
        stats={stats}                         // User statistics
        isAdmin={isAdmin}                     // Admin flag
      />
    </GameFrame>
  );
}
