import { Stack, Typography, Button, IconButton } from "@mui/material";
import { CircleMinus, CirclePlus, User } from "lucide-react";
import { IconContainer, PersonRow } from "@/styles/rutas.styles";
import { theme } from "@/styles/theme";
import type { RouteDetail } from "@/types/rutas.types";

export interface DriverTabProps {
  routeDetail: RouteDetail;
  onAddPerson?: () => void;
  onRemoveDriver?: () => void;
  onRemoveAssistant?: (assistantId: string) => void;
}

export function DriverTab({
  routeDetail,
  onAddPerson,
  onRemoveDriver,
  onRemoveAssistant,
}: DriverTabProps) {
  return (
    <Stack spacing={2} alignItems="flex-start">
      <Stack spacing={1} width="100%">
        <Typography variant="subtitle2">Chofer</Typography>
        {routeDetail.driver ? (
          <PersonRow>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconContainer>
                <User size={18} />
              </IconContainer>
              <Typography variant="subtitle2">{routeDetail.driver.name}</Typography>
            </Stack>
            <IconButton size="small" onClick={onRemoveDriver}>
              <CircleMinus size={16} color={theme.palette.text.secondary} />
            </IconButton>
          </PersonRow>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Sin asignar
          </Typography>
        )}
      </Stack>
      <Stack spacing={1} width="100%">
        <Typography variant="subtitle2">Ayudantes</Typography>
        {routeDetail.assistants.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Sin ayudantes
          </Typography>
        ) : (
          routeDetail.assistants.map((assistant) => (
            <PersonRow key={assistant.id}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconContainer>
                  <User size={18} />
                </IconContainer>
                <Typography variant="subtitle2">{assistant.name}</Typography>
              </Stack>
              <IconButton
                size="small"
                onClick={() => onRemoveAssistant?.(assistant.id)}
              >
                <CircleMinus size={16} color={theme.palette.text.secondary} />
              </IconButton>
            </PersonRow>
          ))
        )}
      </Stack>

      <Button
        variant="outlined"
        size="small"
        startIcon={<CirclePlus size={16} />}
        onClick={onAddPerson}
      >
        Agregar otro
      </Button>
    </Stack>
  );
}
