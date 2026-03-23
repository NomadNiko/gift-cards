import type { Metadata } from "next";
import GenerateGiftCard from "./page-content";

export const metadata: Metadata = {
  title: "Generate Gift Voucher",
};

export default function Page() {
  return <GenerateGiftCard />;
}
