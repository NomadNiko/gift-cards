export interface Redemption {
  id: string;
  amount: number;
  redeemedBy: string;
  redeemedAt: string;
  notes?: string;
  remainingBalance: number;
  reversed?: boolean;
  reversedAt?: string;
  reversedBy?: string;
}

export interface GiftCard {
  id: string;
  code: string;
  templateId: string;
  widgetId?: string;
  originalAmount: number;
  currentBalance: number;
  purchaseDate: string;
  purchaserEmail: string;
  purchaserName: string;
  recipientEmail?: string;
  recipientName?: string;
  status: "active" | "partially_redeemed" | "fully_redeemed" | "cancelled";
  redemptions: Redemption[];
  notes?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}
