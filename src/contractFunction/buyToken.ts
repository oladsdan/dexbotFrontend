import { ethers, formatEther, parseUnits } from "ethers";
import { MetaMaskInpageProvider  } from "@metamask/providers";
import AutomatedTradingBotABI from "./abis/AutomatedTradingBot.json";
import PancakeRouterABI from "./abis/PancakeRouterV2.json";


declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider ; // or: StreamProvider if you're using `@metamask/providers`
  }
}

// Constants
const CONTRACT_ADDRESS = "0xa257B7Cc03B962888c9812611FBCb843Dd274477";
const ROUTER_ADDRESS = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const BUSD = "0x55d398326f99059fF775485246999027B3197955";

// Slippage settings
const SLIPPAGE_PERCENT = 0.5; // 0.5%

export const BuyToken = async (
  tokenName: string,
  tokenAddress: string,
  setPriceBought: (val: number) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUserBalance: (val: any) => void,
  setTxhash: (val: string) => void
): Promise<void> => {
  try {
    if (!window.ethereum) throw new Error("MetaMask not found");

    // 🔥 Ask MetaMask to connect wallet — this triggers the popup
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(CONTRACT_ADDRESS, AutomatedTradingBotABI, signer);
    const router = new ethers.Contract(ROUTER_ADDRESS, PancakeRouterABI, provider);

    // Step 1: Check if token is allowed
    const allowedCount: bigint = await contract.getAllowedTokensCount();
    let isAllowed = false;

    for (let i = 0; i < Number(allowedCount); i++) {
      const token = await contract.allowedTokens(i);
      if (token.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()) {
        isAllowed = true;
        break;
      }
    }

    if (!isAllowed) {
      const tx = await contract.addNewAsset(tokenName, tokenAddress);
      await tx.wait();
    }

    // Step 2: Approve PancakeSwap Router for BUSD
    const approvalTx = await contract.setAssets(BUSD);
    await approvalTx.wait();

    // Step 3: Check contract's BUSD balance
    const busdBalance: bigint = await contract.getDepositBalance(BUSD);
    setUserBalance(formatEther(busdBalance));

    if (busdBalance <= 0n) {
      alert("No BUSD deposited in the smart contract.");
      return;
    }

    // Step 4: Get expected output from PancakeSwap
    const path = [BUSD, tokenAddress];
    const amountsOut: bigint[] = await router.getAmountsOut(busdBalance, path);
    const minAmountOut: bigint = amountsOut[1];

    // Apply slippage: BigInt-safe
    const adjustedMinOut = minAmountOut - (minAmountOut * BigInt(Math.floor(SLIPPAGE_PERCENT * 1000)) / 100000n);

    // Step 5: Execute buy
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 mins
    const buyTx = await contract.buyASSET(BUSD, busdBalance, tokenAddress, adjustedMinOut, deadline);
    const receipt = await buyTx.wait();

    setTxhash(receipt.hash);
    if(receipt){
         const amountIn = parseUnits('1', 18);
            const priceBout = await router.getAmountsOut(amountIn, path);
            setPriceBought(parseFloat(formatEther(amountsOut[1])));
        }
    // setPriceBought(parseFloat(formatEther(minAmountOut)));

    alert("✅ Token bought successfully!");
  } catch (error) {
    console.error("❌ BuyToken Error:", error);
    alert("Something went wrong. Please try again.");
  }
};
