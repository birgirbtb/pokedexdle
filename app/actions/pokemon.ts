"use server";

export interface Pokemon {
  name: string;
  url: string;
}

export async function searchPokemon(query: string): Promise<Pokemon[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const response = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=1000",
    );
    const data = await response.json();

    const filtered = data.results.filter((pokemon: any) =>
      pokemon.name.includes(query.toLowerCase()),
    );

    return filtered.slice(0, 3).map((pokemon: any) => ({
      name: pokemon.name,
      url: pokemon.url,
    }));
  } catch (error) {
    console.error("Error fetching Pokemon:", error);
    return [];
  }
}
