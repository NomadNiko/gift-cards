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
  codePrefix: string;
  qrPosition?: QrPosition;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
