import type { Metadata } from "next";
import BalanceLookup from "./page-content";

export const metadata: Metadata = {
  title: "Check Gift Voucher Balance",
};

export default function Page() {
  return <BalanceLookup />;
}
