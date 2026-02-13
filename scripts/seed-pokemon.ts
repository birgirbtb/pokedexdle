import type { Database } from "@/lib/supabase/database";
import { createClient } from "@supabase/supabase-js";
import Pokedex from "pokedex-promise-v2";

const P = new Pokedex();
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function seedYearOfPokemon() {
  console.log("Fetching Pokemon data...");

  const allPokemon = await P.getPokemonsList({ limit: 1025 });
  const shuffled = allPokemon.results.sort(() => 0.5 - Math.random());

  const entries = [];
  const startDate = new Date();

  console.log("Preparing 365 days of data...");

  for (let i = 0; i < 365; i++) {
    const gameDate = new Date(startDate);
    gameDate.setDate(startDate.getDate() + i);
    const dateString = gameDate.toISOString().split("T")[0];

    entries.push({
      available_on: dateString,
      pokemon_name: shuffled[i % shuffled.length].name,
    });
  }

  const { error } = await supabase
    .from("daily_pokemon")
    .upsert(entries, { onConflict: "available_on" });

  if (error) {
    console.error("Error seeding data:", error.message);
  } else {
    console.log("1 year of Pokédle is ready.");
  }
}

seedYearOfPokemon();
