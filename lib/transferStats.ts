import { transferLocalStatsToUser, LocalGameRecord } from "@/lib/actions/stats";
import { getStoredGames, clearStoredGames } from "@/lib/cookieStats";

/**
 * Transfers local stats to the signed-in user's account and clears local stats.
 * Call this after signup/login.
 */
export async function transferStatsOnSignup(): Promise<{ inserted: number }> {
  console.log('[transferStats] Starting transfer process');
  
  // Get local stats
  const localGames: LocalGameRecord[] = getStoredGames();
  console.log('[transferStats] Retrieved', localGames?.length || 0, 'local games');
  
  if (!localGames || localGames.length === 0) {
    console.log('[transferStats] No local games to transfer');
    return { inserted: 0 };
  }

  console.log('[transferStats] Calling server action transferLocalStatsToUser...');
  // Send to server
  const result = await transferLocalStatsToUser(localGames);
  console.log('[transferStats] Server action returned:', result);

  // Clear local stats after transfer
  console.log('[transferStats] Clearing local storage...');
  clearStoredGames();
  console.log('[transferStats] Local storage cleared');

  return result;
}
