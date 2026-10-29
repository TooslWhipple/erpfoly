/**
 * Guide-box sizing for the Nubarium tablet visor.
 * Run: npx --yes tsx src/utils/nubarium/patches.layout.test.ts
 */
import assert from "node:assert/strict";
import {
  resolveCaptureBox,
  resolveSnapshotCanvasSize,
  selectGuideRedrawMode,
  videoBoxNeedsSync,
} from "./patches";

const tabletHost = resolveCaptureBox({
  hostWidth: 640,
  hostHeight: 480,
  videoOffsetWidth: 1024,
  videoOffsetHeight: 768,
  videoRectWidth: 1024,
  videoRectHeight: 768,
});
assert.equal(tabletHost.width, 640);
assert.equal(tabletHost.height, 480);

const fallbackRect = resolveCaptureBox({
  hostWidth: 0,
  hostHeight: 0,
  videoOffsetWidth: 800,
  videoOffsetHeight: 1200,
  videoRectWidth: 720,
  videoRectHeight: 540,
});
assert.equal(fallbackRect.width, 720);
assert.equal(fallbackRect.height, 540);

const fallbackOffset = resolveCaptureBox({
  hostWidth: 0,
  hostHeight: 0,
  videoOffsetWidth: 800,
  videoOffsetHeight: 600,
  videoRectWidth: 0,
  videoRectHeight: 0,
});
assert.equal(fallbackOffset.width, 800);
assert.equal(fallbackOffset.height, 600);

assert.equal(videoBoxNeedsSync(1024, 768, { width: 640, height: 480 }), true);
assert.equal(videoBoxNeedsSync(640, 480, { width: 640, height: 480 }), false);
assert.equal(videoBoxNeedsSync(641, 480, { width: 640, height: 480 }), false);
assert.equal(videoBoxNeedsSync(800, 600, { width: 0, height: 0 }), false);

assert.equal(
  selectGuideRedrawMode({
    hasFrame: true,
    areaType: "oval",
    hasSetDrawFrame: true,
    hasDraw: true,
  }),
  "setDrawFrame",
);
assert.equal(
  selectGuideRedrawMode({
    hasFrame: true,
    areaType: "rectangle",
    hasSetDrawFrame: true,
    hasDraw: true,
  }),
  "draw",
);
assert.equal(
  selectGuideRedrawMode({
    hasFrame: true,
    areaType: "rectangle",
    hasSetDrawFrame: false,
    hasDraw: true,
  }),
  "draw",
);
assert.equal(
  selectGuideRedrawMode({
    hasFrame: true,
    areaType: "rectangle",
    hasSetDrawFrame: true,
    hasDraw: false,
  }),
  "setDrawFrame",
);

const visorSnapshot = resolveSnapshotCanvasSize({ width: 640.4, height: 480.2 }, 1024, 768);
assert.equal(visorSnapshot.width, 640);
assert.equal(visorSnapshot.height, 480);

const fallbackSnapshot = resolveSnapshotCanvasSize({ width: 0, height: 0 }, 1024, 768);
assert.equal(fallbackSnapshot.width, 1024);
assert.equal(fallbackSnapshot.height, 768);
assert.equal(
  selectGuideRedrawMode({
    hasFrame: false,
    areaType: "oval",
    hasSetDrawFrame: true,
    hasDraw: true,
  }),
  "skip",
);
assert.equal(
  selectGuideRedrawMode({
    hasFrame: true,
    areaType: null,
    hasSetDrawFrame: true,
    hasDraw: true,
  }),
  "skip",
);

console.log("patches.layout.test.ts: ok");
