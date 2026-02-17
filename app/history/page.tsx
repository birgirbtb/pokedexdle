// -----------------------------------------------------------------------------
// app/history/page.tsx
// -----------------------------------------------------------------------------
// This page renders the user's daily guess history as rows of small squares:
// - Each row = a day (from daily_pokemon table)
// - Each square = one attempt slot for that day (max attempts = 6)
//
// Data sources (Supabase):
// - daily_pokemon: provides the calendar of daily Pokémon puzzles
// - games: provides the user's game record for each day
//   - guesses: nested relation providing each attempt for that day
//
// UI wrappers:
// - GameFrame: your shared app layout (header + glass container)
// - Link: Next.js navigation for "Back to Game" and "Login"
// -----------------------------------------------------------------------------

import Link from "next/link"; // Client-side navigation
import GameFrame from "../components/GameFrame"; // Shared app shell layout
import { createClient } from "@/lib/supabase/server"; // Server-side Supabase client

// Max number of guesses/attempt slots shown per day.
// IMPORTANT: This should match your game rules and database logic.
const MAX_ATTEMPTS = 6;

/* ---------------------------- Database Row Types --------------------------- */

// Represents a row from the "daily_pokemon" table.
// This table defines the daily puzzle Pokémon.
type DailyPokemonRow = {
  id: string; // Primary key for the day record
  available_on: string; // Date string "YYYY-MM-DD"
  pokemon_name: string; // Correct Pokémon name for that day
};

// Represents a single guess row in the nested "guesses" relation.
type GuessRow = {
  attempt_number: number; // Which attempt (1..MAX_ATTEMPTS)
  guess_name: string; // The Pokémon name guessed by the user
};

// Represents a row from the "games" table, including nested guesses.
type GameRow = {
  id: string; // Primary key for a single user's game
  daily_pokemon_id: string; // Foreign key pointing to daily_pokemon.id
  won: boolean | null; // Whether the user won (true/false) or not set yet (null)
  is_finished: boolean | null; // Whether the game was finished (true/false/null)
  guesses: GuessRow[]; // Nested guesses for the day
};

/* ----------------------------- UI Tile Status ------------------------------ */

// Each tile in the row can be:
// - correct: guess matched the day's Pokémon
// - wrong: guess was made but incorrect
// - empty: no guess recorded (didn't play / not enough attempts)
type GuessTileStatus = "correct" | "wrong" | "empty";

/* ------------------------------ Date Helpers ------------------------------- */

