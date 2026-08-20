/**
 * Image extraction from Nubarium IdCapture payloads.
 * Run: npx --yes tsx src/utils/nubariumSdk.extract.test.ts
 */
import assert from "node:assert/strict";
import { extractIdCaptureImages, extractNubariumExecutionId } from "./nubariumSdk";

const jpeg = "/9j/4AAQ";

assert.equal(extractNubariumExecutionId({ id: "exec-1" }), "exec-1");
assert.equal(extractNubariumExecutionId({ executionId: "exec-2" }), "exec-2");
assert.equal(extractNubariumExecutionId({}), "");

const fromResources = extractIdCaptureImages({
  resources: { front: jpeg, back: jpeg },
});
assert.ok(fromResources.frontDataUrl.startsWith("data:image/jpeg;base64,"));
assert.ok(fromResources.backDataUrl.startsWith("data:image/jpeg;base64,"));

const fromFailShape = extractIdCaptureImages({
  resources: { id: { front: { base64: jpeg }, back: { image: jpeg } } },
});
assert.ok(fromFailShape.frontDataUrl.includes(jpeg));
assert.ok(fromFailShape.backDataUrl.includes(jpeg));

const fromAnverso = extractIdCaptureImages({
  anverso: jpeg,
  reverso: jpeg,
});
assert.ok(fromAnverso.frontDataUrl);
assert.ok(fromAnverso.backDataUrl);

console.log("nubariumSdk.extract.test.ts: ok");
