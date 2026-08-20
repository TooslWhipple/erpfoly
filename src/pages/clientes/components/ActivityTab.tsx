import { useState } from "react";
import {
  Alert,
  Button,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Card, ActivityItemCard } from "@/styles/clientes/detalle.styles";
import { FileText, Mail, Phone, User, Ban } from "lucide-react";
import { theme } from "@/styles/theme";
import type {
  ClientCollectionActivity,
  ClientCollectionActivityType,
} from "@/types/clientes.types";
import { formatDate } from "@/utils/date";
import { getApiErrorMessage } from "@/lib/axios";

function getActivityIcon(code: string) {
  switch (code) {
    case "CALL":
      return <Phone size={16} color={theme.palette.text.secondary} />;
    case "MESSAGE":
      return <Mail size={16} color={theme.palette.text.secondary} />;
    case "EMAIL":
      return <Mail size={16} color={theme.palette.text.secondary} />;
    case "VISIT":
      return <User size={16} color={theme.palette.text.secondary} />;
    case "NOTE":
      return <FileText size={16} color={theme.palette.text.secondary} />;
    case "DEACTIVATION":
      return <Ban size={16} color={theme.palette.text.secondary} />;
    default:
      return <Phone size={16} color={theme.palette.text.secondary} />;
  }
}

export interface ActivityTabProps {
  activities: ClientCollectionActivity[];
  activityTypes: ClientCollectionActivityType[];
  loadingActivities: boolean;
  onCreateActivity: (payload: {
    activityTypeId: number;
    comment: string;
  }) => Promise<void>;
}

export function ActivityTab({
  activities,
  activityTypes,
  loadingActivities,
  onCreateActivity,
}: ActivityTabProps) {
  const [activityTypeId, setActivityTypeId] = useState<number | null>(null);
  const [activityNotes, setActivityNotes] = useState("");
  const [activitySaving, setActivitySaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectableActivityTypes = activityTypes.filter(
    (type) => type.code !== "DEACTIVATION",
  );

  const getActivityHeading = (activity: ClientCollectionActivity) => {
    if (activity.activityType.code === "DEACTIVATION") {
      return `Baja registrada del cliente por ${activity.createdBy.name}`;
    }
    return `${activity.activityType.name} realizada por ${activity.createdBy.name}`;
  };

  const handleSave = async () => {
    const comment = activityNotes.trim();
    if (!activityTypeId) {
      setFormError("Selecciona un tipo de actividad.");
      return;
    }
    if (!comment) {
      setFormError("Escribe un comentario para guardar la actividad.");
      return;
    }
    setFormError(null);
    setActivitySaving(true);
    try {
      await onCreateActivity({
        activityTypeId,
        comment,
      });
      setActivityNotes("");
      setActivityTypeId(null);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setActivitySaving(false);
    }
  };

  const handleCancel = () => {
    setActivityNotes("");
    setActivityTypeId(null);
    setFormError(null);
  };

  return (
    <Card>
      <Stack spacing={2}>
        <FormControl fullWidth>
          <Select
            size="small"
            value={activityTypeId ?? ""}
            onChange={(event) =>
              setActivityTypeId(Number(event.target.value))
            }
            displayEmpty
            disabled={activitySaving || activityTypes.length === 0}
            renderValue={(value) => {
              const selected =
                activityTypes.find((item) => item.id === Number(value)) ??
                null;
              if (!selected) {
                return (
                  <Typography variant="body2" color="text.secondary">
                    Selecciona tipo de actividad
                  </Typography>
                );
              }
              return (
                <Stack direction="row" spacing={1} alignItems="center">
                  {getActivityIcon(selected.code)}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    {selected.name}
                  </Typography>
                </Stack>
              );
            }}
          >
            {selectableActivityTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                <Stack direction="row" spacing={1} alignItems="center">
                  {getActivityIcon(type.code)}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    {type.name}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Escribe aquí..."
          value={activityNotes}
          onChange={(e) => setActivityNotes(e.target.value)}
          variant="outlined"
          size="small"
          disabled={activitySaving}
        />
        {formError ? <Alert severity="error">{formError}</Alert> : null}
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={activitySaving}
          >
            Guardar
          </Button>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={activitySaving}
          >
            Cancelar
          </Button>
        </Stack>
      </Stack>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        Historial de actividad
      </Typography>
      <Stack
        spacing={4}
        style={{
          position: "relative",
        }}
      >
        {loadingActivities ? (
          <Typography variant="body2" color="text.secondary">
            Cargando actividades...
          </Typography>
        ) : activities.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay actividades registradas.
          </Typography>
        ) : (
          activities.map((activity) => (
            <ActivityItemCard key={activity.id}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {getActivityIcon(activity.activityType.code)}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={500}
                >
                  {getActivityHeading(activity)}
                </Typography>
              </Stack>
              <Stack>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(activity.createdAt, "datetimeShort12h")}
                </Typography>
                <Typography variant="body1">{activity.comment}</Typography>
              </Stack>
            </ActivityItemCard>
          ))
        )}
        <div
          style={{
            width: "1px",
            backgroundColor: theme.palette.app.border,
            position: "absolute",
            top: 8,
            left: "56px",
            bottom: 8,
          }}
        />
      </Stack>
    </Card>
  );
}

const ActivityTabPage = () => null;
export default ActivityTabPage;
