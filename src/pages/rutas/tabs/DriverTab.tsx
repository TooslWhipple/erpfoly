import { Stack, Typography, Button, IconButton } from "@mui/material";
import { CircleMinus, CirclePlus, Plus, User } from "lucide-react";
import { DriverSection, IconContainer, PersonRow } from "@/styles/rutas.styles";
import type { RouteDetail } from "@/types/rutas.types";
import { colors } from "@/styles/theme";

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
        {
          routeDetail.driver ?
            <PersonRow>
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconContainer>
                  <User size={18} />
                </IconContainer>
                <Typography variant="subtitle2">{routeDetail.driver.name}</Typography>
              </Stack>
              <IconButton
                size="small"
                onClick={onRemoveDriver}>
                <CircleMinus size={16} color={colors.text.secondary} />
              </IconButton>
            </PersonRow>
            :
            <Typography variant="body2" color="text.secondary">Sin asignar</Typography>
        }
      </Stack>
      <Stack spacing={1} width="100%">

        <Typography variant="subtitle2">Ayudantes</Typography>
        {
          routeDetail.assistants.length === 0 ?
            <Typography variant="body2" color="text.secondary">Sin ayudantes</Typography>
            :
            routeDetail.assistants.map((a) => (
              <PersonRow key={a.id}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconContainer>
                    <User size={18} />
                  </IconContainer>
                  <Typography variant="subtitle2">{a.name}</Typography>
                </Stack>
                <IconButton
                  size="small"
                  onClick={() => onRemoveAssistant?.(a.id)}
                >
                  <CircleMinus size={16} color={colors.text.secondary} />
                </IconButton>
              </PersonRow>
            ))
        }
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

const RouteDriverTabPage = () => null;

export default RouteDriverTabPage;
