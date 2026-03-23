"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useCallback, useEffect } from "react";
import {
  useUpdateWidgetService,
  useGetWidgetService,
} from "@/services/api/services/widgets";
import { useGetActiveGiftCardTemplatesService } from "@/services/api/services/gift-card-templates";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import MenuItem from "@mui/material/MenuItem";
import LinearProgress from "@mui/material/LinearProgress";
import WidgetPreview from "@/components/widget-preview";

type FormData = {
  name: string;
  templateId: string;
  allowedDomains: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fieldLabelColor: string;
  fieldTextColor: string;
  buttonText: string;
  titleDisplay: string;
  headerText: string;
  footerText: string;
  isActive: boolean;
  redirectUrl: string;
};

function EditWidget() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const updateWidget = useUpdateWidgetService();
  const getWidget = useGetWidgetService();
  const getActiveTemplates = useGetActiveGiftCardTemplatesService();

  const { data: widget, isLoading } = useQuery({
    queryKey: ["widget", id],
    queryFn: async () => {
      const { status, data } = await getWidget(id);
      if (status === HTTP_CODES_ENUM.OK) return data;
      return null;
    },
  });

  const { data: templatesData } = useQuery({
    queryKey: ["activeTemplates"],
    queryFn: async () => {
      const { status, data } = await getActiveTemplates();
      if (status === HTTP_CODES_ENUM.OK) return data;
      return [];
    },
  });

  const { handleSubmit, control, reset } = useForm<FormData>({
    defaultValues: {
      name: "",
      templateId: "",
      allowedDomains: "",
      primaryColor: "#00838f",
      secondaryColor: "#00838f",
      backgroundColor: "#f4ecdc",
      textColor: "#000000",
      fieldLabelColor: "#666666",
      fieldTextColor: "#000000",
      buttonText: "Buy Gift Voucher",
      titleDisplay: "",
      headerText: "",
      footerText: "",
      isActive: true,
      redirectUrl: "",
    },
  });

  useEffect(() => {
    if (widget) {
      reset({
        name: widget.name,
        templateId: widget.templateId,
        allowedDomains: widget.allowedDomains.join("\n"),
        primaryColor: widget.customization?.primaryColor || "#00838f",
        secondaryColor: widget.customization?.secondaryColor || "#00838f",
        backgroundColor: widget.customization?.backgroundColor || "#f4ecdc",
        textColor: widget.customization?.textColor || "#000000",
        fieldLabelColor: widget.customization?.fieldLabelColor || "#666666",
        fieldTextColor: widget.customization?.fieldTextColor || "#000000",
        buttonText: widget.customization?.buttonText || "Buy Gift Voucher",
        titleDisplay: widget.customization?.titleDisplay || "",
        headerText: widget.customization?.headerText || "",
        footerText: widget.customization?.footerText || "",
        isActive: widget.isActive,
        redirectUrl: widget.redirectUrl || "",
      });
    }
  }, [widget, reset]);

  const onSubmit = useCallback(
    async (formData: FormData) => {
      const { status } = await updateWidget(id, {
        name: formData.name,
        templateId: formData.templateId,
        allowedDomains: formData.allowedDomains
          ? formData.allowedDomains.split("\n").filter(Boolean)
          : [],
        customization: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor || undefined,
          backgroundColor: formData.backgroundColor || undefined,
          textColor: formData.textColor || undefined,
          fieldLabelColor: formData.fieldLabelColor || undefined,
          fieldTextColor: formData.fieldTextColor || undefined,
          buttonText: formData.buttonText,
          titleDisplay: formData.titleDisplay || undefined,
          headerText: formData.headerText || undefined,
          footerText: formData.footerText || undefined,
        },
        isActive: formData.isActive,
        redirectUrl: formData.redirectUrl || undefined,
      });
      if (status === HTTP_CODES_ENUM.OK) {
        router.push("/admin-panel/gift-cards/widgets");
      }
    },
    [updateWidget, router, id]
  );

  const watched = useWatch({ control });
  const selectedTemplate = (templatesData || []).find(
    (t) => t.id === watched.templateId
  );

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box pt={3}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3} pt={3}>
          <Grid size={12}>
            <Typography variant="h4">Edit Widget</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Widget Name"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="templateId"
              control={control}
              rules={{ required: "Template is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Template"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  {(templatesData || []).map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="primaryColor"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Primary Button Color
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <input
                      type="color"
                      value={field.value}
                      onChange={field.onChange}
                      style={{
                        width: 40,
                        height: 40,
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                    <TextField
                      value={field.value}
                      onChange={field.onChange}
                      size="small"
                      sx={{ width: 120 }}
                    />
                  </Box>
                </Box>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="secondaryColor"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Secondary Button Color
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <input
                      type="color"
                      value={field.value}
                      onChange={field.onChange}
                      style={{
                        width: 40,
                        height: 40,
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                    <TextField
                      value={field.value}
                      onChange={field.onChange}
                      size="small"
                      sx={{ width: 120 }}
                    />
                  </Box>
                </Box>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="backgroundColor"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Background Color
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <input
                      type="color"
                      value={field.value}
                      onChange={field.onChange}
                      style={{
                        width: 40,
                        height: 40,
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                    <TextField
                      value={field.value}
                      onChange={field.onChange}
                      size="small"
                      sx={{ width: 120 }}
                    />
                  </Box>
                </Box>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="textColor"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Text Color
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <input
                      type="color"
                      value={field.value}
                      onChange={field.onChange}
                      style={{
                        width: 40,
                        height: 40,
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                    <TextField
                      value={field.value}
                      onChange={field.onChange}
                      size="small"
                      sx={{ width: 120 }}
                    />
                  </Box>
                </Box>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="fieldLabelColor"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Field Label Color
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <input
                      type="color"
                      value={field.value}
                      onChange={field.onChange}
                      style={{
                        width: 40,
                        height: 40,
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                    <TextField
                      value={field.value}
                      onChange={field.onChange}
                      size="small"
                      sx={{ width: 120 }}
                    />
                  </Box>
                </Box>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="fieldTextColor"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Field Text Color
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <input
                      type="color"
                      value={field.value}
                      onChange={field.onChange}
                      style={{
                        width: 40,
                        height: 40,
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                    <TextField
                      value={field.value}
                      onChange={field.onChange}
                      size="small"
                      sx={{ width: 120 }}
                    />
                  </Box>
                </Box>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="buttonText"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Button Text" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="titleDisplay"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Title Display" fullWidth />
              )}
            />
          </Grid>

          <Grid size={12}>
            <Controller
              name="redirectUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Redirect URL (for Stripe payments)"
                  fullWidth
                  placeholder="https://yoursite.com/gift-cards"
                  helperText="The page where this widget is embedded. After Stripe payment, users are redirected back here."
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <Controller
              name="allowedDomains"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Allowed Domains (one per line)"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="example.com&#10;partner-site.com"
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

          <Grid size={12}>
            <WidgetPreview
              primaryColor={watched.primaryColor || "#00838f"}
              secondaryColor={watched.secondaryColor || "#00838f"}
              backgroundColor={watched.backgroundColor || "#f4ecdc"}
              textColor={watched.textColor || "#000000"}
              fieldLabelColor={watched.fieldLabelColor || "#666666"}
              fieldTextColor={watched.fieldTextColor || "#000000"}
              buttonText={watched.buttonText || "Buy Gift Voucher"}
              titleDisplay={watched.titleDisplay || ""}
              templateImage={selectedTemplate?.image}
            />
          </Grid>

          <Grid size={12}>
            <Button type="submit" variant="contained" sx={{ mr: 2 }}>
              Save Changes
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push("/admin-panel/gift-cards/widgets")}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default withPageRequiredAuth(EditWidget, { roles: [RoleEnum.ADMIN] });
