import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Item } from "../../../../workers/api/src/types";

export const runtime = "edge";

// In Cloudflare runtime: use the zero-latency service binding.
// In local `next dev` (Node.js): fall back to direct HTTP to the wrangler dev server.
const API_DEV_URL = "http://localhost:8787";

async function callWorker(path: string, init?: RequestInit): Promise<Response> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.API_WORKER.fetch(new Request(`https://api-worker${path}`, init));
  } catch {
    // getCloudflareContext throws outside the CF runtime — fall through to HTTP
  }
  return fetch(`${API_DEV_URL}${path}`, init);
}

export async function GET() {
  const response = await callWorker("/items");
  const data = await response.json<{ items: Item[] }>();
  return Response.json(data, { status: response.status });
}

export async function POST(request: Request) {
  const body = await request.json();
  const response = await callWorker("/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json<{ item: Item } | { error: string }>();
  return Response.json(data, { status: response.status });
}
