import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { StatusContext } from "@/context/statusContext";
import { SellToken } from "@/contractFunction/buyToken";
import {
  ExternalLink,
  TrendingUp,
  Calendar,
  Hash,
  DollarSign,
  Coins,
} from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

// Replace this with data from context, props, or API


export default function TransactionPage() {

  let Ada = "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47";

  Ada =Ada.toLowerCase();

  const navigate = useNavigate();
  
   const {priceBought, setPriceBought, userBalance, setUserBalance, txhash, setTxhash, tokenAddress, tokenName} = useContext(StatusContext);

   console.log("this is the priceBought", priceBought);
   console.log("this is the userBalance", userBalance);
   console.log("this is the transaction hash", txhash);



   const handleSellToken = async(
  tokenAddress: string,
  setTxhash: (val: string) => void
) => {
  console.log("Sell button clicked");
 await SellToken(tokenAddress, setTxhash);

  // Optional: navigate after 5s
  setTimeout(() => {
    navigate("/password-protected"); // replace with your actual route
  }, 5000);
    };

  const transaction = {
  symbol: tokenName,
  priceBought: priceBought.toFixed(6),
  usdtUsed: Number(userBalance).toFixed(3),
  txHash: `https://bscscan.com/tx/${txhash}`,
  date: new Date().toLocaleString(),
};



  return (
    <div className="secure-body-background min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg border  overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 p-6 text-white">
              <h1 className="text-xl font-semibold">Transaction Details</h1>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Asset Symbol */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <Coins className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">
                    Asset (Symbol)
                  </span>
                </div>
                <span className="font-semibold text-gray-900">
                  {transaction.symbol}
                </span>
              </div>

              {/* Price Bought */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">
                    Price Bought
                  </span>
                </div>
                <span className="font-semibold text-gray-900">
                  ${transaction.priceBought}
                </span>
              </div>

              {/* USDT Used */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">USDT Used</span>
                </div>
                <span className="font-semibold text-gray-900">
                  ${transaction.usdtUsed}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">Date</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {new Date(transaction.date).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>

              {/* Transaction Hash */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <Hash className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">Transaction</span>
                </div>
                <a
                  href={`https://bscscan.com/tx/${transaction.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-colors group w-full"
                >
                  <code className="flex-1 text-sm font-mono text-gray-700 truncate">
                    {transaction.txHash}
                  </code>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                </a>
              </div>



              {/* sellToken */}
              <Button onClick={() => handleSellToken(tokenAddress.toLowerCase(), setTxhash)}>SELL</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
