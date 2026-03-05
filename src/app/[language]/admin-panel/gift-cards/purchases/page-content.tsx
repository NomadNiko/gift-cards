"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Link from "@/components/link";
import { useGetGiftCardsQuery } from "./queries/queries";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import { useMemo, useState } from "react";
import { GiftCard } from "@/services/api/types/gift-card";
import { SortEnum } from "@/services/api/types/sort-type";
import { useCurrency } from "@/services/currency/currency-provider";

type SortableField = "code" | "purchaserName" | "purchaseDate";

const statusColors: Record<
  string,
  "success" | "warning" | "error" | "default"
> = {
  active: "success",
  partially_redeemed: "warning",
  fully_redeemed: "default",
  cancelled: "error",
};

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString() +
    " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

function sortCards(cards: GiftCard[], field: SortableField, order: SortEnum) {
  return [...cards].sort((a, b) => {
    let cmp = 0;
    if (field === "code") cmp = a.code.localeCompare(b.code);
    else if (field === "purchaserName")
      cmp = a.purchaserName.localeCompare(b.purchaserName);
    else
      cmp =
        new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
    return order === SortEnum.ASC ? cmp : -cmp;
  });
}

const sortOptions: { value: string; label: string }[] = [
  { value: "purchaseDate-desc", label: "Date (Newest)" },
  { value: "purchaseDate-asc", label: "Date (Oldest)" },
  { value: "code-asc", label: "Code (A-Z)" },
  { value: "code-desc", label: "Code (Z-A)" },
  { value: "purchaserName-asc", label: "Purchaser (A-Z)" },
  { value: "purchaserName-desc", label: "Purchaser (Z-A)" },
];

function PurchasesList() {
  const { symbol: CURRENCY_SYMBOL } = useCurrency();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [orderBy, setOrderBy] = useState<SortableField>("purchaseDate");
  const [order, setOrder] = useState<SortEnum>(SortEnum.DESC);

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useGetGiftCardsQuery();

  const giftCards = useMemo(() => {
    const result = data?.pages.flatMap((page) => page?.data || []) ?? [];
    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  const sorted = useMemo(
    () => sortCards(giftCards, orderBy, order),
    [giftCards, orderBy, order]
  );

  const handleSort = (field: SortableField) => {
    if (orderBy === field) {
      setOrder(order === SortEnum.ASC ? SortEnum.DESC : SortEnum.ASC);
    } else {
      setOrderBy(field);
      setOrder(field === "purchaseDate" ? SortEnum.DESC : SortEnum.ASC);
    }
  };

  const handleMobileSort = (val: string) => {
    const [f, o] = val.split("-") as [SortableField, string];
    setOrderBy(f);
    setOrder(o === "asc" ? SortEnum.ASC : SortEnum.DESC);
  };

  const isRedeemable = (gc: GiftCard) =>
    gc.status === "active" || gc.status === "partially_redeemed";

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} pt={3}>
        <Grid size={12}>
          <Typography variant="h4">Gift Card Purchases</Typography>
        </Grid>

        {isLoading && (
          <Grid size={12}>
            <LinearProgress />
          </Grid>
        )}

        {isMobile && sorted.length > 0 && (
          <Grid size={12}>
            <FormControl size="small" fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                label="Sort By"
                value={`${orderBy}-${order}`}
                onChange={(e) => handleMobileSort(e.target.value)}
              >
                {sortOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {isMobile ? (
          sorted.map((gc) => (
            <Grid size={12} key={gc.id}>
              <Card variant="outlined">
                <CardContent sx={{ pb: "12px !important" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontFamily: "monospace", fontWeight: 700 }}
                    >
                      {gc.code}
                    </Typography>
                    <Chip
                      label={gc.status.replace("_", " ")}
                      color={statusColors[gc.status] || "default"}
                      size="small"
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      rowGap: 0.5,
                    }}
                  >
                    <Typography variant="body2">
                      <strong>
                        {CURRENCY_SYMBOL}
                        {gc.originalAmount.toFixed(2)}
                      </strong>
                      {" · Bal: " +
                        CURRENCY_SYMBOL +
                        gc.currentBalance.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      · {gc.purchaserName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      · {formatDateTime(gc.purchaseDate)}
                    </Typography>
                  </Box>
                  {isRedeemable(gc) && (
                    <Box sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        href={`/admin-panel/gift-cards/redeem?code=${gc.code}`}
                      >
                        Redeem
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid size={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sortDirection={orderBy === "code" ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === "code"}
                        direction={orderBy === "code" ? order : SortEnum.ASC}
                        onClick={() => handleSort("code")}
                      >
                        Code
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell
                      sortDirection={
                        orderBy === "purchaserName" ? order : false
                      }
                    >
                      <TableSortLabel
                        active={orderBy === "purchaserName"}
                        direction={
                          orderBy === "purchaserName" ? order : SortEnum.ASC
                        }
                        onClick={() => handleSort("purchaserName")}
                      >
                        Purchaser
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sortDirection={orderBy === "purchaseDate" ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === "purchaseDate"}
                        direction={
                          orderBy === "purchaseDate" ? order : SortEnum.ASC
                        }
                        onClick={() => handleSort("purchaseDate")}
                      >
                        Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sorted.map((gc) => (
                    <TableRow key={gc.id}>
                      <TableCell
                        sx={{ fontFamily: "monospace", fontWeight: 600 }}
                      >
                        {gc.code}
                      </TableCell>
                      <TableCell>
                        {CURRENCY_SYMBOL}
                        {gc.originalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {CURRENCY_SYMBOL}
                        {gc.currentBalance.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {gc.purchaserName}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {gc.purchaserEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDateTime(gc.purchaseDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={gc.status.replace("_", " ")}
                          color={statusColors[gc.status] || "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {isRedeemable(gc) && (
                          <Button
                            size="small"
                            variant="outlined"
                            component={Link}
                            href={`/admin-panel/gift-cards/redeem?code=${gc.code}`}
                          >
                            Redeem
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && giftCards.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary" py={3}>
                          No purchases yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}

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
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(PurchasesList, {
  roles: [RoleEnum.ADMIN],
});
