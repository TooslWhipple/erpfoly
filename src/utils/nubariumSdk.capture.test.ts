/**
 * Face-capture crop helpers and fail-message mapping.
 * Run: npx --yes tsx src/utils/nubariumSdk.capture.test.ts
 */
import assert from "node:assert/strict";
import {
  computeObjectFitCoverCrop,
  mapFramingFailMessageKey,
  translateNubariumFailReason,
} from "./nubariumSdk";

const coverWideSource = computeObjectFitCoverCrop(1600, 900, 800, 600);
assert.ok(Math.abs(coverWideSource.sw - 1200) < 0.01);
assert.ok(Math.abs(coverWideSource.sh - 900) < 0.01);
assert.ok(Math.abs(coverWideSource.sx - 200) < 0.01);
assert.equal(coverWideSource.sy, 0);

const coverTallSource = computeObjectFitCoverCrop(900, 1600, 800, 600);
assert.ok(Math.abs(coverTallSource.sw - 900) < 0.01);
assert.ok(Math.abs(coverTallSource.sh - 675) < 0.01);
assert.equal(coverTallSource.sx, 0);
assert.ok(Math.abs(coverTallSource.sy - 462.5) < 0.01);

assert.equal(mapFramingFailMessageKey("no_face"), "FAIL_NOFACE");
assert.equal(mapFramingFailMessageKey("NOFACE"), "FAIL_NOFACE");
assert.equal(mapFramingFailMessageKey("face_outside"), "FAIL_FACEOUTSIDE");
assert.equal(mapFramingFailMessageKey("OUTSIDE"), "FAIL_FACEOUTSIDE");
assert.equal(mapFramingFailMessageKey("low_evaluation"), null);
assert.equal(mapFramingFailMessageKey(undefined), null);

assert.equal(
  translateNubariumFailReason("NOFACE"),
  "No se detectó un rostro en la captura.",
);
assert.equal(
  translateNubariumFailReason("fail_faceoutside"),
  "El rostro quedó fuera del área de captura.",
);

console.log("nubariumSdk.capture.test.ts: ok");
