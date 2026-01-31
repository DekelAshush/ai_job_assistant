"use client";

import { useEffect, useRef, useState } from "react";

interface Country {
  name: string;
  cities: string[];
}

interface StepLocationProps {
  data?: string[];
  onNext: (values: string[]) => void;
  onBack?: () => void;
}

const WORK_MODES = ["In-Person", "Hybrid", "Remote"];

const COUNTRIES: Country[] = [
  {
    name: "United States",
    cities: [
      "Atlanta",
      "Austin",
      "Chicago",
      "Denver",
      "Los Angeles",
      "Miami",
      "New York City",
      "Remote in USA",
      "San Francisco Bay Area",
      "Seattle",
      "Washington D.C.",
    ],
  },
  {
    name: "Canada",
    cities: ["Montreal", "Ottawa", "Toronto", "Vancouver", "Remote in Canada"],
  },
  {
    name: "United Kingdom",
    cities: ["London", "Manchester", "Birmingham", "Edinburgh", "Remote UK"],
  },
  {
    name: "Australia",
    cities: ["Sydney", "Melbourne", "Brisbane", "Remote Australia"],
  },
  {
    name: "France",
    cities: ["Paris", "Lyon", "Marseille", "Remote France"],
  },
  {
    name: "Germany",
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Remote Germany"],
  },
  {
    name: "India",
    cities: ["Bengaluru", "Hyderabad", "Mumbai", "Delhi", "Remote India"],
  },
  {
    name: "Ireland",
    cities: ["Dublin", "Cork", "Galway", "Remote Ireland"],
  },
  {
    name: "Italy",
    cities: ["Rome", "Milan", "Turin", "Remote Italy"],
  },
  {
    name: "Spain",
    cities: ["Barcelona", "Madrid", "Valencia", "Remote Spain"],
  },
  {
    name: "United Arab Emirates",
    cities: ["Dubai", "Abu Dhabi", "Remote UAE"],
  },
  {
    name: "Israel",
    cities: ["Tel Aviv", "Jerusalem", "Haifa", "Remote Israel"],
  },
];

// Additional location options for the add-location dropdown (example for USA)
const EXTRA_OPTIONS: Record<string, string[]> = {
  "United States": [
    "Alabama",
    "Alaska",
    "Albuquerque",
    "Anaheim",
    "Anchorage",
    "Arizona",
    "Arkansas",
    "Bakersfield",
    "Boise",
    "Boston",
    "Brooklyn",
    "Buffalo",
    "Charlotte",
    "Cleveland",
    "Columbus",
    "Dallas",
    "Detroit",
    "El Paso",
    "Fort Worth",
    "Fresno",
    "Honolulu",
    "Houston",
    "Indianapolis",
    "Jacksonville",
    "Kansas City",
    "Las Vegas",
    "Long Beach",
    "Los Angeles",
    "Louisville",
    "Memphis",
    "Mesa",
    "Miami",
    "Milwaukee",
    "Minneapolis",
    "Nashville",
    "New Orleans",
    "Oakland",
    "Oklahoma City",
    "Omaha",
    "Orlando",
    "Philadelphia",
    "Phoenix",
    "Pittsburgh",
    "Raleigh",
    "Remote USA (All)",
    "Sacramento",
    "San Antonio",
    "San Diego",
    "San Francisco",
    "San Jose",
    "Seattle",
    "St. Louis",
    "Tampa",
    "Washington D.C.",
  ],
  Canada: [
    "Calgary",
    "Edmonton",
    "Halifax",
    "Quebec City",
    "Saskatoon",
    "Victoria",
    "Winnipeg",
  ],
  "United Kingdom": [
    "Bristol",
    "Brighton",
    "Cambridge",
    "Leeds",
    "Liverpool",
    "Nottingham",
    "Oxford",
    "Remote UK (All)",
  ],
  Australia: [
    "Adelaide",
    "Canberra",
    "Gold Coast",
    "Perth",
    "Hobart",
    "Darwin",
    "Remote Australia (All)",
  ],
  France: [
    "Bordeaux",
    "Nice",
    "Toulouse",
    "Nantes",
    "Lille",
    "Grenoble",
    "Remote France (All)",
  ],
  Germany: [
    "Cologne",
    "Düsseldorf",
    "Leipzig",
    "Stuttgart",
    "Hanover",
    "Dortmund",
    "Remote Germany (All)",
  ],
  India: [
    "Chennai",
    "Pune",
    "Kolkata",
    "Noida",
    "Gurugram",
    "Ahmedabad",
    "Jaipur",
    "Remote India (All)",
  ],
  Ireland: [
    "Limerick",
    "Waterford",
    "Kilkenny",
    "Belfast",
    "Sligo",
    "Remote Ireland (All)",
  ],
  Italy: [
    "Florence",
    "Naples",
    "Bologna",
    "Venice",
    "Verona",
    "Genoa",
    "Remote Italy (All)",
  ],
  Spain: [
    "Seville",
    "Bilbao",
    "Zaragoza",
    "Granada",
    "Malaga",
    "Mallorca",
    "Remote Spain (All)",
  ],
  "United Arab Emirates": [
    "Sharjah",
    "Ajman",
    "Ras Al Khaimah",
    "Fujairah",
    "Al Ain",
    "Remote UAE (All)",
  ],
  Israel: [
    "Herzliya",
    "Ramat Gan",
    "Rishon LeZion",
    "Beer Sheva",
    "Petah Tikva",
    "Netanya",
    "Remote Israel (All)",
  ],
};

