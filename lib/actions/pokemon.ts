/* -------------------------------------------------------------------------- */
/*                                pokemon.ts                                  */
/* -------------------------------------------------------------------------- */
/*
  This file provides Pokémon-related utility logic.

  Current responsibility:
  - searchPokemon(query): returns a filtered list of Pokémon names
    based on a text query.

  Uses:
  - pokedex-promise-v2 library to fetch the full Pokémon list
  - In-memory caching to avoid repeated API calls
*/

import Pokedex from "pokedex-promise-v2"; // Wrapper around PokeAPI

// Create a single Pokedex instance for API calls
const P = new Pokedex();

/* -------------------------------------------------------------------------- */
/*                           In-Memory Pokémon Cache                          */
/* -------------------------------------------------------------------------- */
/*
  cachedPokemonList stores the full Pokémon list after the first fetch.

  Structure:
  [
    { name: string; url: string },
    ...
  ]

  Purpose:
  - Avoids calling PokeAPI on every search
  - Improves performance significantly
*/
let cachedPokemonList: { name: string; url: string }[] | null = null;

/* -------------------------------------------------------------------------- */
/*                               searchPokemon                                */
/* -------------------------------------------------------------------------- */
/*
  Searches Pokémon by name using a simple "includes" match.

  Input:
  - query: string typed by the user

  Returns:
  - Array of up to 10 Pokémon objects:
      { name: string; url: string }

  Behavior:
  - If query is empty → returns []
  - If cache is empty → fetches full list from API
  - Filters locally in memory
*/
export async function searchPokemon(query: string) {
  /* ------------------------- Guard: Empty Query --------------------------- */
  // If user input is empty or whitespace, return empty results
  if (!query.trim()) return [];

  /* ---------------------- Load Pokémon List (Cached) ---------------------- */
  // Only fetch full list from API if not already cached
  if (!cachedPokemonList) {
    const res = await P.getPokemonsList({
      limit: 100000, // Large limit to future-proof if more Pokémon are added
      offset: 0, // Start from first Pokémon
    });

    // Store results in memory for future searches
    cachedPokemonList = res.results;
  }

  /* -------------------------- Filtering Logic ---------------------------- */
  // Normalize query to lowercase for case-insensitive matching
  const lower = query.toLowerCase();

  // Filter cached list:
  // - Check if Pokémon name includes query string
  // - Limit results to first 10 matches
  return cachedPokemonList
    .filter((pokemon) => pokemon.name.includes(lower))
    .slice(0, 10);
}
