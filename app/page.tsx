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

import GameFrame from "./components/GameFrame"; // Layout wrapper
import GameClient from "./components/GameClient"; // Main interactive client component
import { getTodaysPokemon, getUserGame } from "@/lib/actions/guess"; // Game data
import { getUserStats } from "@/lib/actions/stats"; // Stats data
import { getCurrentUserWithAdmin } from "@/lib/actions/auth"; // Auth query (with admin check)
import { getPokemonWithMetadata } from "@/lib/actions/pokemon"; // Pokémon data fetching + processing
import HistoryButton from "./components/HistoryButton"; // Button linking to game history page

/* -------------------------------------------------------------------------- */
/*                                Page Component                              */
/* -------------------------------------------------------------------------- */

export default async function Page() {
  // Get current user and admin status (if logged in)
  const { user, isAdmin } = await getCurrentUserWithAdmin();

  /* ------------------------- Get Today's Pokémon -------------------------- */

  const pokemonData = await getTodaysPokemon();

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
    // Fetch Pokémon details + metadata from PokéAPI
    const { pokemon, generation } =
      await getPokemonWithMetadata(correctPokemon);

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
        headerCenter={<HistoryButton />}
      >
        {/* Main interactive game component */}
        <GameClient
          pokemon={pokemon} // Pokémon full data
          generation={generation} // Generation string
          game={game} // User's game for today
          nextGuessAt={nextGuessAt.toISOString()} // Cooldown target
          stats={stats} // User statistics
          isAdmin={isAdmin} // Admin flag
        />
      </GameFrame>
    );
  } catch (error) {
    console.error("Error fetching pokemon:", error);
    return <div className="text-white">Error loading pokemon data</div>;
  }
}
