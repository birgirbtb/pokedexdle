import { createClient } from "@/lib/supabase/server";

export async function getTodaysPokemon() {
  const supabase = await createClient();

  const { data: pokemonData } = await supabase
    .from("daily_pokemon")
    .select("*")
    .eq("available_on", new Date().toISOString().split("T")[0])
    .single();

  return pokemonData;
}

export async function getUserGame() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const pokemon = await getTodaysPokemon();
    if (!pokemon) {
      throw new Error("No pokemon data available");
    }

    const { data: game } = await supabase
      .from("games")
      .select("*")
      .eq("user_id", user.id)
      .eq("daily_pokemon_id", pokemon.id)
      .single();

    return game;
  }

  return null;
}

export async function createGame() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const pokemon = await getTodaysPokemon();
    if (!pokemon) {
      throw new Error("No pokemon data available");
    }

    await supabase.from("games").insert({
      user_id: user.id,
      daily_pokemon_id: pokemon.id,
    });
  }
}

export async function submitGuess(guessName: string, dailyPokemonId: string) {
  const supabase = await createClient();

  const { data: answer } = await supabase
    .from("daily_pokemon")
    .select("pokemon_name")
    .eq("id", dailyPokemonId)
    .single();

  const isCorrect =
    guessName.toLowerCase() === answer?.pokemon_name.toLowerCase();

  return { isCorrect, name: guessName };
}
