import type { Metadata } from "next";
import RedeemPage from "./page-content";

export const metadata: Metadata = {
  title: "Redeem Gift Voucher",
};

export default function Page() {
  return <RedeemPage />;
}
