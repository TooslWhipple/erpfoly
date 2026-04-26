import {
  InfoCard,
  InfoCardIcon,
  InfoCardLabel,
  Card
} from "@/styles/clientes/detalle.styles";
import { Grid, Stack, Typography } from "@mui/material";
import { Briefcase, FolderOpen, Heart, Map, User, Users } from "lucide-react";

const INFO_CATEGORIES = [
  { id: "basic", label: "Información básica", icon: <User /> },
  { id: "family", label: "Familia", icon: <Heart /> },
  { id: "address", label: "Dirección", icon: <Map /> },
  { id: "employment", label: "Empleo", icon: <Briefcase /> },
  { id: "references", label: "Referencias", icon: <Users /> },
  { id: "documentation", label: "Documentación", icon: <FolderOpen /> },
];

export function InformationTab() {
  const handleCategoryClick = (categoryId: string) => {
    console.log("[ClientDetail] Info category clicked:", categoryId);
  };

  return (
    <Card>
      <Stack>
        <Typography variant="h5">Información</Typography>
        <Typography variant="body2" color="text.secondary">Visualiza y gestiona la información del cliente.</Typography>
      </Stack>
      <Grid container spacing={2}>
        {
          INFO_CATEGORIES.map((cat) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={cat.id}>
              <InfoCard
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleCategoryClick(cat.id)}
              >
                <InfoCardIcon>{cat.icon}</InfoCardIcon>
                <Typography variant="body2" color="text.primary" fontWeight={500}>{cat.label}</Typography>
              </InfoCard>
            </Grid>
          ))
        }
      </Grid>
    </Card>
  );
}

const InformationTabPage = () => null;

export default InformationTabPage;
