import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DateTime } from "luxon";
import { Copy, Loader } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

export default function ContractStatusPage() {
  const apiUrl = "https://backend.thedexbot.com/apis/contract-status";

  const fetchContractStatus = async () => {
    const { data } = await axios.get(apiUrl);
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

  const columns = [
    {
      accessorKey: "type",
      header: "EVENT TYPE",
      cell: ({ row }) => {
        const type = row.original.type;
        return <span className="uppercase font-medium">{type}</span>;
      },
    },
    {
      accessorKey: "tokenName",
      header: "TOKEN NAME",
      cell: ({ row }) => {
        const type = row.original.type;
        if (type === "TokenAdded") {
          return (
            <span className="uppercase font-medium">
              {row.original.name || "UNKNOWN"}
            </span>
          );
        }
        return "N/A";
      },
    },
    {
      accessorKey: "tokenAddress",
      header: "TOKEN ADDRESS",
      cell: ({ row }) => {
        const type = row.original.type;
        if (type === "TokenAdded") {
          const token = row.original.token;
          const short = `${token.slice(0, 6)}...${token.slice(-4)}`;
          const bscUrl = `https://bscscan.com/token/${token}`;
          const handleCopy = () => navigator.clipboard.writeText(token);
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
        }
        return "N/A";
      },
    },

    {
      accessorKey: "tokenIn",
      header: "TOKEN IN",
      cell: ({ row }) => {
        const tokenIn = row.original.tokenIn;
        if (!tokenIn) return "N/A";
        const short = `${tokenIn.slice(0, 6)}...${tokenIn.slice(-4)}`;
        return (
          <span className="text-sm font-mono cursor-default">{short}</span>
        );
      },
    },
    {
      accessorKey: "tokenOut",
      header: "TOKEN OUT",
      cell: ({ row }) => {
        const tokenOut = row.original.tokenOut;
        if (!tokenOut) return "N/A";
        const short = `${tokenOut.slice(0, 6)}...${tokenOut.slice(-4)}`;
        return (
          <span className="text-sm font-mono cursor-default">{short}</span>
        );
      },
    },
    {
      accessorKey: "amountIn",
      header: "AMOUNT IN",
      cell: ({ row }) => {
        return row.original.amountIn
          ? parseFloat(row.original.amountIn).toFixed(6)
          : "N/A";
      },
    },
    {
      accessorKey: "amountOut",
      header: "AMOUNT OUT",
      cell: ({ row }) => {
        return row.original.amountOut
          ? parseFloat(row.original.amountOut).toFixed(6)
          : "N/A";
      },
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
      accessorKey: "timestamp",
      header: "TIME",
      cell: ({ row }) => {
        const time = row.original.timestamp;
        if (!time) return "N/A";

        const formatted = DateTime.fromMillis(Number(time)).toFormat(
          "dd.MM.yyyy HH:mm:ss"
        );
        return <span className="font-mono text-sm">{formatted}</span>;
      },
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold my-8  text-center">Contract Status</h1>

      {/* Data Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-green-400 h-8 w-8 mr-4" />
          <span>Please wait while we fetch the signals...</span>
        </div>
      ) : (
        <DataTable columns={columns} data={contractStatusData} />
      )}
    </div>
  );
}
