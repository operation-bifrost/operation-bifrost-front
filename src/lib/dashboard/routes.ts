const UNPROTECTED = new Set(["/dashboard/login", "/api/dashboard/login", "/api/dashboard/logout"]);

export function isProtectedPath(pathname: string): boolean {
  const p = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  if (UNPROTECTED.has(p)) return false;
  return p === "/dashboard" || p.startsWith("/dashboard/") || p.startsWith("/api/dashboard/");
}

export function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/");
}
