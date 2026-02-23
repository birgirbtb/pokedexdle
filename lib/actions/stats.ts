"use server";

/* -------------------------------------------------------------------------- */
/*                                  stats.ts                                  */
/* -------------------------------------------------------------------------- */
/*
  This file calculates user statistics from the "games" table.

  Output stats:
  - totalGames: total number of games rows for the user
  - totalWins: number of games where won === true
  - currentStreak: current consecutive-day win streak up to the latest recorded day
  - bestStreak: best consecutive-day win streak found across all recorded days

  Tables used (Supabase):
  - games (won, daily_pokemon_id)
  - daily_pokemon (available_on) joined via daily_pokemon_id

  For unsigned users:
  - Stats are calculated from localStorage directly on the client
*/

import { createClient } from "@/lib/supabase/server"; // Server Supabase client (session/cookies aware)

/* -------------------------------------------------------------------------- */
/*                                  Types                                     */
/* -------------------------------------------------------------------------- */

// Returned stats shape used by the UI (GameClient)
export type UserStats = {
  totalGames: number; // Count of games rows for the user
  totalWins: number; // Count of games with won === true
  currentStreak: number; // Consecutive wins ending at the latest day
  bestStreak: number; // Maximum consecutive win streak ever achieved
};

/* -------------------------------------------------------------------------- */
/*                           Date Normalization Helper                        */
/* -------------------------------------------------------------------------- */
/*
  Converts a "YYYY-MM-DD" string into a UTC day number.

  Example:
  - "2026-02-17" -> (UTC timestamp at midnight) / 86400000

  Returns:
  - number representing the day index in UTC
  - null if parsing fails
*/
function toUtcDayNumber(dateString: string) {
  // Split the string and convert to numbers
  const [year, month, day] = dateString.split("-").map(Number);

  // Guard: make sure we have valid values
  if (!year || !month || !day) return null;

  // Convert to UTC timestamp at midnight, then convert to "days since epoch"
  return Date.UTC(year, month - 1, day) / 86400000;
}

/* -------------------------------------------------------------------------- */
/*                               getUserStats                                 */
/* -------------------------------------------------------------------------- */
/*
  Loads all games for the logged-in user and computes stats.

  Returns:
  - UserStats if logged in and data exists
  - null if not logged in or query returns no data
*/
export async function getUserStats(): Promise<UserStats | null> {
  /* -------------------------- Supabase: Auth User -------------------------- */

  // Create server Supabase client
  const supabase = await createClient();

  // Get the current logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, stats should not be shown
  if (!user) return null;

  /* ---------------------------- Load Game Records -------------------------- */

  // Fetch user's games and join daily_pokemon to get the date (available_on)
  const { data } = await supabase
    .from("games")
    .select("won, daily_pokemon:daily_pokemon_id(available_on)")
    .eq("user_id", user.id);

  // If no data returned, stop
  if (!data) return null;

  /* ----------------------- Reduce Games Into Per-Day Map ------------------- */
  /*
    byDate tracks whether a user won on a given day.

    Key: available_on ("YYYY-MM-DD")
    Value: boolean (true if at least one win row exists for that day, else false)
  */
  const byDate = new Map<string, boolean>();

  // Build the map by iterating over every game row
  data.forEach((row) => {
    // Pull available_on from the joined daily_pokemon object
    const availableOn = row.daily_pokemon?.available_on;

    // Skip rows with missing date
    if (!availableOn) return;

    // Treat won === true as a win, anything else as not a win
    const didWin = row.won === true;

    // If we haven't seen this date before, set it now
    if (!byDate.has(availableOn)) {
      byDate.set(availableOn, didWin);
      return;
    }

    // If we already have this date recorded:
    // - keep it true if any entry is a win
    if (didWin) {
      byDate.set(availableOn, true);
    }
  });

  /* ---------------------------- Sort By Date ------------------------------ */
  /*
    Turn the map into an array and sort by date ascending (string compare works
    for ISO format "YYYY-MM-DD").
  */
  const dates = Array.from(byDate.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  /* -------------------------- Streak Calculations -------------------------- */

  // bestStreak: highest win streak observed
  let bestStreak = 0;

  // currentStreak: streak value at the most recent date in the list
  let currentStreak = 0;

  // streak: running counter used while iterating
  let streak = 0;

  // prevDayNumber: previous date converted to UTC day number (for consecutive check)
  let prevDayNumber: number | null = null;

  // Walk through dates in ascending order
  dates.forEach(([date, didWin], index) => {
    // Convert YYYY-MM-DD to a numeric day value
    const dayNumber = toUtcDayNumber(date);

    // Skip if parsing failed
    if (dayNumber === null) return;

    // If the user won on this day:
    if (didWin) {
      // If the previous day exists and this day is exactly 1 day after it,
      // extend the streak
      if (prevDayNumber !== null && dayNumber === prevDayNumber + 1) {
        streak += 1;
      } else {
        // Otherwise start a new streak at 1
        streak = 1;
      }

      // Update bestStreak if this streak is the biggest so far
      if (streak > bestStreak) {
        bestStreak = streak;
      }
    } else {
      // If the user did not win, streak resets
      streak = 0;
    }

    // Update previous day reference
    prevDayNumber = dayNumber;

    // If this is the final date in the sorted list, compute currentStreak
    if (index === dates.length - 1) {
      currentStreak = didWin ? streak : 0;
    }
  });

  /* -------------------------- Totals (Games/Wins) -------------------------- */

  // Total games is the number of rows returned from games table
  const totalGames = data.length;

  // Total wins counts rows where won === true
  const totalWins = data.filter((row) => row.won === true).length;

  /* ------------------------------ Return Stats ----------------------------- */

  return {
    totalGames,
    totalWins,
    currentStreak,
    bestStreak,
  };
}
