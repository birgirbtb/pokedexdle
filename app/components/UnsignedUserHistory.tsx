"use client";

import { useEffect, useState } from "react";
import { getStoredGames } from "@/lib/cookieStats";
import type { GameRecord } from "@/lib/cookieStats";

const MAX_ATTEMPTS = 6;

type GuessTileStatus = "correct" | "wrong" | "empty";

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTileClasses(status: GuessTileStatus) {
  if (status === "correct") {
    return "bg-emerald-500/70 border-emerald-400/50";
  }
  if (status === "wrong") {
    return "bg-red-500/70 border-red-400/50";
  }
  return "bg-white/5 border-white/10";
}

function buildTiles(record: GameRecord): GuessTileStatus[] {
  const tiles: GuessTileStatus[] = Array(record.guesses)
    .fill(null)
    .map(() => (record.won ? "correct" : "wrong"));

  // Pad with empty tiles
  return tiles.concat(
    Array.from({ length: MAX_ATTEMPTS - tiles.length }, () => "empty"),
  );
}

export function UnsignedUserHistory() {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const stored = getStoredGames();
    // Sort by date descending (newest first)
    const sorted = [...stored].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    setGames(sorted);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="text-[#9aa6c3]">Loading...</div>;
  }

  return (
    <>
      <div className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-5">
        {/* Empty history state */}
        {games.length === 0 ? (
          <div className="text-[#9aa6c3]">No history yet.</div>
        ) : (
          // Rows container
          <div className="flex flex-col gap-4">
            {/* Render one row per day */}
            {games.map((game) => {
              const tiles = buildTiles(game);

              return (
                <div key={game.date} className="flex items-center gap-6">
                  {/* Left: Day label */}
                  <div className="w-36 text-[#9aa6c3]">
                    {formatDate(game.date)}
                  </div>

                  {/* Right: Attempt tiles */}
                  <div className="flex flex-wrap gap-2">
                    {tiles.map((status, index) => (
                      <div
                        key={`${game.date}-${index}`}
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
    </>
  );
}
