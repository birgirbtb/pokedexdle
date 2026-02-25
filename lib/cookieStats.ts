/**
 * Cookie/localStorage utilities for storing game stats for unsigned users
 * 
 * Since cookies are better for persistence across browser sessions,
 * we use localStorage which provides a similar API and persists data.
 */

export type GameRecord = {
  date: string; // YYYY-MM-DD
  won: boolean;
  guesses: number; // number of attempts
  pokemonName: string; // the correct answer
  isFinished?: boolean; // whether the game is complete
};

export type UnsignedUserStats = {
  totalGames: number;
  totalWins: number;
  currentStreak: number;
  bestStreak: number;
  games: GameRecord[];
};

// Stats object that mirrors UserStats type from database
export type ClientStats = {
  totalGames: number;
  totalWins: number;
  currentStreak: number;
  bestStreak: number;
};

const STORAGE_KEY = "pokedexdle_unsigned_stats";

/**
 * Get all stored games for unsigned user
 */
export function getStoredGames(): GameRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Save a game record for unsigned user
 */
export function saveGameRecord(record: GameRecord): void {
  if (typeof window === "undefined") return;

  try {
    const games = getStoredGames();
    
    // Check if a game for this date already exists and replace it
    const existingIndex = games.findIndex(g => g.date === record.date);
    if (existingIndex >= 0) {
      games[existingIndex] = record;
    } else {
      games.push(record);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch (error) {
    console.error("Error saving game record to storage:", error);
  }
}

/**
 * Get today's game record if it exists
 */
export function getTodaysGameRecord(): GameRecord | undefined {
  const todayIso = new Date().toISOString().split("T")[0];
  return getStoredGames().find(g => g.date === todayIso);
}

/**
 * Calculate stats from stored games, matching the UserStats format
 */
export function calculateUnsignedStats(): UnsignedUserStats {
  const games = getStoredGames();

  if (games.length === 0) {
    return {
      totalGames: 0,
      totalWins: 0,
      currentStreak: 0,
      bestStreak: 0,
      games: [],
    };
  }

  // Sort games by date
  const sortedGames = [...games].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  let bestStreak = 0;
  let currentStreak = 0;
  let streak = 0;
  let prevDayNumber: number | null = null;

  // Walk through games in ascending order
  sortedGames.forEach((game, index) => {
    const dayNumber = toUtcDayNumber(game.date);
    if (dayNumber === null) return;

    if (game.won) {
      if (prevDayNumber !== null && dayNumber === prevDayNumber + 1) {
        streak += 1;
      } else {
        streak = 1;
      }

      if (streak > bestStreak) {
        bestStreak = streak;
      }
    } else {
      streak = 0;
    }

    prevDayNumber = dayNumber;

    // If this is the final date, compute currentStreak
    if (index === sortedGames.length - 1) {
      currentStreak = game.won ? streak : 0;
    }
  });

  const totalWins = games.filter(g => g.won).length;

  return {
    totalGames: games.length,
    totalWins,
    currentStreak,
    bestStreak,
    games: sortedGames,
  };
}

/**
 * Get just the stats (ClientStats format) without the full games list
 */
export function getUnsignedUserStats(): ClientStats {
  const fullStats = calculateUnsignedStats();
  return {
    totalGames: fullStats.totalGames,
    totalWins: fullStats.totalWins,
    currentStreak: fullStats.currentStreak,
    bestStreak: fullStats.bestStreak,
  };
}

/**
 * Date normalization helper (copied from stats.ts)
 */
function toUtcDayNumber(dateString: string): number | null {
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return null;
  return Date.UTC(year, month - 1, day) / 86400000;
}

/**
 * Clear all stored games (for testing or logout)
 */
export function clearStoredGames(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing stored games:", error);
  }
}
