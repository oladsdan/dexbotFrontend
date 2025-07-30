import React, { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

// Define the shape of the context value
interface StatusContextType {
  priceBought: number;
  setPriceBought: Dispatch<SetStateAction<number>>;
  userBalance: number;
  setUserBalance: Dispatch<SetStateAction<number>>;
  txhash: string;
  setTxhash: Dispatch<SetStateAction<string>>;
  tokenName: string;
  setTokenName: Dispatch<SetStateAction<string>>;
  tokenAddress: string;
  setTokenAddress: Dispatch<SetStateAction<string>>;
}

// Create context with undefined default (safer for TS inference)
export const StatusContext = createContext<StatusContextType | undefined>(undefined);

// Props for the provider
interface StatusProviderProps {
  children: ReactNode;
}

export const StatusProvider: React.FC<StatusProviderProps> = ({ children }) => {
  const [priceBought, setPriceBought] = useState<number>(0);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [txhash, setTxhash] = useState<string>("");
  const [tokenName, setTokenName]= useState<string>("");
  const [tokenAddress, setTokenAddress]= useState<string>("");

  return (
    <StatusContext.Provider
      value={{ priceBought, setPriceBought, userBalance, setUserBalance, txhash, setTxhash, tokenName, setTokenName, tokenAddress, setTokenAddress }}
    >
      {children}
    </StatusContext.Provider>
  );
};
