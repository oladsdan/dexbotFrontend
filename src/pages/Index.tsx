import { useState, useEffect, useMemo } from "react";
import { Loader, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTable } from "@/components/ui/data-table";

export interface Signal {
  pairName: string;
  signal: string;
  currentPrice: string;
  timeTakenFor1_6_percent: string;
  // lstmPrediction?: string | number;
  // xgboostPrediction?: string | number;
  combinedPrediction?: string | number;
  predictedTime?: string;
  expiryTime?: string;
  signalUpdate?: {
    time: string;
    price: string;
  }
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [secondsFetched, setSecondsFetched] = useState(35);
  const [signals, setSignals] = useState([]);
  const [globalSignals, setGlobalSignals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");

  // const API_URL = "https://pancakeswapsignal.onrender.com/api/signals"; // Your backend API
  const API_URL = "https://projectmlpancakeswap.onrender.com/api/signals"; // Your backend API
  // const API_URL = "http://188.165.71.103:3000/api/signals"; // Your backend API
  // const API_URL = "/api/signals"; // Your backend API
  // const API_URL = "https://pancake-signalsugragph.onrender.com/api/signals"; // Your backend API

  const fetchSignals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("API response is not an array");
      }
      setSignals(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch signals:", err);
      setError("signal is loading. please wait while it fetches.");
      setSignals([]); // ensure `signals` remains an array
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSignals();
  }, []);

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
          setError("Failed to fetch country.");
        }
      } catch (err) {
        setError("Error fetching location by IP.");
      }
    };

    fetchCountry();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === 1) {
          fetchSignals(); // trigger the fetch
          return 30; // reset timer
        }
        return prev - 1;
      });
    }, 1000); // every second

    return () => clearInterval(interval); // cleanup on unmount
  }, []);


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
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: timezone || "Asia/Singapore", // default to Asia/Singapore if timezone is not set// adds GMT+08 or SGT
    });
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
      header: "S/NO",
      cell: (info) => `${info.row.index + 1}.`,
    },
    {
      accessorKey: "pairName",
      header: "TOKEN (NAME)",
      cell: (info) => `${info.getValue().split("/")[0]}`,
    },
    {
      accessorKey: "signal",
      header: "CURRENT SIGNAL",
      cell: ({ row }) => {
          const signal = row.original.signal.toLowerCase();
          let colorClass = "text-white"; // default color

          if (signal === "buy") colorClass = "text-green-400";
          // else if (signal === "sell") colorClass = "text-red-400";
          else if (signal === "hold") colorClass = "text-yellow-400";
          // else if (signal === "exit") colorClass = "text-orange-400";

          return (
            <div className="flex items-center">
              <span className={`font-medium uppercase ${colorClass}`}>
                {signal.toLowerCase() === "hold" ? "No Action" : signal}
              </span>
            </div>
          );
        },
    },
    {
      accessorKey: "currentPrice",
      header: "CURRENT PRICE (USD)",
      cell: (info) => parseFloat(info.getValue()).toFixed(8) || "N/A",
    },
    {
      accessorKey: "AI-LSTM",
      header: "AI-Prediction(USD)",
      cell: ({ row }) => row.original.combinedPrediction || row.original.lstmPrediction || "N/A", // Modified line,
    },
    {
      accessorKey: "prediction Time",
      header: "Prediction Time",
      cell: ({ row }) => row.original.predictedTime || "N/A",
    },
    {
      accessorKey: "expiry Time",
      header: "expiry Time",
      cell: ({ row }) => row.original.expiryTime || "N/A",
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
          <p className="text-gray-400 mb-2">
            Next update in: {formatTimeSec(secondsLeft)}
          </p>
          <p className="text-gray-400">
            Time: {formatTime(currentTime)} ({country})
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

        {/* Signal Statistics */}
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 ">
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
                Hold: {filteredSignals.filter((s) => s.signal === "Hold").length}/
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
            <div
              className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 h-2 rounded-full"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
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

