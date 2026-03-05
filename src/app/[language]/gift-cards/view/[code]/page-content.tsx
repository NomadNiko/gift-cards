"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGetGiftCardByCodeService } from "@/services/api/services/gift-cards";
import { useGetGiftCardTemplateService } from "@/services/api/services/gift-card-templates";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { GiftCard } from "@/services/api/types/gift-card";
import { GiftCardTemplate } from "@/services/api/types/gift-card-template";
import { useCurrency } from "@/services/currency/currency-provider";
import { QRCodeSVG } from "qrcode.react";

export default function GiftCardView() {
  const { symbol: CURRENCY_SYMBOL, code: currencyCode } = useCurrency();
  const params = useParams<{ code: string }>();
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
  const [template, setTemplate] = useState<GiftCardTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lookupByCode = useGetGiftCardByCodeService();
  const getTemplate = useGetGiftCardTemplateService();
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    const img = imgRef.current;
    if (img && img.naturalWidth > 0) {
      setScale(img.clientWidth / img.naturalWidth);
    }
  }, []);

  useEffect(() => {
    async function load() {
      if (!params.code) return;
      try {
        const { status, data } = await lookupByCode(params.code);
        if (status === HTTP_CODES_ENUM.OK && data) {
          setGiftCard(data);
          const { status: tStatus, data: tData } = await getTemplate(
            data.templateId
          );
          if (tStatus === HTTP_CODES_ENUM.OK) {
            setTemplate(tData);
          }
        } else {
          setError("Gift card not found.");
        }
      } catch {
        setError("Gift card not found.");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.code]);

  useEffect(() => {
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [updateScale]);

  const formatExpDate = useCallback(
    (dateStr: string) => {
      const d = new Date(dateStr);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return currencyCode === "USD"
        ? `${mm}/${dd}/${yyyy}`
        : `${dd}/${mm}/${yyyy}`;
    },
    [currencyCode]
  );

  const expirationLabel = template?.expirationDate
    ? `EXP: ${formatExpDate(template.expirationDate)}`
    : "EXP: Never";

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (loading) return <LinearProgress />;
  if (error)
    return (
      <Container maxWidth="sm" sx={{ pt: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  if (!giftCard) return null;

  return (
    <Container maxWidth="sm">
      <Grid container spacing={3} pt={4}>
        <Grid size={12} sx={{ textAlign: "center" }} className="no-print">
          <Button variant="contained" onClick={handlePrint} sx={{ mb: 2 }}>
            Print Gift Card
          </Button>
        </Grid>

        <Grid size={12}>
          <Paper
            elevation={3}
            sx={{ overflow: "hidden", borderRadius: 2 }}
            id="gift-card-printable"
          >
            {/* Template image with code overlay */}
            {template?.image && (
              <Box sx={{ position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={template.image}
                  alt="Gift Card"
                  style={{ width: "100%", display: "block" }}
                  onLoad={updateScale}
                />
                {template.codePosition && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: `${template.codePosition.x}%`,
                      top: `${template.codePosition.y}%`,
                      width: `${template.codePosition.width}%`,
                      height: `${template.codePosition.height}%`,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent:
                        template.codePosition.alignment === "left"
                          ? "flex-start"
                          : template.codePosition.alignment === "right"
                            ? "flex-end"
                            : "center",
                      overflow: "hidden",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize:
                          (template.codePosition.fontSize || 16) * scale,
                        color: template.codePosition.fontColor || "#000",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        px: 0.5,
                        lineHeight: 1.2,
                      }}
                    >
                      {giftCard.code}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize:
                          (template.codePosition.fontSize || 16) * scale * 0.6,
                        color: template.codePosition.fontColor || "#000",
                        whiteSpace: "nowrap",
                        lineHeight: 1,
                        ml: 1,
                      }}
                    >
                      {expirationLabel}
                    </Typography>
                  </Box>
                )}
                {template.qrPosition && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: `${template.qrPosition.x}%`,
                      top: `${template.qrPosition.y}%`,
                      width: `${template.qrPosition.size}%`,
                    }}
                  >
                    <QRCodeSVG
                      value={`${window.location.origin}/gift-cards/qr/${giftCard.code}`}
                      size={1000}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </Box>
                )}
              </Box>
            )}

            {/* Card details */}
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ fontFamily: "monospace", fontWeight: 700, mb: 1 }}
              >
                {giftCard.code}
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                {CURRENCY_SYMBOL}
                {giftCard.originalAmount.toFixed(2)}
              </Typography>
              {giftCard.currentBalance !== giftCard.originalAmount && (
                <Typography
                  variant="h6"
                  color={
                    giftCard.currentBalance > 0
                      ? "success.main"
                      : "text.secondary"
                  }
                >
                  Balance: {CURRENCY_SYMBOL}
                  {giftCard.currentBalance.toFixed(2)}
                </Typography>
              )}
              {template?.expirationDate && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {expirationLabel}
                </Typography>
              )}
              {giftCard.notes && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontStyle: "italic", mt: 1 }}
                >
                  &ldquo;{giftCard.notes}&rdquo;
                </Typography>
              )}
              {giftCard.recipientName && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  For: {giftCard.recipientName}
                </Typography>
              )}
              <Box sx={{ mt: 2 }}>
                {!template?.qrPosition && (
                  <QRCodeSVG
                    value={`${window.location.origin}/gift-cards/qr/${giftCard.code}`}
                    size={120}
                  />
                )}
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Scan to check balance or redeem
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body * {
            visibility: hidden;
          }
          #gift-card-printable,
          #gift-card-printable * {
            visibility: visible;
          }
          #gift-card-printable {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </Container>
  );
}
