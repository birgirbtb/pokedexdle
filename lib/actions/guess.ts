"use server";

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
      .select("*, guesses(*)")
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

    try {
      const { data } = await supabase
        .from("games")
        .insert({
          user_id: user.id,
          daily_pokemon_id: pokemon.id,
        })
        .select("*, guesses(*)")
        .single();

      return data;
    } catch (error) {
      console.error("Error creating game:", error);
      return null;
    }
  }
}

export async function createGuess(guessName: string) {
  const supabase = await createClient();

  const game = await getOrCreateGame();
  if (!game) return;

  try {
    await supabase.from("guesses").insert({
      game_id: game.id,
      user_id: game.user_id,
      guess_name: guessName,
      attempt_number: game.guesses.length + 1,
    });

    // TODO: check if the guess is correct and update the game status if it is
  } catch (error) {
    console.error("Error submitting guess:", error);
  }
}

export async function endGame(won: boolean) {
  const supabase = await createClient();

  const game = await getOrCreateGame();
  if (!game) return;

  try {
    await supabase
      .from("games")
      .update({
        won,
        is_finished: true,
      })
      .eq("id", game.id);
  } catch (error) {
    console.error("Error ending game:", error);
  }
}

async function getOrCreateGame() {
  let game: Awaited<ReturnType<typeof getUserGame>> | undefined =
    await getUserGame();
  if (!game) {
    game = await createGame();
  }

  if (!game) {
    console.error("Game not found after creation");
    // Hérna getum við gert ráð fyrir því að notandinn sé ekki skráður inn og sleppum alveg að vista guesses í gagnagrunn
    return null;
  }

  return game;
}
