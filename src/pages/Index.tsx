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
import * as XLSX from "xlsx";
import { access } from "fs";
import { Download } from "lucide-react";
import Footer from "@/components/Footer";
import MenuDropdown from "@/components/MenuDropDown";
import Drawer from "@/components/Drawer";

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
  const [accuracyStats, setAccuracyStats] = useState<{
    pastAccuracy?: string;
    currentAccuracy?: string;
  }>({});
  const [drawerOpen, setDrawerOpen] = useState(false);

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
  const MetricEndpoint = "https://bot.securearbitrage.com/api/accuracy-stats";

  const fetchSignals = async () => {
    const { data } = await axios.get(API_URL);
    return data;
  };

  const fetchAccuracyStats = async () => {
    const { data } = await axios.get(MetricEndpoint);
    return data;
  };

  //we call the fetchAccuracyStats every 10seconds and store in accuracyStats
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAccuracyStats().then((data) => {
        setAccuracyStats(data);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchAccuracyStats();

  //   }, 10000);
  //   return () => clearInterval(interval);
  // }, []);

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
      accessorKey: "currentPriceAtPredicition",
      header: "Prediction Time Price (USDT)",
      cell: ({ row }) =>
        row.original.currentPriceAtPredicition &&
        row.original.currentPriceAtPredicition.toFixed(8),
    },
    {
      accessorKey: "target_price_usdt",
      header: "TARGET PRICE (USDT)",
      cell: ({ row }) => {
        const PredictedTimePrice = Number(
          row.original.currentPriceAtPredicition
        );
        const TargetPrice = (PredictedTimePrice * 1.016).toFixed(8);
        return (
          <div className="">
            <span className=" text-white">
              {TargetPrice ? TargetPrice : "N/A"}
            </span>
          </div>
        );
      },
    },
    // {
    //   accessorKey: "target_price_usdt",
    //   header: "TARGET PRICE (USDT)",
    //   cell: ({ row }) => Number(row.original.target_price_usdt).toFixed(8),
    // },
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
      accessorKey: "signal",
      header: "SIGNAL",
      cell: ({ row }) => {
        const signal = row.original.signal.toLowerCase();
        return (
          <div className="flex items-center justify-end">
            {signal.toLowerCase() === "buy" ? (
              <Button className={`hover:cursor-pointer text-white uppercase`}>
                {signal}
              </Button>
            ) : (
              <span className={` text-white uppercase`}>
                {signal.toLowerCase() === "hold" ? "No Action" : signal}
              </span>
            )}
          </div>
        );
      },
    },
    //  {
    //   accessorKey: "target_diff_percent",
    //   header: "TARGET DIFF(%)",
    //   // cell: ({ row }) => row.original.target_diff_percent,
    //   cell: ({ row }) => {
    //      const PredictedTimePrice = Number(row.original.currentPriceAtPredicition)
    //     const TargetPrice = PredictedTimePrice * 1.016
    //     let TargetDiff = ((TargetPrice - PredictedTimePrice) / PredictedTimePrice) * 100;
    //    const TargetDiffs = TargetDiff.toFixed(2)
    //     let colorClass = "text-white";

    //     if (TargetDiff > 0) colorClass = "text-green-400";
    //     else if (TargetDiff < 0) colorClass = "text-red-400";
    //     return (
    //       <div className="flex items-center">
    //         <span className={`font-medium ${colorClass}`}>
    //           {TargetDiffs ? `${TargetDiffs}%` : "N/A"}
    //         </span>
    //       </div>
    //     )
    //   }
    // },

    {
      accessorKey: "target_diff_percent",
      header: "TARGET DIFF(%)",
      cell: ({ row }) => {
        const TargeDiff = row.original.target_diff_percent;

        let colorClass = "text-white";

        if (TargeDiff.includes("-")) {
          colorClass = "text-red-400";
        } else {
          colorClass = "text-green-400";
        }

        return (
          <div className="flex items-center justify-end">
            <span className={`font-medium uppercase ${colorClass}`}>
              {TargeDiff ? TargeDiff : "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "takeProfitPercentage",
      header: "TP (%)",

      accessorFn: (row) => {
        const TakeProfit = row.original.tpPercentage;

        const takeProfitPercentage = `${TakeProfit.toFixed(3)}%`;

        // const takeProfitPercentage = `${tpPercent.toFixed(3)}%`;

        if (row.signal === "Buy") {
          return takeProfitPercentage;
        }
      },

      cell: ({ row }) => {
        const signal = row.original.signal.toLowerCase();
        // const targetDiff = parseFloat(row.original.target_diff_percent);

        // const tpPercent = targetDiff * 0.85;
        const TakeProfit = row.original.tpPercentage;

        const takeProfitPercentage = `${TakeProfit.toFixed(3)}%`;

        return <span>{signal === "buy" ? takeProfitPercentage : "N/A"}</span>;
      },
    },

    {
      accessorKey: "stopLossPercentage",
      header: "SL (%)",

      accessorFn: (row) => {
        // const targetDiff = parseFloat(row.target_diff_percent);

        //  const slPercent = targetDiff * 0.75;

        // const stopLossPercentage = `${slPercent.toFixed(3)}%`;
        const stopLoss = row.original.slPercentage;

        const stopLossPercentage = `${stopLoss.toFixed(3)}%`;

        if (row.signal === "Buy") {
          return stopLossPercentage;
        }
      },

      cell: ({ row }) => {
        const signal = row.original.signal.toLowerCase();
        // const targetDiff = parseFloat(row.original.target_diff_percent);

        // const slPercent = targetDiff * 0.75;
        const stopLoss = row.original.slPercentage;

        const stopLossPercentage = `${stopLoss.toFixed(3)}%`;

        return <span>{signal === "buy" ? stopLossPercentage : "N/A"}</span>;
      },
    },
    // {
    //   accessorKey: "TrailingTakeProfit",
    //   header: "TTP(%)",

    //   accessorFn: (row) => {
    //     // const targetDiff = parseFloat(row.target_diff_percent);

    //     //  const slPercent = targetDiff * 0.75;

    //     // const stopLossPercentage = `${slPercent.toFixed(3)}%`;
    //     let TrailingTakeProfit = row.original.TTP;

    //     TrailingTakeProfit = `${TrailingTakeProfit.toFixed(3)}%`;

    //     if (row.signal === "Buy") {
    //       return TrailingTakeProfit;
    //     }
    //   },

    //   cell: ({ row }) => {
    //     const signal = row.original.signal.toLowerCase();
    //     // const targetDiff = parseFloat(row.original.target_diff_percent);

    //     let TrailingTakeProfit = row.original.TTP;

    //     TrailingTakeProfit = `${TrailingTakeProfit.toFixed(3)}%`;

    //     return <span>{signal === "buy" ? TrailingTakeProfit : "N/A"}</span>;
    //   },
    // },

    // {
    //   accessorKey: "TrailingStopLoss",
    //   header: "TSL(%)",

    //   accessorFn: (row) => {
    //     // const targetDiff = parseFloat(row.target_diff_percent);

    //     //  const slPercent = targetDiff * 0.75;

    //     // const stopLossPercentage = `${slPercent.toFixed(3)}%`;
    //     let TrailingStopLoss = row.original.TSL;

    //     TrailingStopLoss = `${TrailingStopLoss.toFixed(3)}%`;

    //     if (row.signal === "Buy") {
    //       return TrailingStopLoss;
    //     }
    //   },

    //   cell: ({ row }) => {
    //     const signal = row.original.signal.toLowerCase();
    //     // const targetDiff = parseFloat(row.original.target_diff_percent);

    //     let TrailingStopLoss = row.original.TSL;

    //     TrailingStopLoss = `${TrailingStopLoss.toFixed(3)}%`;

    //     return <span>{signal === "buy" ? TrailingStopLoss : "N/A"}</span>;
    //   },
    // },

    // {
    //   accessorKey: "RiskRewardRatio",
    //   header: "RRR",

    //   accessorFn: (row) => {
    //     const RRRsignal = row.original.riskRewardRatio;

    //     const RRR = `${RRRsignal.toFixed(2)}`;

    //     if (row.signal === "Buy") {
    //       return RRR;
    //     }
    //   },

    //   cell: ({ row }) => {
    //     const signal = row.original.signal.toLowerCase();
    //     // const targetDiff = parseFloat(row.original.target_diff_percent);

    //     // const slPercent = targetDiff * 0.75;
    //     const RRRsignal = row.original.riskRewardRatio;

    //     const RRR = `${RRRsignal.toFixed(2)}`;

    //     return <span>{signal === "buy" ? RRR : "N/A"}</span>;
    //   },
    // },
    {
      accessorKey: "predictedTime",
      header: "Predicted At",
      accessorFn: (row) => {
        if (!row.predictedTime || row.predictedTime === "N/A") return null;
        return DateTime.fromFormat(row.predictedTime, "yyyy.MM.dd HH:mm:ss", {
          zone: "UTC+1",
        }).toMillis(); // sorting uses this timestamp
      },
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
        if (row.hit_time === "Not Reached" || !row.hit_time)
          return "Not Reached";
        return DateTime.fromFormat(row.hit_time, "yyyy.MM.dd HH:mm:ss", {
          zone: "UTC+1",
        }).toMillis(); // sorting uses this timestamp
      },

      cell: ({ row }) => {
        // parseCustomDateString(row.original.hit_time) || "Not Reached";

        if (row.original.hit_time === "Not Reached" || !row.original.hit_time)
          return "Not Reached";
        const hitTime = parseCustomDateString(row.original.hit_time);

        let colorClass;
        if (row.original.hit_time === "Not Reached")
          colorClass = "text-red-400";
        else colorClass = "text-green-400";
        return (
          <div className="flex items-center justify-end">
            <span className={`font-medium ${colorClass}`}>{hitTime}</span>
          </div>
        );
      },
    },
  ];

  const handleExportToExcel = () => {
    const exportData = filteredSignals.map((row, index) => {
      const targetPrice = row.currentPriceAtPredicition * 1.016;

      return {
        "S/NO": index + 1,
        "TOKEN (NAME)": row.pairName,
        "Prediction Time Price (USDT)":
          row.currentPriceAtPredicition.toFixed(8),
        "TARGET PRICE (USDT)": targetPrice.toFixed(8),
        "CURRENT PRICE (USDT)": parseFloat(row.currentPrice).toFixed(8),
        "NOW DIFF (%)": row.now_diff_percent,
        "CURRENT SIGNAL": row.signal === "Buy" ? row.signal : "No Action",
        "TARGET DIFF (%)": row.target_diff_percent,
        "TP (%)": row.tpPercentage.toFixed(3),
        "SL (%)": row.slPercentage.toFixed(3),
        RRR: row.riskRewardRatio.toFixed(2),
        "Predicted At": parseCustomDateString(row.predictedTime),
        "Expires At": parseCustomDateString(row.expiryTime),
        "HIT STATUS": row.hit_status,
        "HIT TIME": row.hit_time,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Signals");

    const date = new Date();

    XLSX.writeFile(workbook, "pancake_price_predictions.xlsx");
  };

  return (
    <div className="min-h-screen secure-body-background text-white">
      {/* Header Navigation */}
      <header className="bg-[#212529] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center space-x-4">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="h-12 w-12 object-cover rounded-lg"
            />
            <h1 className="font-bold text-white text-lg">SECURE ARBITRAGE</h1>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Desktop Menu Dropdown */}
            <div className="hidden md:block">
              <MenuDropdown />
            </div>

            {/* Sign In (Desktop Only) */}
            <a
              href="https://securearbitrage.com/sign-in"
              className="hidden md:inline-block"
            >
              <Button
                style={{
                  background: "linear-gradient(45deg, #5B86E5, #36D1DC)",
                  color: "#FFFFFF",
                  padding: "8px",
                  fontSize: "16px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "0.3s ease",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                }}
              >
                Sign In
              </Button>
            </a>

            {/* Hamburger Menu (Mobile Only) */}
            <button
              className="text-white text-2xl md:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Drawer (Mobile Only) */}
        <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 text-center">
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

        <div className="flex justify-center items-center gap-5 mb-8">
          <TimezoneSelector
            onTimezoneChange={setTimezone}
            initialTimezone={timezone}
          />

          <div>
            <Button
              onClick={handleExportToExcel}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              <Download />
            </Button>
          </div>
        </div>

        {/* Signal Statistics */}
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-1 gap-4 mb-8 ">
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
            {/* <div className="text-center">
              <span className="text-yellow-400 font-medium">
                Hold:{" "}
                {filteredSignals.filter((s) => s.signal === "Hold").length}/
                {filteredSignals.length}
              </span>
            </div> */}
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

        {/* AccuracyStats */}
        {/* <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6">
          {accuracyStats?.pastAccuracy && !accuracyStats.pastAccuracy.includes("N/A") && (
            <div>
              <span>Past Accuracy: </span>
              {accuracyStats?.pastAccuracy}
            </div>
          )}
          <div>
            <span>Current Accuracy: </span>
            {accuracyStats?.currentAccuracy}
          </div>
        </div> */}

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
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
