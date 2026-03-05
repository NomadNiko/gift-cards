"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  useGetGiftCardByCodeService,
  useGetGiftCardsByEmailService,
} from "@/services/api/services/gift-cards";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { GiftCard } from "@/services/api/types/gift-card";
import { useCurrency } from "@/services/currency/currency-provider";
import { useSearchParams } from "next/navigation";

const statusColors: Record<
  string,
  "success" | "warning" | "error" | "default"
> = {
  active: "success",
  partially_redeemed: "warning",
  fully_redeemed: "default",
  cancelled: "error",
};

export default function BalanceLookup() {
  const { symbol: CURRENCY_SYMBOL } = useCurrency();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("code") || "");
  const [results, setResults] = useState<GiftCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const autoSearched = useRef(false);

  const lookupByCode = useGetGiftCardByCodeService();
  const lookupByEmail = useGetGiftCardsByEmailService();

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setError(null);
    setResults([]);
    setLoading(true);
    setSearched(true);
    try {
      if (q.includes("@")) {
        const { status, data } = await lookupByEmail(q);
        if (status === HTTP_CODES_ENUM.OK) {
          setResults(data);
          if (data.length === 0)
            setError("No gift cards found for this email.");
        }
      } else {
        const { status, data } = await lookupByCode(q.toUpperCase());
        if (status === HTTP_CODES_ENUM.OK && data) {
          setResults([data]);
        } else {
          setError("Gift card not found.");
        }
      }
    } catch {
      setError("Gift card not found.");
    } finally {
      setLoading(false);
    }
  }, [query, lookupByCode, lookupByEmail]);

  useEffect(() => {
    if (searchParams.get("code") && !autoSearched.current) {
      autoSearched.current = true;
      handleSearch();
    }
  }, [searchParams, handleSearch]);

  return (
    <Container maxWidth="sm">
      <Grid container spacing={3} pt={6}>
        <Grid size={12} sx={{ textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Check Gift Card Balance
          </Typography>
          <Typography color="text.secondary">
            Enter your gift card code or email address
          </Typography>
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Gift Card Code or Email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="GC-XXXX-XXXX or email@example.com"
              fullWidth
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{ minWidth: 100 }}
            >
              Search
            </Button>
          </Box>
        </Grid>

        {error && (
          <Grid size={12}>
            <Alert severity="info">{error}</Alert>
          </Grid>
        )}

        {results.map((gc) => (
          <Grid size={12} key={gc.id}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontFamily: "monospace", fontWeight: 700 }}
                >
                  {gc.code}
                </Typography>
                <Chip
                  label={gc.status.replace("_", " ")}
                  color={statusColors[gc.status] || "default"}
                />
              </Box>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Original Amount
                  </Typography>
                  <Typography variant="h6">
                    {CURRENCY_SYMBOL}
                    {gc.originalAmount.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Current Balance
                  </Typography>
                  <Typography
                    variant="h6"
                    color={
                      gc.currentBalance > 0 ? "success.main" : "text.secondary"
                    }
                  >
                    {CURRENCY_SYMBOL}
                    {gc.currentBalance.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">
                    Purchased: {new Date(gc.purchaseDate).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}

        {searched && !loading && results.length === 0 && !error && (
          <Grid size={12}>
            <Typography color="text.secondary" textAlign="center">
              No results found.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
