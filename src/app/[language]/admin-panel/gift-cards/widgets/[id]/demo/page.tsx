import type { Metadata } from "next";
import WidgetDemo from "./page-content";

export const metadata: Metadata = {
  title: "Widget Demo & Test Purchase",
};

export default function Page() {
  return <WidgetDemo />;
}
