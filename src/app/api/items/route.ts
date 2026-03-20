import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Item } from "../../../../workers/api/src/index";

export const runtime = "edge";

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });

  const response = await env.API_WORKER.fetch(
    new Request("https://api-worker/items")
  );

  const data = await response.json<{ items: Item[] }>();
  return Response.json(data, { status: response.status });
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext({ async: true });

  const body = await request.json();

  const response = await env.API_WORKER.fetch(
    new Request("https://api-worker/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );

  const data = await response.json<{ item: Item } | { error: string }>();
  return Response.json(data, { status: response.status });
}
