import {
  InfoCard,
  InfoCardIcon,
  Card,
} from "@/styles/clientes/detalle.styles";
import { useRouter } from "next/router";
import { Grid, Stack, Typography } from "@mui/material";
import { Briefcase, FolderOpen, Heart, Map, User, Users } from "lucide-react";

const INFO_CATEGORIES = [
  { id: "basic-information", label: "Información básica", icon: <User /> },
  { id: "family", label: "Familia", icon: <Heart /> },
  { id: "address", label: "Dirección", icon: <Map /> },
  { id: "employment", label: "Empleo", icon: <Briefcase /> },
  { id: "references", label: "Referencias", icon: <Users /> },
  { id: "documentation", label: "Documentación", icon: <FolderOpen /> },
] as const;

interface InformationTabProps {
  isCreditClient: boolean;
}

export function InformationTab({ isCreditClient }: InformationTabProps) {
  const router = useRouter();

  const categories = isCreditClient
    ? INFO_CATEGORIES
    : INFO_CATEGORIES.filter((cat) => cat.id === "basic-information");

  const handleCategoryClick = (categoryId: string) => {
    const { id } = router.query;
    if (typeof id !== "string") return;
    router.push(`/clientes/${id}/editar?tab=${categoryId}`);
  };

  return (
    <Card>
      <Stack spacing={1}>
        <Typography variant="h5">Información</Typography>
        <Typography variant="body2" color="text.secondary">
          {isCreditClient
            ? "Visualiza y gestiona la información del cliente."
            : "Este cliente de contado solo tiene información básica registrada."}
        </Typography>
      </Stack>
      <Grid container spacing={2}>
        {categories.map((cat) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={cat.id}>
            <InfoCard
              onClick={() => handleCategoryClick(cat.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && handleCategoryClick(cat.id)
              }
            >
              <InfoCardIcon>{cat.icon}</InfoCardIcon>
              <Typography
                variant="body2"
                color="text.primary"
                fontWeight={500}
              >
                {cat.label}
              </Typography>
            </InfoCard>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}

const InformationTabPage = () => null;

export default InformationTabPage;
