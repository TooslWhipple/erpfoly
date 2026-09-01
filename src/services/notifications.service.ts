import { get, unwrapOrThrow } from "@/lib/axios";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Everything the Novu `<Inbox>` needs to mount, as returned by the backend.
 *
 * The hash is an HMAC-SHA256 of the full prefixed `subscriberId` and is
 * computed in Apifoly: the Novu Secret Key never reaches the browser, and the
 * front never derives the subscriber id from the auth store.
 */
export interface InboxCredentials {
  subscriberId: string;
  subscriberHash: string;
  applicationIdentifier: string;
}

// ============================================================================
// SERVICE
// ============================================================================

export async function getInboxCredentials(): Promise<InboxCredentials> {
  const result = await get<InboxCredentials>("/notifications/inbox-credentials", {
    // The bell fetches on its own, without the user asking: a failure hides it
    // instead of raising a global error toast over whatever they were doing.
    skipGlobalErrorToast: true,
  });
  return unwrapOrThrow(result);
}
