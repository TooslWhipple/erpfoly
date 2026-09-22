/**
 * Retry policy for TanStack Query: skip 4xx except 408.
 * Run: npx --yes tsx src/lib/queryClient.test.ts
 */
import assert from "node:assert/strict";
import { AxiosError } from "axios";
import { shouldRetryQuery } from "./queryClient";

function axiosError(status: number): AxiosError {
  return new AxiosError("fail", undefined, undefined, undefined, {
    status,
    statusText: "Error",
    data: {},
    headers: {},
    config: {} as never,
  });
}

assert.equal(shouldRetryQuery(0, new Error("network")), true);
assert.equal(shouldRetryQuery(3, new Error("network")), false);
assert.equal(shouldRetryQuery(0, axiosError(500)), true);
assert.equal(shouldRetryQuery(0, axiosError(429)), false);
assert.equal(shouldRetryQuery(0, axiosError(403)), false);
assert.equal(shouldRetryQuery(0, axiosError(408)), true);
assert.equal(
  shouldRetryQuery(0, Object.assign(new Error("limited"), { apiError: { status: 429 } })),
  false,
);

console.log("queryClient.test.ts: ok");
