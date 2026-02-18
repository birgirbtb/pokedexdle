/* -------------------------------------------------------------------------- */
/*                         app/unlimited/page.tsx                             */
/* -------------------------------------------------------------------------- */
/*
  Unlimited mode page.

  Responsibilities:
  - Get authenticated user (if logged in)
  - Determine if user is admin
  - Pick a random Pokémon each time the page loads
  - Fetch Pokémon details from PokéAPI
  - Fetch user stats (optional, if logged in)
  - Render GameFrame layout + GameClient
  - Force a fresh game each load (game = null)
*/

/* --------------------------------- Imports -------------------------------- */

import Link from "next/link"; // Client-side navigation
import { createClient } from "@/lib/supabase/server"; // Server-side Supabase client
import Pokedex from "pokedex-promise-v2"; // PokéAPI wrapper
import GameFrame from "../components/GameFrame"; // Shared layout wrapper
import GameClient from "../components/GameClient"; // Main interactive game client component
import { getUserStats } from "@/lib/actions/stats"; // User stats query

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

  // Fetch evolution chain data using the URL in species response
  const evoRes = await fetch(species.evolution_chain.url);
  const evoChain = await evoRes.json();

  // Traverse evolution chain until we find the pokemonName
  let stage = 1;
  let current = evoChain.chain;

  while (current) {
    // If this species is the Pokémon we're looking for, return stage number
    if (current.species.name === pokemonName) {
      return stage;
    }

    // Move to next evolution node
    current = current.evolves_to?.[0];
    stage++;
  }

  // Fallback if chain traversal fails
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
    // Read admin flag from profiles table
    const { data } = await supabase
      .from("profiles")
      .select("admin")
      .eq("id", user.id)
      .single();

    isAdmin = data?.admin || false;
  }

  /* ----------------------- Pokémon Fetching Variables ---------------------- */

  let pokemon: Pokedex.Pokemon & { evolutionStage?: number };
  let generation: string;

  /* ---------------------------- Pick Random Pokémon ------------------------ */

  // Pick a random Pokémon ID (1..1025)
  const randomId = Math.floor(Math.random() * 1025) + 1;

  // Resolve the Pokémon name from its ID
  const correctPokemon = (await P.getPokemonByName(randomId)).name;

  /* --------------------------- PokéAPI Fetching ---------------------------- */

  try {
    // Fetch species info (to get generation)
    const speciesData = await P.getPokemonSpeciesByName(correctPokemon);
    generation = speciesData.generation.name;

    // Fetch full Pokémon data (sprites, types, etc.)
    pokemon = await P.getPokemonByName(correctPokemon);

    // Determine evolution stage and attach it to pokemon object
    const evolutionStage = await getEvolutionStage(correctPokemon);
    pokemon.evolutionStage = evolutionStage;
  } catch (error) {
    console.error("Error fetching pokemon:", error);
    return <div className="text-white">Error loading pokemon data</div>;
  }

  /* ------------------------------ Game / Stats ----------------------------- */

  // Unlimited mode always starts fresh, so there is no stored "game"
  const game = null;

  // Stats only available if user is logged in
  const stats = user ? await getUserStats() : null;

  /* ------------------------------ Render Page ------------------------------ */

  return (
    <GameFrame
      /*
        headerCenter renders a centered button in the GameFrame header.
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
        pokemon={pokemon}          // Random Pokémon full data
        generation={generation}    // Generation string
        game={game}                // Always null in unlimited
        nextGuessAt=""             // No daily cooldown in unlimited
        stats={stats}              // User stats (optional)
        isAdmin={isAdmin}          // Admin flag (optional tools)
        isUnlimited={true}         // Enables unlimited-mode behavior in GameClient
      />
    </GameFrame>
  );
}
