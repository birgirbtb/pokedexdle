// -----------------------------------------------------------------------------
// Hints.tsx
// -----------------------------------------------------------------------------
// This component renders the hint "chips" that gradually reveal information
// about the correct Pokémon as the player uses attempts.
//
// Inputs:
// - pokemon: the correct Pokémon object (or null if not loaded yet)
// - generation: the Pokémon generation string (e.g. "generation-iii")
// - revealedHints: how many hint tiers should be revealed (typically attemptsUsed)
//
// Output:
// - A row (wrapping) of rounded hint pills/chips.
// -----------------------------------------------------------------------------

import type { Pokemon } from "pokedex-promise-v2"; // Pokémon type from pokedex-promise-v2

// Props passed in by GameClient (or wherever you use this component)
type Props = {
  pokemon: Pokemon | null; // Correct Pokémon data (null while loading)
  generation: string | null; // Generation string (null while loading)
  revealedHints: number; // Number of hint tiers to reveal (0..N)
};

// Utility: Capitalizes the first character in a string (e.g. "fire" -> "Fire")
function capitalize(value: string): string {
  // Guard: if the string is empty/undefined, just return it
  if (!value) return value;

  // Uppercase the first character and append the remainder
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Utility: Convert Roman numerals to an integer (e.g. "III" -> 3)
//
// Used here because PokeAPI generations often come as:
// "generation-i", "generation-ii", "generation-iii", etc.
function romanToInt(roman: string): number {
  // Mapping of Roman numeral symbols to integer values
  const romanMap: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  // Accumulator for final value
  let total = 0;

  // Loop through each character in the Roman numeral string
  for (let i = 0; i < roman.length; i++) {
    // Current symbol value (e.g. "I" -> 1)
    const current = romanMap[roman[i]];

    // Next symbol value (or 0 if we're at the end)
    const next = romanMap[roman[i + 1]] || 0;

    // If a smaller value appears before a bigger value, subtract it (e.g. IV = 4)
    if (current < next) {
      total -= current;
    } else {
      // Otherwise add it normally
      total += current;
    }
  }

  // Final converted integer value
  return total;
}

// Utility: Convert "generation-iii" to 3, etc.
//
// Returns:
// - number if conversion works
// - null if generation is missing or not in the expected format
function generationToNumber(generation: string | null): number | null {
  // If generation wasn't provided, we can't convert it
  if (!generation) return null;

  // Match the suffix after "generation-" (e.g. "iii" from "generation-iii")
  const match = generation.match(/generation-(.+)/);

  // If the format doesn't match, stop here
  if (!match) return null;

  // Roman numeral portion (uppercase for consistent lookup)
  const roman = match[1].toUpperCase();

  // Convert roman numerals to a number
  return romanToInt(roman);
}

// Main component
export default function Hints({ pokemon, generation, revealedHints }: Props) {
  // The list of hint strings we will render as chips
  const hints: string[] = [];

  // Pokémon can have 1 or 2 types; default to empty array if pokemon is null
  const types = pokemon?.types ?? [];

  /* ------------------------------------------------------------------------ */
  /*                              Hint Tier Logic                              */
  /* ------------------------------------------------------------------------ */
  // The hint tiers are revealed based on revealedHints:
  // 1 -> Type
  // 2 -> Secondary type (or None)
  // 3 -> Evolution stage
  // 4 -> Generation number

  // Tier 1: First wrong guess → reveal primary type
  if (revealedHints >= 1 && types[0]) {
    // Example output: "Type: Fire"
    hints.push(`Type: ${capitalize(types[0].type.name)}`);
  } else {
    // Hidden state
    hints.push("Type: ???");
  }

  // Tier 2: Second wrong guess → reveal secondary type OR "None"
  if (revealedHints >= 2) {
    // Example output: "Secondary Type: Flying" OR "Secondary Type: None"
    hints.push(
      `Secondary Type: ${types[1] ? capitalize(types[1].type.name) : "None"}`,
    );
  } else {
    // Hidden state
    hints.push("Secondary Type: ???");
  }

  // Tier 3: Third wrong guess → reveal evolution stage
  if (revealedHints >= 3) {
    // NOTE: evolutionStage is a custom field you attach on the server
    // If it doesn't exist, show "?"
    hints.push(`Evolution Stage: ${pokemon?.evolutionStage ?? "?"}`);
  } else {
    // Hidden state
    hints.push("Evolution Stage: ???");
  }

  // Tier 4: Fourth wrong guess → reveal generation number
  if (revealedHints >= 4 && generation) {
    // Convert "generation-iii" -> 3
    const genNumber = generationToNumber(generation);

    // Example output: "Generation: 3"
    hints.push(`Generation: ${genNumber}`);
  } else {
    // Hidden state
    hints.push("Generation: ???");
  }

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                   */
  /* ------------------------------------------------------------------------ */
  return (
    // Chip container:
    // - flex-wrap allows chips to wrap on small screens
    // - justify-center keeps them centered
    // - gap controls spacing between chips
    <div className="flex flex-wrap justify-center gap-2.5 mt-2">
      {hints.map((hint, i) => (
        // Each chip:
        // - rounded-full for pill shape
        // - consistent padding for good tap targets on mobile
        // - subtle background/border styling
        <div
          key={i}
          className="rounded-full py-2.5 px-3.5 bg-black/22 border border-white/12 text-white hover:bg-black/30"
        >
          {/* The actual hint text */}
          {hint}
        </div>
      ))}
    </div>
  );
}
