import type { Pokemon } from "pokedex-promise-v2";

type Props = {
  pokemon: Pokemon | null;
  generation: string | null;
  revealedHints: number;
};

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function romanToInt(roman: string): number {
  const romanMap: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const current = romanMap[roman[i]];
    const next = romanMap[roman[i + 1]] || 0;
    if (current < next) {
      total -= current;
    } else {
      total += current;
    }
  }
  return total;
}

function generationToNumber(generation: string | null): number | null {
  if (!generation) return null;
  const match = generation.match(/generation-(.+)/);
  if (!match) return null;
  const roman = match[1].toUpperCase();
  return romanToInt(roman);
}

export default function Hints({ pokemon, generation, revealedHints }: Props) {
  const hints: string[] = [];

  const types = pokemon?.types ?? [];

  // First wrong guess → primary type
  if (revealedHints >= 1 && types[0]) {
    hints.push(`Type: ${capitalize(types[0].type.name)}`);
  } else {
    hints.push("Type: ???");
  }

  // Second wrong guess → secondary type OR None
  if (revealedHints >= 2) {
    hints.push(
      `Secondary Type: ${types[1] ? capitalize(types[1].type.name) : "None"}`,
    );
  } else {
    hints.push("Secondary Type: ???");
  }

  // Third wrong guess → evolution stage
  if (revealedHints >= 3) {
    hints.push(`Evolution Stage: ${pokemon?.evolutionStage ?? "?"}`);
  } else {
    hints.push("Evolution Stage: ???");
  }

  // Fourth wrong guess → generation
  if (revealedHints >= 4 && generation) {
    const genNumber = generationToNumber(generation);
    hints.push(`Generation: ${genNumber}`);
  } else {
    hints.push("Generation: ???");
  }

  return (
    <div className="flex flex-wrap justify-center gap-2.5 mt-2">
      {hints.map((hint, i) => (
        <div
          key={i}
          className="rounded-full py-2.5 px-3.5 bg-black/22 border border-white/12 text-white hover:bg-black/30"
        >
          {hint}
        </div>
      ))}
    </div>
  );
}
