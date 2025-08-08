import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DateTime } from "luxon";
import { Copy, Loader } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import monitoredTokens from "@/monitodTokens.json";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Cell } from "recharts";

const apiUrl = "https://backend.thedexbot.com/apis/contract-status";

const signals = "https://backend.thedexbot.com/apis/signals";


export default function ContractStatusPage() {
  const [processedContractData, setProcessedContractData] = useState([]);
  const [timeZoneLabel, setTimeZoneLabel] = useState("TIME");





  useEffect(() => {
    const fetchTimeZone = async () => {
      try {
        const response = await fetch("https://ipwho.is/");
        const data = await response.json();
        if (data.success) {
          const country = data.country;
          setTimeZoneLabel(`${country} Time`);
        }
      } catch (err) {
        console.error("Failed to fetch IP time zone info:", err);
      }
    };

    fetchTimeZone();
  }, []);

  const fetchContractStatus = async () => {
    const { data } = await axios.get(apiUrl);
    return data;
  };

  const fetchSignals = async () => {
    const { data } = await axios.get(signals);
    return data;
  };

  const {
    data: contractStatusData = [],
    isLoading,
    refetch,
    error: queryError,
  } = useQuery({
    queryKey: ["contracts"],
    queryFn: fetchContractStatus,
    refetchInterval: 2000, // Refetch every 1 seconds
  });

  const { data: signalsData = [] } = useQuery({
  queryKey: ["signals"],
  queryFn: fetchSignals,
  refetchInterval: 30000, // refresh every 30 sec
});

  const tokenMap = useMemo(() => {
    const map = new Map();
    monitoredTokens.monitoredTokens.forEach((token) => {
      map.set(token.symbol, token.name);
    });
    return map;
  }, []);

  const processContractData = useCallback(() => {
    if (!contractStatusData || !Array.isArray(contractStatusData)) {
      console.log(
        "Contract data is not available or not an array:",
        contractStatusData
      );
      return;
    }

    try {
      const processed = contractStatusData.map((item, index) => {
        const {
          type,
          name,
          token,
          tokenIn,
          tokenOut,
          amountIn,
          amountOut,
          txHash,
          timestamp,
        } = item;

        // Determine the token address for asset name
        let assetAddress: string | undefined = undefined;

        if (name) {
          const symbol = name.split("/")[0];
          const assetName = tokenMap.get(symbol) || symbol;
          return {
            ...item,
            serialNo: index + 1,
            asset: `${assetName} (${symbol})`,
            // amountIn: amountIn ? parseFloat(amountIn).toFixed(6) : "N/A",
            // amountOut: amountOut ? parseFloat(amountOut).toFixed(6) : "N/A",
            formattedTimestamp: timestamp
              ? DateTime.fromMillis(Number(timestamp)).toFormat(
                  "dd.MM.yyyy HH:mm:ss"
                )
              : "N/A",
          };
        }

        if (type === "Sell") {
          assetAddress = tokenIn;
        } else if (type === "Buy") {
          assetAddress = tokenOut;
        } else if (type === "TokenAdded") {
          assetAddress = token;
        }

        const address = assetAddress?.toLowerCase();
        const matched = monitoredTokens.monitoredTokens.find(
          (t) => t.address.toLowerCase() === address
        );

        const symbol =
          matched?.symbol ||
          (assetAddress
            ? `${assetAddress.slice(0, 6)}...${assetAddress.slice(-4)}`
            : "UNKNOWN");
        const assetName = matched?.name || "Unknown";

         // Match with signalsData
        // let matchedSignal = null;
        // if (signalsData && signalsData.length > 0) {
        //   matchedSignal = signalsData.find(
        //     s =>
        //       s.pairName &&
        //       s.pairName.toLowerCase().includes(symbol?.toLowerCase())
        //   );
        // }

         const matchedSignal = signalsData?.find(
        (s) => s.pairAddress?.toLowerCase() === address
         );


        const currentPrice = matchedSignal?.currentPrice ?? "N/A";
        const nowDiffPercent = matchedSignal?.now_diff_percent ?? "N/A";

       



        return {
          ...item,
          serialNo: index + 1,
          asset: `${assetName} (${symbol})`,
          amountIn: amountIn ? parseFloat(amountIn).toFixed(6) : "N/A",
          amountOut: amountOut ? parseFloat(amountOut).toFixed(6) : "N/A",
          formattedTimestamp: timestamp
            ? DateTime.fromMillis(Number(timestamp)).toFormat(
                "dd.MM.yyyy HH:mm:ss"
              )
            : "N/A",
          currentPrice,
          nowDiffPercent,
        };
      });

      setProcessedContractData(processed);
    } catch (err) {
      console.error("Error processing contract data:", err);
    }
  }, [contractStatusData, tokenMap, signalsData ]);

  useEffect(() => {
    processContractData();
  }, [contractStatusData, processContractData]);


  // console.log("this is processed contract data", processedContractData);

  const columns = [
    {
      accessorKey: "serialNo",
      header: "#",
      enableSorting: false,
    },
    {
      accessorKey: "type",
      header: "EVENT TYPE",
      cell: ({ row }) => {
        return (
          <span className="uppercase font-medium">{row.original.type}</span>
        );
      },
    },
    {
      accessorKey: "asset",
      header: "ASSET (SYMBOL)",
      cell: ({ row }) => {
        return <span className="uppercase">{row.original.asset}</span>;
      },
    },
    {
      accessorKey: "tokenAddress",
      header: "ASSET ADDRESS",
      cell: ({ row }) => {
        const { type, token, tokenIn, tokenOut } = row.original;

        let address = null;

        if (type === "TokenAdded") {
          address = token;
        } else if (type === "Sell") {
          address = tokenIn;
        } else if (type === "Buy") {
          address = tokenOut;
        }

        if (!address) return "N/A";

        const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
        const bscUrl = `https://bscscan.com/token/${address}`;
        const handleCopy = () => navigator.clipboard.writeText(address);

        return (
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-mono text-blue-400 hover:underline cursor-pointer"
              onClick={() => window.open(bscUrl)}
            >
              {short}
            </span>
            <Copy
              size={16}
              className="hover:text-blue-400 cursor-pointer"
              onClick={handleCopy}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "tokenIn",
      header: "ASSET IN",
      cell: ({ row }) => {
        const tokenOut = row.original.tokenOut;
        const bscUrl = `https://bscscan.com/token/${tokenOut}`;
        const handleCopy = () => navigator.clipboard.writeText(tokenOut);

        if (!tokenOut) return "N/A";
        const short = `${tokenOut.slice(0, 6)}...${tokenOut.slice(-4)}`;
        return (
          <div className="flex items-center gap-2">
            <span 
            onClick={() => window.open(bscUrl)}
            className="text-sm font-mono cursor-pointer">{short}</span>
            <Copy
            size={16}
            className="hover:text-blue-400 cursor-pointer"
            onClick={handleCopy}
             />

          </div>
        );
      },
    },
    {
      accessorKey: "tokenOut",
      header: "ASSET OUT",
      cell: ({ row }) => {
        const tokenIn = row.original.tokenIn;
        const bscUrl = `https://bscscan.com/token/${tokenIn}`;
        const handleCopy = () => navigator.clipboard.writeText(tokenIn);


        if (!tokenIn) return "N/A";
        const short = `${tokenIn.slice(0, 6)}...${tokenIn.slice(-4)}`;
        return (
          <div className="flex items-center gap-2">
            <span
            onClick={() => window.open(bscUrl)}
            className="text-sm font-mono cursor-pointer">{short}</span>
             <Copy
            size={16}
            className="hover:text-blue-400 cursor-pointer"
            onClick={handleCopy}
             />

          </div>
        );
      },
    },
    {
      accessorKey: "amountIn",
      header: "AMOUNT IN",
      cell: ({ row }) => {
        const amountIn = row.original.amountOut;
        const eventType = row.original.type;
        const assetName = row.original.asset.split("(")[1].split(")")[0];
        // const splitAssetName = assetName.split(" ")[0];



        if (!amountIn) return "N/A";

        if (eventType.toUpperCase() === "SELL") return `${amountIn} USDT`;

        return <span className="text-sm font-mono cursor-default">{amountIn} {assetName}</span>;
      }
    },
    {
      accessorKey: "amountOut",
      header: "AMOUNT OUT",
      cell: ({ row }) => {
        const amountOut = row.original.amountIn;
         const eventType = row.original.type;
        const assetName = row.original.asset.split("(")[1].split(")")[0];

        if (eventType.toUpperCase() === "BUY") return `${amountOut} USDT`;
        if (!amountOut) return "N/A";
        return <span className="text-sm font-mono cursor-default">{amountOut} {assetName}</span>;
      }
    },

    {

      accessorKey: "Price of Asset Bought",
      header: "PRICE BOUGHT",
      cell: ({ row }) => {
        const eventType = row.original.type;
        const amountBought = row.original.amountBought;

        if (!amountBought) return "N/A";
        if (eventType.toUpperCase() === "BUY") return `${amountBought} USDT`;
        // return <span className="text-sm font-mono cursor-default">{amountBought} USDT</span>;

        
      }

    },

    {
      accessorKey: "Current Price of Asset",
      header: "CURRENT PRICE",
      cell: ({ row }) => {
        const eventType = row.original.type;
        const currentPrice = row.original.currentPrice;

        if (eventType.toUpperCase() === "BUY") return `${Number(currentPrice).toFixed(8)} USDT`;
        if (!currentPrice) return "N/A";
        else return "N/A";
        // return <span className="text-sm font-mono cursor-default">{currentPrice} USDT</span>;
      }


    },
    {
      accessorKey: "Now Difference %",
      header: "NOW DIFF(%)",
       cell: ({ row }) => {
        const eventType = row.original.type;
        const nowDiff = row.original.nowDiffPercent;

        let colorClass;

        if (nowDiff?.includes("-")) colorClass = "text-red-400";
        else colorClass = "text-green-400";


        if (eventType.toUpperCase() === "BUY") {
          return <span className={`font-medium uppercase ${colorClass}`}>{nowDiff}</span>;
        };
        if (!nowDiff) return "N/A";
        else return "N/A";
        // return <span className="text-sm font-mono cursor-default">{currentPrice} USDT</span>;
      }


    },


    {
      accessorKey: "txHash",
      header: "TRANSACTION",
      cell: ({ row }) => {
        const hash = row.original.txHash;
        const shortHash = `${hash.slice(0, 6)}...${hash.slice(-4)}`;
        const txUrl = `https://bscscan.com/tx/${hash}`;
        const handleCopy = () => navigator.clipboard.writeText(hash);
        return (
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-mono text-blue-400 hover:underline cursor-pointer"
              onClick={() => window.open(txUrl)}
            >
              {shortHash}
            </span>
            <Copy
              size={16}
              className="hover:text-blue-400 cursor-pointer"
              onClick={handleCopy}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "formattedTimestamp",
      header: timeZoneLabel,
      cell: ({ row }) => {
        return (
          <span className="font-mono text-sm">
            {row.original.formattedTimestamp}
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold my-8  text-center">Contract Status</h1>
      <p className="text-center mb-8 text-blue-400 underline">
        {" "}
        <Link
          to="https://bscscan.com/address/0xa257b7cc03b962888c9812611fbcb843dd274477"
          target="_blank"
        >
          Contract Address
        </Link>
      </p>

      {/* Data Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-green-400 h-8 w-8 mr-4" />
          <span>Please wait while we fetch the signals...</span>
        </div>
      ) : (
        <DataTable columns={columns} data={processedContractData} />
      )}
    </div>
  );
}
