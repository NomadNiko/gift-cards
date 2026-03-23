import type { Metadata } from "next";
import GiftCardView from "./page-content";

export const metadata: Metadata = {
  title: "View Gift Voucher",
};

export default function Page() {
  return <GiftCardView />;
}
