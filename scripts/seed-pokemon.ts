/* -------------------------------------------------------------------------- */
/*                               seed-pokemon.ts                              */
/* -------------------------------------------------------------------------- */
/*
  Script to seed 1 year (365 days) of daily Pokémon into the database.

  What this file does:
  - Fetches the full Pokémon list from PokéAPI
  - Shuffles the list
  - Generates 365 future dates starting from today
  - Assigns one Pokémon per day
  - Upserts them into the "daily_pokemon" table

  This should be run manually (e.g. with ts-node or as a Node script).
*/

/* ---------------------------------- Types --------------------------------- */
/*
  Database type generated from Supabase.
  Ensures type-safe usage of the Supabase client.
*/
import type { Database } from "@/lib/supabase/database";

/* ----------------------------- Supabase Client ----------------------------- */
/*
  Using the service role key:
  - Bypasses RLS
  - Should NEVER be exposed to the client
  - Safe only in server-side / script environments
*/
import { createClient } from "@supabase/supabase-js";

/* ----------------------------- PokéAPI Wrapper ----------------------------- */
/*
  pokedex-promise-v2 is used to fetch Pokémon list.
*/
import Pokedex from "pokedex-promise-v2";

/* -------------------------- Initialize API Clients ------------------------- */

// Create Pokedex API instance
const P = new Pokedex();

// Create Supabase client with service role
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // Supabase project URL
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key (server only)
);

/* -------------------------------------------------------------------------- */
/*                         Main Seeding Function                              */
/* -------------------------------------------------------------------------- */
async function seedYearOfPokemon() {
  console.log("Fetching Pokemon data...");

  /*
    Fetch all available Pokémon (currently 1025).
    limit: 1025 ensures we get all known Pokémon.
  */
  const allPokemon = await P.getPokemonsList({ limit: 1025 });

  /*
    Shuffle the Pokémon list randomly.
    Simple random sort for distribution across the year.
  */
  const shuffled = allPokemon.results.sort(() => 0.5 - Math.random());

  /*
    entries will store all 365 rows that will be inserted.
  */
  const entries: {
    available_on: string;
    pokemon_name: string;
  }[] = [];

  /*
    Start date = today.
    Each next day increments from this date.
  */
  const startDate = new Date();

  console.log("Preparing 365 days of data...");

  /*
    Loop 365 times to create 1 year of daily Pokémon.
  */
  for (let i = 0; i < 365; i++) {
    /*
      Create a new date instance based on today.
    */
    const gameDate = new Date(startDate);

    /*
      Move forward by i days.
    */
    gameDate.setDate(startDate.getDate() + i);

    /*
      Convert date to ISO format and extract YYYY-MM-DD.
      Example: "2026-02-17"
    */
    const dateString = gameDate.toISOString().split("T")[0];

    /*
      Add entry for this date.
      If we somehow exceed Pokémon count, it loops using modulo.
    */
    entries.push({
      available_on: dateString,
      pokemon_name: shuffled[i % shuffled.length].name,
    });
  }

  /*
    Upsert into daily_pokemon table.

    onConflict: "available_on"
    - If a row with same date exists, it will update it instead of failing.
  */
  const { error } = await supabase
    .from("daily_pokemon")
    .upsert(entries, { onConflict: "available_on" });

  /*
    Error handling and logging.
  */
  if (error) {
    console.error("Error seeding data:", error.message);
  } else {
    console.log("1 year of Pokédle is ready.");
  }
}

/* -------------------------------------------------------------------------- */
/*                               Execute Script                               */
/* -------------------------------------------------------------------------- */
/*
  Immediately run the seeding function.
*/
seedYearOfPokemon();
