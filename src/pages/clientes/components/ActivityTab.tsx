import { useState } from "react";
import {
  Alert,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Card,
  ActivityItemCard,
} from "@/styles/clientes/detalle.styles";
import { FileText, Mail, Phone, User } from "lucide-react";
import { colors } from "@/styles/theme";
import { StatusChip } from "@/components";
import type {
  ClientCollectionActivity,
  ClientCollectionActivityType,
  ClientDetail,
} from "@/types/clientes.types";
import { formatDate } from "@/utils/date";
import { getApiErrorMessage } from "@/lib/axios";

function getActivityIcon(code: string) {
  switch (code) {
    case "CALL":
      return <Phone size={16} color={colors.text.secondary} />;
    case "MESSAGE":
      return <Mail size={16} color={colors.text.secondary} />;
    case "EMAIL":
      return <Mail size={16} color={colors.text.secondary} />;
    case "VISIT":
      return <User size={16} color={colors.text.secondary} />;
    case "NOTE":
      return <FileText size={16} color={colors.text.secondary} />;
    default:
      return <Phone size={16} color={colors.text.secondary} />;
  }
}

export interface ActivityTabProps {
  client: ClientDetail;
  activities: ClientCollectionActivity[];
  activityTypes: ClientCollectionActivityType[];
  loadingActivities: boolean;
  onCreateActivity: (payload: { activityTypeId: number; comment: string }) => Promise<void>;
}

export function ActivityTab({
  client,
  activities,
  activityTypes,
  loadingActivities,
  onCreateActivity,
}: ActivityTabProps) {
  const [activityTypeId, setActivityTypeId] = useState<number | null>(null);
  const [activityNotes, setActivityNotes] = useState("");
  const [activitySaving, setActivitySaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <Select
                  size="small"
                  value={activityTypeId ?? ""}
                  onChange={(event) => setActivityTypeId(Number(event.target.value))}
                  displayEmpty
                  disabled={activitySaving || activityTypes.length === 0}
                  renderValue={(value) => {
                    const selected =
                      activityTypes.find((item) => item.id === Number(value)) ?? null;
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
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {selected.name}
                        </Typography>
                      </Stack>
                    );
                  }}
                >
                  {activityTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {getActivityIcon(type.code)}
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
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
                <Button variant="contained" onClick={handleSave} disabled={activitySaving}>
                  Guardar
                </Button>
                <Button variant="outlined" onClick={handleCancel} disabled={activitySaving}>
                  Cancelar
                </Button>
              </Stack>
            </Stack>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Historial de actividad
            </Typography>
            <Stack spacing={4} style={{ position: "relative" }}>
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
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {`${activity.activityType.name} realizada por ${activity.createdBy.name}`}
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
                  backgroundColor: colors.border,
                  position: "absolute",
                  top: 8,
                  left: "56px",
                  bottom: 8,
                }}
              />
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Casos activos
            </Typography>
            {client.activeCases.map((c) => (
              <ActivityItemCard key={c.id}>
                <Stack spacing={1} alignItems="flex-start">
                  <StatusChip variant="info" size="small" label={c.statusLabel} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {c.id}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    <span style={{ color: colors.text.secondary }}>[1]</span> {c.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {c.orderType}
                  </Typography>
                </Stack>
              </ActivityItemCard>
            ))}
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

const ActivityTabPage = () => null;

export default ActivityTabPage;
