import type { Metadata } from "next";
import QrRedirect from "./page-content";

export const metadata: Metadata = { title: "Gift Card" };

export default function Page() {
  return <QrRedirect />;
}
