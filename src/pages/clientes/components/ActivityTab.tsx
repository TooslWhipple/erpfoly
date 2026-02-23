import { useState } from "react";
import { Box, TextField, Button, MenuItem, Select, FormControl } from "@mui/material";
import {
  Phone as PhoneIcon,
  Message as MessageIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import type { ClientDetail, ClientActivity, ActivityType } from "@/types/clientes.types";
import {
  ActivityFormCard,
  ActivityFormActions,
  SectionTitle,
  ActivityList,
  ActivityItemCard,
  ActivityItemIcon,
  ActivityItemContent,
  ActivityItemMeta,
  ActivityItemDescription,
  ActiveCasesList,
  ActiveCaseCard,
  CaseStatusChip,
  CaseId,
  CaseDescription,
  CaseOrderType,
  EmptyState,
} from "@/styles/clientes/detalle.styles";

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "call":
      return <PhoneIcon fontSize="small" />;
    case "message":
    case "email":
      return <MessageIcon fontSize="small" />;
    default:
      return <PhoneIcon fontSize="small" />;
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
  { value: "call", label: "Llamada", icon: <PhoneIcon fontSize="small" /> },
  { value: "message", label: "Mensaje", icon: <MessageIcon fontSize="small" /> },
  { value: "email", label: "Correo", icon: <EmailIcon fontSize="small" /> },
  { value: "visit", label: "Visita", icon: <PersonIcon fontSize="small" /> },
  { value: "note", label: "Nota", icon: <DescriptionIcon fontSize="small" /> },
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
      <ActivityFormCard>
        <FormControl size="small" fullWidth sx={{ mb: 2 }}>
          <Select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as ActivityType)}
            displayEmpty
            renderValue={(value) => {
              const opt = ACTIVITY_TYPES.find((o) => o.value === value);
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {opt ? getActivityIcon(opt.value) : null}
                  <span>{opt?.label ?? value}</span>
                </Box>
              );
            }}
            sx={{ minHeight: 44 }}
          >
            {ACTIVITY_TYPES.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {opt.icon}
                  {opt.label}
                </Box>
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
        />
        <ActivityFormActions>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={activitySaving || !activityNotes.trim()}
          >
            Guardar
          </Button>
          <Button variant="outlined" onClick={handleCancel}>
            Cancelar
          </Button>
        </ActivityFormActions>
      </ActivityFormCard>

      <SectionTitle>Historial de actividad</SectionTitle>
      <ActivityList>
        {client.activities.length === 0 ? (
          <EmptyState>No hay actividad registrada</EmptyState>
        ) : (
          client.activities.map((activity: ClientActivity) => (
            <ActivityItemCard key={activity.id}>
              <ActivityItemIcon>{getActivityIcon(activity.type)}</ActivityItemIcon>
              <ActivityItemContent>
                <ActivityItemMeta>
                  {activity.type === "message" && activity.toolName
                    ? `Mensaje enviado automáticamente a través de ${activity.toolName}`
                    : `${getActivityTypeLabel(activity.type)} realizada por ${activity.author}`}{" "}
                  · {activity.date} {activity.time}
                </ActivityItemMeta>
                <ActivityItemDescription>{activity.description}</ActivityItemDescription>
              </ActivityItemContent>
            </ActivityItemCard>
          ))
        )}
      </ActivityList>

      <SectionTitle sx={{ mt: 3 }}>Casos activos</SectionTitle>
      <ActiveCasesList>
        {client.activeCases.length === 0 ? (
          <EmptyState>No hay casos activos</EmptyState>
        ) : (
          client.activeCases.map((c) => (
            <ActiveCaseCard key={c.id}>
              <CaseStatusChip label={c.statusLabel} size="small" />
              <CaseId>{c.id}</CaseId>
              <CaseDescription>{c.description}</CaseDescription>
              <CaseOrderType>{c.orderType}</CaseOrderType>
            </ActiveCaseCard>
          ))
        )}
      </ActiveCasesList>
    </>
  );
}
