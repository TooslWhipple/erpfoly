import { Button, Typography, Box } from "@mui/material";
import { useRouter } from "next/router";
import { usePermissions } from "@/hooks/usePermissions";
import { Container, TitleContainer, Description, ActionsContainer } from "./styles";

type ActionVariant = "contained" | "outlined" | "text";
type ActionColor = "primary" | "secondary" | "error" | "warning" | "info" | "success";

export interface TitleAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: ActionVariant;
  color?: ActionColor;
  permission?: string;
  disabled?: boolean;
  loading?: boolean;
}

interface TitleProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  actions?: TitleAction[];
}

export function Title({ title, description, actions }: TitleProps) {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const handleAction = (action: TitleAction) => {
    if (action.href) {
      router.push(action.href);
    } else if (action.onClick) {
      action.onClick();
    }
  };

  const visibleActions = actions?.filter((action) => {
    if (!action.permission) return true;
    return hasPermission(action.permission);
  });

  return (
    <Container>
      <TitleContainer>
        {typeof title === "string" ? (
          <Typography variant="h2">{title}</Typography>
        ) : (
          <Box sx={{ "& .MuiTypography-h2": { margin: 0 } }}>
            <Typography variant="h2" component="div" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {title}
            </Typography>
          </Box>
        )}
        {description && (
          typeof description === "string" ? (
            <Description variant="body2" color="text.secondary">
              {description}
            </Description>
          ) : (
            <Box sx={{ mt: 0.5 }}>{description}</Box>
          )
        )}
      </TitleContainer>

      {visibleActions && visibleActions.length > 0 && (
        <ActionsContainer>
          {visibleActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || "contained"}
              color={action.color || "primary"}
              disabled={action.disabled || action.loading}
              loading={action.loading}
              onClick={() => handleAction(action)}
              startIcon={action.icon}
            >
              {action.label}
            </Button>
          ))}
        </ActionsContainer>
      )}
    </Container>
  );
}
