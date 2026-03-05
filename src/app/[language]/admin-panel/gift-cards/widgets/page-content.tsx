"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Link from "@/components/link";
import { useGetWidgetsQuery, widgetsQueryKeys } from "./queries/queries";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import { useMemo, useCallback, useState } from "react";
import { useDeleteWidgetService } from "@/services/api/services/widgets";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { Widget } from "@/services/api/types/widget";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import LinearProgress from "@mui/material/LinearProgress";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";

function EmbedCodeDialog({
  widget,
  open,
  onClose,
}: {
  widget: Widget | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!widget) return null;
  const embedCode = `<div id="gift-card-widget-${widget.id}"></div>
<script src="${typeof window !== "undefined" ? window.location.origin : ""}/widget.js"></script>
<script>
  GiftCardWidget.init({
    apiKey: '${widget.apiKey}',
    containerId: 'gift-card-widget-${widget.id}'
  });
</script>`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Embed Code - {widget.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          API Key: <code>{widget.apiKey}</code>
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={8}
          value={embedCode}
          slotProps={{ input: { readOnly: true } }}
          sx={{
            mt: 2,
            "& textarea": { fontFamily: "monospace", fontSize: 13 },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            navigator.clipboard.writeText(embedCode);
          }}
        >
          Copy to Clipboard
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function WidgetsList() {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useGetWidgetsQuery();
  const deleteService = useDeleteWidgetService();
  const queryClient = useQueryClient();
  const { confirmDialog } = useConfirmDialog();

  const [embedWidget, setEmbedWidget] = useState<Widget | null>(null);

  const widgets = useMemo(() => {
    const result = data?.pages.flatMap((page) => page?.data || []) ?? [];
    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  const handleDelete = useCallback(
    async (widget: Widget) => {
      const isConfirmed = await confirmDialog({
        title: "Delete Widget",
        message: `Are you sure you want to delete "${widget.name}"?`,
      });
      if (isConfirmed) {
        await deleteService(widget.id);
        queryClient.setQueryData(
          widgetsQueryKeys.list().key,
          (oldData: InfiniteData<{ data: Widget[] } | undefined>) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) =>
                page
                  ? {
                      ...page,
                      data: page.data.filter((w) => w.id !== widget.id),
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
          <Typography variant="h4">Widgets</Typography>
          <Button
            variant="contained"
            component={Link}
            href="/admin-panel/gift-cards/widgets/create"
          >
            Create Widget
          </Button>
        </Grid>

        {isLoading && (
          <Grid size={12}>
            <LinearProgress />
          </Grid>
        )}

        {widgets.map((widget) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={widget.id}>
            <Card>
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
                    {widget.name}
                  </Typography>
                  <Chip
                    label={widget.isActive ? "Active" : "Inactive"}
                    color={widget.isActive ? "success" : "default"}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  API Key: <code>{widget.apiKey.substring(0, 12)}...</code>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Domains: {widget.allowedDomains.join(", ") || "Any"}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  component={Link}
                  href={`/admin-panel/gift-cards/widgets/${widget.id}/demo`}
                >
                  Demo & Test
                </Button>
                <Button size="small" onClick={() => setEmbedWidget(widget)}>
                  Embed Code
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(widget)}
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

        {!isLoading && widgets.length === 0 && (
          <Grid size={12}>
            <Typography color="text.secondary" textAlign="center" py={4}>
              No widgets yet. Create your first widget!
            </Typography>
          </Grid>
        )}
      </Grid>

      <EmbedCodeDialog
        widget={embedWidget}
        open={!!embedWidget}
        onClose={() => setEmbedWidget(null)}
      />
    </Container>
  );
}

export default withPageRequiredAuth(WidgetsList, { roles: [RoleEnum.ADMIN] });
