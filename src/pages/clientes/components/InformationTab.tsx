import {
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  Place as PlaceIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import {
  InfoCard,
  InfoCardIcon,
  InfoCardLabel,
} from "@/styles/clientes/detalle.styles";
import { Grid, Stack, Typography } from "@mui/material";

const INFO_CATEGORIES = [
  { id: "basic", label: "Información básica", icon: <PersonIcon /> },
  { id: "family", label: "Familia", icon: <FavoriteIcon /> },
  { id: "address", label: "Dirección", icon: <PlaceIcon /> },
  { id: "employment", label: "Empleo", icon: <BusinessIcon /> },
  { id: "references", label: "Referencias", icon: <PeopleIcon /> },
  { id: "documentation", label: "Documentación", icon: <DescriptionIcon /> },
];

export function InformationTab() {
  const handleCategoryClick = (categoryId: string) => {
    console.log("[ClientDetail] Info category clicked:", categoryId);
  };

  return (
    <Stack spacing={2}>
      <Stack>
        <Typography variant="h3">Información</Typography>
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
                <InfoCardLabel>{cat.label}</InfoCardLabel>
              </InfoCard>
            </Grid>
          ))
        }
      </Grid>
    </Stack>
  );
}

const InformationTabPage = () => null;

export default InformationTabPage;
