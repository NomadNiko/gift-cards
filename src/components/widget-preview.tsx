"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import { Special_Elite } from "next/font/google";

const specialElite = Special_Elite({ weight: "400", subsets: ["latin"] });

interface PreviewProps {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fieldLabelColor: string;
  fieldTextColor: string;
  buttonText: string;
  titleDisplay: string;
  templateImage?: string;
}

export default function WidgetPreview(props: PreviewProps) {
  const {
    primaryColor,
    secondaryColor,
    backgroundColor,
    textColor,
    fieldLabelColor,
    fieldTextColor,
    buttonText,
    titleDisplay,
    templateImage,
  } = props;

  const tfSx = {
    "& .MuiInputLabel-root": { color: fieldLabelColor },
    "& .MuiInputBase-input": { color: fieldTextColor },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: fieldLabelColor },
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="subtitle2" gutterBottom>
          Live Preview
        </Typography>
      </Grid>
      {/* Step 1 preview */}
      <Grid size={6}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            bgcolor: backgroundColor,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Typography
            variant="subtitle1"
            textAlign="center"
            gutterBottom
            sx={{
              fontFamily: specialElite.style.fontFamily,
              fontWeight: 700,
              color: textColor,
              fontSize: "0.9rem",
            }}
          >
            {titleDisplay || "The Hurstwood"}
          </Typography>
          {templateImage && (
            <Box sx={{ textAlign: "center", mb: 1 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={templateImage}
                alt="Template"
                style={{ maxWidth: "100%", maxHeight: 100, borderRadius: 4 }}
              />
            </Box>
          )}
          <Typography
            variant="caption"
            sx={{ color: textColor, fontWeight: 600 }}
          >
            Choose an amount
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, my: 1, flexWrap: "wrap" }}>
            {[25, 50, 75].map((v) => (
              <Button
                key={v}
                size="small"
                variant={v === 25 ? "contained" : "outlined"}
                sx={{
                  minWidth: 0,
                  px: 1,
                  fontSize: "0.65rem",
                  backgroundColor: v === 25 ? primaryColor : undefined,
                  borderColor: v !== 25 ? secondaryColor : undefined,
                  color: v !== 25 ? secondaryColor : undefined,
                }}
              >
                £{v}
              </Button>
            ))}
          </Box>
          <Button
            variant="contained"
            fullWidth
            size="small"
            sx={{ backgroundColor: primaryColor, fontSize: "0.7rem" }}
          >
            Continue
          </Button>
        </Paper>
      </Grid>
      {/* Step 2 preview */}
      <Grid size={6}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            bgcolor: backgroundColor,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Typography
            variant="subtitle1"
            textAlign="center"
            gutterBottom
            sx={{
              fontFamily: specialElite.style.fontFamily,
              fontWeight: 700,
              color: textColor,
              fontSize: "0.9rem",
            }}
          >
            {titleDisplay || "The Hurstwood"}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: textColor, fontWeight: 600 }}
          >
            Your Information
          </Typography>
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            <TextField
              label="Your Name"
              size="small"
              fullWidth
              sx={{
                ...tfSx,
                "& .MuiInputBase-root": { height: 32 },
                "& .MuiInputLabel-root": {
                  color: fieldLabelColor,
                  fontSize: "0.75rem",
                },
              }}
            />
            <TextField
              label="Your Email"
              size="small"
              fullWidth
              sx={{
                ...tfSx,
                "& .MuiInputBase-root": { height: 32 },
                "& .MuiInputLabel-root": {
                  color: fieldLabelColor,
                  fontSize: "0.75rem",
                },
              }}
            />
          </Box>
          <Divider sx={{ my: 1 }} />
          <Typography
            variant="caption"
            sx={{ color: textColor, opacity: 0.7, fontSize: "0.6rem" }}
          >
            Sending to someone else? (optional)
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              sx={{
                fontSize: "0.65rem",
                borderColor: secondaryColor,
                color: secondaryColor,
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              size="small"
              fullWidth
              sx={{ backgroundColor: primaryColor, fontSize: "0.65rem" }}
            >
              {buttonText || "Buy Gift Voucher"}
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