export default function StepLocation({
  data = [],
  onNext,
  onBack,
}: StepLocationProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [selectedModes, setSelectedModes] = useState<string[]>(["Remote"]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(data);
  const [customLocations, setCustomLocations] = useState<Record<string, string[]>>({});
  const [activeAddCountry, setActiveAddCountry] = useState<string | null>(null);
  const [addSearch, setAddSearch] = useState<string>("");
  const [consumedExtras, setConsumedExtras] = useState<Record<string, string[]>>({});

  // Close the add-location dropdown when clicking outside of it (and not on its trigger)
  useEffect(() => {
    if (!activeAddCountry) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      // Keep open if clicking the add-location trigger button
      if (target.closest('[data-add-location-trigger="true"]')) return;
      // Close if clicking outside the dropdown content
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setActiveAddCountry(null);
        setAddSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeAddCountry]);

  const toggleMode = (mode: string) => {
    if (selectedModes.includes(mode)) {
      setSelectedModes(selectedModes.filter((m) => m !== mode));
    } else {
      setSelectedModes([...selectedModes, mode]);
    }
  };

  const toggleLocation = (city: string) => {
    if (selectedLocations.includes(city)) {
      setSelectedLocations(selectedLocations.filter((c) => c !== city));
    } else {
      setSelectedLocations([...selectedLocations, city]);
    }
  };

  const toggleSelectAll = (country: Country) => {
    const added = customLocations[country.name] || [];
    const allCities = [...country.cities, ...added];
    const allSelected = allCities.every((c) => selectedLocations.includes(c));

    if (allSelected) {
      setSelectedLocations(selectedLocations.filter((c) => !allCities.includes(c)));
    } else {
      const merged = new Set([...selectedLocations, ...allCities]);
      setSelectedLocations(Array.from(merged));
    }
  };

  const handleAddLocation = (countryName: string) => {
    setActiveAddCountry(countryName);
    setAddSearch("");
  };

  const handleContinue = () => {
    if (selectedLocations.length > 0) {
      onNext(selectedLocations);
    }
  };

  return (
    <div className="max-w-5xl mx-auto text-gray-100">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
        Where would you like to work?
      </h1>
      <p className="text-sm text-gray-300 mb-8">
        Choose work modes and locations. Select as many cities as you like.
      </p>

      <div className="mb-6 space-y-2">
        <p className="text-sm font-semibold text-gray-200">
          Work Location Preferences
        </p>
        <div className="flex flex-wrap gap-3">
          {WORK_MODES.map((mode) => {
            const active = selectedModes.includes(mode);
            return (
              <button
                key={mode}
                onClick={() => toggleMode(mode)}
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                  active
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-gray-700 bg-slate-800 text-gray-200 hover:border-gray-500"
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-8">
        {COUNTRIES.map((country) => {
          const added = customLocations[country.name] || [];
          const allCities = [...country.cities, ...added];
          const allSelected = allCities.every((c) => selectedLocations.includes(c));
          const extraOptions = EXTRA_OPTIONS[country.name] || [];
          const consumed = consumedExtras[country.name] || [];
          const filteredExtras = extraOptions
            .filter((opt) => !consumed.includes(opt))
            .filter((opt) => opt.toLowerCase().includes(addSearch.toLowerCase()));

          return (
            <div key={country.name} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-white">{country.name}</h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => toggleSelectAll(country)}
                      className="h-4 w-4 rounded border-gray-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                    />
                    Select all in {country.name}
                  </label>
                  <button
                    onClick={() => handleAddLocation(country.name)}
                    data-add-location-trigger="true"
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                  >
                    + Add Location
                  </button>
                </div>
              </div>

              {activeAddCountry === country.name && extraOptions.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="mt-3 rounded-lg border border-gray-700 bg-slate-800 p-3 space-y-3"
                >
                  <input
                    type="text"
                    value={addSearch}
                    onChange={(e) => setAddSearch(e.target.value)}
                    placeholder={`Search for other regions in ${country.name}`}
                    className="w-full rounded-md border border-gray-700 bg-slate-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="max-h-52 overflow-y-auto pr-1 space-y-1">
                    {filteredExtras.map((opt) => {
                      const active = selectedLocations.includes(opt);
                      return (
                        <button
                          key={`${country.name}-extra-${opt}`}
                          onClick={() => toggleLocation(opt)}
                          className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-all ${
                            active
                              ? "border-blue-500 bg-blue-600 text-white"
                              : "border-gray-700 bg-slate-900 text-gray-200 hover:border-gray-500"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                    {filteredExtras.length === 0 && (
                      <p className="text-sm text-gray-500">No matches found.</p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        const selectedExtras = (EXTRA_OPTIONS[country.name] || []).filter((opt) =>
                          selectedLocations.includes(opt)
                        );

                        if (selectedExtras.length) {
                          setCustomLocations((prev) => {
                            const existing = prev[country.name] || [];
                            const merged = Array.from(new Set([...existing, ...selectedExtras]));
                            return { ...prev, [country.name]: merged };
                          });

                          setConsumedExtras((prev) => {
                            const existing = prev[country.name] || [];
                            const merged = Array.from(new Set([...existing, ...selectedExtras]));
                            return { ...prev, [country.name]: merged };
                          });
                        }

                        setActiveAddCountry(null);
                        setAddSearch("");
                      }}
                      className="text-sm text-gray-300 hover:text-white"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {allCities.map((city) => {
                  const active = selectedLocations.includes(city);
                  return (
                    <button
                      key={`${country.name}-${city}`}
                      onClick={() => toggleLocation(city)}
                      className={`px-4 py-2 rounded-full border text-sm transition-all ${
                        active
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-gray-700 bg-slate-800 text-gray-200 hover:border-gray-500"
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selectedLocations.length > 0 && (
        <p className="mt-6 text-sm text-gray-300">
          {selectedLocations.length} selected
        </p>
      )}

      <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            ← Back
          </button>
        )}
        <button
          onClick={handleContinue}
          disabled={selectedLocations.length === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            selectedLocations.length > 0
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          Save and Continue
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
