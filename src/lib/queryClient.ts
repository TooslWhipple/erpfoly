import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

const DEFAULT_RETRY_COUNT = 3;
const REQUEST_TIMEOUT_STATUS = 408;

function getQueryErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  if (error && typeof error === "object" && "apiError" in error) {
    const status = (error as { apiError?: { status?: number } }).apiError
      ?.status;
    if (typeof status === "number") return status;
  }
  return undefined;
}

export function shouldRetryQuery(
  failureCount: number,
  error: unknown,
): boolean {
  if (failureCount >= DEFAULT_RETRY_COUNT) return false;
  const status = getQueryErrorStatus(error);
  if (
    status != null &&
    status >= 400 &&
    status < 500 &&
    status !== REQUEST_TIMEOUT_STATUS
  ) {
    return false;
  }
  return true;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
    },
  },
});
