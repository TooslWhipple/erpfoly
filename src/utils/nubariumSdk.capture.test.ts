/**
 * Face-capture crop / rotation helpers for landscape snapshots.
 * Run: npx --yes tsx src/utils/nubariumSdk.capture.test.ts
 */
import assert from "node:assert/strict";
import {
  aspectsDifferByQuarterTurn,
  computeCaptureRotationDegrees,
  computeObjectFitCoverCrop,
  mapFramingFailMessageKey,
  orientationFromVideoBox,
  shouldSkipIdAutorotate,
  translateNubariumFailReason,
} from "./nubariumSdk";

assert.equal(aspectsDifferByQuarterTurn(720, 1280, 800, 450), true);
assert.equal(aspectsDifferByQuarterTurn(1280, 720, 800, 450), false);
assert.equal(aspectsDifferByQuarterTurn(720, 1280, 400, 700), false);
assert.equal(aspectsDifferByQuarterTurn(0, 1280, 800, 450), false);

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

assert.equal(
  computeCaptureRotationDegrees(720, 1280, 800, 450, 90),
  90,
);
assert.equal(
  computeCaptureRotationDegrees(720, 1280, 800, 450, 270),
  270,
);
assert.equal(
  computeCaptureRotationDegrees(1280, 720, 800, 450, 90),
  0,
);
assert.equal(
  computeCaptureRotationDegrees(720, 1280, 800, 450, 0),
  90,
);

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

assert.equal(shouldSkipIdAutorotate(1024, 768, -90), true);
assert.equal(shouldSkipIdAutorotate(1024, 768, 270), true);
assert.equal(shouldSkipIdAutorotate(768, 1024, -90), false);
assert.equal(shouldSkipIdAutorotate(1024, 768, 0), false);

assert.equal(orientationFromVideoBox(420, 560), "PORTRAIT");
assert.equal(orientationFromVideoBox(640, 360), "LANDSCAPE");
assert.equal(orientationFromVideoBox(0, 560), null);

console.log("nubariumSdk.capture.test.ts: ok");
