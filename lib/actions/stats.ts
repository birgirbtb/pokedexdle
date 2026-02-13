"use server";

import { createClient } from "@/lib/supabase/server";

export type UserStats = {
  totalGames: number;
  totalWins: number;
  currentStreak: number;
  bestStreak: number;
};

function toUtcDayNumber(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return null;
  return Date.UTC(year, month - 1, day) / 86400000;
}

export async function getUserStats(): Promise<UserStats | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("games")
    .select("won, daily_pokemon:daily_pokemon_id(available_on)")
    .eq("user_id", user.id);

  if (!data) return null;

  const byDate = new Map<string, boolean>();
  data.forEach((row) => {
    const availableOn = row.daily_pokemon?.available_on;
    if (!availableOn) return;

    const didWin = row.won === true;
    if (!byDate.has(availableOn)) {
      byDate.set(availableOn, didWin);
      return;
    }

    if (didWin) {
      byDate.set(availableOn, true);
    }
  });

  const dates = Array.from(byDate.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  let bestStreak = 0;
  let currentStreak = 0;
  let streak = 0;
  let prevDayNumber: number | null = null;

  dates.forEach(([date, didWin], index) => {
    const dayNumber = toUtcDayNumber(date);
    if (dayNumber === null) return;

    if (didWin) {
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

    if (index === dates.length - 1) {
      currentStreak = didWin ? streak : 0;
    }
  });

  const totalGames = data.length;
  const totalWins = data.filter((row) => row.won === true).length;

  return {
    totalGames,
    totalWins,
    currentStreak,
    bestStreak,
  };
}
