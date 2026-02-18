import Link from "next/link";
import GameFrame from "../components/GameFrame";

export default function HelpPage() {
  return (
    <GameFrame>
      <div className="w-full max-w-3xl flex flex-col gap-8 text-[#e8eefc]">
        <div className="pt-4 text-center">
          <Link href="/">
            <button className="px-6 py-2 rounded-xl bg-linear-to-r from-blue-500 to-rose-500 text-white font-bold shadow hover:scale-105 transition-transform">
              Back to Game
            </button>
          </Link>
        </div>
        <h1 className="text-4xl font-extrabold text-white text-center">
          How to Play
        </h1>

        {/* Objective */}
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-yellow-300">🎯 Objective</h2>
          <p className="text-[#9aa6c3]">
            Guess today's Pokémon in as few attempts as possible.
          </p>
        </section>

        {/* Guessing */}
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-yellow-300">
            🔍 Making a Guess
          </h2>
          <ul className="list-disc list-inside text-[#9aa6c3] space-y-2">
            <li>Start typing in the search bar.</li>
            <li>Select a Pokémon from the dropdown.</li>
            <li>Click “Guess”.</li>
            <li>You have 6 attempts per day.</li>
          </ul>
        </section>

        {/* Hints */}
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-yellow-300">💡 Hints</h2>
          <p className="text-[#9aa6c3]">
            Each incorrect guess reveals more hints about the Pokémon:
          </p>
          <ul className="list-disc list-inside text-[#9aa6c3] space-y-2">
            <li>Type</li>
            <li>Secondary Type</li>
            <li>Evolution stage</li>
            <li>Generation</li>
            <li>Image of the Pokémon, which is revealed after 5 incorrect guesses</li>
          </ul>
        </section>

        {/* Attempts */}
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-yellow-300">
            ⏳ Attempts & Cooldown
          </h2>
          <ul className="list-disc list-inside text-[#9aa6c3] space-y-2">
            <li>You get 6 attempts per day. If you use all attempts or win, you will see a pop up for either winning or losing.</li>
            <li>After closing the pop up (Either by clicking the X or clicking anywhere outside the pop up)</li> 
            <li>you must wait until midnight for the next Pokémon to become available.</li>
          </ul>
        </section>

        {/* Stats */}
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-yellow-300">📊 Stats</h2>
          <ul className="list-disc list-inside text-[#9aa6c3] space-y-2">
            <li>On the right hand side of the image, you will see the stats (Stats only appear if user is logged in)</li>
            <li>In the Stats window you will see the following:</li>
            <li>Total Wins</li>
            <li>Total Games Played</li>
            <li>Current Win Streak</li>
            <li>Best Streak</li>
          </ul>
          <p className="text-[#9aa6c3]">
            Login to track your progress and compete with yourself or others!
          </p>
        </section>

        <div className="pt-4 text-center">
          <Link href="/">
            <button className="px-6 py-2 rounded-xl bg-linear-to-r from-blue-500 to-rose-500 text-white font-bold shadow hover:scale-105 transition-transform">
              Back to Game
            </button>
          </Link>
        </div>
      </div>
    </GameFrame>
  );
}