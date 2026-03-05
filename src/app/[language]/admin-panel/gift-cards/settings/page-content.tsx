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
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import { useState, useEffect, useCallback } from "react";
import {
  useGetSettingsService,
  useUpdateSettingsService,
} from "@/services/api/services/settings";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

function SettingsPage() {
  const [currency, setCurrency] = useState<"GBP" | "EUR" | "USD">("GBP");
  const [defaultRedemptionType, setDefaultRedemptionType] = useState<
    "partial" | "full"
  >("full");
  const [notificationEmails, setNotificationEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getSettings = useGetSettingsService();
  const updateSettings = useUpdateSettingsService();

  useEffect(() => {
    getSettings()
      .then(({ status, data }) => {
        if (status === HTTP_CODES_ENUM.OK && data) {
          setCurrency(data.currency);
          setDefaultRedemptionType(data.defaultRedemptionType);
          setNotificationEmails(data.notificationEmails || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
  }, [currency, defaultRedemptionType, notificationEmails, updateSettings]);

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
    </Container>
  );
}

export default withPageRequiredAuth(SettingsPage, {
  roles: [RoleEnum.ADMIN],
});