// Format "YYYY-MM-DD" into a human-readable US date label.
function formatDate(value: string) {
  // Force midnight UTC to avoid timezone shifting issues when rendering dates
  const date = new Date(`${value}T00:00:00.000Z`);

  // Example output: "Feb 17, 2026"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ------------------------------ Style Helpers ------------------------------ */

// Returns the Tailwind classes needed for a tile based on its status.
function getTileClasses(status: GuessTileStatus) {
  // Correct guess tile (green)
  if (status === "correct") {
    return "bg-emerald-500/70 border-emerald-400/50";
  }

  // Wrong guess tile (red)
  if (status === "wrong") {
    return "bg-red-500/70 border-red-400/50";
  }

  // Empty tile (grey)
  return "bg-white/5 border-white/10";
}

/* ------------------------------ Tile Builder ------------------------------- */

// Build an array of MAX_ATTEMPTS tile statuses for a given day.
// - If no game exists => all tiles empty (didn't play)
// - If game exists => mark each attempt as correct/wrong based on match
function buildTiles(
  day: DailyPokemonRow,
  game: GameRow | undefined,
): GuessTileStatus[] {
  // If the user never played this day, show a full empty row
  if (!game) {
    return Array.from({ length: MAX_ATTEMPTS }, () => "empty");
  }

  // Sort guesses so attempt order is always consistent
  const guesses = [...game.guesses].sort(
    (a, b) => a.attempt_number - b.attempt_number,
  );

  // Normalize the correct Pokémon name for comparisons
  const pokemonName = day.pokemon_name.toLowerCase();

  // Convert each guess to correct/wrong by comparing guessed name to correct name
  const results: GuessTileStatus[] = guesses.map((guess) =>
    guess.guess_name.toLowerCase() === pokemonName ? "correct" : "wrong",
  );

  // If user has more guesses than MAX_ATTEMPTS, trim it
  if (results.length >= MAX_ATTEMPTS) {
    return results.slice(0, MAX_ATTEMPTS);
  }

  // Otherwise pad the remainder with empty tiles
  return results.concat(
    Array.from({ length: MAX_ATTEMPTS - results.length }, () => "empty"),
  );
}

/* ------------------------------- Page -------------------------------------- */

export default async function HistoryPage() {
  /* -------------------------- Auth / Supabase Setup ------------------------ */

  // Create server Supabase client (reads session from cookies)
  const supabase = await createClient();

  // Read current user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* -------------------------- Load Daily Calendar -------------------------- */

  // Today's date in YYYY-MM-DD format (used to filter out future days)
  const todayIso = new Date().toISOString().split("T")[0];

  // Fetch all daily puzzles up to today, newest first
  const { data: days, error: daysError } = await supabase
    .from("daily_pokemon")
    .select("id, available_on, pokemon_name")
    .lte("available_on", todayIso) // Only days that are available up to today
    .order("available_on", { ascending: false }); // Newest first

  /* ------------------------------ Error State ------------------------------ */

  // If the daily calendar cannot load, show a simple error inside GameFrame
  if (daysError) {
    return (
      <GameFrame
        // Center header button: return to main game page
        headerCenter={
          <Link href="/">
            <button className="border border-white/[0.14] bg-black/10 text-[#e8eefc] py-2.5 px-3.5 rounded-xl font-bold cursor-pointer">
              Back to Game
            </button>
          </Link>
        }
      >
        <h1 className="text-white text-2xl font-bold">Guess History</h1>

        <div className="text-[#9aa6c3]">
          Could not load history. Please try again later.
        </div>
      </GameFrame>
    );
  }

  /* ---------------------------- Logged-out State --------------------------- */

  // If not logged in, show a message and a login button.
  // This prevents loading user-specific games and avoids query errors.
  if (!user) {
    return (
      <GameFrame
        headerCenter={
          <Link href="/">
            <button className="border border-white/[0.14] bg-black/10 text-[#e8eefc] py-2.5 px-3.5 rounded-xl font-bold cursor-pointer">
              Back to Game
            </button>
          </Link>
        }
      >
        <h1 className="text-white text-2xl font-bold">Guess History</h1>

        {/* Panel for logged-out messaging */}
        <div className="rounded-2xl border border-white/10 bg-black/20 shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-5 text-center text-[#9aa6c3]">
          Log in to view your history.

          {/* Login call-to-action */}
          <div className="mt-4">
            <Link href="/login">
              <button className="border border-white/[0.14] bg-black/10 text-[#e8eefc] py-2.5 px-3.5 rounded-xl font-bold cursor-pointer">
                Login
              </button>
            </Link>
          </div>
        </div>
      </GameFrame>
    );
  }

  /* -------------------------- Load User Games Data ------------------------- */

  // Normalize days into an array (days can be null if no rows exist)
  const dayList = days || [];

  // Extract day IDs so we can fetch matching games in a single query
  const dayIds = dayList.map((day) => day.id);

  // Map for quick lookup: dayId -> game record
  const gamesByDay = new Map<string, GameRow>();

  // Only query games if we actually have days to request
  if (dayIds.length > 0) {
    // Fetch all of the user's games for the listed dayIds
    // Includes nested guesses with attempt_number and guess_name
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select(
        "id, daily_pokemon_id, won, is_finished, guesses(attempt_number, guess_name)",
      )
      .eq("user_id", user.id) // Only this user's games
      .in("daily_pokemon_id", dayIds); // Only days we are displaying

    // If the query succeeded, store each game by its day ID for fast access
    if (!gamesError && games) {
      for (const game of games) {
        gamesByDay.set(game.daily_pokemon_id, game);
      }
    }
  }

  /* ------------------------------- Render ---------------------------------- */

  return (
    <GameFrame
      // Center header button: return to main game page
      headerCenter={
        <Link href="/">
          <button className="border border-white/[0.14] bg-black/10 text-[#e8eefc] py-2.5 px-3.5 rounded-xl font-bold cursor-pointer">
            Back to Game
          </button>
        </Link>
      }
    >
      {/* Page title */}
      <h1 className="text-white text-2xl font-bold">Guess History</h1>

      {/* Outer history panel */}
      <div className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-5">
        {/* Empty history state */}
        {dayList.length === 0 ? (
          <div className="text-[#9aa6c3]">No history yet.</div>
        ) : (
          // Rows container
          <div className="flex flex-col gap-4">
            {/* Render one row per day */}
            {dayList.map((day) => {
              // Look up the user's game for this day (if it exists)
              const game = gamesByDay.get(day.id);

              // Build MAX_ATTEMPTS tiles for this day
              const tiles = buildTiles(day, game);

              return (
                <div key={day.id} className="flex items-center gap-6">
                  {/* Left: Day label */}
                  <div className="w-36 text-[#9aa6c3]">
                    {formatDate(day.available_on)}
                  </div>

                  {/* Right: Attempt tiles */}
                  <div className="flex flex-wrap gap-2">
                    {tiles.map((status, index) => (
                      <div
                        key={`${day.id}-${index}`}
                        className={`w-7 h-7 rounded-md border ${getTileClasses(
                          status,
                        )}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend explaining tile colors */}
        <div className="mt-6 flex flex-wrap gap-6 text-[#9aa6c3]">
          {/* Correct */}
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-emerald-500/70 border border-emerald-400/50" />
            <span>Correct</span>
          </div>

          {/* Wrong */}
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-red-500/70 border border-red-400/50" />
            <span>Wrong</span>
          </div>

          {/* Didn't play */}
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-white/5 border border-white/10" />
            <span>Didn{"'"}t play</span>
          </div>
        </div>
      </div>
    </GameFrame>
  );
}
