import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Stack, Button, Typography, Skeleton } from "@mui/material";
import {
  MainLayout,
  Breadcrumbs,
  VerticalSidebarTabs,
  ImageViewerModal,
  ApproveCreditModal,
  RejectCreditModal,
  RequestAdditionalInfoModal,
} from "@/components";
import { SectionContent } from "@/components/CreditApplicationDetailSections";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { VerticalSidebarTabItem } from "@/components/VerticalSidebarTabs";
import type { CreditApplicationDetailSection } from "@/types/solicitud-credito-detail.types";
import { getCreditApplicationById } from "@/services/creditApplications.service";
import { mapCreditApplicationDetailResponseToReviewDetail } from "@/lib/creditApplicationReviewDetailMapper";
import {
  DetailLayout,
  SidebarColumn,
  ContentColumn,
  RiskCard,
  RiskBar,
  RiskScore,
  RiskLabel,
  RevisionContentWrapper,
  RevisionErrorContainer,
} from "@/styles/solicitudes-credito.styles";

const SECTION_TABS: VerticalSidebarTabItem[] = [
  { value: "basic", label: "Información básica" },
  { value: "address", label: "Dirección" },
  { value: "family", label: "Familia" },
  { value: "employment", label: "Empleo" },
  { value: "references", label: "Referencias" },
  { value: "documentation", label: "Documentación" },
  { value: "credit-bureau", label: "Buró de crédito" },
  { value: "biometrics", label: "Biometricos" },
  { value: "purchase-intention", label: "Intención de compra" },
];

const RISK_LABELS: Record<string, string> = {
  low: "Riesgo bajo",
  medium: "Riesgo medio",
  high: "Riesgo alto",
};

export default function CreditApplicationReviewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [activeSection, setActiveSection] = useState<CreditApplicationDetailSection>("basic");
  const [imageViewer, setImageViewer] = useState<{
    title: string;
    subtitle: string;
    url: string;
    backgroundColor?: string;
  } | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [requestAdditionalInfoOpen, setRequestAdditionalInfoOpen] = useState(false);

  const idString = typeof id === "string" ? id : undefined;
  const numericId = idString !== undefined ? Number(idString) : NaN;
  const idIsValid = idString !== undefined && Number.isFinite(numericId);

  const detailQuery = useQuery({
    queryKey: ["credit-application", "review", idString],
    queryFn: () => getCreditApplicationById(idString!),
    enabled: router.isReady && idIsValid,
  });

  const detail = useMemo(
    () => idIsValid && detailQuery.data
      ? mapCreditApplicationDetailResponseToReviewDetail(numericId, detailQuery.data)
      : null,
    [detailQuery.data, idIsValid, numericId]
  );

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Solicitudes de crédito", href: "/solicitudes-credito" },
    { label: "Revisión de solicitud", href: undefined },
  ];

  const handleBack = () => {
    void router.push("/solicitudes-credito");
  };

  const handleOpenImageViewer = useCallback(
    (title: string, subtitle: string, url: string, backgroundColor?: string) => {
      setImageViewer({ title, subtitle, url, backgroundColor });
    },
    [],
  );

  if (!router.isReady) {
    return null;
  }

  if (!idString || !idIsValid) {
    return (
      <MainLayout>
        <Stack spacing={3}>
          <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
          <RevisionErrorContainer>
            <Typography>Identificador de solicitud no válido</Typography>
            <Button variant="outlined" onClick={handleBack} sx={{ mt: 2 }}>
              Volver al listado
            </Button>
          </RevisionErrorContainer>
        </Stack>
      </MainLayout>
    );
  }

  if (detailQuery.isPending) {
    return (
      <MainLayout>
        <Stack spacing={3}>
          <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
          <DetailLayout>
            <SidebarColumn>
              <Skeleton variant="rectangular" height={72} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 1 }} />
            </SidebarColumn>
            <ContentColumn>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
            </ContentColumn>
          </DetailLayout>
        </Stack>
      </MainLayout>
    );
  }

  if (detailQuery.isError || !detail) {
    return (
      <MainLayout>
        <Stack spacing={3}>
          <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
          <RevisionErrorContainer>
            <Typography>No se pudo cargar la solicitud, intenta nuevamente.</Typography>
            <Button variant="outlined" onClick={() => void detailQuery.refetch()} sx={{ mt: 2, mr: 1 }}>
              Reintentar
            </Button>
            <Button variant="outlined" onClick={handleBack} sx={{ mt: 2 }}>
              Volver al listado
            </Button>
          </RevisionErrorContainer>
        </Stack>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
          {
            detail.status !== "REJECTED" && detail.status !== "APPROVED" &&
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="outlined" onClick={() => setRequestAdditionalInfoOpen(true)}>
                Solicitar inf. adicional
              </Button>
              <Button variant="outlined" color="error" onClick={() => setRejectModalOpen(true)}>
                Rechazar solicitud
              </Button>
              <Button variant="contained" onClick={() => setApproveModalOpen(true)}>
                Aprobar solicitud
              </Button>
            </Stack>
          }
        </Stack>

        <DetailLayout>
          <SidebarColumn>
            <RiskCard>
              <RiskBar />
              <RiskScore>{detail.riskScore}</RiskScore>
              <RiskLabel>{RISK_LABELS[detail.riskLevel] ?? detail.riskLevel}</RiskLabel>
            </RiskCard>
            <VerticalSidebarTabs
              tabs={SECTION_TABS}
              value={activeSection}
              onChange={(v) => setActiveSection(v as CreditApplicationDetailSection)}
              dividerBeforeValue="purchase-intention"
            />
          </SidebarColumn>
          <ContentColumn>
            <RevisionContentWrapper>
              <SectionContent
                detail={detail}
                activeSection={activeSection}
                onOpenImageViewer={handleOpenImageViewer}
              />
            </RevisionContentWrapper>
          </ContentColumn>
        </DetailLayout>
      </Stack>

      {imageViewer && (
        <ImageViewerModal
          open={!!imageViewer}
          onClose={() => setImageViewer(null)}
          title={imageViewer.title}
          subtitle={imageViewer.subtitle}
          imageUrl={imageViewer.url}
          previewBackgroundColor={imageViewer.backgroundColor}
        />
      )}

      <ApproveCreditModal
        open={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        suggestedAmount={detail.suggestedCreditLine}
        minAmount={detail.minCreditLine}
        maxAmount={detail.maxCreditLine}
      />

      <RejectCreditModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        applicationId={idString}
        cooldownMonths={6}
        onRejectSuccess={() => {
          void router.push("/solicitudes-credito");
        }}
      />

      <RequestAdditionalInfoModal
        applicationId={idString}
        requestedItems={detailQuery.data.additionalInformationRequested ?? []}
        open={requestAdditionalInfoOpen}
        onClose={() => setRequestAdditionalInfoOpen(false)}
      />
    </MainLayout>
  );
}
