import Link from "next/link";

export default function Page() {
  return (
    <main className="page">
      <div className="app">
        <header className="topbar">
          <div className="topbarInner">
            <div className="brand">
              <div className="brandTitle">Pokedexle</div>
              <div className="brandSub">Guess the Pokémon</div>
            </div>

            <div className="auth">
              <button className="btn btnGhost">Login</button>
              <Link href="/login">
                <button className="btn btnGhost">Login</button>
              </Link>
              <button className="btn btnPrimary">Log Out</button>
            </div>
          </div>
        </header>

        <section className="content">
          <div className="card imageCard" aria-label="Image">
            <div className="imageInner">
              <div className="imageSilhouette" />
              <div className="imageLines">
                <div className="line w55" />
                <div className="line w80" />
              </div>
            </div>
          </div>

          <div className="hintRow">
            <button className="chip">Type</button>
            <button className="chip">Secondary Type</button>
            <button className="chip">Evolution Stage</button>
            <button className="chip">Gen</button>
          </div>

          <div className="card pickerCard" aria-label="Picker">
            <div className="pickerTop">
              <div className="pickerLabel">Your guess</div>
              <div className="pickerHint">Start typing to search</div>
            </div>

            <div className="pickerBar">
              <div className="pokeIcon" aria-hidden="true">
                <div className="pokeTop" />
                <div className="pokeMid" />
                <div className="pokeBot" />
                <div className="pokeCore" />
              </div>

              <div className="fakeInput" />
              <button className="guessBtn">Guess</button>
            </div>

            <div className="dropdown">
              <div className="ddItem">
                <span className="dot" />
              </div>
              <div className="ddItem">
                <span className="dot" />
              </div>
              <div className="ddItem">
                <span className="dot" />
              </div>
            </div>
          </div>

          <div className="attemptsBlock" aria-label="Attempts">
            <div className="attemptsTop">
              <div className="attemptsLabel">Attempts</div>
              <div className="attemptsMeta">2 / 5 used</div>
            </div>

            <div className="attempts">
              <div className="diamond filled" />
              <div className="diamond filled" />
              <div className="diamond" />
              <div className="diamond" />
              <div className="diamond" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
