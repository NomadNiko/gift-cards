import type { Metadata } from "next";
import PurchasesList from "./page-content";

export const metadata: Metadata = {
  title: "Gift Voucher Purchases",
};

export default function Page() {
  return <PurchasesList />;
}
