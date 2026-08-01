import { Stack, Typography, useTheme } from "@mui/material";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { formatDateOnly } from "@/utils/date";
import {
  RouteProgressDot,
  RouteProgressTrack,
} from "./DiscrepancyDetailHeader.styles";

export interface DiscrepancyDetailHeaderProps {
  breadcrumbItems: BreadcrumbItem[];
  originName: string;
  originDate: string;
  branchName: string;
  deliveryDate: string;
  onBack: () => void;
}

export function DiscrepancyDetailHeader({
  breadcrumbItems,
  originName,
  originDate,
  branchName,
  deliveryDate,
  onBack,
}: DiscrepancyDetailHeaderProps) {
  const theme = useTheme();

  return (
    <Stack spacing={{ xs: 2, md: 2.5 }}>
      <Breadcrumbs items={breadcrumbItems} showBackButton onBack={onBack} />

      <Stack
        spacing={{ xs: 1.5, md: 1.25 }}
        sx={{ maxWidth: { xs: "100%", md: 608 }, width: "100%" }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={{ xs: 1.5, md: 2 }}
        >
          <Stack spacing={0.5} flex={1} minWidth={0}>
            <Typography
              variant="body1"
              fontWeight={500}
              sx={{
                overflowWrap: "anywhere",
                whiteSpace: { xs: "normal", md: "nowrap" },
              }}
            >
              {originName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDateOnly(originDate, "dateLong")}
            </Typography>
          </Stack>

          <Stack
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="center"
            flexShrink={0}
            sx={{ py: { xs: 0.25, md: 0 } }}
            aria-hidden
          >
            <Stack sx={{ display: { xs: "none", md: "flex" } }}>
              <ArrowRight size={16} color={theme.palette.text.secondary} />
            </Stack>
            <Stack sx={{ display: { xs: "flex", md: "none" } }}>
              <ArrowDown size={16} color={theme.palette.text.secondary} />
            </Stack>
          </Stack>

          <Stack
            spacing={0.5}
            flex={1}
            minWidth={0}
            alignItems={{ xs: "flex-start", md: "flex-end" }}
          >
            <Typography
              variant="body1"
              fontWeight={500}
              sx={{
                overflowWrap: "anywhere",
                whiteSpace: { xs: "normal", md: "nowrap" },
                textAlign: { xs: "left", md: "right" },
              }}
            >
              {branchName}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: { xs: "left", md: "right" } }}
            >
              Entrega: {formatDateOnly(deliveryDate, "dateLong")}
            </Typography>
          </Stack>
        </Stack>

        <RouteProgressTrack>
          <RouteProgressDot />
        </RouteProgressTrack>
      </Stack>
    </Stack>
  );
}
