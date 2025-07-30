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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setPriceBought: (val: any) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUserBalance: (val: any) => void,
  setTxhash: (val: string) => void,
  setTokenName: (val: string) => void
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

    setTokenName(tokenName);

    // Step 3: Check contract's BUSD balance
    const busdBalance: bigint = await contract.getDepositBalance(BUSD);
    const busdBalaneresult = formatEther(busdBalance);
    // console.log("this is the busdBalanresult", busdBalaneresult);


    // console.log("this is the busd balance", busdBalance);
    setUserBalance(busdBalaneresult);

    if (busdBalance <= 0n) {
      alert("No BUSD deposited in the smart contract.");
      return;
    }

    // Step 4: Get expected output from PancakeSwap
    const path = [BUSD.toLowerCase(), tokenAddress.toLowerCase()];
    const amountsOut: bigint[] = await router.getAmountsOut(busdBalance, path);
    const minAmountOut: bigint = amountsOut[1];

    console.log("this is the minAmountOut", minAmountOut);

    // Apply slippage: BigInt-safe
    const adjustedMinOut = minAmountOut - (minAmountOut * BigInt(Math.floor(SLIPPAGE_PERCENT * 1000)) / 100000n);

    // Step 5: Execute buy
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 mins
    const buyTx = await contract.buyASSET(BUSD, busdBalance, tokenAddress, adjustedMinOut, deadline);
    const receipt = await buyTx.wait();

    setTxhash(receipt.hash);
    if(receipt){
         const amountIn = parseUnits('1', 18);
            const priceBought = await router.getAmountsOut(amountIn, path);

            // console.log("priceBought", priceBought);
            const priceBought1 = formatEther(priceBought[0]);
            const priceBoughtz = formatEther(priceBought[1]);
            const price = Number(priceBought1) / Number(priceBoughtz);
            // console.log("this is the amount out", amountOut);
            setPriceBought(price);
        }
    // setPriceBought(parseFloat(formatEther(minAmountOut)));

    alert("✅ Token bought successfully!");
  } catch (error) {
    console.error("❌ BuyToken Error:", error);
    alert("Something went wrong. Please try again.");
  }
};

export const SellToken = async (
  tokenAddress: string,
  setTxhash: (val: string) => void
): Promise<void> => {
  try {
    if (!window.ethereum) throw new Error("MetaMask not found");

    await window.ethereum.request({ method: "eth_requestAccounts" }); // ensures wallet connection
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(CONTRACT_ADDRESS, AutomatedTradingBotABI, signer);
    const router = new ethers.Contract(ROUTER_ADDRESS, PancakeRouterABI, provider);

    const path = [tokenAddress.toLowerCase(), BUSD.toLowerCase()];

    // 1. Get token balance from contract
    const tokenBalance: bigint = await contract.getTokenBalance(tokenAddress);
    if (tokenBalance <= 0n) {
      alert("No tokens available in the contract to sell.");
      return;
    }

    const approveTx = await contract.setAssets(tokenAddress); // use setAssets to approve
    await approveTx.wait();

    // 2. Get expected BUSD output
    const amountsOut: bigint[] = await router.getAmountsOut(tokenBalance, path);
    const expectedBUSD = amountsOut[1];

    // 3. Apply slippage
    const adjustedMinOut = expectedBUSD - (expectedBUSD * BigInt(Math.floor(SLIPPAGE_PERCENT * 1000)) / 100000n);
    const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes

    // 4. Call smart contract to sell token
    const sellTx = await contract.sellASSET(tokenAddress, tokenBalance, BUSD.toLowerCase(), adjustedMinOut, deadline);
    const receipt = await sellTx.wait();

    setTxhash(receipt.hash);
    alert("✅ Token sold successfully!");
  } catch (error) {
    console.error("❌ SellToken Error:", error);
    alert("Something went wrong while selling. Please try again.");
  }
}
