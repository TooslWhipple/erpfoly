import { Avatar, Stack, Typography } from "@mui/material";
import { getInitials } from "@/components/Sidebar/sidebar.utils";

const MAX_VISIBLE = 3;

interface AccessAvatarsProps {
  emails: string[];
}

export function AccessAvatars({ emails }: AccessAvatarsProps) {
  if (emails.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  const visible = emails.slice(0, MAX_VISIBLE);
  const remaining = emails.length - visible.length;

  return (
    <Stack direction="row" spacing={-0.75} alignItems="center">
      {visible.map((email) => (
        <Avatar
          key={email}
          sx={{
            width: 28,
            height: 28,
            fontSize: 11,
            bgcolor: "primary.main",
            border: "2px solid white",
          }}
          title={email}
        >
          {getInitials(email.split("@")[0]?.replace(/\./g, " "))}
        </Avatar>
      ))}
      {remaining > 0 && (
        <Avatar
          sx={{
            width: 28,
            height: 28,
            fontSize: 11,
            bgcolor: "grey.400",
            border: "2px solid white",
          }}
        >
          +{remaining}
        </Avatar>
      )}
    </Stack>
  );
}
