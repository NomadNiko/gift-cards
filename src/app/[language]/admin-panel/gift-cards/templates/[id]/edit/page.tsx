import type { Metadata } from "next";
import EditTemplate from "./page-content";

export const metadata: Metadata = {
  title: "Edit Gift Voucher Template",
};

export default function Page() {
  return <EditTemplate />;
}
