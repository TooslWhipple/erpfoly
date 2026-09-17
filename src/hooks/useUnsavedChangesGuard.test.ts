/**
 * Same-route skip for the unsaved-changes guard.
 * Run: npx --yes tsx src/hooks/useUnsavedChangesGuard.test.ts
 */
import assert from "node:assert/strict";
import { isSameRouteNavigation } from "./unsavedChangesNavigation";

const PRODUCT_PATH = "/catalogos/productos/[id]";

assert.equal(
  isSameRouteNavigation(
    PRODUCT_PATH,
    "/catalogos/productos/nuevo",
    { id: "nuevo" },
    { pathname: PRODUCT_PATH, query: { id: "nuevo", tab: "price" } }
  ),
  true,
  "tab query on the same dynamic route is not a leave"
);

assert.equal(
  isSameRouteNavigation(
    PRODUCT_PATH,
    "/catalogos/productos/nuevo",
    { id: "nuevo" },
    "/catalogos/productos"
  ),
  false,
  "leaving to the catalog list is a leave"
);

assert.equal(
  isSameRouteNavigation(
    PRODUCT_PATH,
    "/catalogos/productos/nuevo",
    { id: "nuevo" },
    { pathname: PRODUCT_PATH, query: { id: "42", tab: "general" } }
  ),
  false,
  "switching product id on the same template is a leave"
);

assert.equal(
  isSameRouteNavigation(
    PRODUCT_PATH,
    "/catalogos/productos/nuevo?tab=general",
    { id: "nuevo", tab: "general" },
    "/catalogos/productos/nuevo?tab=price"
  ),
  true,
  "string URL with only query change matches asPath"
);

console.log("useUnsavedChangesGuard.test.ts: ok");
