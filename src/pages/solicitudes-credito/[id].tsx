import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Stack, Button, Typography, Skeleton } from "@mui/material";
import {
  MainLayout,
  Breadcrumbs,
  VerticalSidebarTabs,
  ImageViewerModal,
  ApproveCreditModal,
} from "@/components";
import { SectionContent } from "@/components/CreditApplicationDetailSections";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { VerticalSidebarTabItem } from "@/components/VerticalSidebarTabs";
import type { CreditApplicationDetail, CreditApplicationDetailSection } from "@/types/solicitud-credito-detail.types";
import { getCreditApplicationDetail } from "@/data/solicitud-credito-detail.mockData";
import {
  DetailLayout,
  SidebarColumn,
  ContentColumn,
  RiskCard,
  RiskBar,
  RiskScore,
  RiskLabel,
} from "@/styles/solicitudes-credito.styles";
import { colors } from "@/styles/theme";

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

const CONTENT_WRAPPER_STYLE = {
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: 24,
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
} as const;

export default function CreditApplicationDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [detail, setDetail] = useState<CreditApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<CreditApplicationDetailSection>("basic");
  const [imageViewer, setImageViewer] = useState<{ title: string; subtitle: string; url: string } | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  const loadDetail = useCallback(async (applicationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCreditApplicationDetail(applicationId);
      setDetail(data ?? null);
      if (!data) setError("Solicitud no encontrada");
    } catch (err) {
      console.error("[CreditApplicationDetail] Error loading:", err);
      setError("Error al cargar la solicitud");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id && typeof id === "string") {
      loadDetail(id);
    }
  }, [id, loadDetail]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Solicitudes de crédito", href: "/solicitudes-credito" },
    { label: "Detalle de solicitud", href: undefined },
  ];

  const handleBack = () => router.push("/solicitudes-credito");

  const handleOpenImageViewer = useCallback((title: string, subtitle: string, url: string) => {
    setImageViewer({ title, subtitle, url });
  }, []);

  if (loading) {
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

  if (error || !detail) {
    return (
      <MainLayout>
        <Stack spacing={3}>
          <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
          <div
            style={{
              padding: 48,
              textAlign: "center",
              color: colors.text.secondary,
            }}
          >
            <Typography>{error ?? "Solicitud no encontrada"}</Typography>
            <Button variant="outlined" onClick={handleBack} sx={{ mt: 2 }}>
              Volver al listado
            </Button>
          </div>
        </Stack>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              onClick={() => { }}>
              Solicitar inf. adicional
            </Button>
            <Button
              variant="outlined"
              onClick={() => { }}>
              Rechazar solicitud
            </Button>
            <Button
              variant="contained"
              onClick={() => setApproveModalOpen(true)}>
              Aprobar solicitud
            </Button>
          </Stack>
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
            <div style={CONTENT_WRAPPER_STYLE}>
              <SectionContent
                detail={detail}
                activeSection={activeSection}
                onOpenImageViewer={handleOpenImageViewer}
              />
            </div>
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
        />
      )}

      <ApproveCreditModal
        open={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        suggestedAmount={detail.suggestedCreditLine}
        minAmount={detail.minCreditLine}
        maxAmount={detail.maxCreditLine}
      />
    </MainLayout>
  );
}
