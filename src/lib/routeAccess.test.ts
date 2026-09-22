/**
 * Post-login landing: honor an allowed redirect, otherwise first allowed home.
 * Run: npx --yes tsx src/lib/routeAccess.test.ts
 */
import assert from "node:assert/strict";
import type { User } from "../store/useAuthStore";
import { CASH_REGISTERS_READ, CUSTOMERS_READ } from "./permissions";
import { shouldBypassAccessControl } from "./accessControl";
import { getFirstAllowedRoute, resolvePostLoginPath } from "./routeAccess";

function userWith(permissions: string[]): User {
  return {
    id: "1",
    name: "Test",
    email: "test@foly.local",
    role: "cajero",
    permissions,
  };
}

assert.equal(getFirstAllowedRoute(userWith([CUSTOMERS_READ])), "/clientes");
assert.equal(resolvePostLoginPath(userWith([CUSTOMERS_READ])), "/clientes");
assert.equal(
  resolvePostLoginPath(userWith([CUSTOMERS_READ]), "/login"),
  "/clientes",
);
assert.equal(resolvePostLoginPath(userWith([CUSTOMERS_READ]), "/"), "/clientes");
assert.equal(resolvePostLoginPath(null, "/cajas"), "/login");

if (!shouldBypassAccessControl) {
  assert.equal(
    resolvePostLoginPath(userWith([CUSTOMERS_READ]), "/cajas"),
    "/clientes",
  );
  assert.equal(
    resolvePostLoginPath(
      userWith([CASH_REGISTERS_READ, CUSTOMERS_READ]),
      "/cajas",
    ),
    "/cajas",
  );
}

console.log("routeAccess.test.ts: ok");
