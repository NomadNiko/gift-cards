import type { Metadata } from "next";
import TemplatesList from "./page-content";

export const metadata: Metadata = {
  title: "Gift Voucher Templates",
};

export default function Page() {
  return <TemplatesList />;
}
