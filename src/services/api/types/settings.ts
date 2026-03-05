export interface Settings {
  id: string;
  currency: "GBP" | "EUR" | "USD";
  defaultRedemptionType: "partial" | "full";
  notificationEmails: string[];
  updatedAt: string;
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  EUR: "€",
  USD: "$",
};
