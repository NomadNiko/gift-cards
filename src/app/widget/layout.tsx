import "../globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import CssBaseline from "@mui/material/CssBaseline";
import type { Metadata } from "next";
import ThemeProvider from "@/components/theme/widget-theme-provider";
import QueryClientProvider from "@/services/react-query/query-client-provider";
import queryClient from "@/services/react-query/query-client";
import { CurrencyProvider } from "@/services/currency/currency-provider";

export const metadata: Metadata = {
  title: "Gift Voucher Widget",
};

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <CssBaseline />
            <CurrencyProvider>{children}</CurrencyProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
