
import { useState, useEffect, useMemo } from "react";
import { Loader, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [secondsLeft, setSecondsLeft]= useState(30);
  const [secondsFetched, setSecondsFetched] = useState(60);
  const [signals, setSignals] = useState([]);
  // const [globalSignals, setGlobalSignals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState(null);

   const API_URL = "https://pancakeswapsignal.onrender.com/api/signals"; // Your backend API

   let globalSignals;

 const fetchSignals = async () => {
  try {
    
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
  } catch (err) {
    console.error("Failed to fetch signals:", err);
    setError("signal is loading. please wait while it fetches.");
    setSignals([]); // ensure `signals` remains an array
  } finally {
    setLoading(false);
  }
};

const fetchGlobalSignals = () => {
  setLoading(true);
  setTimeout(() => {
    globalSignals = signals;
    setLoading(false);
  }, 3000); 
  
  return globalSignals;
  
}



  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === 1) {
          fetchGlobalSignals(); // trigger the fetch
          return 30; // reset timer
        }
        return prev - 1;
      });
    }, 1000); // every second

    return () => clearInterval(interval); // cleanup on unmount
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsFetched((prev) => {
        if (prev === 1) {
          fetchSignals(); // trigger the fetch
          return 60; // reset timer
        }
        return prev - 1;
      });
    }, 1000); // every second

    return () => clearInterval(interval); // cleanup on unmount
  }, []);


  //   // Format seconds into mm:ss
  const formatTimeSec = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Singapore',
    });
  };

  const sortedSignals = useMemo(() => {
    // Define the order of signal types
    const signalOrder = {
      'Buy': 1,
      'Hold': 2,
      'Sell': 3, // Assuming 'Sell' should be before 'Error' but after 'Buy/Hold'
      'Error': 4 // Errors go last
      // Add other signal types if you have them, e.g., 'Neutral', 'Insufficient Data'
    };

    return [...globalSignals].sort((a, b) => {
      const orderA = signalOrder[a.signal] || 99; // Default to a high number if signal type is unknown
      const orderB = signalOrder[b.signal] || 99;

      if (orderA === orderB) {
        // Secondary sort: if signal types are the same, sort by pair name alphabetically
        return a.pairName.localeCompare(b.pairName);
      }
      return orderA - orderB;
    });
  }, [globalSignals]);



  return (
    <div className="min-h-screen bg-slate-800 text-white">
      {/* Header Navigation */}
      <header className="bg-teal-600 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="bg-black p-2 rounded">
              <span className="text-teal-400 font-bold text-xl">₿</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-white hover:text-teal-200">Benefits</a>
              <a href="#" className="text-white hover:text-teal-200">Testimonials</a>
              <a href="#" className="text-white hover:text-teal-200">Performance</a>
              <a href="#" className="text-white hover:text-teal-200">FAQ</a>
              <a href="#" className="text-green-400 hover:text-green-300">Pancake.finance ↓</a>
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
          <h1 className="text-3xl md:text-4xl font-bold text-green-400 mb-4">
            Signals - Pancake.finance
          </h1>
          <p className="text-gray-400 mb-2">Next update in: {formatTimeSec(secondsLeft)}</p>
          <p className="text-gray-400">
            Time: {formatTime(currentTime)}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <span className="text-green-400 font-medium">Buy: {}</span>
          </div>
          <div className="text-center">
            <span className="text-red-400 font-medium">Sell: {}</span>
          </div>
          <div className="text-center">
            <span className="text-yellow-400 font-medium">Hold: {}</span>
          </div>
          <div className="text-center">
            <span className="text-orange-400 font-medium">Exit: {}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 h-2 rounded-full" style={{width: '100%'}}></div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-700 rounded-lg overflow-hidden overflow-x-auto">
          {loading?(
            <div className="flex items-center justify-center h-64">
              <Loader className="animate-spin text-green-400 h-8 w-8" />
              <span>Please wait while we fetch the signals. Some calculations are working in the background.</span>
            </div>
            
          ):(
            <Table>
              <TableHeader>
                <TableRow className="border-slate-600 hover:bg-slate-600">
                  <TableHead className="text-gray-300 font-medium">S/NO</TableHead>
                  <TableHead className="text-gray-300 font-medium">TOKEN (NAME) ↕</TableHead>
                  <TableHead className="text-gray-300 font-medium">CURRENT SIGNAL ↕</TableHead>
                  <TableHead className="text-gray-300 font-medium">CURRENT PRICE (USD) ↕</TableHead>
                  <TableHead className="text-gray-300 font-medium">CURRENT VOLUME ↕</TableHead>
                  <TableHead className="text-gray-300 font-medium">RSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSignals.map((signal, index) => (
                  <TableRow key={index} className="border-slate-600 hover:bg-slate-600">
                    <TableCell className="text-white">{index + 1}.</TableCell>
                    <TableCell className="text-white">
                      <span className="font-medium">{signal.pairName}</span>
                      <span className="text-gray-400 ml-2"></span>
                    </TableCell>
                    <TableCell>
                      <span className="text-yellow-400 font-medium">{signal.signal}</span>
                    </TableCell>
                    <TableCell className="text-white">{parseFloat(signal.currentPrice).toFixed(2) || "N/A"}</TableCell>
                    <TableCell className="text-gray-400">{parseFloat(signal.currentVolume).toFixed(2) || "N/A"}</TableCell>
                    <TableCell className="text-gray-400">{signal.rsi || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
           
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;

// import React, { useEffect, useState } from 'react';

// const TimerWithFetch = () => {
//   const [secondsLeft, setSecondsLeft] = useState(30);

//   // Function to fetch data
//   const fetchData = async () => {
//     try {
//       const response = await fetch('https://your-endpoint.com/api');
//       const data = await response.json();
//       console.log('Fetched data:', data);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setSecondsLeft((prev) => {
//         if (prev === 1) {
//           fetchData(); // trigger the fetch
//           return 30; // reset timer
//         }
//         return prev - 1;
//       });
//     }, 1000); // every second

//     return () => clearInterval(interval); // cleanup on unmount
//   }, []);

//   // Format seconds into mm:ss
//   const formatTime = (secs) => {
//     const minutes = Math.floor(secs / 60);
//     const seconds = secs % 60;
//     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//   };

//   return (
//     <div style={{ fontSize: '2rem', fontFamily: 'monospace' }}>
//       Countdown: {formatTime(secondsLeft)}
//     </div>
//   );
// };

// export default TimerWithFetch;
