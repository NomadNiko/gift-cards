import type { Metadata } from "next";
import QrRedirect from "./page-content";

export const metadata: Metadata = { title: "Gift Voucher" };

export default function Page() {
  return <QrRedirect />;
}
