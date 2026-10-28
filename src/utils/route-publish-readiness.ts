export const ROUTE_PUBLISH_REQUIREMENTS_NOT_MET =
  "ROUTE_PUBLISH_REQUIREMENTS_NOT_MET";

export function formatPublishRouteFailure(
  api:
    | {
        message?: string;
        errorCode?: string;
        requirementErrors?: { code: string; message: string }[];
      }
    | null
    | undefined,
  fallbackMessage: string,
): string {
  if (api?.errorCode !== ROUTE_PUBLISH_REQUIREMENTS_NOT_MET) {
    return fallbackMessage;
  }

  const details = api.requirementErrors ?? [];
  if (details.length === 1) return details[0].message;
  if (api.message) return api.message;
  if (details.length > 1) {
    return details.map((detail) => detail.message).join("\n");
  }
  return fallbackMessage;
}
