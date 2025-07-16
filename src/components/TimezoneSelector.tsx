import { useState, useEffect } from "react";
import * as ct from "countries-and-timezones";

interface TimezoneSelectorProps {
  onTimezoneChange: (timezone: string) => void;
  initialTimezone?: string;
}

interface CountryOption {
  id: string;
  name: string;
}

export default function TimezoneSelector({
  onTimezoneChange,
  initialTimezone,
}: TimezoneSelectorProps) {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  // Load saved country from localStorage
  const loadSavedCountry = (): CountryOption | null => {
    if (typeof window !== "undefined") {
      const savedCountryData = localStorage.getItem("selectedCountryData");
      if (savedCountryData) {
        try {
          return JSON.parse(savedCountryData) as CountryOption;
        } catch (error) {
          console.error("Error parsing saved country data:", error);
          return null;
        }
      }
    }
    return null;
  };

  // Save country data to localStorage
  const saveCountryToStorage = (countryId: string, countryName: string) => {
    if (typeof window !== "undefined") {
      const countryData: CountryOption = {
        id: countryId,
        name: countryName,
      };
      localStorage.setItem("selectedCountryData", JSON.stringify(countryData));
    }
  };

  useEffect(() => {
    const allCountries = ct.getAllCountries();
    const sortedCountries: CountryOption[] = Object.values(allCountries)
      .map((country) => ({
        id: country.id,
        name: country.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    setCountries(sortedCountries);

    // Load saved country first
    const savedCountryData = loadSavedCountry();
    if (savedCountryData && savedCountryData.id) {
      setSelectedCountry(savedCountryData.id);
      const country = ct.getCountry(savedCountryData.id);
      if (country && country.timezones.length > 0) {
        onTimezoneChange(country.timezones[0]);
      }
    } else if (initialTimezone) {
      const country = ct.getCountryForTimezone(initialTimezone);
      if (country) {
        setSelectedCountry(country.id);
        saveCountryToStorage(country.id, country.name);
        onTimezoneChange(initialTimezone);
      }
    }
  }, [initialTimezone, onTimezoneChange]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = e.target.value;
    setSelectedCountry(countryId);

    if (countryId) {
      const selectedCountryData = countries.find(
        (country) => country.id === countryId
      );
      const countryName = selectedCountryData ? selectedCountryData.name : "";

      saveCountryToStorage(countryId, countryName);

      const country = ct.getCountry(countryId);
      if (country && country.timezones.length > 0) {
        onTimezoneChange(country.timezones[0]);
      }
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("selectedCountryData");
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        title="Select Country"
        id="country-select"
        value={selectedCountry}
        onChange={handleCountryChange}
        className="bg-gray-700 text-white w-64 border border-gray-600 rounded-md p-2"
      >
        <option value="">-- Select --</option>
        {countries.map((country) => (
          <option key={country.id} value={country.id}>
            {country.name}
          </option>
        ))}
      </select>
    </div>
  );
}
