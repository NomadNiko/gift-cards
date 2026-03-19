"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import UndoIcon from "@mui/icons-material/Undo";
import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  useGetGiftCardByCodeService,
  useRedeemGiftCardService,
  useUnredeemGiftCardService,
} from "@/services/api/services/gift-cards";
import { useGetGiftCardTemplateService } from "@/services/api/services/gift-card-templates";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { GiftCard } from "@/services/api/types/gift-card";
import { GiftCardTemplate } from "@/services/api/types/gift-card-template";
import { useCurrency } from "@/services/currency/currency-provider";

function RedeemPage() {
  const { symbol: CURRENCY_SYMBOL } = useCurrency();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const [code, setCode] = useState(initialCode);
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
  const [template, setTemplate] = useState<GiftCardTemplate | null>(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lookupService = useGetGiftCardByCodeService();
  const redeemService = useRedeemGiftCardService();
  const unredeemService = useUnredeemGiftCardService();
  const getTemplate = useGetGiftCardTemplateService();

  const isFullRedemption = !template || template.redemptionType === "full";

  const [confirmUnredeem, setConfirmUnredeem] = useState<{
    id: string;
    amount: number;
  } | null>(null);

  const handleLookup = useCallback(async () => {
    setError(null);
    setSuccess(null);
    setGiftCard(null);
    setTemplate(null);
    if (!code.trim()) return;
    setLoading(true);
    try {
      const { status, data } = await lookupService(code.trim().toUpperCase());
      if (status === HTTP_CODES_ENUM.OK && data) {
        setGiftCard(data);
        const { status: ts, data: td } = await getTemplate(data.templateId);
        if (ts === HTTP_CODES_ENUM.OK) setTemplate(td);
      } else {
        setError("Gift card not found.");
      }
    } catch {
      setError("Gift card not found.");
    } finally {
      setLoading(false);
    }
  }, [code, lookupService, getTemplate]);

  const didAutoLookup = useRef(false);
  useEffect(() => {
    if (initialCode && !didAutoLookup.current) {
      didAutoLookup.current = true;
      handleLookup();
    }
  }, [initialCode, handleLookup]);

  const handleRedeem = useCallback(async () => {
    if (!giftCard) return;
    setError(null);
    setSuccess(null);

    let redeemAmount: number;
    if (isFullRedemption) {
      redeemAmount = giftCard.currentBalance;
    } else {
      redeemAmount = parseFloat(amount);
      if (isNaN(redeemAmount) || redeemAmount <= 0) {
        setError("Enter a valid amount.");
        return;
      }
      if (redeemAmount > giftCard.currentBalance) {
        setError("Amount exceeds current balance.");
        return;
      }
    }

    setLoading(true);
    try {
      const { status, data } = await redeemService(giftCard.id, {
        amount: isFullRedemption ? undefined : redeemAmount,
        notes: notes || undefined,
      });
      if (status === HTTP_CODES_ENUM.OK) {
        setGiftCard(data);
        setAmount("");
        setNotes("");
        setSuccess(
          `Redeemed ${CURRENCY_SYMBOL}${redeemAmount.toFixed(2)}. Remaining balance: ${CURRENCY_SYMBOL}${data.currentBalance.toFixed(2)}`
        );
      }
    } catch {
      setError("Redemption failed.");
    } finally {
      setLoading(false);
    }
  }, [giftCard, amount, notes, redeemService, isFullRedemption]);

  const handleUnredeem = useCallback(async () => {
    if (!giftCard || !confirmUnredeem) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const { status, data } = await unredeemService(giftCard.id, {
        redemptionId: confirmUnredeem.id,
      });
      if (status === HTTP_CODES_ENUM.OK) {
        setGiftCard(data);
        setSuccess(
          `Reversed ${CURRENCY_SYMBOL}${confirmUnredeem.amount.toFixed(2)}. Balance restored to ${CURRENCY_SYMBOL}${data.currentBalance.toFixed(2)}`
        );
      }
    } catch {
      setError("Failed to reverse redemption.");
    } finally {
      setLoading(false);
      setConfirmUnredeem(null);
    }
  }, [giftCard, confirmUnredeem, unredeemService, CURRENCY_SYMBOL]);

  return (
    <Container maxWidth="md">
      <Grid container spacing={3} pt={3}>
        <Grid size={12}>
          <Typography variant="h4">Redeem Gift Card</Typography>
        </Grid>

        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Gift Card Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="GC-XXXX-XXXX"
                fullWidth
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                sx={{
                  "& input": {
                    fontFamily: "monospace",
                    fontSize: { xs: 14, sm: 18 },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleLookup}
                disabled={loading}
                sx={{ minWidth: { xs: 80, sm: 120 }, flexShrink: 0 }}
              >
                Lookup
              </Button>
            </Box>
          </Paper>
        </Grid>

        {error && (
          <Grid size={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
        {success && (
          <Grid size={12}>
            <Alert severity="success">{success}</Alert>
          </Grid>
        )}

        {giftCard && (
          <>
            <Grid size={12}>
              <Paper sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="body2" color="text.secondary">
                      Code
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontFamily: "monospace", fontWeight: 700 }}
                    >
                      {giftCard.code}
                    </Typography>
                  </Grid>
                  <Grid size={6} sx={{ textAlign: "right" }}>
                    <Chip
                      label={giftCard.status.replace("_", " ")}
                      color={
                        giftCard.status === "active"
                          ? "success"
                          : giftCard.status === "partially_redeemed"
                            ? "warning"
                            : "default"
                      }
                    />
                  </Grid>
                  <Grid size={4}>
                    <Typography variant="body2" color="text.secondary">
                      Original Amount
                    </Typography>
                    <Typography variant="h6">
                      {CURRENCY_SYMBOL}
                      {giftCard.originalAmount.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography variant="body2" color="text.secondary">
                      Current Balance
                    </Typography>
                    <Typography
                      variant="h6"
                      color={
                        giftCard.currentBalance > 0
                          ? "success.main"
                          : "text.secondary"
                      }
                    >
                      {CURRENCY_SYMBOL}
                      {giftCard.currentBalance.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography variant="body2" color="text.secondary">
                      Purchaser
                    </Typography>
                    <Typography>{giftCard.purchaserName}</Typography>
                  </Grid>
                </Grid>

                {giftCard.currentBalance > 0 &&
                  giftCard.status !== "cancelled" && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="h6" gutterBottom>
                        {isFullRedemption
                          ? "Redeem Full Balance"
                          : "Redeem Amount"}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          alignItems: "flex-start",
                        }}
                      >
                        {!isFullRedemption && (
                          <TextField
                            label="Amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            inputProps={{
                              min: 0.01,
                              max: giftCard.currentBalance,
                              step: 0.01,
                            }}
                            sx={{ width: 160 }}
                          />
                        )}
                        <TextField
                          label="Notes (optional)"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          sx={{ flex: 1 }}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleRedeem}
                          disabled={loading}
                          sx={{ minWidth: 120, height: 56 }}
                        >
                          {isFullRedemption
                            ? `Redeem ${CURRENCY_SYMBOL}${giftCard.currentBalance.toFixed(2)}`
                            : "Redeem"}
                        </Button>
                      </Box>
                      {isFullRedemption && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1, display: "block" }}
                        >
                          This gift card is single-use. The full balance will be
                          redeemed.
                        </Typography>
                      )}
                    </>
                  )}
              </Paper>
            </Grid>

            {giftCard.redemptions.length > 0 && (
              <Grid size={12}>
                <Typography variant="h6" gutterBottom>
                  Redemption History
                </Typography>
                <Paper sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          Date
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          Amount
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          Remaining
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          Notes
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          Status
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {giftCard.redemptions.map((r) => (
                        <TableRow
                          key={r.id}
                          sx={
                            r.reversed
                              ? { opacity: 0.5, textDecoration: "line-through" }
                              : undefined
                          }
                        >
                          <TableCell
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                          >
                            {new Date(r.redeemedAt).toLocaleString()}
                          </TableCell>
                          <TableCell
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                          >
                            {CURRENCY_SYMBOL}
                            {r.amount.toFixed(2)}
                          </TableCell>
                          <TableCell
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                          >
                            {CURRENCY_SYMBOL}
                            {r.remainingBalance.toFixed(2)}
                          </TableCell>
                          <TableCell
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                          >
                            {r.notes || "-"}
                          </TableCell>
                          <TableCell>
                            {r.reversed ? (
                              <Chip label="Reversed" size="small" />
                            ) : (
                              <Tooltip title="Undo this redemption">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() =>
                                    setConfirmUnredeem({
                                      id: r.id,
                                      amount: r.amount,
                                    })
                                  }
                                >
                                  <UndoIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            )}
          </>
        )}
      </Grid>

      <Dialog open={!!confirmUnredeem} onClose={() => setConfirmUnredeem(null)}>
        <DialogTitle>Reverse Redemption</DialogTitle>
        <DialogContent>
          Restore {CURRENCY_SYMBOL}
          {confirmUnredeem?.amount.toFixed(2)} to this gift card&apos;s balance?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmUnredeem(null)}>Cancel</Button>
          <Button
            onClick={handleUnredeem}
            variant="contained"
            color="warning"
            disabled={loading}
          >
            Reverse
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default withPageRequiredAuth(RedeemPage, { roles: [RoleEnum.ADMIN] });
