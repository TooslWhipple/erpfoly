import { useState } from "react";
import { TextField, Button, MenuItem, Select, FormControl, Grid, Stack, Typography } from "@mui/material";
import type { ClientDetail, ClientActivity, ActivityType } from "@/types/clientes.types";
import {
  Card,
  ActivityItemCard
} from "@/styles/clientes/detalle.styles";
import { FileText, Mail, Phone, User } from "lucide-react";
import { colors } from "@/styles/theme";
import { StatusChip } from "@/components";

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "call":
      return <Phone size={16} color={colors.text.secondary} />;
    case "message":
    case "email":
      return <Mail size={16} color={colors.text.secondary} />;
    default:
      return <Phone size={16} color={colors.text.secondary} />;
  }
}

function getActivityTypeLabel(type: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    call: "Llamada",
    message: "Mensaje",
    email: "Correo",
    visit: "Visita",
    note: "Nota",
  };
  return labels[type] ?? type;
}

const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: React.ReactNode }[] = [
  { value: "call", label: "Llamada", icon: <Phone size={16} color={colors.text.secondary} /> },
  { value: "message", label: "Mensaje", icon: <Mail size={16} color={colors.text.secondary} /> },
  { value: "email", label: "Correo", icon: <Mail size={16} color={colors.text.secondary} /> },
  { value: "visit", label: "Visita", icon: <User size={16} color={colors.text.secondary} /> },
  { value: "note", label: "Nota", icon: <FileText size={16} color={colors.text.secondary} /> },
];

export interface ActivityTabProps {
  client: ClientDetail;
}

export function ActivityTab({ client }: ActivityTabProps) {
  const [activityType, setActivityType] = useState<ActivityType>("call");
  const [activityNotes, setActivityNotes] = useState("");
  const [activitySaving, setActivitySaving] = useState(false);

  const handleSave = () => {
    if (!activityNotes.trim()) return;
    setActivitySaving(true);
    setTimeout(() => {
      setActivityNotes("");
      setActivitySaving(false);
    }, 500);
  };

  const handleCancel = () => setActivityNotes("");

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <Select
                  size="small"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as ActivityType)}
                  displayEmpty
                  renderValue={(value) => {
                    const opt = ACTIVITY_TYPES.find((o) => o.value === value);
                    return (
                      <Stack direction="row" spacing={1} alignItems="center">
                        {(opt) ? opt.icon : null}
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>{opt?.label ?? value}</Typography>
                      </Stack>
                    );
                  }}
                >
                  {
                    ACTIVITY_TYPES.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {(opt) ? opt.icon : null}
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>{opt?.label}</Typography>
                        </Stack>
                      </MenuItem>
                    ))
                  }
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
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={activitySaving}>
                  Guardar
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancel}>
                  Cancelar
                </Button>
              </Stack>
            </Stack>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Historial de actividad</Typography>
            <Stack spacing={4} style={{ position: "relative" }}>
              {
                client.activities.map((activity: ClientActivity) => (
                  <ActivityItemCard key={activity.id}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {
                        getActivityIcon(activity.type)
                      }
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {
                          activity.type === "message" && activity.toolName
                            ? `Mensaje enviado automáticamente a través de ${activity.toolName}`
                            : `${getActivityTypeLabel(activity.type)} realizada por ${activity.author}`
                        }
                      </Typography>
                    </Stack>
                    <Stack>
                      <Typography variant="body2" color="text.secondary">{activity.date} {activity.time}</Typography>
                      <Typography variant="body1">{activity.description}</Typography>
                    </Stack>
                  </ActivityItemCard>
                ))
              }
              <div
                style={{ width: "1px", backgroundColor: colors.border, position: "absolute", top: 8, left: "56px", bottom: 8 }}
              />
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Casos activos</Typography>
            {
              client.activeCases.map((c) => (
                <ActivityItemCard key={c.id}>
                  <Stack spacing={1} alignItems="flex-start">
                    <StatusChip
                      variant="info"
                      size="small"
                      label={c.statusLabel}
                    />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>{c.id}</Typography>
                    <Typography variant="body1" fontWeight={600}><span style={{ color: colors.text.secondary }}>[1]</span> {c.description}</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>{c.orderType}</Typography>
                  </Stack>
                </ActivityItemCard>
              ))
            }
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

const ActivityTabPage = () => null;

export default ActivityTabPage;
