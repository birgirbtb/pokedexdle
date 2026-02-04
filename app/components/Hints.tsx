import type { Pokemon } from "pokedex-promise-v2";

type Props = {
  pokemon: Pokemon | null;
  generation: string | null;
  revealedHints: number;
};

export default function Hints({ pokemon, generation, revealedHints }: Props) {
  const hints: string[] = [];

  const types = pokemon?.types ?? [];

  // 1️⃣ First wrong guess → primary type
  if (revealedHints >= 1 && types[0]) {
    hints.push(`Type: ${types[0].type.name}`);
  }

  // 2️⃣ Second wrong guess → secondary type OR None
  if (revealedHints >= 2) {
    hints.push(`Secondary Type: ${types[1] ? types[1].type.name : "None"}`);
  }

  // 3️⃣ Third wrong guess → evolution stage
  if (revealedHints >= 3) {
    hints.push(`Evolution Stage: ${pokemon?.evolutionStage}`);
  }

  // 4️⃣ Fourth wrong guess → generation
  if (revealedHints >= 4 && generation) {
    hints.push(`Generation: ${generation}`);
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