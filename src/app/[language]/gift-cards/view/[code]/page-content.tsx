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

export default function GiftCardView() {
  const { symbol: CURRENCY_SYMBOL } = useCurrency();
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
                      alignItems: "center",
                      justifyContent:
                        template.codePosition.alignment || "center",
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
                      }}
                    >
                      {giftCard.code}
                    </Typography>
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
