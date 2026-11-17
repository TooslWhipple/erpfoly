/**
 * Post-login landing: honor an allowed redirect, otherwise first allowed home.
 * Run: npx --yes tsx src/lib/routeAccess.test.ts
 */
import assert from "node:assert/strict";
import type { User } from "../store/useAuthStore";
import {
  CASH_REGISTERS_READ,
  CUSTOMER_DELINQUENCY_LISTS_READ,
  CUSTOMERS_READ,
  DELIVERY_HOLD_READ,
  NEW_ORDER_READ,
  TRASPASOS_INCIDENTS_READ,
} from "./permissions";
import { shouldBypassAccessControl } from "./accessControl";
import {
  canAccessPath,
  getFirstAllowedRoute,
  isPublicRoute,
  resolvePostLoginPath,
} from "./routeAccess";

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
assert.equal(isPublicRoute("/compartido/morosidad/abc"), false);
assert.equal(resolvePostLoginPath(userWith([CUSTOMERS_READ])), "/clientes");
assert.equal(
  resolvePostLoginPath(userWith([CUSTOMERS_READ]), "/login"),
  "/clientes",
);
assert.equal(resolvePostLoginPath(userWith([CUSTOMERS_READ]), "/"), "/clientes");
assert.equal(resolvePostLoginPath(null, "/cajas"), "/login");
assert.equal(getFirstAllowedRoute(userWith([DELIVERY_HOLD_READ])), "/entregas/resguardos");
assert.equal(
  getFirstAllowedRoute(userWith([TRASPASOS_INCIDENTS_READ])),
  "/traspasos/incidencias",
);
assert.equal(
  getFirstAllowedRoute(userWith([TRASPASOS_INCIDENTS_READ, DELIVERY_HOLD_READ])),
  "/entregas/resguardos",
);

if (!shouldBypassAccessControl) {
  assert.equal(
    canAccessPath("/compartido/morosidad/abc", userWith([CUSTOMERS_READ])),
    false,
  );
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

  // `pedidos-nuevo.view` opens the order form, not the order list.
  assert.equal(canAccessPath("/pedidos/nuevo", userWith([NEW_ORDER_READ])), true);
  assert.equal(canAccessPath("/pedidos", userWith([NEW_ORDER_READ])), false);

  // Cobranza externa: solo `clientes.morosidad-listas.read`.
  const collector = userWith([CUSTOMER_DELINQUENCY_LISTS_READ]);
  assert.equal(canAccessPath("/clientes/morosidad", collector), true);
  assert.equal(canAccessPath("/clientes/morosidad/listas/5", collector), true);
  assert.equal(canAccessPath("/clientes", collector), false);
  assert.equal(getFirstAllowedRoute(collector), "/clientes/morosidad");
}

console.log("routeAccess.test.ts: ok");
