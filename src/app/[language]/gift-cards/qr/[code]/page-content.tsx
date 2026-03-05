"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuth from "@/services/auth/use-auth";
import { RoleEnum } from "@/services/api/types/role";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function QrRedirect() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const { user, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    const code = params.code;
    const isAdmin =
      !!user?.role && [RoleEnum.ADMIN].includes(Number(user.role.id));

    if (isAdmin) {
      router.replace(`/admin-panel/gift-cards/redeem?code=${code}`);
    } else {
      router.replace(`/gift-cards/balance?code=${code}`);
    }
  }, [isLoaded, user, params.code, router]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
