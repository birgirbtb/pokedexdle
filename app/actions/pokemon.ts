'use server';

export async function searchPokemon(query: string) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
  const data = await res.json();

  return data.results.filter((p: any) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );
}

export async function getPokemonDetails(name: string) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getPokemonEvolutionStage(name: string) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name.toLowerCase()}`);
  if (!res.ok) return null;
  const species = await res.json();

  const evoRes = await fetch(species.evolution_chain.url);
  const evoChain = await evoRes.json();

  let stage = 1;
  let current = evoChain.chain;

  while (current) {
    if (current.species.name === name.toLowerCase()) return stage;
    current = current.evolves_to?.[0];
    stage++;
  }

  return null;
}
