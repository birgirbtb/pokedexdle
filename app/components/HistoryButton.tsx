// -----------------------------------------------------------------------------
// HistoryButton.tsx
// -----------------------------------------------------------------------------
// A simple button component that links to the game history page.
//
// Output:
// - A styled button that says "History"
// - On click, navigates user to "/history" page
// -----------------------------------------------------------------------------

import Link from "next/link";

export default function HistoryButton() {
  return (
    <Link href="/history">
      <button
        type="button"
        className="
          border border-white/[0.14]
          bg-black/10
          text-[#e8eefc]
          py-2.5 px-3.5
          rounded-xl
          font-bold
          cursor-pointer
          hover:bg-black/20
          active:translate-y-px
          focus:outline-none
          focus:ring-2
          focus:ring-white/20
        "
      >
        History
      </button>
    </Link>
  );
}
