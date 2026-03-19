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
import { useState, useCallback } from "react";
import { useGetActiveGiftCardTemplatesService } from "@/services/api/services/gift-card-templates";
import { usePurchaseGiftCardService } from "@/services/api/services/gift-cards";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useQuery } from "@tanstack/react-query";
import { useCurrency } from "@/services/currency/currency-provider";

function GenerateGiftCard() {
  const { symbol: CURRENCY_SYMBOL } = useCurrency();
  const getActiveTemplates = useGetActiveGiftCardTemplatesService();
  const purchaseGiftCard = usePurchaseGiftCardService();

  const { data: templates } = useQuery({
    queryKey: ["activeTemplates"],
    queryFn: async () => {
      const { status, data } = await getActiveTemplates();
      return status === HTTP_CODES_ENUM.OK ? data : [];
    },
  });

  const [templateId, setTemplateId] = useState("");
  const [amount, setAmount] = useState("");
  const [fromName, setFromName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!templateId || !amount || !fromName) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { status, data } = await purchaseGiftCard({
        templateId,
        originalAmount: parseFloat(amount),
        purchaserName: fromName,
        purchaserEmail: recipientEmail || "noreply@generated.local",
        recipientName: recipientName || undefined,
        recipientEmail: recipientEmail || undefined,
        notes: notes || undefined,
      });
      if (status === HTTP_CODES_ENUM.CREATED && data) {
        setSuccess(
          `Gift card ${data.code} generated for ${CURRENCY_SYMBOL}${parseFloat(amount).toFixed(2)}` +
            (recipientEmail ? ` — email sent to ${recipientEmail}` : "")
        );
        setAmount("");
        setRecipientName("");
        setRecipientEmail("");
        setNotes("");
      } else {
        setError("Failed to generate gift card.");
      }
    } catch {
      setError("Failed to generate gift card.");
    } finally {
      setSaving(false);
    }
  }, [
    templateId,
    amount,
    fromName,
    recipientName,
    recipientEmail,
    notes,
    purchaseGiftCard,
    CURRENCY_SYMBOL,
  ]);

  const canSubmit =
    templateId && parseFloat(amount) >= 1 && fromName.trim() !== "";

  return (
    <Container maxWidth="sm">
      <Grid container spacing={3} pt={3}>
        <Grid size={12}>
          <Typography variant="h4">Generate Gift Card</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create a gift card without a purchase — for promotions,
            complimentary gifts, or replacements.
          </Typography>
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
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  select
                  label="Template *"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  fullWidth
                >
                  {(templates || []).map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={12}>
                <TextField
                  label={`Amount (${CURRENCY_SYMBOL}) *`}
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  fullWidth
                  inputProps={{ min: 1, step: 0.01 }}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="From (sender name) *"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  fullWidth
                  helperText="Who is this gift card from? e.g. The Hurstwood"
                />
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
                  helperText="If provided, the gift card will be emailed to this address"
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
          </Paper>
        </Grid>

        <Grid size={12}>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={saving || !canSubmit}
            size="large"
          >
            {saving ? "Generating..." : "Generate Gift Card"}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(GenerateGiftCard, {
  roles: [RoleEnum.ADMIN],
});
