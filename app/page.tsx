// -----------------------------------------------------------------------------
// app/page.tsx
// -----------------------------------------------------------------------------
// Main "Game" page (Server Component).
//
// Responsibilities:
// - Read the current logged-in user from Supabase (server session)
// - Determine if the user is an admin (from profiles table)
// - Load today's daily Pokémon record (from your DB via getTodaysPokemon)
// - Fetch Pokémon details (species + pokemon data) from PokeAPI/Pokedex library
// - Compute extra derived data (generation number string, evolution stage, nextGuessAt)
// - Load the user's game state + stats (if logged in)
// - Render the GameFrame layout + GameClient interactive component
// -----------------------------------------------------------------------------

import Link from "next/link"; // Next.js client navigation for the header button
import { createClient } from "@/lib/supabase/server"; // Server Supabase client (reads auth cookies/session)
import Pokedex from "pokedex-promise-v2"; // Pokedex API wrapper (used to fetch pokemon + species)
import GameFrame from "./components/GameFrame"; // Shared app shell layout (header + glass container)
import GameClient from "./components/GameClient"; // Client component handling gameplay (guesses, UI)
import { getTodaysPokemon, getUserGame } from "@/lib/actions/guess"; // Server actions to fetch today + user game
import { getUserStats } from "@/lib/actions/stats"; // Server action to fetch user stats

// Create one Pokedex instance that can be reused for API calls
const P = new Pokedex();

/* -------------------------------------------------------------------------- */
/*                          Helper: Evolution Stage                           */
/* -------------------------------------------------------------------------- */
/*
  Fetches evolution stage for a Pokémon using PokeAPI evolution chain data.

  Inputs:
  - pokemonName: name string, e.g. "bulbasaur"

  Output:
  - stage number (1 = first form, 2 = second form, etc.)

  Notes:
  - This walks only the first evolution path (evolves_to[0]).
  - For branched chains (e.g. Eevee), this will follow the first branch only.
*/
async function getEvolutionStage(pokemonName: string) {
  // Fetch species data (contains evolution_chain URL)
  const speciesRes = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`,
  );
  const species = await speciesRes.json();

  // Fetch evolution chain data from the URL in species
  const evoRes = await fetch(species.evolution_chain.url);
  const evoChain = await evoRes.json();

  // Track stage number while walking the chain
  let stage = 1;

  // Start at the root of the evolution chain
  let current = evoChain.chain;

  // Walk through chain until we find our pokemonName or run out of nodes
  while (current) {
    // If this node matches the pokemonName, return current stage count
    if (current.species.name === pokemonName) {
      return stage;
    }

    // Move to next evolution step (first branch only)
    current = current.evolves_to?.[0];

    // Increase stage as we move forward
    stage++;
  }

  // Default fallback if not found
  return 1;
}

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */
/*
  This is the server-rendered entry point for the main game page.
  It loads data server-side and passes it into GameClient for interactive UI.
*/
export default async function Page() {
  /* -------------------------- Supabase: Auth User -------------------------- */

  // Create server Supabase client
  const supabase = await createClient();

  // Fetch current user session (null if not logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* -------------------------- Supabase: Admin Flag ------------------------- */

  // Default admin state
  let isAdmin = false;

  // Only query profile if user exists
  if (user) {
    // Read admin flag from profiles table for this user
    const { data } = await supabase
      .from("profiles") // Table containing extra user info
      .select("admin") // Only fetch "admin" column
      .eq("id", user.id) // Match current user id
      .single(); // Expect a single row

    // Set admin boolean (false if missing)
    isAdmin = data?.admin || false;
  }

  /* ------------------------- Load Today's Pokémon Row ---------------------- */

  // Get today's daily Pokémon record from your DB/server logic
  const pokemonData = await getTodaysPokemon();

  // These will be filled after we fetch PokeAPI data
  let pokemon: Pokedex.Pokemon & { evolutionStage?: number };
  let generation: string;

  // If today's Pokémon record is missing, show simple fallback UI
  if (!pokemonData) {
    return <div className="text-white">No pokemon data available</div>;
  }

  /* --------------------------- Derived Day Values -------------------------- */

  // Correct Pokémon name for today (from DB)
  const correctPokemon = pokemonData.pokemon_name;

  // Date this Pokémon is available (YYYY-MM-DD)
  const availableOn = pokemonData.available_on;

  // Compute the next allowed guess time:
  // - Start at midnight UTC of availableOn
  // - Add 1 day (so next guess is at midnight UTC next day)
  const nextGuessAt = new Date(`${availableOn}T00:00:00.000Z`);
  nextGuessAt.setUTCDate(nextGuessAt.getUTCDate() + 1);

  /* ---------------------- PokeAPI: Fetch Pokémon Details ------------------- */

  try {
    // Fetch species to get generation information
    const speciesData = await P.getPokemonSpeciesByName(correctPokemon);

    // Example: "generation-iii"
    generation = speciesData.generation.name;

    // Fetch the actual pokemon object (sprites, types, etc.)
    pokemon = await P.getPokemonByName(correctPokemon);

    // Compute evolution stage and attach it to the pokemon object for hint usage
    const evolutionStage = await getEvolutionStage(correctPokemon);
    pokemon.evolutionStage = evolutionStage;
  } catch (error) {
    // Log server error for debugging
    console.error("Error fetching pokemon:", error);

    // Fallback UI if PokeAPI fails
    return <div className="text-white">Error loading pokemon data</div>;
  }

  /* --------------------- Load User-Specific Game + Stats ------------------- */

  // If user is logged in, load their game record for today; otherwise null
  const game = user ? await getUserGame() : null;

  // If user is logged in, load their overall stats; otherwise null
  const stats = user ? await getUserStats() : null;

  /* ------------------------------- Render UI ------------------------------- */

  return (
    // GameFrame wraps everything in your shared UI shell (header + glass panel)
    <GameFrame
      // headerCenter gets rendered in the middle of the header:
      // - On mobile: it becomes its own row (GameFrame handles this)
      // - On desktop: it is centered absolutely (GameFrame handles this)
      headerCenter={
        <Link href="/history" className="block">
          <button
            type="button"
            className="
              w-full sm:w-auto
              min-h-[44px]
              px-4 py-2
              rounded-xl
              font-bold
              text-[#e8eefc]
              border border-white/[0.14]
              bg-black/10
              hover:bg-black/20
              active:translate-y-px
              focus:outline-none focus:ring-2 focus:ring-white/20
              cursor-pointer
            "
          >
            History
          </button>
        </Link>
      }
    >
      {/* GameClient is the interactive gameplay UI:
          - guessing, attempts tracking, hints, etc.
          - receives all server-fetched data as props
      */}
      <GameClient
        pokemon={pokemon} // Full Pokémon object + evolutionStage
        generation={generation} // Generation string for hint logic
        game={game} // User’s saved game state for today (if logged in)
        nextGuessAt={nextGuessAt.toISOString()} // When user can guess again (cooldown UI)
        stats={stats} // User’s overall stats (if logged in)
        isAdmin={isAdmin} // Controls whether debug buttons appear
      />
    </GameFrame>
  );
}
