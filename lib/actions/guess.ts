"use server";

/* -------------------------------------------------------------------------- */
/*                                  guess.ts                                  */
/* -------------------------------------------------------------------------- */
/*
  This file contains Server Actions for the daily guessing game.

  Tables used (Supabase):
  - daily_pokemon: defines which Pokémon is active for a given date
  - games: one row per user per daily puzzle
  - guesses: rows linked to a game (each attempt)

  Exported functions:
  - getTodaysPokemon(): returns the daily_pokemon row for today
  - getUserGame(): returns the current user's game for today (including guesses)
  - createGame(): creates a new game row for the user for today
  - createGuess(guessName): inserts a guess row for the user's game
  - endGame(won): marks the game as finished and sets won=true/false

  Internal helper:
  - getOrCreateGame(): returns today's game or creates it if missing
*/

import { createClient } from "@/lib/supabase/server"; // Server Supabase client (session/cookies aware)

/* -------------------------------------------------------------------------- */
/*                             getTodaysPokemon                               */
/* -------------------------------------------------------------------------- */
/*
  Loads the daily_pokemon row for today's date (UTC-based ISO string split).

  Returns:
  - daily_pokemon row object (or null/undefined if not found)
*/
export async function getTodaysPokemon() {
  // Create server Supabase client
  const supabase = await createClient();

  // Build today's date string in YYYY-MM-DD format
  const todayIso = new Date().toISOString().split("T")[0];

  // Query daily_pokemon for the row matching today's date
  const { data: pokemonData } = await supabase
    .from("daily_pokemon") // Daily puzzle table
    .select("*") // Fetch all columns
    .eq("available_on", todayIso) // Only today's record
    .single(); // Expect exactly one row

  // Return the row (or null if missing)
  return pokemonData;
}

/* -------------------------------------------------------------------------- */
/*                                getUserGame                                 */
/* -------------------------------------------------------------------------- */
/*
  Loads the current user's game record for today's daily Pokémon.
  Includes nested guesses.

  Returns:
  - game row with guesses included, or null if:
    - user not logged in
    - game not found
*/
export async function getUserGame() {
  // Create server Supabase client
  const supabase = await createClient();

  // Read current user from Supabase session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only proceed if user is logged in
  if (user) {
    // Load today's daily_pokemon row
    const pokemon = await getTodaysPokemon();

    // If there is no daily puzzle row, stop with an error
    if (!pokemon) {
      throw new Error("No pokemon data available");
    }

    // Fetch the game row for this user and today's daily_pokemon_id
    // Also fetch related guesses (nested)
    const { data: game } = await supabase
      .from("games") // Games table
      .select("*, guesses(*)") // Include nested guesses
      .eq("user_id", user.id) // Only this user
      .eq("daily_pokemon_id", pokemon.id) // Only today's game
      .single(); // Expect one row (or error if none)

    // Return game row (or null if not found)
    return game;
  }

  // Not logged in => no game data
  return null;
}

