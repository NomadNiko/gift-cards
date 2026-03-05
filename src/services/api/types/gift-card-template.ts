import { CodePosition } from "./code-position";

export interface GiftCardTemplate {
  id: string;
  name: string;
  description: string;
  image: string;
  codePosition: CodePosition;
  redemptionType: "partial" | "full";
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
