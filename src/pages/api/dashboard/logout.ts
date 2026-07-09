import { handleLogout } from "@/lib/dashboard/handlers";

export const prerender = false;

export async function POST(): Promise<Response> {
  return handleLogout({ secure: import.meta.env.PROD });
}