/* -------------------------------------------------------------------------- */
/*                                 createGame                                 */
/* -------------------------------------------------------------------------- */
/*
  Creates a new game row for the current user for today's daily Pokémon.
  Immediately returns the created row including nested guesses.

  Returns:
  - game row with guesses included, or:
    - null if creation fails
    - undefined if user is not logged in (because function exits without return)
*/
export async function createGame() {
  // Create server Supabase client
  const supabase = await createClient();

  // Read current user from Supabase session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only proceed if user is logged in
  if (user) {
    // Load today's daily_pokemon row
    const pokemon = await getTodaysPokemon();

    // If there is no daily puzzle row, stop with an error
    if (!pokemon) {
      throw new Error("No pokemon data available");
    }

    try {
      // Insert a new game row for this user and today's pokemon
      const { data } = await supabase
        .from("games") // Games table
        .insert({
          user_id: user.id, // Link to user
          daily_pokemon_id: pokemon.id, // Link to today's daily puzzle
        })
        .select("*, guesses(*)") // Return the created row + nested guesses
        .single(); // Expect exactly one row returned

      // Return created game
      return data;
    } catch (error) {
      // Log error on server for debugging
      console.error("Error creating game:", error);

      // Return null to indicate failure
      return null;
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                                createGuess                                 */
/* -------------------------------------------------------------------------- */
/*
  Internal helper: Inserts a new guess row for the current user's game.
  Attempt number is computed as (existing guesses length + 1).

  Inputs:
  - guessName: the Pokémon name guessed by the user
  - game: the game object

  Returns:
  - void (no explicit return value)
*/
async function createGuess(guessName: string, game: { id: string; user_id: string; guesses: unknown[] }) {
  // Create server Supabase client
  const supabase = await createClient();

  try {
    // Insert a guess row into guesses table
    await supabase.from("guesses").insert({
      game_id: game.id, // Link guess to game
      user_id: game.user_id, // Store user_id for easy filtering
      guess_name: guessName, // Store guess name
      attempt_number: game.guesses.length + 1, // Next attempt number
    });
  } catch (error) {
    // Log server error for debugging
    console.error("Error submitting guess:", error);
  }
}

/* -------------------------------------------------------------------------- */
/*                                submitGuess                                 */
/* -------------------------------------------------------------------------- */
/*
  Unified guessing action that handles the entire guess submission process.

  This combines:
  - Guess validation against the correct Pokémon
  - Saving the guess to database (if not unlimited)
  - Checking if the game should end
  - Ending the game if necessary (if not unlimited)

  Inputs:
  - guessName: the Pokémon name guessed by the user
  - correctPokemonName: the correct Pokémon name to check against
  - isUnlimited: whether this is unlimited mode (skip DB operations)

  Returns:
  - Object with game state:
    {
      isCorrect: boolean,
      gameOver: boolean,
      attemptsUsed: number,
      won: boolean
    }
*/
export async function submitGuess(guessName: string, correctPokemonName: string, isUnlimited: boolean = false) {
  // Check if guess is correct
  const isCorrect = guessName.toLowerCase() === correctPokemonName.toLowerCase();

  // If unlimited mode, skip database operations
  if (isUnlimited) {
    return {
      isCorrect,
      gameOver: false, // Unlimited mode never ends
      attemptsUsed: 0, // Not tracked in unlimited - handled by client
      won: isCorrect
    };
  }

  // Get or create game for daily mode
  const game = await getOrCreateGame();
  if (!game) {
    // User not logged in or game creation failed - skip database operations
    // Return special value to indicate local tracking should be used
    return {
      isCorrect,
      gameOver: false, // Continue playing
      attemptsUsed: -1, // Special value: use local tracking
      won: isCorrect
    };
  }

  // Save the guess
  await createGuess(guessName, game);

  // Calculate new state
  const attemptsUsed = game.guesses.length + 1;
  const maxAttempts = 6;
  const gameOver = attemptsUsed >= maxAttempts && !isCorrect;
  const won = isCorrect;

  // End game if it's over
  if (won || gameOver) {
    await endGame(won);
  }

  return {
    isCorrect,
    gameOver,
    attemptsUsed,
    won
  };
}

/* -------------------------------------------------------------------------- */
/*                                  endGame                                   */
/* -------------------------------------------------------------------------- */
/*
  Marks the current user's game as finished and stores win/loss.

  Inputs:
  - won: boolean indicating whether the user won or lost

  Returns:
  - void (no explicit return value)
*/
export async function endGame(won: boolean) {
  // Create server Supabase client
  const supabase = await createClient();

  // Ensure the user has a game row for today (or create one)
  const game = await getOrCreateGame();

  // If no game exists (commonly not logged in), stop
  if (!game) return;

  try {
    // Update the game row to mark it finished
    await supabase
      .from("games") // Games table
      .update({
        won, // Store win/loss result
        is_finished: true, // Mark finished
      })
      .eq("id", game.id); // Only update this game row
  } catch (error) {
    // Log server error for debugging
    console.error("Error ending game:", error);
  }
}

/* -------------------------------------------------------------------------- */
/*                              getOrCreateGame                               */
/* -------------------------------------------------------------------------- */
/*
  Internal helper that attempts to load today's game for the current user.
  If no game exists, it tries to create it.

  Returns:
  - game row (with guesses)
  - null if user is not logged in or game creation fails
*/
async function getOrCreateGame() {
  // First try to load existing game
  let game: Awaited<ReturnType<typeof getUserGame>> | undefined =
    await getUserGame();

  // If no game exists, try creating one
  if (!game) {
    game = await createGame();
  }

  // If game still doesn't exist, stop and return null
  if (!game) {
    console.error("Game not found after creation");

    // Hérna getum við gert ráð fyrir því að notandinn sé ekki skráður inn og sleppum alveg að vista guesses í gagnagrunn
    return null;
  }

  // Return the game row
  return game;
}
