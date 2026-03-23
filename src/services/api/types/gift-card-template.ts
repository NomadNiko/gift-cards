import { CodePosition } from "./code-position";

export interface QrPosition {
  x: number;
  y: number;
  size: number;
}

export interface GiftCardTemplate {
  id: string;
  name: string;
  description: string;
  image: string;
  codePosition: CodePosition;
  redemptionType: "partial" | "full";
  expirationDate?: string;
  expirationMonths?: number;
  codePrefix: string;
  qrPosition?: QrPosition;
  adminFeeType?: "none" | "fixed" | "percentage";
  adminFeeValue?: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
