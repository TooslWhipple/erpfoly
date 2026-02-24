import {
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  Place as PlaceIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import {
  InfoSectionHeader,
  InfoSectionTitle,
  InfoSectionSubtitle,
  InfoGrid,
  InfoCard,
  InfoCardIcon,
  InfoCardLabel,
} from "@/styles/clientes/detalle.styles";

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
    <>
      <InfoSectionHeader>
        <InfoSectionTitle>Información</InfoSectionTitle>
        <InfoSectionSubtitle>
          Visualiza y gestiona la información del cliente.
        </InfoSectionSubtitle>
      </InfoSectionHeader>
      <InfoGrid>
        {INFO_CATEGORIES.map((cat) => (
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
        ))}
      </InfoGrid>
    </>
  );
}
