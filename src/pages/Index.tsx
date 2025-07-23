import { useState, useEffect, useMemo } from "react";
import { Loader, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { CountdownDisplay } from "@/components/ui/CountdownDisplay";
import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";
import TimezoneSelector from "@/components/TimezoneSelector";
import CurrentTimeDisplay from "@/components/CurrentTimeDisplay";
import monitoredTokens from "@/monitodTokens.json";

export interface Signal {
  pairName: string;
  signal: string;
  currentPrice: string | number;
  timeTakenFor1_6_percent: string;
  // lstmPrediction?: string | number;
  // xgboostPrediction?: string | number;
  combinedPrediction?: string | number;
  predictedTime?: string;
  expiryTime?: string;
  signalUpdate?: {
    time: string;
    price: string;
  };
  now_diff_percent?: string | number;
  hit_status: string;
  hit_time: string;

  target_diff_percent?: string | number;
  target_price_usdt: string | number;
  direction: string;
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  // const [signals, setSignals] = useState([]);
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("UTC");

  const tokenMap = useMemo(() => {
    const map = new Map();
    monitoredTokens.monitoredTokens.forEach((token) => {
      map.set(token.symbol, token.name);
    });
    return map;
  }, []);

  // const API_URL = "https://pancakeswapsignal.onrender.com/api/signals"; // Your backend API
  // const API_URL = "https://projectmlpancakeswap.onrender.com/api/signals"; // Your backend API
  const API_URL = "https://bot.securearbitrage.com/api/signals"; // Your backend API
  // const API_URL = "http://188.165.71.103:3000/api/signals"; // Your backend API
  // const API_URL = "/api/signals"; // Your backend API
  // const API_URL = "https://pancake-signalsugragph.onrender.com/api/signals"; // Your backend API

  const fetchSignals = async () => {
    const { data } = await axios.get(API_URL);
    return data;
  };
  const {
    data: signals = [],
    isLoading,
    refetch,
    error: queryError,
  } = useQuery({
    queryKey: ["signals"],
    queryFn: fetchSignals,
  });

  // const fetchGlobalSignals = () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);

  // }

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await axios.get("https://ipwho.is/");
        if (response.data && response.data.success) {
          setCountry(response.data.country);
          setTimezone(response.data.timezone.id);
        } else {
          console.log("Failed to fetch country.");
        }
      } catch (err) {
        console.log("Error fetching location by IP.");
      }
    };

    fetchCountry();
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setSecondsLeft((prev) => {
  //       if (prev === 1) {
  //         fetchSignals(); // trigger the fetch
  //         return 30; // reset timer
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000); // every second

  //   return () => clearInterval(interval); // cleanup on unmount
  // }, []);

  const formatTimeSec = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: timezone || "Asia/Singapore",
    };

    try {
      const parts = new Intl.DateTimeFormat("en-GB", options).formatToParts(
        date
      );
      const day = parts.find((p) => p.type === "day")?.value;
      const month = parts.find((p) => p.type === "month")?.value;
      const year = parts.find((p) => p.type === "year")?.value;
      const hour = parts.find((p) => p.type === "hour")?.value;
      const minute = parts.find((p) => p.type === "minute")?.value;
      const second = parts.find((p) => p.type === "second")?.value;

      return `${day}.${month}.${year} ${hour}:${minute}:${second}`;
    } catch (err) {
      // fallback to UTC if invalid timezone
      const fallbackOptions = { ...options, timeZone: "UTC" };
      const parts = new Intl.DateTimeFormat(
        "en-GB",
        fallbackOptions
      ).formatToParts(date);
      const day = parts.find((p) => p.type === "day")?.value;
      const month = parts.find((p) => p.type === "month")?.value;
      const year = parts.find((p) => p.type === "year")?.value;
      const hour = parts.find((p) => p.type === "hour")?.value;
      const minute = parts.find((p) => p.type === "minute")?.value;
      const second = parts.find((p) => p.type === "second")?.value;

      return `${day}.${month}.${year} ${hour}:${minute}:${second}`;
    }
  };

  const parseCustomDateString = (dateString: string): string => {
    if (!dateString || dateString === "N/A") return "N/A";

    // Parse as UTC+1
    const dt = DateTime.fromFormat(dateString, "yyyy.MM.dd HH:mm:ss", {
      zone: "UTC+1", // your input is UTC+1
    });

    if (!dt.isValid) {
      console.error("Invalid DateTime:", dt.invalidExplanation);
      return "Invalid Date";
    }

    // Convert to the target timezone (or Asia/Singapore)
    return dt
      .setZone(timezone || "Asia/Singapore")
      .toFormat("dd.MM.yyyy HH:mm:ss");
  };

  const sortedSignals = useMemo(() => {
    // Define the order of signal types
    const signalOrder = {
      Buy: 1,
      Hold: 2,
      Sell: 3, // Assuming 'Sell' should be before 'Error' but after 'Buy/Hold'
      Error: 4, // Errors go last
      // Add other signal types if you have them, e.g., 'Neutral', 'Insufficient Data'
    };

    if (!Array.isArray(signals)) {
      return [];
    }

    return [...signals].sort((a, b) => {
      const orderA = signalOrder[a.signal] || 99; // Default to a high number if signal type is unknown
      const orderB = signalOrder[b.signal] || 99;

      if (orderA === orderB) {
        // Secondary sort: if signal types are the same, sort by pair name alphabetically
        return a.pairName.localeCompare(b.pairName);
      }
      return orderA - orderB;
    });
  }, [signals]);

  // const filteredSignals = useMemo(() => {
  //   if (!searchTerm.trim()) return sortedSignals;

  //   return sortedSignals.filter((signal) =>
  //     signal.pairName.toLowerCase().includes(searchTerm.trim().toLowerCase())
  //   );
  // }, [searchTerm, sortedSignals]);

  const filteredSignals = useMemo(() => {
    // Start with sorted signals
    let currentFilteredSignals = sortedSignals;

    // Filter by search term if present
    if (searchTerm.trim()) {
      currentFilteredSignals = currentFilteredSignals.filter((signal) =>
        signal.pairName.toLowerCase().includes(searchTerm.trim().toLowerCase())
      );
    }

    // NEW: Filter out signals with "Error"
    currentFilteredSignals = currentFilteredSignals.filter(
      (signal) => signal.signal !== "Error"
    );

    return currentFilteredSignals;
  }, [searchTerm, sortedSignals]);

  const columns = [
    {
      accessorKey: "serialNo",
      header: "#",
      cell: (info) => `${info.row.index + 1}.`,
      enableSorting: false,
    },
    {
      accessorKey: "pairName",
      header: " ASSET (SYMBOL)",
      cell: (info) => {
        const pairName = info.getValue();
        const symbol = pairName.split("/")[0];
        const assetName = tokenMap.get(symbol) || symbol;
        return `${assetName} (${symbol})`;
      },
    },
    {
      accessorKey: "signal",
      header: "SIGNAL",
      cell: ({ row }) => {
        const signal = row.original.signal.toLowerCase();
        let colorClass = "text-white"; // default color

        if (signal === "buy") colorClass = "text-green-400";
        // else if (signal === "sell") colorClass = "text-red-400";
        else if (signal === "hold") colorClass = "text-yellow-400";
        // else if (signal === "exit") colorClass = "text-orange-400";

        return (
          <div className="flex items-center justify-end">
            <span className={`font-medium uppercase ${colorClass}`}>
              {signal.toLowerCase() === "hold" ? "No Action" : signal}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "aiPrediction",
      header: "AI Prediction (USDT)",
      accessorFn: (row) =>
        Number(row.combinedPrediction || row.lstmPrediction || 0),
      // cell: ({ row }) =>
      //   row.original.combinedPrediction || row.original.lstmPrediction || "N/A", // Modified line,
      cell: ({ row }) => {
        const aiPrice = Number(
          row.original.combinedPrediction || row.original.lstmPrediction
        );

        const actualPrice = Number(row.original.currentPrice);

        // const percentageChange = ((aiPrice - actualPrice) / actualPrice) * 100;
        const priceChange = aiPrice - actualPrice;
        let colorClass = "text-white";

        if (priceChange > 0) colorClass = "text-green-400";
        else if (priceChange < 0) colorClass = "text-red-400";

        return (
          <div className="flex items-center justify-end">
            <span className={`font-medium uppercase ${colorClass}`}>
              {aiPrice ? aiPrice : "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "currentPriceAtPredicition",
      header: "Prediction Time Price (USDT)",
      cell: ({ row }) => row.original.currentPriceAtPredicition.toFixed(8),
    },
    {
      accessorKey: "target_price_usdt",
      header: "TARGET PRICE (USDT)",
      cell: ({ row }) => Number(row.original.target_price_usdt).toFixed(8),
    },
    {
      accessorKey: "target_diff_percent",
      header: "TARGET DIFF(%)",
      cell: ({ row }) => row.original.target_diff_percent,
    },
    {
      accessorKey: "currentPrice",
      header: "CURRENT PRICE (USDT)",
      cell: ({ row }) => {
        const currentPrice = parseFloat(row.original.currentPrice).toFixed(8);
        let colorClass = "text-red-400";
        if (row.original.direction === "UP") colorClass = "text-green-400";
        return (
          <div className="flex items-center justify-end">
            <span className={`font-medium uppercase ${colorClass}`}>
              {currentPrice ? currentPrice : "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "now_diff_percent",
      header: "NOW DIFF(%)",
      cell: ({ row }) => {
        const priceDifference = row.original.now_diff_percent;

        let colorClass = "text-white";

        if (priceDifference.includes("-")) {
          colorClass = "text-red-400";
        } else {
          colorClass = "text-green-400";
        }

        return (
          <div className="flex items-center justify-end">
            <span className={`font-medium uppercase ${colorClass}`}>
              {priceDifference ? priceDifference : "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "priceDifference",
      header: "Price Difference (%)",
      accessorFn: (row) => {
        const predicted = Number(row.target_price_usdt);
        const current = Number(row.currentPriceAtPredicition);
        if (!predicted || !current) return null;
        return ((predicted - current) / current) * 100;
      },
      cell: ({ row }) => {
        const predicted = Number(row.original.target_price_usdt);
        const current = Number(row.original.currentPriceAtPredicition);
        if (!predicted || !current) return "N/A";

        const diffPercent = ((predicted - current) / current) * 100;
        const colorClass =
          diffPercent > 0
            ? "text-green-400"
            : diffPercent < 0
            ? "text-red-400"
            : "text-white";

        return (
          <div className="flex items-center justify-end">
            <span className={`font-medium ${colorClass}`}>
              {diffPercent.toFixed(2)}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "predictedTime",
      header: "Predicted At",
      accessorFn: (row) => {
        if (!row.predictedTime || row.predictedTime === "N/A") return null;
        return DateTime.fromFormat(row.predictedTime, "yyyy.MM.dd HH:mm:ss", {
          zone: "UTC+1",
        }).toMillis(); // sorting uses this timestamp
      },
      /*************  ✨ Windsurf Command ⭐  *************/
      /**
       * Cell renderer function for displaying the predicted time.
       * Parses the predicted time from the row's original data using the custom date parser.
       * If the predicted time is not available or invalid, it returns "N/A".
       */

      /*******  bf0ddb0b-3c93-4565-9e22-75c77c421cf6  *******/
      cell: ({ row }) =>
        parseCustomDateString(row.original.predictedTime) || "N/A",
    },
    {
      accessorKey: "expiryTime",
      header: "Expires At",
      accessorFn: (row) => {
        if (!row.expiryTime || row.expiryTime === "N/A") return null;
        return DateTime.fromFormat(row.expiryTime, "yyyy.MM.dd HH:mm:ss", {
          zone: "UTC+1",
        }).toMillis(); // sorting uses this timestamp
      },
      cell: ({ row }) =>
        parseCustomDateString(row.original.expiryTime) || "N/A",
    },
    {
      accessorKey: "hit_status",
      header: "HIT STATUS",
      cell: ({ row }) => {
        let colorClass;
        if (row.original.hit_status === "Not Reached")
          colorClass = "text-red-400";
        else colorClass = "text-green-400";
        return (
          <div className="flex items-center justify-end">
            <span className={`font-medium ${colorClass}`}>
              {row.original.hit_status}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "hit_time",
      header: "HIT TIME",
      accessorFn: (row) => {
        if (row.hit_time === "Not Reached") return row.hit_time;
        return DateTime.fromFormat(row.hit_time, "yyyy.MM.dd HH:mm:ss", {
          zone: "UTC+1",
        }).toMillis(); // sorting uses this timestamp
      },

      cell: ({ row }) => {
        // parseCustomDateString(row.original.hit_time) || "Not Reached";

        let colorClass;
        if (row.original.hit_time === "Not Reached")
          colorClass = "text-red-400";
        else colorClass = "text-green-400";
        return (
          <div className="flex items-center justify-end">
            <span className={`font-medium ${colorClass}`}>
              {row.original.hit_time}
            </span>
          </div>
        );
      },
    },

    // {
    //   accessorKey: "AI-XGBOOST",
    //   header: "XGBoost Prediction",
    //   cell: ({ row }) => row.original.xgboostPrediction || "N/A",
    // },
    // {
    //   accessorKey: "targetPrice",
    //   header: "Signal Update (Time and Price)",
    //   cell: ({row}) =>  row.original.signalUpdate ? `${row.original.signalUpdate.time} - ${row.original.signalUpdate.price}` : "N/A",
    // },
    // {
    //   accessorKey: "time",
    //   header: "Time Taken for 1.2%",
    //   cell: ({row}) => row.original.timeTakenFor1_6_percent || "N/A",
    // },
  ];

  return (
    <div className="min-h-screen bg-slate-800 text-white">
      {/* Header Navigation */}
      <header className="bg-teal-600 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="bg-black p-2 rounded">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-8 w-8 object-cover"
              />
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-white hover:text-teal-200">
                Benefits
              </a>
              <a href="#" className="text-white hover:text-teal-200">
                Testimonials
              </a>
              <a href="#" className="text-white hover:text-teal-200">
                Performance
              </a>
              <a href="#" className="text-white hover:text-teal-200">
                FAQ
              </a>
              <a href="#" className="text-green-400 hover:text-green-300">
                Pancake.finance ↓
              </a>
            </nav>
          </div>
          <Button className="bg-green-400 hover:bg-green-500 text-black font-medium px-6">
            Start now →
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-400 mb-4 text-center">
            Signals - <span className="block sm:inline">Pancake.finance</span>
          </h1>
          <div className="text-center text-gray-400 mb-6">
            <CountdownDisplay onRefresh={refetch} refreshInterval={30} />
          </div>
          <p className="text-gray-400">
            Time: <CurrentTimeDisplay timezone={timezone} />
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Country Selector */}

        <div className="flex justify-center items-center mb-8">
          <TimezoneSelector
            onTimezoneChange={setTimezone}
            initialTimezone={timezone}
          />
        </div>

        {/* Signal Statistics */}
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-2 gap-4 mb-8 ">
            <div className="text-center">
              <span className="text-green-400 font-medium">
                Buy: {filteredSignals.filter((s) => s.signal === "Buy").length}/
                {filteredSignals.length}
              </span>
            </div>
            {/* <div className="text-center">
              <span className="text-red-400 font-medium">
                Sell: {filteredSignals.filter((s) => s.signal === "Sell").length}/
                {filteredSignals.length}
              </span>
            </div> */}
            <div className="text-center">
              <span className="text-yellow-400 font-medium">
                Hold:{" "}
                {filteredSignals.filter((s) => s.signal === "Hold").length}/
                {filteredSignals.length}
              </span>
            </div>
            {/* <div className="text-center">
              <span className="text-orange-400 font-medium">
                Exit: {filteredSignals.filter((s) => s.signal === "Exit").length}/
                {filteredSignals.length}
              </span>
            </div> */}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-400 w-full via-yellow-400 to-red-400 h-2 rounded-full"></div>
          </div>
        </div>

        {/* ✅ Error Message */}
        {queryError && (
          <div className="text-red-500 text-center py-4">
            Failed to fetch signals. Please check your connection.
          </div>
        )}

        {/* Data Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin text-green-400 h-8 w-8 mr-4" />
            <span>Please wait while we fetch the signals...</span>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredSignals} />
        )}
      </main>
    </div>
  );
};

export default Index;
