import type { ReactNode } from "react";
import Link from "next/link";
import LogOut from "../(auth)/components/LogOut";
import { createClient } from "@/lib/supabase/server";

type AppFrameProps = {
  children: ReactNode;
  headerCenter?: ReactNode;
};

export default async function GameFrame({
  children,
  headerCenter,
}: AppFrameProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex justify-center items-center p-4.5">
      <div className="relative w-full max-w-275 rounded-[18px] overflow-hidden bg-linear-to-b from-white/6 to-white/3 border border-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.45)] backdrop-blur-[10px]">
        <header className="relative bg-[linear-gradient(90deg,rgba(229,72,77,0.18),rgba(59,130,246,0.14)),rgba(15,23,42,0.55)] border-b border-white/10">
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="text-white inline-block py-1.5 px-3 rounded-full bg-black/25 border border-white/12">
                Pokédexdle
              </div>
              <div className="text-[#9aa6c3] text-[13px]">
                Guess the Pokémon
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {user && (
                <p className="text-white text-sm font-semibold">{user.email}</p>
              )}
              {user ? (
                <LogOut />
              ) : (
                <Link href="/login">
                  <button className="border border-white/[0.14] bg-black/10 text-[#e8eefc] py-2.5 px-3.5 rounded-xl font-bold cursor-pointer">
                    Login
                  </button>
                </Link>
              )}
            </div>
          </div>

          {headerCenter && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {headerCenter}
            </div>
          )}
        </header>

        <section className="p-4.5 flex flex-col items-center gap-3.5">
          {children}
        </section>
      </div>
    </main>
  );
}
