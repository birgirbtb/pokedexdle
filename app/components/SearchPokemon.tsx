'use client';

import { useState, useRef, useEffect } from 'react';
import { searchPokemon } from '@/app/actions/pokemon';

export default function SearchPokemon() {
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<any | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const performSearch = async () => {
      if (searchInput.trim().length === 0) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      try {
        const results = await searchPokemon(searchInput);
        setResults(results);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  const handleSelectPokemon = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setSearchInput(pokemon.name);
    setShowDropdown(false);
  };

  const handleGuess = () => {
    if (selectedPokemon) {
      console.log('Guessing:', selectedPokemon.name);
      // Add game logic here
    }
  };

  return (
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

        <input
          ref={inputRef}
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onFocus={() => searchInput && setShowDropdown(true)}
          placeholder="Search Pokemon..."
          className="fakeInput"
          style={{ padding: '8px 12px', fontSize: '14px' }}
        />
        <button className="guessBtn" onClick={handleGuess}>
          Guess
        </button>
      </div>

      {showDropdown && results.length > 0 && (
        <div className="dropdown">
          {results.map((pokemon) => (
            <div
              key={pokemon.name}
              className="ddItem"
              onClick={() => handleSelectPokemon(pokemon)}
              style={{ cursor: 'pointer' }}
            >
              <span className="dot" />
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </div>
          ))}
          {results.length >= 10 && (
            <div className="ddItem muted">…more results</div>
          )}
        </div>
      )}
    </div>
  );
}
