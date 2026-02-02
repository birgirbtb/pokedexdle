'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import Pokedex from 'pokedex-promise-v2';
const P = new Pokedex();

export default function Home() {
  const [pokemon, setPokemon] = useState<any>(null);
  const [generation, setGenoration] = useState<any>(null)

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const allPokemon = await P.getPokemonsList({ limit: 1025 });
        const randomIndex = Math.floor(Math.random() * allPokemon.results.length);
        const randomPokemonName = allPokemon.results[randomIndex].name;
        const speciesData = await P.getPokemonSpeciesByName(randomPokemonName);

        // The generation is now available in speciesData.generation.name
        console.log('Generation:', speciesData.generation.name); // e.g., "generation-i", "generation-vii"
        setGenoration(speciesData.generation.name)
        
        const pokemonData = await P.getPokemonByName(randomPokemonName);
        setPokemon(pokemonData);
      } catch (error) {
        console.error('Error fetching pokemon:', error);
      }
    };

    fetchPokemon();
  }, []);

  const playAudio = () => {
    if (pokemon?.cries?.latest) {
      const audio = new Audio(pokemon.cries.latest);
      audio.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  if (!pokemon) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{pokemon.name}</h1>
      <h1>{pokemon.types[0].type.name}</h1>
      <h1>{pokemon.types[1]?.type.name ?? "doesn't have one"}</h1>
      <h1>{generation}</h1>
      <button onClick={playAudio}>Play Cry</button>
      {pokemon.sprites?.front_default && (
        <Image 
          src={pokemon.sprites.other["official-artwork"].front_default} 
          alt={pokemon.name}
          width={400}
          height={400}
        />
      )}
    </div>
  );
}
