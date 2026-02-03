import { createClient } from "@/lib/supabase/server";

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
