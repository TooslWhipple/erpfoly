import type { NextRouter } from "next/router";

type RouterUrl = Parameters<NextRouter["push"]>[0];
type RouterAs = Parameters<NextRouter["push"]>[1];

function resolveAsPath(url: RouterUrl, as?: RouterAs): string {
  if (typeof as === "string") {
    return as;
  }
  if (as && typeof as === "object" && as.pathname) {
    return String(as.pathname);
  }
  if (typeof url === "string") {
    return url;
  }
  if (url && typeof url === "object" && "pathname" in url && url.pathname) {
    return String(url.pathname);
  }
  return "";
}

function pathMatchesTarget(currentPath: string, targetPath: string): boolean {
  const normalize = (value: string) => value.split("?")[0]?.split("#")[0] ?? value;
  return normalize(currentPath) === normalize(targetPath);
}

function queryId(query: unknown): string | undefined {
  if (!query || typeof query !== "object") return undefined;
  const id = (query as Record<string, unknown>).id;
  if (Array.isArray(id)) return typeof id[0] === "string" ? id[0] : undefined;
  return typeof id === "string" || typeof id === "number" ? String(id) : undefined;
}

/** Same Next page (dynamic route + query/tab) is not a leave. */
export function isSameRouteNavigation(
  currentPathname: string,
  currentAsPath: string,
  currentQuery: unknown,
  url: RouterUrl,
  as?: RouterAs
): boolean {
  if (url && typeof url === "object" && "pathname" in url && url.pathname) {
    if (String(url.pathname) !== currentPathname) return false;
    const nextId = queryId(url.query);
    const currentId = queryId(currentQuery);
    if (nextId && currentId && nextId !== currentId) return false;
    return true;
  }
  return pathMatchesTarget(currentAsPath, resolveAsPath(url, as));
}
