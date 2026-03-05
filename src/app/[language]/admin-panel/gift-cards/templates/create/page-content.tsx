"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import MenuItem from "@mui/material/MenuItem";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useCallback, useState, useRef } from "react";
import { useFileUploadService } from "@/services/api/services/files";
import { useCreateGiftCardTemplateService } from "@/services/api/services/gift-card-templates";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useRouter } from "next/navigation";
import { CodePosition } from "@/services/api/types/code-position";
import { QrPosition } from "@/services/api/types/gift-card-template";
import { useCurrency } from "@/services/api/types/currency";

type FormData = {
  name: string;
  description: string;
  isActive: boolean;
  redemptionType: "partial" | "full";
  expirationDate: string;
  codePrefix: string;
};

const DEFAULT_CODE_POSITION: CodePosition = {
  x: 10,
  y: 80,
  width: 80,
  height: 10,
  fontSize: 16,
  fontColor: "#000000",
  alignment: "center",
};

function CreateTemplate() {
  const router = useRouter();
  const uploadFile = useFileUploadService();
  const createTemplate = useCreateGiftCardTemplateService();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [codePosition, setCodePosition] = useState<CodePosition>(
    DEFAULT_CODE_POSITION
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [dragMode, setDragMode] = useState<"code" | "qr">("code");
  const [qrPosition, setQrPosition] = useState<QrPosition>({
    x: 85,
    y: 5,
    size: 12,
  });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const { handleSubmit, control } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      redemptionType: "full" as const,
      expirationDate: "",
      codePrefix: "GC",
    },
  });

  const watchedExpDate = useWatch({ control, name: "expirationDate" });
  const watchedPrefix = useWatch({ control, name: "codePrefix" });
  const { code: currencyCode } = useCurrency();

  const expirationLabel = (() => {
    if (!watchedExpDate) return "EXP: Never";
    const d = new Date(watchedExpDate);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return currencyCode === "USD"
      ? `EXP: ${mm}/${dd}/${yyyy}`
      : `EXP: ${dd}/${mm}/${yyyy}`;
  })();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const { status, data } = await uploadFile(file);
        if (status === HTTP_CODES_ENUM.CREATED) {
          setImageUrl(data.file.path);
        }
      } finally {
        setUploading(false);
      }
    },
    [uploadFile]
  );

  const getRelativePosition = useCallback((e: React.MouseEvent) => {
    if (!imageContainerRef.current) return null;
    const rect = imageContainerRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const pos = getRelativePosition(e);
      if (!pos) return;
      if (dragMode === "qr") {
        setQrPosition((prev) => ({
          ...prev,
          x: Math.max(0, Math.min(pos.x, 100 - prev.size)),
          y: Math.max(0, Math.min(pos.y, 100 - prev.size)),
        }));
      } else {
        setIsDragging(true);
        setDragStart(pos);
      }
    },
    [getRelativePosition, dragMode]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !dragStart || dragMode === "qr") return;
      const pos = getRelativePosition(e);
      if (!pos) return;
      const x = Math.min(dragStart.x, pos.x);
      const y = Math.min(dragStart.y, pos.y);
      const width = Math.abs(pos.x - dragStart.x);
      const height = Math.abs(pos.y - dragStart.y);
      setCodePosition((prev) => ({
        ...prev,
        x: Math.max(0, Math.min(x, 100)),
        y: Math.max(0, Math.min(y, 100)),
        width: Math.min(width, 100 - x),
        height: Math.min(height, 100 - y),
      }));
    },
    [isDragging, dragStart, getRelativePosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  const onSubmit = useCallback(
    async (formData: FormData) => {
      if (!imageUrl) return;
      const { status } = await createTemplate({
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        codePosition,
        redemptionType: formData.redemptionType,
        expirationDate: formData.expirationDate || undefined,
        codePrefix: formData.codePrefix || "GC",
        qrPosition,
        isActive: formData.isActive,
      });
      if (status === HTTP_CODES_ENUM.CREATED) {
        router.push("/admin-panel/gift-cards/templates");
      }
    },
    [imageUrl, codePosition, qrPosition, createTemplate, router]
  );

  return (
    <Container maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3} pt={3}>
          <Grid size={12}>
            <Typography variant="h4">Create Gift Card Template</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Template Name"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch checked={field.value} onChange={field.onChange} />
                  }
                  label="Active"
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="redemptionType"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Redemption Type"
                  fullWidth
                  helperText={
                    field.value === "full"
                      ? "Single use — full balance redeemed at once"
                      : "Partial — balance can be used across multiple visits"
                  }
                >
                  <MenuItem value="full">Single Use (Full Balance)</MenuItem>
                  <MenuItem value="partial">
                    Partial Redemption Allowed
                  </MenuItem>
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="expirationDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Expiration Date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  helperText="Leave empty for no expiration"
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="codePrefix"
              control={control}
              rules={{ required: "Code prefix is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Code Prefix"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ||
                    `Codes will look like: ${field.value || "GC"}-XXXX-XXXX`
                  }
                  inputProps={{ maxLength: 6 }}
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <Button variant="outlined" component="label" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Template Image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
          </Grid>

          {imageUrl && (
            <>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom>
                  Position elements on the template
                </Typography>
                <ToggleButtonGroup
                  value={dragMode}
                  exclusive
                  onChange={(_, v) => {
                    if (v) setDragMode(v);
                  }}
                  size="small"
                  sx={{ mb: 1 }}
                >
                  <ToggleButton value="code">Code Area</ToggleButton>
                  <ToggleButton value="qr">QR Code</ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {dragMode === "code"
                    ? "Click and drag to select where the gift card code will appear."
                    : "Click to place the QR code. Use the slider below to resize."}
                </Typography>
                <Paper
                  elevation={2}
                  sx={{ p: 1, display: "inline-block", position: "relative" }}
                >
                  <Box
                    ref={imageContainerRef}
                    sx={{
                      position: "relative",
                      cursor: "crosshair",
                      userSelect: "none",
                      maxWidth: "100%",
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <img
                      src={imageUrl}
                      alt="Template"
                      style={{
                        display: "block",
                        maxWidth: "100%",
                        maxHeight: 500,
                      }}
                      draggable={false}
                    />
                    {/* Code position overlay */}
                    <Box
                      sx={{
                        position: "absolute",
                        left: `${codePosition.x}%`,
                        top: `${codePosition.y}%`,
                        width: `${codePosition.width}%`,
                        height: `${codePosition.height}%`,
                        border: `2px dashed ${dragMode === "code" ? "#00838f" : "rgba(0,131,143,0.4)"}`,
                        backgroundColor: "rgba(0, 131, 143, 0.1)",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent:
                          codePosition.alignment === "left"
                            ? "flex-start"
                            : codePosition.alignment === "right"
                              ? "flex-end"
                              : "center",
                        pointerEvents: "none",
                        overflow: "hidden",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: codePosition.fontSize || 16,
                          color: codePosition.fontColor || "#000",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          lineHeight: 1.2,
                          px: 0.5,
                        }}
                      >
                        {(watchedPrefix || "GC") + "-XXXX-XXXX"}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: (codePosition.fontSize || 16) * 0.6,
                          color: codePosition.fontColor || "#000",
                          whiteSpace: "nowrap",
                          lineHeight: 1,
                          ml: 1,
                        }}
                      >
                        {expirationLabel}
                      </Typography>
                    </Box>
                    {/* QR position overlay */}
                    <Box
                      sx={{
                        position: "absolute",
                        left: `${qrPosition.x}%`,
                        top: `${qrPosition.y}%`,
                        width: `${qrPosition.size}%`,
                        aspectRatio: "1",
                        border: `2px dashed ${dragMode === "qr" ? "#e65100" : "rgba(230,81,0,0.4)"}`,
                        backgroundColor: "rgba(230, 81, 0, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                        fontSize: 10,
                        color: "#e65100",
                        fontWeight: "bold",
                      }}
                    >
                      QR
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Code position controls */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography gutterBottom>
                  Font Size: {codePosition.fontSize}px
                </Typography>
                <Slider
                  value={codePosition.fontSize || 16}
                  onChange={(_, v) =>
                    setCodePosition((p) => ({ ...p, fontSize: v as number }))
                  }
                  min={8}
                  max={48}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography gutterBottom>Font Color</Typography>
                <input
                  type="color"
                  value={codePosition.fontColor || "#000000"}
                  onChange={(e) =>
                    setCodePosition((p) => ({
                      ...p,
                      fontColor: e.target.value,
                    }))
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography gutterBottom>Alignment</Typography>
                <ToggleButtonGroup
                  value={codePosition.alignment || "center"}
                  exclusive
                  onChange={(_, v) => {
                    if (v) setCodePosition((p) => ({ ...p, alignment: v }));
                  }}
                  size="small"
                >
                  <ToggleButton value="left">Left</ToggleButton>
                  <ToggleButton value="center">Center</ToggleButton>
                  <ToggleButton value="right">Right</ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography gutterBottom>
                  QR Code Size: {qrPosition.size}%
                </Typography>
                <Slider
                  value={qrPosition.size}
                  onChange={(_, v) =>
                    setQrPosition((p) => ({ ...p, size: v as number }))
                  }
                  min={5}
                  max={30}
                />
              </Grid>
            </>
          )}

          <Grid size={12}>
            <Button
              type="submit"
              variant="contained"
              disabled={!imageUrl}
              sx={{ mr: 2 }}
            >
              Create Template
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push("/admin-panel/gift-cards/templates")}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default withPageRequiredAuth(CreateTemplate, {
  roles: [RoleEnum.ADMIN],
});
