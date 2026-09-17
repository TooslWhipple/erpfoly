'use client';

import { useRef, useState } from 'react';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import { Bell as LucideBell } from 'lucide-react';
import { Bell, Inbox, InboxContent } from '@novu/nextjs';
import { useInboxCredentials } from '@/hooks/useInboxCredentials';

const inboxAppearance = {
  variables: {
    colorPrimary: '#2663EB',
    colorPrimaryForeground: '#FFFFFF',
    colorSecondary: '#ec4899',
    colorSecondaryForeground: '#FFFFFF',
    colorBackground: '#FFFFFF',
    colorForeground: '#232325',
    colorNeutral: '#D4D4D8',
    colorShadow: 'rgba(0, 0, 0, 0.08)',
    fontSize: '14px',
  },
} as const;

export default function NotificationInbox() {
  const { data: credentials } = useInboxCredentials();
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  // Never render an unsigned Inbox: with HMAC enabled in Novu, an <Inbox>
  // without its hash is rejected, so while the request is in flight or if it
  // failed the bell simply is not shown.
  if (!credentials) {
    return null;
  }

  return (
    <Inbox
      applicationIdentifier={credentials.applicationIdentifier}
      subscriberId={credentials.subscriberId}
      subscriberHash={credentials.subscriberHash}
      appearance={inboxAppearance}
    >
      <Box
        ref={anchorRef}
        onClick={() => setOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen((prev) => !prev);
          }
        }}
        aria-label="Notificaciones"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          flexShrink: 0,
          cursor: 'pointer',
          borderRadius: 1,
        }}
      >
        <Bell
          renderBell={(unreadCount) => (
            <Badge
              color="error"
              variant="dot"
              invisible={unreadCount.total === 0}
              overlap="circular"
            >
              <LucideBell size={18} color="#71717A" />
            </Badge>
          )}
        />
      </Box>
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              width: 400,
              maxWidth: 'calc(100vw - 24px)',
              height: 600,
              maxHeight: 'calc(100vh - 24px)',
              overflow: 'hidden',
              zIndex: 1300,
            },
          },
        }}
      >
        <InboxContent />
      </Popover>
    </Inbox>
  );
}
