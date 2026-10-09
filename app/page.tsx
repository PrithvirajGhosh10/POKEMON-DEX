"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Pokemon = { //pokemon object   //type define structure
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: {
    type: {
      name: string;   //multiple types
    };
  }[];
};

type PokemonListItem = {  // describe item from api list
  name: string;
  url: string;
};

export default function Home() {   //home page
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);  //current data//finction to change the type
  const [search, setSearch] = useState(""); //store what user scarch in text box/scarch box
  const [debouncedSearch,setDebouncedSearch]=useState("");
  const [type, setType] = useState("");     //store selected pokemon type
  const [page, setPage] = useState(0);      
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(()=>{
    const timer = setTimeout(()=>{
      setDebouncedSearch(search);
    },5000);
    return()=> clearTimeout(timer);
  },[search]);

  const limit = 20;

  useEffect(() => {
    async function getPokemon() {
      try {
        setLoading(true);
        setError("");

        /*
          GET ALL POKEMON NAMES + IDS
        */
        const listResponse = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=2000"
        );

        if (!listResponse.ok) {
          throw new Error("Failed to fetch Pokémon");
        }

        const listData = await listResponse.json();

        let results: PokemonListItem[] = listData.results;

        /*
          SEARCH BY NAME OR ID
        */
        if (debouncedSearch.trim() !== "") {
          const searchValue = debouncedSearch.trim().toLowerCase();

          results = results.filter((p: PokemonListItem, index: number) => {  //filter satisfries condition
            const id = index + 1;    //position

            return (
              p.name.includes(searchValue) ||  //includes checks an array or string contains a particular value
              id.toString() === searchValue     //tostring converts the num into str
            );
          });
        }

        /*
          FILTER BY TYPE
          This checks ALL Pokémon, not only the current page.
        */
        if (type !== "") {
          const typeResponse = await fetch(
            `https://pokeapi.co/api/v2/type/${type}`
          );

          if (!typeResponse.ok) {  //.ok http request is successful
            throw new Error("Failed to fetch Pokémon type");
          }

          const typeData = await typeResponse.json();

          const typePokemonNames = new Set(
            typeData.pokemon.map(
              (item: {
                pokemon: PokemonListItem;
              }) => item.pokemon.name
            )
          );

          results = results.filter((p) =>
            typePokemonNames.has(p.name)
          );
        }

        /*
          TOTAL NUMBER OF RESULTS
        */
        setTotalResults(results.length);

        /*
          PAGINATION
          Only load 20 Pokémon at a time.
        */
        const start = page * limit;
        const end = start + limit;

        const pageResults = results.slice(start, end);

        /*
          GET DETAILS FOR CURRENT 20 POKEMON
        */
        const details = await Promise.all(
          pageResults.map(async (p: PokemonListItem) => {
            const response = await fetch(p.url);

            if (!response.ok) {
              throw new Error("Failed to fetch Pokémon details");
            }

            return response.json();
          })
        );

        setPokemon(details);
      } catch {
        setPokemon([]);
        setTotalResults(0);
        setError("Failed to load Pokémon. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    getPokemon();
  }, [page, search, type]);

  /*
    WHEN SEARCH OR TYPE CHANGES,
    RETURN TO PAGE 1
  */
  function handleSearch(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleType(value: string) {
    setType(value);
    setPage(0);
  }

  const totalPages = Math.ceil(totalResults / limit);

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      {/* Heading */}
      <h1 className="text-4xl font-bold text-center mb-8">
        Pokemon Dex
      </h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or ID"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="block w-full max-w-md mx-auto mb-4 p-3 border rounded-lg"
      />

      {/* Type Filter */}
      <select
        value={type}
        onChange={(e) => handleType(e.target.value)}
        className="block w-full max-w-md mx-auto mb-8 p-3 border rounded-lg"
      >
        <option value="">All Types</option>
        <option value="normal">Normal</option>
        <option value="fire">Fire</option>
        <option value="water">Water</option>
        <option value="electric">Electric</option>
        <option value="grass">Grass</option>
        <option value="ice">Ice</option>
        <option value="fighting">Fighting</option>
        <option value="poison">Poison</option>
        <option value="ground">Ground</option>
        <option value="flying">Flying</option>
        <option value="psychic">Psychic</option>
        <option value="bug">Bug</option>
        <option value="rock">Rock</option>
        <option value="ghost">Ghost</option>
        <option value="dragon">Dragon</option>
        <option value="dark">Dark</option>
        <option value="steel">Steel</option>
        <option value="fairy">Fairy</option>
      </select>

      {/* Loading */}
      {loading && (
        <div className="text-center text-xl font-bold mb-6">
          Loading Pokemon...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center text-red-500 font-bold mb-6">
          {error}
        </div>
      )}

      {/* Pokémon Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {pokemon.map((p) => (
            <Link
              href={`/pokemon/${p.id}`}
              key={p.id}
              className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg"
            >
              <img
                src={p.sprites.front_default}
                alt={p.name}
                className="mx-auto"
              />

              <h2 className="text-xl font-bold capitalize">
                {p.name}
              </h2>

              <p>ID: #{p.id}</p>

              <p className="capitalize text-gray-500">
                {p.types
                  .map((t) => t.type.name)
                  .join(", ")}
              </p>
            </Link>
          ))}

        </div>
      )}

      {/* No Results */}
      {!loading &&
        !error &&
        pokemon.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            No Pokemon found.
          </p>
        )}

      {/* Pagination */}
      {!loading && totalResults > 0 && (
        <div className="flex justify-center items-center gap-4 mt-8">

          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="bg-blue-500 text-white px-5 py-2 rounded disabled:bg-gray-400"
          >
            Previous
          </button>

          <span className="px-5 py-2">
            Page {page + 1} of {totalPages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="bg-blue-500 text-white px-5 py-2 rounded disabled:bg-gray-400"
          >
            Next
          </button>

        </div>
      )}

    </main>
  );
}