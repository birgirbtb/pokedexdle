"use client";

/**
 * Client-side game submission utilities
 * Handles saving game progress for both signed-in and unsigned users
 */

import {
  createGuess as serverCreateGuess,
  endGame as serverEndGame,
  getUserGame as serverGetUserGame,
} from "@/lib/actions/guess";
import { getTodaysPokemon } from "@/lib/actions/guess";
import { saveGameRecord, getTodaysGameRecord, getStoredGames } from "@/lib/cookieStats";

/**
 * Submit a guess - handles both signed-in users (database) and unsigned users (localStorage)
 */
export async function submitGuess(
  guessName: string,
  isSignedIn: boolean,
): Promise<void> {
  if (isSignedIn) {
    // Signed-in user: save to database
    await serverCreateGuess(guessName);
  } else {
    // Unsigned user: increment guess count in localStorage
    let record = getTodaysGameRecord();
    if (record) {
      record.guesses += 1;
      saveGameRecord(record);
    }
  }
}

/**
 * End game - handles both signed-in users (database) and unsigned users (localStorage)
 */
export async function submitEndGame(
  won: boolean,
  isSignedIn: boolean,
  pokemonName: string,
): Promise<void> {
  if (isSignedIn) {
    // Signed-in user: save to database
    await serverEndGame(won);
  } else {
    // Unsigned user: update game result in localStorage
    const todayIso = new Date().toISOString().split("T")[0];
    const games = getStoredGames();
    
    // Find today's game and update it
    const existingIndex = games.findIndex(g => g.date === todayIso);
    
    if (existingIndex >= 0) {
      // Update existing record and mark as finished
      games[existingIndex].won = won;
      games[existingIndex].isFinished = true;
      
      // Save the updated games array
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("pokedexdle_unsigned_stats", JSON.stringify(games));
        } catch (error) {
          console.error("Error saving game record to storage:", error);
        }
      }
    }
  }
}

/**
 * Check if today's game is already finished for unsigned user
 */
export function isTodaysGameFinished(isSignedIn: boolean): boolean {
  if (isSignedIn) return false; // Only applies to unsigned users
  
  const record = getTodaysGameRecord();
  return record?.isFinished === true;
}

/**
 * Initialize a game - for unsigned users this creates a skeleton record
 */
export async function initializeGame(
  isSignedIn: boolean,
  pokemonName: string,
): Promise<void> {
  if (!isSignedIn) {
    // Check if today's record exists
    const todayIso = new Date().toISOString().split("T")[0];
    let record = getTodaysGameRecord();
    
    if (!record) {
      // Create new record for today
      saveGameRecord({
        date: todayIso,
        won: false,
        guesses: 0,
        pokemonName,
        isFinished: false,
      });
    }
  }
}
