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

// Type helper to extract the actual species data from the API response, which can be either an array or a single object
type PokemonSpeciesResponse = Awaited<
  ReturnType<typeof P.getPokemonSpeciesByName>
>;

/* -------------------------------------------------------------------------- */
/*                                isSpeciesArray                              */
/* -------------------------------------------------------------------------- */
/*
  The PokéAPI can return either a single species object or an array of species objects when fetching Pokémon species data.
  This helper function checks the structure of the response to determine if it's an array or a single object.

  Input:
  - species: the raw response from P.getPokemonSpeciesByName

  Output:
  - boolean: true if the response is an array of species, false if it's a single species object
*/
function isSpeciesArray(
  species: PokemonSpeciesResponse,
): species is Pokedex.PokemonSpecies[] {
  return Array.isArray(species);
}

/* -------------------------------------------------------------------------- */
/*                               getSingleSpecies                             */
/* -------------------------------------------------------------------------- */
/*
  Extracts a single species object from either an array of species or a single species object.

  Input:
  - species: the raw response from P.getPokemonSpeciesByName (can be array or single object)

  Output:
  - a single Pokedex.PokemonSpecies object
*/
function getSingleSpecies(
  species: PokemonSpeciesResponse,
): Pokedex.PokemonSpecies {
  if (isSpeciesArray(species)) {
    const firstSpecies = species[0];

    if (!firstSpecies) {
      throw new Error("No species data returned from PokéAPI");
    }

    return firstSpecies;
  }

  return species;
}

/* -------------------------------------------------------------------------- */
/*                              getEvolutionStage                             */
/* -------------------------------------------------------------------------- */
/*
  Determines the evolution stage of a Pokémon by traversing its evolution chain.

  Input:
  - pokemonName: the name of the Pokémon to check
  - speciesData (optional): pre-fetched species data to avoid redundant API calls

  Output:
  - number: the evolution stage (1 for base form, 2 for first evolution, etc.)
*/
async function getEvolutionStage(
  pokemonName: string,
  speciesData?: Pokedex.PokemonSpecies,
) {
  // Get species data if not provided
  const species =
    speciesData ??
    getSingleSpecies(await P.getPokemonSpeciesByName(pokemonName));

  // Extract evolution chain ID from the species data URL
  // .filter is used to remove empty strings from splitting the URL, .pop() gets the last segment which is the ID
  const evolutionChainId = species.evolution_chain.url
    .split("/")
    .filter(Boolean)
    .pop();

  // If for some reason the evolution chain ID cannot be extracted, default to stage 1
  if (!evolutionChainId) {
    return 1;
  }

  // Fetch the full evolution chain data using the extracted ID
  const evoChain = await P.getEvolutionChainById(Number(evolutionChainId));
  // Create a queue for traversal of the evolution chain
  const queue = [{ node: evoChain.chain, stage: 1 }];

  // Traverse the evolution chain
  while (queue.length > 0) {
    // Get the current node and its evolution stage
    // .shift() removes the first element from the queue
    const current = queue.shift();

    // If the current node is undefined, skip to the next iteration
    if (!current) {
      continue;
    }

    // Check if the current node's species name matches the Pokémon we're looking for
    if (current.node.species.name === pokemonName) {
      // If it matches, return the current evolution stage
      return current.stage;
    }

    // If it doesn't match, add all of its evolutions to the queue with an incremented stage
    for (const nextEvolution of current.node.evolves_to ?? []) {
      queue.push({ node: nextEvolution, stage: current.stage + 1 });
    }
  }

  // If we finish the queue without finding the Pokémon, default to stage 1
  return 1;
}

/* -------------------------------------------------------------------------- */
/*                           getPokemonWithMetadata                           */
/* -------------------------------------------------------------------------- */
/*
  Fetches Pokémon details along with its generation and evolution stage.

  Input:
  - pokemonNameOrId: the name or ID of the Pokémon to fetch

  Output:
  - An object containing:
    - pokemon: the full Pokémon data from PokeAPI, augmented with an evolutionStage property
    - generation: the generation string (e.g., "generation-i")
*/
export async function getPokemonWithMetadata(pokemonNameOrId: string | number) {
  const pokemon = await P.getPokemonByName(pokemonNameOrId);
  const speciesData = getSingleSpecies(
    await P.getPokemonSpeciesByName(pokemon.name),
  );
  const generation = speciesData.generation.name;
  const evolutionStage = await getEvolutionStage(pokemon.name, speciesData);

  return {
    pokemon: {
      ...pokemon,
      evolutionStage,
    },
    generation,
  };
}

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
