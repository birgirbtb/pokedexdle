import Link from "next/link";
import GameFrame from "../components/GameFrame";
import { createClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <GameFrame
      headerCenter={
        <Link href="/">
          <button className="border border-white/[0.14] bg-black/10 text-[#e8eefc] py-2.5 px-3.5 rounded-xl font-bold cursor-pointer">
            Back to Game
          </button>
        </Link>
      }
    >
      <h1 className="text-white text-2xl font-bold">Guess History</h1>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-6">
            <div className="w-28 text-[#9aa6c3]">Day 12</div>

            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
              <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
              <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
              <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
              <div className="w-7 h-7 rounded-md bg-emerald-500/70 border border-emerald-400/50" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-28 text-[#9aa6c3]">Day 11</div>
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
              <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
              <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
              <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
              <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
              <div className="w-7 h-7 rounded-md bg-red-500/70 border border-red-400/50" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-28 text-[#9aa6c3]">Day 10</div>
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-500/70 border border-emerald-400/50" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-28 text-[#9aa6c3]">Day 9</div>

            <div className="relative flex items-center gap-3">
              <button
                type="button"
                aria-label="Play Day 9"
                className="group w-7 h-7 rounded-md flex items-center justify-center bg-white/10 border border-white/18 shadow-[0_4px_12px_rgba(0,0,0,0.25)] transition-all hover:border-yellow-400 hover:ring-2 hover:ring-yellow-400/40 hover:bg-white/14 focus:outline-none"
              >
                <span className="block w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[9px] border-l-white/90 translate-x-[1px] group-hover:border-l-yellow-400 transition-colors" />
              </button>

              <div className="flex items-center gap-2 text-yellow-400 text-sm pointer-events-none">
                <span className="text-lg">←</span>
                <span>Press to play</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-6 text-[#9aa6c3]">
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-emerald-500/70 border border-emerald-400/50" />
            <span>Correct</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-red-500/70 border border-red-400/50" />
            <span>Wrong</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-md bg-white/5 border border-white/10" />
            <span>Didn{"'"}t play</span>
          </div>
        </div>
      </div>
    </GameFrame>
  );
}
