import { Hono } from "hono";
import { cors } from "hono/cors";

type Env = Record<string, never>;

export type Item = {
  id: number;
  name: string;
  createdAt: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({ origin: "*" }));

app.get("/items", (c) => {
  const items: Item[] = [
    { id: 1, name: "Widget A", createdAt: "2026-01-01T00:00:00Z" },
    { id: 2, name: "Widget B", createdAt: "2026-01-02T00:00:00Z" },
  ];
  return c.json({ items });
});

app.post("/items", async (c) => {
  const body = await c.req.json<{ name: string }>();

  if (!body?.name || typeof body.name !== "string" || body.name.trim() === "") {
    return c.json({ error: "name is required" }, 400);
  }

  const created: Item = {
    id: Date.now(),
    name: body.name.trim(),
    createdAt: new Date().toISOString(),
  };

  return c.json({ item: created }, 201);
});

app.notFound((c) => c.json({ error: "Not Found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
