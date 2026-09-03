import { Stack, Typography, Button, IconButton } from "@mui/material";
import { CircleMinus, Plus, User } from "lucide-react";
import { VehicleSearchField } from "@/components/VehicleSearchField";
import { IconContainer, PersonRow } from "@/styles/rutas.styles";
import { theme } from "@/styles/theme";
import type { RouteDetail } from "@/types/rutas.types";

export const MAX_ASSISTANTS_PER_ROUTE = 2;

export interface DriverTabProps {
  routeDetail: RouteDetail;
  onAddDriver?: () => void;
  onAddAssistant?: () => void;
  onRemoveDriver?: () => void;
  onRemoveAssistant?: (assistantId: string) => void;
  onAssignVehicle?: (vehicleId: number | null) => void;
  canManage?: boolean;
  loadingDriver?: boolean;
  loadingAssistant?: boolean;
  loadingVehicle?: boolean;
}

export function DriverTab({
  routeDetail,
  onAddDriver,
  onAddAssistant,
  onRemoveDriver,
  onRemoveAssistant,
  onAssignVehicle,
  canManage = true,
  loadingDriver = false,
  loadingAssistant = false,
  loadingVehicle = false,
}: DriverTabProps) {
  const hasDriver = Boolean(routeDetail.driver);
  const assistantCount = routeDetail.assistants.length;
  const maxAssistantsReached = assistantCount >= MAX_ASSISTANTS_PER_ROUTE;

  return (
    <Stack spacing={3} alignItems="flex-start">
      <Stack spacing={1} width="100%">
        {canManage ? (
          <VehicleSearchField
            label="Vehículo asignado"
            value={routeDetail.vehicleId}
            selectedLabel={routeDetail.vehicle?.label ?? null}
            onChange={(vehicleId) => onAssignVehicle?.(vehicleId)}
            disabled={loadingVehicle}
          />
        ) : routeDetail.vehicle ? (
          <>
            <Typography variant="subtitle2">Vehículo asignado</Typography>
            <Typography variant="body2">{routeDetail.vehicle.label}</Typography>
          </>
        ) : (
          <>
            <Typography variant="subtitle2">Vehículo asignado</Typography>
            <Typography variant="body2" color="text.secondary">
              Sin asignar
            </Typography>
          </>
        )}
      </Stack>

      <Stack spacing={1} width="100%">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Typography variant="subtitle2">Chofer</Typography>
          {canManage && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={onAddDriver}
              disabled={loadingDriver || hasDriver}
            >
              Agregar chofer
            </Button>
          )}
        </Stack>
        {routeDetail.driver ? (
          <PersonRow>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconContainer>
                <User size={18} />
              </IconContainer>
              <Typography variant="subtitle2">
                {routeDetail.driver.name}
              </Typography>
            </Stack>
            {canManage && (
              <IconButton
                size="small"
                onClick={onRemoveDriver}
                disabled={loadingDriver}
              >
                <CircleMinus size={16} color={theme.palette.text.secondary} />
              </IconButton>
            )}
          </PersonRow>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Sin asignar
          </Typography>
        )}
      </Stack>

      <Stack spacing={1} width="100%">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Typography variant="subtitle2">Ayudantes</Typography>
          {canManage && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={onAddAssistant}
              disabled={loadingAssistant || maxAssistantsReached}
            >
              Agregar ayudante
            </Button>
          )}
        </Stack>
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
              {canManage && (
                <IconButton
                  size="small"
                  onClick={() => onRemoveAssistant?.(assistant.id)}
                  disabled={loadingAssistant}
                >
                  <CircleMinus size={16} color={theme.palette.text.secondary} />
                </IconButton>
              )}
            </PersonRow>
          ))
        )}
      </Stack>
    </Stack>
  );
}
