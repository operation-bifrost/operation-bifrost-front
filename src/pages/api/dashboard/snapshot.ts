import { env } from "cloudflare:workers";

import { handleSnapshot } from "@/lib/dashboard/handlers";
import { getDashboardSnapshot } from "@/lib/downloads/repository";

export const prerender = false;

export async function GET(): Promise<Response> {
  return handleSnapshot({ getSnapshot: () => getDashboardSnapshot(env.DB!, Date.now()) });
}
