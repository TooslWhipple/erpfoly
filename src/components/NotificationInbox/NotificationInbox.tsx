'use client';

import { Inbox } from '@novu/nextjs';
import { useInboxCredentials } from '@/hooks/useInboxCredentials';

export default function NotificationInbox() {
  const { data: credentials } = useInboxCredentials();

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
      placement="bottom-end"
      appearance={{
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
        elements: {
          bellIcon: {
            color: '#71717A',
          },
          inbox__popoverContent: {
            zIndex: 1300,
          },
        },
      }}
    />
  );
}
