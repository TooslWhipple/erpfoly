const REQUIRE_AUTH_ENV_VALUE = process.env.NEXT_PUBLIC_REQUIRE_AUTH;

/**
 * Frontend access control switch.
 *
 * Set NEXT_PUBLIC_REQUIRE_AUTH=false in local development to render protected
 * screens without an authenticated user. Production always keeps auth enabled.
 */
export const shouldRequireAuthenticatedUser =
  process.env.NODE_ENV === "production" || REQUIRE_AUTH_ENV_VALUE !== "false";

export const shouldBypassAccessControl = !shouldRequireAuthenticatedUser;
