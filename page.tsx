import Link from "next/link";

type PokemonDetails = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
  types: {
    type: {
      name: string;
    };
  }[];
  abilities: {
    ability: {
      name: string;
    };
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
};

export default async function PokemonDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Pokémon");
    }

    const pokemon: PokemonDetails = await response.json();

    return (
      <main className="min-h-screen bg-gray-100 p-4 md:p-8">

        <Link
          href="/"
          className="inline-block mb-6 bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600"
        >
          ← Back
        </Link>

        <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow">

          {/* Image */}
          <img
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
            className="w-48 h-48 mx-auto"
          />

          {/* Name */}
          <h1 className="text-4xl font-bold text-center capitalize">
            {pokemon.name}
          </h1>

          {/* ID */}
          <p className="text-center text-gray-500 mt-2">
            ID: #{pokemon.id}
          </p>

          {/* Types */}
          <div className="mt-6">
            <h2 className="text-2xl font-bold">
              Types
            </h2>

            <p className="capitalize mt-2">
              {pokemon.types
                .map((item) => item.type.name)
                .join(", ")}
            </p>
          </div>

          {/* Height */}
          <div className="mt-4">
            <p>
              <b>Height:</b> {pokemon.height}
            </p>
          </div>

          {/* Weight */}
          <div className="mt-2">
            <p>
              <b>Weight:</b> {pokemon.weight}
            </p>
          </div>

          {/* Abilities */}
          <div className="mt-6">
            <h2 className="text-2xl font-bold">
              Abilities
            </h2>

            <ul className="list-disc ml-6 mt-2 capitalize">
              {pokemon.abilities.map((item) => (
                <li key={item.ability.name}>
                  {item.ability.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div className="mt-6">
            <h2 className="text-2xl font-bold">
              Base Stats
            </h2>

            <div className="mt-3">
              {pokemon.stats.map((item) => (
                <div
                  key={item.stat.name}
                  className="flex justify-between border-b py-2"
                >
                  <span className="capitalize">
                    {item.stat.name}
                  </span>

                  <span className="font-bold">
                    {item.base_stat}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8 text-center">

        <h1 className="text-3xl font-bold text-red-500">
          Failed to load Pokemon
        </h1>

        <p className="mt-4">
          Please try again later.
        </p>

        <Link
          href="/"
          className="inline-block mt-6 bg-blue-500 text-white px-5 py-2 rounded"
        >
          ← Back
        </Link>

      </main>
    );
  }
}