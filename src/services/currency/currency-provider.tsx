"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { API_URL } from "@/services/api/config";
import { CURRENCY_SYMBOLS } from "@/services/api/types/settings";

type CurrencyContextType = {
  symbol: string;
  code: string;
};

const CurrencyContext = createContext<CurrencyContextType>({
  symbol: "£",
  code: "GBP",
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyContextType>({
    symbol: "£",
    code: "GBP",
  });

  useEffect(() => {
    fetch(`${API_URL}/v1/settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.currency) {
          setCurrency({
            symbol: CURRENCY_SYMBOLS[data.currency] || "£",
            code: data.currency,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <CurrencyContext.Provider value={currency}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
