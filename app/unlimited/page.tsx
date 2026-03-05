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

import GameFrame from "../components/GameFrame"; // Shared layout wrapper
import GameClient from "../components/GameClient"; // Main interactive game client component
import { getUserStats } from "@/lib/actions/stats"; // User stats query
import { getCurrentUserWithAdmin } from "@/lib/actions/auth"; // Auth query (with admin check)
import { getPokemonWithMetadata } from "@/lib/actions/pokemon"; // Pokémon data fetching + processing
import HistoryButton from "../components/HistoryButton"; // Button linking to game history page

/* -------------------------------------------------------------------------- */
/*                                Page Component                              */
/* -------------------------------------------------------------------------- */

export default async function Page() {
  // Get current user and admin status (if logged in)
  const { user, isAdmin } = await getCurrentUserWithAdmin();

  /* ---------------------------- Pick Random Pokémon ------------------------ */

  // Pick a random Pokémon ID (1..1025)
  const randomId = Math.floor(Math.random() * 1025) + 1;

  /* --------------------------- PokéAPI Fetching ---------------------------- */

  try {
    const { pokemon, generation } = await getPokemonWithMetadata(randomId);

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
        headerCenter={<HistoryButton />}
      >
        {/* Main interactive game component */}
        <GameClient
          pokemon={pokemon} // Random Pokémon full data
          generation={generation} // Generation string
          game={game} // Always null in unlimited
          nextGuessAt="" // No daily cooldown in unlimited
          stats={stats} // User stats (optional)
          isAdmin={isAdmin} // Admin flag (optional tools)
          isUnlimited={true} // Enables unlimited-mode behavior in GameClient
        />
      </GameFrame>
    );
  } catch (error) {
    // Handle errors gracefully by showing a message instead of crashing the page
    console.error("Error fetching pokemon:", error);
    return <div className="text-white">Error loading pokemon data</div>;
  }
}
