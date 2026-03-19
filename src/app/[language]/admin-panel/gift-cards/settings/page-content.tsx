"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useState, useEffect, useCallback } from "react";
import {
  useGetSettingsService,
  useUpdateSettingsService,
} from "@/services/api/services/settings";
import { useGetActiveGiftCardTemplatesService } from "@/services/api/services/gift-card-templates";
import { SquarespacePayLink } from "@/services/api/types/settings";
import { GiftCardTemplate } from "@/services/api/types/gift-card-template";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

function SettingsPage() {
  const [currency, setCurrency] = useState<"GBP" | "EUR" | "USD">("GBP");
  const [defaultRedemptionType, setDefaultRedemptionType] = useState<
    "partial" | "full"
  >("full");
  const [notificationEmails, setNotificationEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [paymentMode, setPaymentMode] = useState<"sandbox" | "production">(
    "sandbox"
  );
  const [paymentGateway, setPaymentGateway] = useState<
    "stripe" | "square" | "squarespace"
  >("stripe");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");
  const [squarespaceApiKey, setSquarespaceApiKey] = useState("");
  const [squarespacePollingInterval, setSquarespacePollingInterval] =
    useState(30);
  const [squarespacePayLinks, setSquarespacePayLinks] = useState<
    SquarespacePayLink[]
  >([]);
  const [templates, setTemplates] = useState<GiftCardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pay link dialog
  const [payLinkDialogOpen, setPayLinkDialogOpen] = useState(false);
  const [editingPayLink, setEditingPayLink] =
    useState<SquarespacePayLink | null>(null);
  const [plName, setPlName] = useState("");
  const [plProductName, setPlProductName] = useState("");
  const [plTemplateId, setPlTemplateId] = useState("");

  const getSettings = useGetSettingsService();
  const updateSettings = useUpdateSettingsService();
  const getActiveTemplates = useGetActiveGiftCardTemplatesService();

  useEffect(() => {
    Promise.all([getSettings(), getActiveTemplates()]).then(
      ([settingsRes, templatesRes]) => {
        if (settingsRes.status === HTTP_CODES_ENUM.OK && settingsRes.data) {
          const d = settingsRes.data;
          setCurrency(d.currency);
          setDefaultRedemptionType(d.defaultRedemptionType);
          setNotificationEmails(d.notificationEmails || []);
          setPaymentMode(d.paymentMode || "sandbox");
          setPaymentGateway(d.paymentGateway || "stripe");
          setStripeSecretKey(d.stripeSecretKey || "");
          setStripeWebhookSecret(d.stripeWebhookSecret || "");
          setSquarespaceApiKey(d.squarespaceApiKey || "");
          setSquarespacePollingInterval(d.squarespacePollingInterval || 30);
          setSquarespacePayLinks(d.squarespacePayLinks || []);
        }
        if (templatesRes.status === HTTP_CODES_ENUM.OK && templatesRes.data) {
          setTemplates(
            Array.isArray(templatesRes.data) ? templatesRes.data : []
          );
        }
        setLoading(false);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { status } = await updateSettings({
        currency,
        defaultRedemptionType,
        notificationEmails,
        paymentMode,
        paymentGateway,
        stripeSecretKey,
        stripeWebhookSecret,
        squarespaceApiKey,
        squarespacePollingInterval,
        squarespacePayLinks,
      });
      if (status === HTTP_CODES_ENUM.OK) {
        setSuccess("Settings saved. Refresh the page to see currency changes.");
      } else {
        setError("Failed to save settings.");
      }
    } catch {
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }, [
    currency,
    defaultRedemptionType,
    notificationEmails,
    paymentMode,
    paymentGateway,
    stripeSecretKey,
    stripeWebhookSecret,
    squarespaceApiKey,
    squarespacePollingInterval,
    squarespacePayLinks,
    updateSettings,
  ]);

  const addEmail = useCallback(() => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (notificationEmails.includes(email)) return;
    setNotificationEmails((prev) => [...prev, email]);
    setNewEmail("");
  }, [newEmail, notificationEmails]);

  const removeEmail = useCallback((email: string) => {
    setNotificationEmails((prev) => prev.filter((e) => e !== email));
  }, []);

  const openAddPayLink = () => {
    setEditingPayLink(null);
    setPlName("");
    setPlProductName("");
    setPlTemplateId(templates[0]?.id || "");
    setPayLinkDialogOpen(true);
  };

  const openEditPayLink = (pl: SquarespacePayLink) => {
    setEditingPayLink(pl);
    setPlName(pl.name);
    setPlProductName(pl.productName);
    setPlTemplateId(pl.templateId);
    setPayLinkDialogOpen(true);
  };

  const savePayLink = () => {
    if (!plName.trim() || !plProductName.trim() || !plTemplateId) return;
    if (editingPayLink) {
      setSquarespacePayLinks((prev) =>
        prev.map((pl) =>
          pl.id === editingPayLink.id
            ? {
                ...pl,
                name: plName.trim(),
                productName: plProductName.trim(),
                templateId: plTemplateId,
              }
            : pl
        )
      );
    } else {
      setSquarespacePayLinks((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: plName.trim(),
          productName: plProductName.trim(),
          templateId: plTemplateId,
        },
      ]);
    }
    setPayLinkDialogOpen(false);
  };

  const deletePayLink = (id: string) => {
    setSquarespacePayLinks((prev) => prev.filter((pl) => pl.id !== id));
  };

  const getTemplateName = (templateId: string) =>
    templates.find((t) => t.id === templateId)?.name || templateId;

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="md">
      <Grid container spacing={3} pt={3}>
        <Grid size={12}>
          <Typography variant="h4">Settings</Typography>
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

        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Currency
            </Typography>
            <TextField
              select
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value as "GBP" | "EUR" | "USD")
              }
              fullWidth
              helperText="Currency displayed across the site and in emails"
            >
              <MenuItem value="GBP">£ — British Pounds (GBP)</MenuItem>
              <MenuItem value="EUR">€ — Euros (EUR)</MenuItem>
              <MenuItem value="USD">$ — US Dollars (USD)</MenuItem>
            </TextField>
          </Paper>
        </Grid>

        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Default Redemption Type
            </Typography>
            <TextField
              select
              value={defaultRedemptionType}
              onChange={(e) =>
                setDefaultRedemptionType(e.target.value as "partial" | "full")
              }
              fullWidth
              helperText={
                defaultRedemptionType === "full"
                  ? "Single use — full balance redeemed at once (default for new templates)"
                  : "Partial — balance can be used across multiple visits (default for new templates)"
              }
            >
              <MenuItem value="full">Single Use (Full Balance)</MenuItem>
              <MenuItem value="partial">Partial Redemption Allowed</MenuItem>
            </TextField>
          </Paper>
        </Grid>

        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment Mode
            </Typography>
            <TextField
              select
              value={paymentMode}
              onChange={(e) =>
                setPaymentMode(e.target.value as "sandbox" | "production")
              }
              fullWidth
              helperText={
                paymentMode === "sandbox"
                  ? "Sandbox — no real charges are made. Gift cards are created immediately for testing."
                  : "Production — real payments are processed through your chosen payment gateway."
              }
            >
              <MenuItem value="sandbox">Sandbox (Testing)</MenuItem>
              <MenuItem value="production">Production (Live Payments)</MenuItem>
            </TextField>

            {paymentMode === "production" && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Payment Gateway
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                      variant="outlined"
                      onClick={() => setPaymentGateway("stripe")}
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        borderColor:
                          paymentGateway === "stripe"
                            ? "primary.main"
                            : undefined,
                        borderWidth: paymentGateway === "stripe" ? 2 : 1,
                      }}
                    >
                      <Typography variant="subtitle2">Stripe</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Accept card payments via Stripe Checkout
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        opacity: 0.5,
                        cursor: "not-allowed",
                      }}
                    >
                      <Typography variant="subtitle2">
                        Square{" "}
                        <Chip label="Coming Soon" size="small" sx={{ ml: 1 }} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Accept payments via Square
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                      variant="outlined"
                      onClick={() => setPaymentGateway("squarespace")}
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        borderColor:
                          paymentGateway === "squarespace"
                            ? "primary.main"
                            : undefined,
                        borderWidth: paymentGateway === "squarespace" ? 2 : 1,
                      }}
                    >
                      <Typography variant="subtitle2">Squarespace</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Auto-create gift cards from Squarespace orders
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {paymentGateway === "stripe" && (
                  <Box sx={{ mt: 3 }}>
                    <TextField
                      label="Stripe Secret Key"
                      value={stripeSecretKey}
                      onChange={(e) => setStripeSecretKey(e.target.value)}
                      fullWidth
                      type="password"
                      helperText="Starts with sk_live_ or sk_test_"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Stripe Webhook Secret"
                      value={stripeWebhookSecret}
                      onChange={(e) => setStripeWebhookSecret(e.target.value)}
                      fullWidth
                      type="password"
                      helperText={`Starts with whsec_. Set your webhook endpoint to: ${process.env.NEXT_PUBLIC_API_URL}/v1/gift-cards/stripe-webhook`}
                    />
                  </Box>
                )}

                {paymentGateway === "squarespace" && (
                  <Box sx={{ mt: 3 }}>
                    <TextField
                      label="Squarespace API Key"
                      value={squarespaceApiKey}
                      onChange={(e) => setSquarespaceApiKey(e.target.value)}
                      fullWidth
                      type="password"
                      helperText="Generate this in your Squarespace site under Settings → Advanced → Developer API Keys"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Polling Interval (seconds)"
                      value={squarespacePollingInterval}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v)) setSquarespacePollingInterval(v);
                      }}
                      fullWidth
                      type="number"
                      inputProps={{ min: 30, max: 300 }}
                      helperText="How often to check Squarespace for new orders (30–300 seconds)"
                      sx={{ mb: 3 }}
                    />

                    <Typography variant="subtitle1" gutterBottom>
                      Connected Pay Links
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Each pay link product name must be unique and must not be
                      a substring of another. For example, do not create both
                      &quot;Gift Cards&quot; and &quot;Buy Gift Cards&quot; —
                      the exact product name from your Squarespace pay link is
                      used for matching.
                    </Alert>

                    {squarespacePayLinks.map((pl) => (
                      <Paper
                        key={pl.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2">{pl.name}</Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontFamily: "monospace" }}
                          >
                            {pl.productName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Template: {getTemplateName(pl.templateId)}
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => openEditPayLink(pl)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => deletePayLink(pl.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}

                    {squarespacePayLinks.length === 0 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        No pay links configured. Add one to start processing
                        Squarespace orders.
                      </Typography>
                    )}

                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={openAddPayLink}
                      sx={{ mt: 1 }}
                    >
                      Add Pay Link
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Email List
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These addresses receive a notification for every gift card
              purchase and are BCC&apos;d on all purchase confirmation emails.
            </Typography>

            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <TextField
                label="Email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEmail()}
                fullWidth
                size="small"
              />
              <Button
                variant="outlined"
                onClick={addEmail}
                sx={{ minWidth: 80 }}
              >
                Add
              </Button>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {notificationEmails.map((email) => (
                <Chip
                  key={email}
                  label={email}
                  onDelete={() => removeEmail(email)}
                />
              ))}
              {notificationEmails.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No notification emails configured.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={12}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            size="large"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </Grid>
      </Grid>

      {/* Pay Link Add/Edit Dialog */}
      <Dialog
        open={payLinkDialogOpen}
        onClose={() => setPayLinkDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingPayLink ? "Edit Pay Link" : "Add Pay Link"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Display Name"
            value={plName}
            onChange={(e) => setPlName(e.target.value)}
            fullWidth
            helperText="Internal name for this pay link"
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            label="Squarespace Product Name"
            value={plProductName}
            onChange={(e) => setPlProductName(e.target.value)}
            fullWidth
            helperText="The exact product name as it appears in Squarespace"
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Gift Card Template"
            value={plTemplateId}
            onChange={(e) => setPlTemplateId(e.target.value)}
            fullWidth
          >
            {templates.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayLinkDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={savePayLink}
            disabled={!plName.trim() || !plProductName.trim() || !plTemplateId}
          >
            {editingPayLink ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default withPageRequiredAuth(SettingsPage, {
  roles: [RoleEnum.ADMIN],
});
