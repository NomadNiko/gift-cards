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
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import { useForm, Controller } from "react-hook-form";
import { useCallback, useState, useRef, useEffect } from "react";
import { useFileUploadService } from "@/services/api/services/files";
import {
  useGetGiftCardTemplateService,
  useUpdateGiftCardTemplateService,
} from "@/services/api/services/gift-card-templates";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useRouter, useParams } from "next/navigation";
import { CodePosition } from "@/services/api/types/code-position";

type FormData = {
  name: string;
  description: string;
  isActive: boolean;
  redemptionType: "partial" | "full";
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

function EditTemplate() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const uploadFile = useFileUploadService();
  const getTemplate = useGetGiftCardTemplateService();
  const updateTemplate = useUpdateGiftCardTemplateService();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codePosition, setCodePosition] = useState<CodePosition>(
    DEFAULT_CODE_POSITION
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const { handleSubmit, control, reset } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      redemptionType: "full" as const,
    },
  });

  useEffect(() => {
    async function load() {
      if (!params.id) return;
      try {
        const { status, data } = await getTemplate(params.id);
        if (status === HTTP_CODES_ENUM.OK && data) {
          reset({
            name: data.name,
            description: data.description,
            isActive: data.isActive,
            redemptionType: data.redemptionType || "full",
          });
          setImageUrl(data.image);
          if (data.codePosition) {
            setCodePosition(data.codePosition);
          }
        } else {
          setError("Template not found.");
        }
      } catch {
        setError("Failed to load template.");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

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
      setIsDragging(true);
      setDragStart(pos);
    },
    [getRelativePosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !dragStart) return;
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
      if (!imageUrl || !params.id) return;
      const { status } = await updateTemplate(params.id, {
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        codePosition,
        redemptionType: formData.redemptionType,
        isActive: formData.isActive,
      });
      if (status === HTTP_CODES_ENUM.OK) {
        router.push("/admin-panel/gift-cards/templates");
      }
    },
    [imageUrl, codePosition, updateTemplate, router, params.id]
  );

  if (loading) return <LinearProgress />;
  if (error)
    return (
      <Container maxWidth="md" sx={{ pt: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );

  return (
    <Container maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3} pt={3}>
          <Grid size={12}>
            <Typography variant="h4">Edit Gift Card Template</Typography>
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
              {uploading ? "Uploading..." : "Replace Template Image"}
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
                  Code Position
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Click and drag on the image to reposition the code area.
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                    <Box
                      sx={{
                        position: "absolute",
                        left: `${codePosition.x}%`,
                        top: `${codePosition.y}%`,
                        width: `${codePosition.width}%`,
                        height: `${codePosition.height}%`,
                        border: "2px dashed #00838f",
                        backgroundColor: "rgba(0, 131, 143, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: codePosition.alignment || "center",
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
                          px: 0.5,
                        }}
                      >
                        GC-XXXX-XXXX-XXXX
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

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
            </>
          )}

          <Grid size={12}>
            <Button
              type="submit"
              variant="contained"
              disabled={!imageUrl}
              sx={{ mr: 2 }}
            >
              Save Changes
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

export default withPageRequiredAuth(EditTemplate, {
  roles: [RoleEnum.ADMIN],
});
