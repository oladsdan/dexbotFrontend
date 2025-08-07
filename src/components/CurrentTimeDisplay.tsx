import { useEffect, useState } from "react";
import * as ct from "countries-and-timezones";

interface CurrentTimeDisplayProps {
  timezone?: string;
}

interface SavedCountryData {
  id: string;
  name: string;
}

export default function CurrentTimeDisplay({
  timezone,
}: CurrentTimeDisplayProps) {
  const [currentTime, setCurrentTime] = useState<string>("Loading...");
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  const loadSavedCountry = (): SavedCountryData | null => {
    if (typeof window !== "undefined") {
      const savedCountryData = localStorage.getItem("selectedCountryData");
      if (savedCountryData) {
        try {
          return JSON.parse(savedCountryData) as SavedCountryData;
        } catch (error) {
          console.error("Error parsing saved country data:", error);
        }
      }
    }
    return null;
  };

  const formatDate = (date: Date, tz: string): string => {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
        .format(date)
        .replace(",", "")
        .replace(/\//g, ".");
    } catch (error) {
      console.error("Failed to format date for timezone:", tz, error);
      // Fallback to UTC on error
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
        .format(date)
        .replace(",", "")
        .replace(/\//g, ".");
    }
  };


  useEffect(() => {
  setHasMounted(true);

  const timer = setInterval(() => {
    const savedCountryData = loadSavedCountry();
    let tz = timezone || "UTC";
    let countryName = "Unknown";

    if (savedCountryData && savedCountryData.id) {
      countryName = savedCountryData.name;
      if (!timezone) {
        const country = ct.getCountry(savedCountryData.id);
        if (country?.timezones.length > 0) {
          tz = country.timezones[0];
        }
      }
    }

    const now = new Date();
    const timeStr = formatDate(now, tz);
    setCurrentTime(`${timeStr} (${countryName})`);
  }, 1000);

  return () => clearInterval(timer);
}, [timezone]);


  if (!hasMounted) return null;

  return <span>{currentTime}</span>;
}
