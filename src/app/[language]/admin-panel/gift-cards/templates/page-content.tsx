"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Chip from "@mui/material/Chip";
import Link from "@/components/link";
import { useGetGiftCardTemplatesQuery } from "./queries/queries";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import { useMemo, useCallback } from "react";
import { useDeleteGiftCardTemplateService } from "@/services/api/services/gift-card-templates";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { giftCardTemplatesQueryKeys } from "./queries/queries";
import { GiftCardTemplate } from "@/services/api/types/gift-card-template";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";

function TemplatesList() {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useGetGiftCardTemplatesQuery();
  const deleteService = useDeleteGiftCardTemplateService();
  const queryClient = useQueryClient();
  const { confirmDialog } = useConfirmDialog();

  const templates = useMemo(() => {
    const result = data?.pages.flatMap((page) => page?.data || []) ?? [];
    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  const handleDelete = useCallback(
    async (template: GiftCardTemplate) => {
      const isConfirmed = await confirmDialog({
        title: "Delete Template",
        message: `Are you sure you want to delete "${template.name}"?`,
      });
      if (isConfirmed) {
        await deleteService(template.id);
        queryClient.setQueryData(
          giftCardTemplatesQueryKeys.list().key,
          (oldData: InfiniteData<{ data: GiftCardTemplate[] } | undefined>) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) =>
                page
                  ? {
                      ...page,
                      data: page.data.filter((t) => t.id !== template.id),
                    }
                  : page
              ),
            };
          }
        );
      }
    },
    [confirmDialog, deleteService, queryClient]
  );

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} pt={3}>
        <Grid
          size={12}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4">Gift Card Templates</Typography>
          <Button
            variant="contained"
            component={Link}
            href="/admin-panel/gift-cards/templates/create"
          >
            Create Template
          </Button>
        </Grid>

        {isLoading && (
          <Grid size={12}>
            <LinearProgress />
          </Grid>
        )}

        {templates.map((template) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={template.id}>
            <Card>
              {template.image && (
                <CardMedia
                  component="img"
                  height="200"
                  image={template.image}
                  alt={template.name}
                  sx={{ objectFit: "cover" }}
                />
              )}
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" noWrap>
                    {template.name}
                  </Typography>
                  <Chip
                    label={template.isActive ? "Active" : "Inactive"}
                    color={template.isActive ? "success" : "default"}
                    size="small"
                  />
                  <Chip
                    label={
                      template.redemptionType === "partial"
                        ? "Partial"
                        : "Single Use"
                    }
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {template.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  component={Link}
                  href={`/admin-panel/gift-cards/templates/${template.id}/edit`}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(template)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {hasNextPage && (
          <Grid size={12} sx={{ textAlign: "center" }}>
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading..." : "Load More"}
            </Button>
          </Grid>
        )}

        {!isLoading && templates.length === 0 && (
          <Grid size={12}>
            <Typography color="text.secondary" textAlign="center" py={4}>
              No templates yet. Create your first gift card template!
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(TemplatesList, {
  roles: [RoleEnum.ADMIN],
});
