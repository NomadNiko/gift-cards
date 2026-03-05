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
import { useForm, Controller } from "react-hook-form";
import { useCallback } from "react";
import { useCreateWidgetService } from "@/services/api/services/widgets";
import { useGetActiveGiftCardTemplatesService } from "@/services/api/services/gift-card-templates";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import MenuItem from "@mui/material/MenuItem";

type FormData = {
  name: string;
  templateId: string;
  allowedDomains: string;
  primaryColor: string;
  buttonText: string;
  headerText: string;
  footerText: string;
  isActive: boolean;
};

function CreateWidget() {
  const router = useRouter();
  const createWidget = useCreateWidgetService();
  const getActiveTemplates = useGetActiveGiftCardTemplatesService();

  const { data: templatesData } = useQuery({
    queryKey: ["activeTemplates"],
    queryFn: async () => {
      const { status, data } = await getActiveTemplates();
      if (status === HTTP_CODES_ENUM.OK) return data;
      return [];
    },
  });

  const { handleSubmit, control } = useForm<FormData>({
    defaultValues: {
      name: "",
      templateId: "",
      allowedDomains: "",
      primaryColor: "#00838f",
      buttonText: "Buy Gift Card",
      headerText: "",
      footerText: "",
      isActive: true,
    },
  });

  const onSubmit = useCallback(
    async (formData: FormData) => {
      const { status } = await createWidget({
        name: formData.name,
        templateId: formData.templateId,
        allowedDomains: formData.allowedDomains
          ? formData.allowedDomains.split("\n").filter(Boolean)
          : [],
        customization: {
          primaryColor: formData.primaryColor,
          buttonText: formData.buttonText,
          headerText: formData.headerText || undefined,
          footerText: formData.footerText || undefined,
        },
        isActive: formData.isActive,
      });
      if (status === HTTP_CODES_ENUM.CREATED) {
        router.push("/admin-panel/gift-cards/widgets");
      }
    },
    [createWidget, router]
  );

  return (
    <Container maxWidth="md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3} pt={3}>
          <Grid size={12}>
            <Typography variant="h4">Create Widget</Typography>
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
                    Primary Color
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <input
                      type="color"
                      value={field.value}
                      onChange={field.onChange}
                      style={{
                        width: 48,
                        height: 48,
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
            <Button type="submit" variant="contained" sx={{ mr: 2 }}>
              Create Widget
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

export default withPageRequiredAuth(CreateWidget, { roles: [RoleEnum.ADMIN] });
