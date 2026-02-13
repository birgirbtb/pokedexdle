import Pokedex from "pokedex-promise-v2";

const P = new Pokedex();


let cachedPokemonList: { name: string; url: string }[] | null = null;

export async function searchPokemon(query: string) {
  if (!query.trim()) return [];

  if (!cachedPokemonList) {
    const res = await P.getPokemonsList({
      limit: 100000, // future proofing
      offset: 0,
    });

    cachedPokemonList = res.results;
  }

  const lower = query.toLowerCase();

  return cachedPokemonList
    .filter((pokemon) => pokemon.name.includes(lower))
    .slice(0, 10);
}
