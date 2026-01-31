"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogOut() {
  const supabase = createClient();
  const { refresh } = useRouter();

  const logOut = async () => {
    await supabase.auth.signOut();
    refresh();
  };

  return (
    <button
      className="bg-linear-to-b cursor-pointer from-[#c52222] to-[#a31616] border border-white/18 text-[#e8eefc] py-2.5 px-3.5 rounded-xl font-bold select-none active:translate-y-px"
      onClick={logOut}
    >
      Log Out
    </button>
  );
}
