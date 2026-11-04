/**
 * Fail-reason message mapping for Nubarium capture.
 * Run: npx --yes tsx src/utils/nubariumSdk.capture.test.ts
 */
import assert from "node:assert/strict";
import { translateNubariumFailReason } from "./nubariumSdk";

assert.equal(
  translateNubariumFailReason("NOFACE"),
  "No se detectó un rostro en la captura.",
);
assert.equal(
  translateNubariumFailReason("fail_faceoutside"),
  "El rostro quedó fuera del área de captura.",
);

console.log("nubariumSdk.capture.test.ts: ok");
