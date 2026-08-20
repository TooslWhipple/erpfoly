/**
 * Camera selection helpers used by Nubarium capture.
 * Run: npx --yes tsx src/utils/cameraDevices.test.ts
 */
import assert from "node:assert/strict";
import {
  applyPreferredCameraConstraint,
  facingHintToNubarium,
  formatCameraLabel,
  inferCameraFacing,
  findStoredCamera,
  pickPreferredCamera,
  resolvePreferredCamera,
  type CameraDeviceOption,
} from "./cameraDevices";

assert.equal(inferCameraFacing("camera2 1, facing back"), "environment");
assert.equal(inferCameraFacing("Cámara trasera"), "environment");
assert.equal(inferCameraFacing("FaceTime HD Camera"), "user");
assert.equal(inferCameraFacing("camera2 0, facing front"), "user");
assert.equal(inferCameraFacing("USB Camera"), "unknown");
assert.equal(inferCameraFacing(""), "unknown");

const tabletCameras: CameraDeviceOption[] = [
  { deviceId: "front-id", label: "Cámara frontal", rawLabel: "Cámara frontal", facing: "user" },
  { deviceId: "back-id", label: "Cámara trasera", rawLabel: "Cámara trasera", facing: "environment" },
];

assert.equal(pickPreferredCamera(tabletCameras, "environment"), "back-id");
assert.equal(pickPreferredCamera(tabletCameras, "user"), "front-id");
assert.equal(pickPreferredCamera([], "environment"), "");

assert.equal(findStoredCamera(tabletCameras, "back-id", "Cámara trasera")?.deviceId, "back-id");
assert.equal(findStoredCamera(tabletCameras, "gone-id", "Cámara frontal")?.deviceId, "front-id");
assert.equal(findStoredCamera(tabletCameras, "gone-id", "missing"), undefined);

assert.equal(
  resolvePreferredCamera(tabletCameras, {
    storedDeviceId: "back-id",
    storedLabel: "Cámara trasera",
    currentDeviceId: "",
    preferFacing: "user",
  }),
  "back-id",
);
assert.equal(
  resolvePreferredCamera(tabletCameras, {
    storedDeviceId: "gone-id",
    storedLabel: "Cámara frontal",
    currentDeviceId: "",
    preferFacing: "environment",
  }),
  "front-id",
);
assert.equal(
  resolvePreferredCamera(tabletCameras, {
    storedDeviceId: "back-id",
    storedLabel: "Cámara trasera",
    currentDeviceId: "front-id",
    preferFacing: "environment",
  }),
  "front-id",
);
assert.equal(
  resolvePreferredCamera([], {
    storedDeviceId: "back-id",
    preferFacing: "environment",
  }),
  "",
);
assert.equal(
  pickPreferredCamera(
    [{ deviceId: "usb", label: "USB Camera", rawLabel: "USB Camera", facing: "unknown" }],
    "environment",
  ),
  "usb",
);

assert.equal(facingHintToNubarium("environment"), "back");
assert.equal(facingHintToNubarium("user"), "front");
assert.equal(facingHintToNubarium("unknown"), "default");

assert.equal(formatCameraLabel({ label: "USB Camera", facing: "environment" }, 0), "USB Camera (trasera)");
assert.equal(formatCameraLabel({ label: "", facing: "user" }, 1), "Cámara 2 (frontal)");
assert.equal(formatCameraLabel({ label: "Cámara trasera", facing: "environment" }, 0), "Cámara trasera");

const pinned = applyPreferredCameraConstraint(
  { audio: false, video: { facingMode: "user", width: { ideal: 1280 } } },
  "back-id",
);
assert.deepEqual(pinned.video, { width: { ideal: 1280 }, deviceId: { exact: "back-id" } });
assert.equal("facingMode" in (pinned.video as object), false);

const passthrough = applyPreferredCameraConstraint({ video: true }, null);
assert.deepEqual(passthrough, { video: true });

const audioOnly = applyPreferredCameraConstraint({ audio: true, video: false }, "back-id");
assert.deepEqual(audioOnly, { audio: true, video: false });

console.log("cameraDevices.test.ts: ok");
