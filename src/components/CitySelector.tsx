type City = { id: number; name: string };

type CitySelectorProps = {
  cities: City[] | undefined;
  onSelect: (cityId: number) => void;
};

export function CitySelector({ cities, onSelect }: CitySelectorProps) {
  return (
    <div className="m-4 flex flex-col rounded-lg border-2 border-solid border-gray-200 bg-firstLayer">
      <ul className="flex flex-col flex-wrap justify-around border-gray-200 text-center text-xl font-bold leading-none text-gray-500 dark:border-gray-700 dark:text-gray-400">
        <p className="flex-wrap justify-around pt-6 text-white">
          Select a city:
        </p>
        {cities?.map((city) => (
          <li key={city.id} className="mr-2">
            <button
              onClick={() => onSelect(city.id)}
              className="active m-6 inline-block rounded-lg bg-secondLayer p-10 text-white dark:bg-gray-800 dark:text-blue-500"
            >
              {city.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
