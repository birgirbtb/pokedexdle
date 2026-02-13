import Link from "next/link";
import GameFrame from "../components/GameFrame";
import { createClient } from "@/lib/supabase/server";

const MAX_ATTEMPTS = 6;

type DailyPokemonRow = {
  id: string;
  available_on: string;
  pokemon_name: string;
};

type GuessRow = {
  attempt_number: number;
  guess_name: string;
};

type GameRow = {
  id: string;
  daily_pokemon_id: string;
  won: boolean | null;
  is_finished: boolean | null;
  guesses: GuessRow[];
};

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

function buildTiles(
  day: DailyPokemonRow,
  game: GameRow | undefined,
): GuessTileStatus[] {
  if (!game) {
    return Array.from({ length: MAX_ATTEMPTS }, () => "empty");
  }

  const guesses = [...game.guesses].sort(
    (a, b) => a.attempt_number - b.attempt_number,
  );
  const pokemonName = day.pokemon_name.toLowerCase();
  const results: GuessTileStatus[] = guesses.map((guess) =>
    guess.guess_name.toLowerCase() === pokemonName ? "correct" : "wrong",
  );

  if (results.length >= MAX_ATTEMPTS) {
    return results.slice(0, MAX_ATTEMPTS);
  }

  return results.concat(
    Array.from({ length: MAX_ATTEMPTS - results.length }, () => "empty"),
  );
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const todayIso = new Date().toISOString().split("T")[0];

  const { data: days, error: daysError } = await supabase
    .from("daily_pokemon")
    .select("id, available_on, pokemon_name")
    .lte("available_on", todayIso)
    .order("available_on", { ascending: false });

  if (daysError) {
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
        <div className="text-[#9aa6c3]">
          Could not load history. Please try again later.
        </div>
      </GameFrame>
    );
  }

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
        <div className="rounded-2xl border border-white/10 bg-black/20 shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-5 text-center text-[#9aa6c3]">
          Log in to view your history.
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

  const dayList = days || [];
  const dayIds = dayList.map((day) => day.id);

  const gamesByDay = new Map<string, GameRow>();
  if (dayIds.length > 0) {
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select(
        "id, daily_pokemon_id, won, is_finished, guesses(attempt_number, guess_name)",
      )
      .eq("user_id", user.id)
      .in("daily_pokemon_id", dayIds);

    if (!gamesError && games) {
      for (const game of games) {
        gamesByDay.set(game.daily_pokemon_id, game);
      }
    }
  }

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

      <div className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-5">
        {dayList.length === 0 ? (
          <div className="text-[#9aa6c3]">No history yet.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {dayList.map((day) => {
              const game = gamesByDay.get(day.id);
              const tiles = buildTiles(day, game);

              return (
                <div key={day.id} className="flex items-center gap-6">
                  <div className="w-36 text-[#9aa6c3]">
                    {formatDate(day.available_on)}
                  </div>

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

        <div className="mt-6 flex flex-wrap gap-6 text-[#9aa6c3]">
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-emerald-500/70 border border-emerald-400/50" />
            <span>Correct</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-red-500/70 border border-red-400/50" />
            <span>Wrong</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-white/5 border border-white/10" />
            <span>Didn{"'"}t play</span>
          </div>
        </div>
      </div>
    </GameFrame>
  );
}
