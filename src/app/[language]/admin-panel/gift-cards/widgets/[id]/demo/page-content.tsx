"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
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
import Link from "@/components/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useGetWidgetService } from "@/services/api/services/widgets";
import { useGetGiftCardTemplateService } from "@/services/api/services/gift-card-templates";
import { usePurchaseGiftCardService } from "@/services/api/services/gift-cards";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { Widget } from "@/services/api/types/widget";
import { GiftCardTemplate } from "@/services/api/types/gift-card-template";
import { GiftCard } from "@/services/api/types/gift-card";
import { useCurrency } from "@/services/currency/currency-provider";
import { Special_Elite } from "next/font/google";

const specialElite = Special_Elite({ weight: "400", subsets: ["latin"] });

function WidgetDemo() {
  const { symbol: CURRENCY_SYMBOL } = useCurrency();
  const params = useParams<{ id: string }>();

  const getWidget = useGetWidgetService();
  const getTemplate = useGetGiftCardTemplateService();
  const purchaseGiftCard = usePurchaseGiftCardService();

  const [widget, setWidget] = useState<Widget | null>(null);
  const [template, setTemplate] = useState<GiftCardTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Purchase form state
  const [activeStep, setActiveStep] = useState(0);
  const [amount, setAmount] = useState("25");
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [purchasedCard, setPurchasedCard] = useState<GiftCard | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    async function load() {
      if (!params.id) return;
      try {
        const { status, data } = await getWidget(params.id);
        if (status === HTTP_CODES_ENUM.OK && data) {
          setWidget(data);
          const { status: tStatus, data: tData } = await getTemplate(
            data.templateId
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
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handlePurchase = useCallback(async () => {
    if (!widget || !template) return;
    setPurchasing(true);
    setError(null);
    try {
      const { status, data } = await purchaseGiftCard({
        templateId: widget.templateId,
        widgetId: widget.id,
        originalAmount: parseFloat(amount),
        purchaserName,
        purchaserEmail,
        recipientName: recipientName || undefined,
        recipientEmail: recipientEmail || undefined,
        notes: notes || undefined,
      });
      if (status === HTTP_CODES_ENUM.CREATED) {
        setPurchasedCard(data);
        setActiveStep(3);
      } else {
        setError("Purchase failed. Please try again.");
      }
    } catch {
      setError("Purchase failed. Please try again.");
    } finally {
      setPurchasing(false);
    }
  }, [
    widget,
    template,
    amount,
    purchaserName,
    purchaserEmail,
    recipientName,
    recipientEmail,
    notes,
    purchaseGiftCard,
  ]);

  const canProceedStep0 = parseFloat(amount) >= 1;
  const canProceedStep1 =
    purchaserName.trim() !== "" && purchaserEmail.includes("@");

  if (loading) return <LinearProgress />;
  if (error && !widget)
    return (
      <Container maxWidth="md" sx={{ pt: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  if (!widget) return null;

  const embedCode = `<div id="gift-card-widget-${widget.apiKey}"></div>
<script src="${process.env.NEXT_PUBLIC_API_URL}/v1/widgets/loader/${widget.apiKey}/widget.js"></script>`;

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4} pt={3}>
        {/* Left: Widget Simulation */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h4" gutterBottom>
            Widget Demo: {widget.name}
          </Typography>

          <Paper
            elevation={3}
            sx={{
              p: 3,
              border: `2px solid ${widget.customization.primaryColor}`,
              borderRadius: 2,
            }}
          >
            {widget.customization.headerText && (
              <Typography
                variant="h5"
                textAlign="center"
                gutterBottom
                sx={{ color: widget.customization.primaryColor }}
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
                }}
              >
                The Hurstwood
              </Typography>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Step 0: Amount */}
            {activeStep === 0 && (
              <Box>
                {template?.image && (
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                <Typography variant="h6" gutterBottom>
                  Choose an amount
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                  {[25, 50, 75, 100, 150, 200].map((v) => (
                    <Button
                      key={v}
                      variant={amount === String(v) ? "contained" : "outlined"}
                      onClick={() => setAmount(String(v))}
                      sx={{
                        backgroundColor:
                          amount === String(v)
                            ? widget.customization.primaryColor
                            : undefined,
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
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  disabled={!canProceedStep0}
                  onClick={() => setActiveStep(1)}
                  sx={{
                    backgroundColor: widget.customization.primaryColor,
                  }}
                >
                  Continue
                </Button>
              </Box>
            )}

            {/* Step 1: Details */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Your Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      label="Your Name *"
                      value={purchaserName}
                      onChange={(e) => setPurchaserName(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Your Email *"
                      type="email"
                      value={purchaserEmail}
                      onChange={(e) => setPurchaserEmail(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Sending to someone else? (optional)
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Recipient Name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Recipient Email"
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      fullWidth
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
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button variant="outlined" onClick={() => setActiveStep(0)}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={!canProceedStep1}
                    onClick={() => setActiveStep(2)}
                    sx={{
                      backgroundColor: widget.customization.primaryColor,
                    }}
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 2: Review */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Review Your Order
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography>
                    <strong>Amount:</strong> {CURRENCY_SYMBOL}
                    {parseFloat(amount).toFixed(2)}
                  </Typography>
                  <Typography>
                    <strong>From:</strong> {purchaserName} ({purchaserEmail})
                  </Typography>
                  {recipientName && (
                    <Typography>
                      <strong>To:</strong> {recipientName}{" "}
                      {recipientEmail && `(${recipientEmail})`}
                    </Typography>
                  )}
                  {notes && (
                    <Typography>
                      <strong>Message:</strong> {notes}
                    </Typography>
                  )}
                </Paper>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Payment integration coming soon. This is a test purchase — no
                  charge will be made.
                </Alert>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button variant="outlined" onClick={() => setActiveStep(1)}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handlePurchase}
                    disabled={purchasing}
                    sx={{
                      backgroundColor: widget.customization.primaryColor,
                    }}
                  >
                    {purchasing
                      ? "Processing..."
                      : widget.customization.buttonText || "Buy Gift Voucher"}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 3: Success */}
            {activeStep === 3 && purchasedCard && (
              <Box sx={{ textAlign: "center" }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Gift card purchased successfully! An email has been sent to{" "}
                  {purchasedCard.purchaserEmail}.
                </Alert>
                <Paper
                  variant="outlined"
                  sx={{ p: 3, mb: 2, display: "inline-block" }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Gift Voucher Code
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: widget.customization.primaryColor,
                      letterSpacing: 2,
                    }}
                  >
                    {purchasedCard.code}
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>
                    {CURRENCY_SYMBOL}
                    {purchasedCard.originalAmount.toFixed(2)}
                  </Typography>
                </Paper>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    component={Link}
                    href={`/gift-cards/view/${purchasedCard.code}`}
                    sx={{
                      backgroundColor: widget.customization.primaryColor,
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
                    sx={{ flex: { xs: 1, sm: "auto" } }}
                  >
                    Buy Another
                  </Button>
                </Box>
              </Box>
            )}

            {widget.customization.footerText && (
              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
                display="block"
                sx={{ mt: 2 }}
              >
                {widget.customization.footerText}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Right: Embed Instructions */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="h5" gutterBottom>
            Embed Instructions
          </Typography>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Widget Details
            </Typography>
            <Typography variant="body2">
              <strong>Name:</strong> {widget.name}
            </Typography>
            <Typography variant="body2">
              <strong>API Key:</strong>{" "}
              <code style={{ fontSize: 12 }}>{widget.apiKey}</code>
            </Typography>
            <Typography variant="body2">
              <strong>Template:</strong> {template?.name || widget.templateId}
            </Typography>
            <Typography variant="body2">
              <strong>Allowed Domains:</strong>{" "}
              {widget.allowedDomains.length > 0
                ? widget.allowedDomains.join(", ")
                : "Any domain"}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Step 1: Add the embed code
            </Typography>
            <Typography variant="body2" gutterBottom>
              Copy and paste this code into your website where you want the gift
              card widget to appear:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={embedCode}
              slotProps={{ input: { readOnly: true } }}
              sx={{
                "& textarea": { fontFamily: "monospace", fontSize: 12 },
              }}
            />
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
              onClick={() => navigator.clipboard.writeText(embedCode)}
            >
              Copy to Clipboard
            </Button>
          </Paper>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Step 2: Customize (optional)
            </Typography>
            <Typography variant="body2">
              The widget automatically loads its styling from the configuration
              you set when creating it. To change colors, button text, or
              branding, edit the widget settings.
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Step 3: Test
            </Typography>
            <Typography variant="body2">
              Use the live demo on the left to test the full purchase flow. The
              gift voucher will be created in the system and emails will be sent
              to the addresses provided. No payment is charged during the proof
              of concept phase.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(WidgetDemo, { roles: [RoleEnum.ADMIN] });
