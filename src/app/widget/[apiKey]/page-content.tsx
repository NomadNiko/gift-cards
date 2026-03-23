"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import { useGetWidgetByApiKeyService } from "@/services/api/services/widgets";
import { useGetGiftCardTemplatePublicService } from "@/services/api/services/gift-card-templates";
import { usePurchaseGiftCardService } from "@/services/api/services/gift-cards";
import { useCreateCheckoutSessionService } from "@/services/api/services/gift-cards";
import { useGetGiftCardByStripeSessionService } from "@/services/api/services/gift-cards";
import { useGetPublicPaymentConfigService } from "@/services/api/services/settings";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { Widget } from "@/services/api/types/widget";
import { GiftCardTemplate } from "@/services/api/types/gift-card-template";
import { GiftCard } from "@/services/api/types/gift-card";
import { useCurrency } from "@/services/currency/currency-provider";
import { Special_Elite } from "next/font/google";

const specialElite = Special_Elite({ weight: "400", subsets: ["latin"] });

export default function WidgetPageContent() {
  const { symbol: CURRENCY_SYMBOL } = useCurrency();
  const params = useParams<{ apiKey: string }>();
  const searchParams = useSearchParams();

  const getWidget = useGetWidgetByApiKeyService();
  const getTemplate = useGetGiftCardTemplatePublicService();
  const purchaseGiftCard = usePurchaseGiftCardService();
  const createCheckoutSession = useCreateCheckoutSessionService();
  const getPaymentConfig = useGetPublicPaymentConfigService();
  const getGiftCardByStripeSession = useGetGiftCardByStripeSessionService();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [widget, setWidget] = useState<Widget | null>(null);
  const [template, setTemplate] = useState<GiftCardTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [amount, setAmount] = useState("25");
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [purchasedCard, setPurchasedCard] = useState<GiftCard | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<{
    paymentMode: string;
    paymentGateway: string;
  }>({ paymentMode: "sandbox", paymentGateway: "stripe" });

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const pollForGiftCard = useCallback(
    (sessionId: string) => {
      setPurchasing(true);
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts++;
        try {
          const { status, data } = await getGiftCardByStripeSession(sessionId);
          if (status === HTTP_CODES_ENUM.OK && data?.id) {
            if (pollRef.current) clearInterval(pollRef.current);
            setPurchasedCard(data);
            setActiveStep(4);
            setPurchasing(false);
          }
        } catch {
          // keep polling
        }
        if (attempts >= 30) {
          if (pollRef.current) clearInterval(pollRef.current);
          setPurchasing(false);
          setError(
            "Payment received but gift voucher is still processing. Check your email shortly."
          );
        }
      }, 2000);
    },
    [getGiftCardByStripeSession]
  );

  useEffect(() => {
    async function load() {
      if (!params.apiKey) return;
      try {
        const [widgetRes, paymentRes] = await Promise.all([
          getWidget(params.apiKey),
          getPaymentConfig(),
        ]);
        if (paymentRes.status === HTTP_CODES_ENUM.OK && paymentRes.data) {
          setPaymentConfig(paymentRes.data);
        }
        if (widgetRes.status === HTTP_CODES_ENUM.OK && widgetRes.data) {
          setWidget(widgetRes.data);
          const { status: tStatus, data: tData } = await getTemplate(
            widgetRes.data.templateId
          );
          if (tStatus === HTTP_CODES_ENUM.OK) setTemplate(tData);
        } else {
          setError("Widget not found.");
        }
      } catch {
        setError("Failed to load widget.");
      } finally {
        setLoading(false);
      }

      const sessionId = searchParams.get("session_id");
      if (sessionId) {
        pollForGiftCard(sessionId);
      }
    }
    load();
  }, [
    params.apiKey,
    getWidget,
    getTemplate,
    getPaymentConfig,
    searchParams,
    pollForGiftCard,
  ]);

  const handlePurchase = async () => {
    if (!widget || !template) return;
    setPurchasing(true);
    setError(null);

    const purchaseData = {
      templateId: widget.templateId,
      widgetId: widget.id,
      originalAmount: parseFloat(amount),
      purchaserName,
      purchaserEmail,
      recipientName: recipientName || undefined,
      recipientEmail: recipientEmail || undefined,
      notes: notes || undefined,
    };

    try {
      if (
        paymentConfig.paymentMode === "production" &&
        paymentConfig.paymentGateway === "stripe"
      ) {
        const fallbackUrl = `${window.location.origin}/widget/${params.apiKey}`;
        const redirectBase = widget.redirectUrl || fallbackUrl;
        const separator = redirectBase.includes("?") ? "&" : "?";
        const { status, data } = await createCheckoutSession({
          ...purchaseData,
          successUrl: `${redirectBase}${separator}session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: redirectBase,
        });
        if (status === HTTP_CODES_ENUM.OK && data?.url) {
          const target = window.top || window;
          target.location.href = data.url;
        } else {
          setError("Failed to start payment. Please try again.");
          setPurchasing(false);
        }
        return;
      } else {
        const { status, data } = await purchaseGiftCard(purchaseData);
        if (status === HTTP_CODES_ENUM.CREATED) {
          setPurchasedCard(data);
          setActiveStep(4);
        } else {
          setError("Purchase failed. Please try again.");
        }
      }
    } catch {
      setError("Purchase failed. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const canProceedStep0 = parseFloat(amount) >= 1;
  const canProceedStep1 =
    purchaserName.trim() !== "" && purchaserEmail.includes("@");

  if (loading) return <LinearProgress />;
  if (error && !widget)
    return (
      <Container maxWidth="sm" sx={{ pt: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  if (!widget) return null;

  const c = widget.customization;
  const bgColor = c.backgroundColor || "#f4ecdc";
  const textColor = c.textColor || undefined;
  const labelColor = c.fieldLabelColor || undefined;
  const fieldColor = c.fieldTextColor || undefined;
  const secondaryColor = c.secondaryColor || c.primaryColor;

  const tfSx = {
    "& .MuiInputLabel-root": labelColor ? { color: labelColor } : {},
    "& .MuiInputBase-input": fieldColor ? { color: fieldColor } : {},
    "& .MuiOutlinedInput-notchedOutline": labelColor
      ? { borderColor: labelColor }
      : {},
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: bgColor,
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{ py: { xs: 1, sm: 3 }, height: "100vh", overflow: "hidden" }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 3 },
            height: "100%",
            overflow: "auto",
            bgcolor: bgColor,
          }}
        >
          {" "}
          {widget.customization.headerText && (
            <Typography
              variant="h5"
              textAlign="center"
              gutterBottom
              sx={{
                color: c.primaryColor,
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
              }}
            >
              {widget.customization.headerText}
            </Typography>
          )}
          {!widget.customization.headerText && (
            <Typography
              variant="h5"
              textAlign="center"
              gutterBottom
              sx={{
                fontFamily: specialElite.style.fontFamily,
                fontWeight: 700,
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
                color: textColor,
              }}
            >
              {c.titleDisplay || "The Hurstwood"}
            </Typography>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {activeStep === 0 && (
            <Box>
              {template?.image && (
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <img
                    src={template.image}
                    alt={template.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: 250,
                      borderRadius: 8,
                    }}
                  />
                </Box>
              )}
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  color: textColor,
                }}
              >
                Choose an amount
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                {[25, 50, 75, 100, 150, 200].map((v) => (
                  <Button
                    key={v}
                    size="small"
                    variant={amount === String(v) ? "contained" : "outlined"}
                    onClick={() => setAmount(String(v))}
                    sx={{
                      backgroundColor:
                        amount === String(v) ? c.primaryColor : undefined,
                      borderColor:
                        amount !== String(v) ? secondaryColor : undefined,
                      color: amount !== String(v) ? secondaryColor : undefined,
                    }}
                  >
                    {CURRENCY_SYMBOL}
                    {v}
                  </Button>
                ))}
              </Box>
              <TextField
                label="Custom Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputProps={{ min: 1, step: 0.01 }}
                fullWidth
                size="small"
                sx={{ mb: 2, ...tfSx }}
              />
              <Button
                variant="contained"
                fullWidth
                disabled={!canProceedStep0}
                onClick={() => setActiveStep(1)}
                sx={{
                  backgroundColor: c.primaryColor,
                }}
              >
                Continue
              </Button>
            </Box>
          )}
          {activeStep === 1 && (
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  color: textColor,
                }}
              >
                Your Information
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={12}>
                  <TextField
                    label="Your Name *"
                    value={purchaserName}
                    onChange={(e) => setPurchaserName(e.target.value)}
                    fullWidth
                    size="small"
                    sx={tfSx}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="Your Email *"
                    type="email"
                    value={purchaserEmail}
                    onChange={(e) => setPurchaserEmail(e.target.value)}
                    fullWidth
                    size="small"
                    sx={tfSx}
                  />
                </Grid>
                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ color: textColor, opacity: 0.7 }}
                  >
                    Sending to someone else? (optional)
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="Recipient Name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    fullWidth
                    size="small"
                    sx={tfSx}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="Recipient Email"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    fullWidth
                    size="small"
                    sx={tfSx}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="Personal Message (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    sx={tfSx}
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(0)}
                  sx={{ borderColor: secondaryColor, color: secondaryColor }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={!canProceedStep1}
                  onClick={() => setActiveStep(2)}
                  sx={{
                    backgroundColor: c.primaryColor,
                  }}
                >
                  Continue
                </Button>
              </Box>
            </Box>
          )}
          {activeStep === 2 && (
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  color: textColor,
                }}
              >
                Disclaimer
              </Typography>
              <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
                <Typography variant="body2" sx={{ color: textColor, mb: 1 }}>
                  All vouchers are valid for 12 months from the date of
                  purchase.
                </Typography>
                <Typography variant="body2" sx={{ color: textColor, mb: 1 }}>
                  Vouchers purchased online are subject to a 3.5% Transaction
                  Fee.
                </Typography>
                <Typography variant="body2" sx={{ color: textColor, mb: 1 }}>
                  To redeem a voucher, please make a reservation through one of
                  the following methods:
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{ color: textColor, pl: 2, mb: 1 }}
                >
                  Website:{" "}
                  <a
                    href="https://www.thehurstwood.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: c.primaryColor }}
                  >
                    www.thehurstwood.com
                  </a>
                  <br />
                  Email:{" "}
                  <a
                    href="mailto:bookings@thehurstwood.com"
                    style={{ color: c.primaryColor }}
                  >
                    bookings@thehurstwood.com
                  </a>
                  <br />
                  Phone:{" "}
                  <a href="tel:+441825732257" style={{ color: c.primaryColor }}>
                    +44 1825 732257
                  </a>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: textColor, fontWeight: 700 }}
                >
                  THIS VOUCHER DOES NOT HAVE A CASH VALUE.
                </Typography>
              </Paper>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(1)}
                  sx={{ borderColor: secondaryColor, color: secondaryColor }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setActiveStep(3)}
                  sx={{
                    backgroundColor: c.primaryColor,
                  }}
                >
                  I Understand, Continue
                </Button>
              </Box>
            </Box>
          )}
          {activeStep === 3 && (
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  color: textColor,
                }}
              >
                Review Your Order
              </Typography>
              <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
                <Typography variant="body2" sx={{ color: textColor }}>
                  <strong>Gift Voucher Value:</strong> {CURRENCY_SYMBOL}
                  {parseFloat(amount).toFixed(2)}
                </Typography>
                {(() => {
                  const feeType = template?.adminFeeType;
                  const feeVal = template?.adminFeeValue || 0;
                  const amt = parseFloat(amount);
                  const fee =
                    feeType === "fixed"
                      ? feeVal
                      : feeType === "percentage"
                        ? Math.round(amt * feeVal) / 100
                        : 0;
                  if (!fee) return null;
                  return (
                    <>
                      <Typography variant="body2" sx={{ color: textColor }}>
                        <strong>Processing Fee:</strong> {CURRENCY_SYMBOL}
                        {fee.toFixed(2)}
                        {feeType === "percentage" ? ` (${feeVal}%)` : ""}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: textColor, fontWeight: 700, mt: 0.5 }}
                      >
                        Total: {CURRENCY_SYMBOL}
                        {(amt + fee).toFixed(2)}
                      </Typography>
                    </>
                  );
                })()}
                <Typography variant="body2" sx={{ color: textColor }}>
                  <strong>From:</strong> {purchaserName} ({purchaserEmail})
                </Typography>
                {recipientName && (
                  <Typography variant="body2" sx={{ color: textColor }}>
                    <strong>To:</strong> {recipientName}{" "}
                    {recipientEmail && `(${recipientEmail})`}
                  </Typography>
                )}
                {notes && (
                  <Typography variant="body2" sx={{ color: textColor }}>
                    <strong>Message:</strong> {notes}
                  </Typography>
                )}
              </Paper>
              <Alert severity="info" sx={{ mb: 2 }}>
                {paymentConfig.paymentMode === "sandbox"
                  ? "Sandbox mode — no charge will be made. Gift card will be created immediately."
                  : "You will be redirected to complete payment securely."}
              </Alert>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(2)}
                  sx={{ borderColor: secondaryColor, color: secondaryColor }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handlePurchase}
                  disabled={purchasing}
                  sx={{
                    backgroundColor: c.primaryColor,
                  }}
                >
                  {purchasing
                    ? paymentConfig.paymentMode === "production"
                      ? "Waiting for payment..."
                      : "Processing..."
                    : c.buttonText || "Buy Gift Voucher"}
                </Button>
              </Box>
            </Box>
          )}
          {activeStep === 4 && purchasedCard && (
            <Box sx={{ textAlign: "center" }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Gift card purchased successfully! An email has been sent to{" "}
                {purchasedCard.purchaserEmail}.
              </Alert>
              <Paper
                variant="outlined"
                sx={{ p: { xs: 2, sm: 3 }, mb: 2, display: "inline-block" }}
              >
                <Typography variant="body2" color="text.secondary">
                  Gift Voucher Code
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: c.primaryColor,
                    letterSpacing: 2,
                    fontSize: { xs: "1.5rem", sm: "2.125rem" },
                  }}
                >
                  {purchasedCard.code}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ mt: 1, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
                >
                  {CURRENCY_SYMBOL}
                  {purchasedCard.originalAmount.toFixed(2)}
                </Typography>
              </Paper>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1,
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => {
                    window.open(
                      `gift-cards/view/${purchasedCard.code}`,
                      "_blank"
                    );
                  }}
                  sx={{
                    backgroundColor: c.primaryColor,
                    flex: { xs: 1, sm: "auto" },
                  }}
                >
                  View & Print
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setActiveStep(0);
                    setPurchasedCard(null);
                    setPurchaserName("");
                    setPurchaserEmail("");
                    setRecipientName("");
                    setRecipientEmail("");
                    setNotes("");
                    setAmount("25");
                  }}
                  sx={{
                    flex: { xs: 1, sm: "auto" },
                    borderColor: secondaryColor,
                    color: secondaryColor,
                  }}
                >
                  Buy Another
                </Button>
              </Box>
            </Box>
          )}
          {c.footerText && (
            <Typography
              variant="caption"
              textAlign="center"
              display="block"
              sx={{ mt: 2, color: textColor, opacity: 0.7 }}
            >
              {c.footerText}
            </Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
