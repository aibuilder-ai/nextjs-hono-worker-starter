"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type Item = {
  id: number;
  name: string;
  createdAt: string;
};

const STACK = [
  {
    title: "Next.js 16",
    description:
      "App Router with edge runtime. API routes live in src/app/api/ and call Cloudflare workers via service bindings.",
    badge: "Frontend",
    badgeVariant: "default" as const,
  },
  {
    title: "Hono Worker",
    description:
      "Standalone Cloudflare Worker in workers/api/ built with Hono. Handles GET /items and POST /items.",
    badge: "API",
    badgeVariant: "secondary" as const,
  },
  {
    title: "Service Binding",
    description:
      "Zero-latency, zero-cost calls between workers. No HTTP round-trip — env.API_WORKER.fetch() runs in the same datacenter.",
    badge: "Cloudflare",
    badgeVariant: "outline" as const,
  },
];

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/items");
      const data = await res.json<{ items: Item[] }>();
      setItems(data.items);
    } catch {
      setError("Failed to load items from the API worker.");
    } finally {
      setLoading(false);
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json<{ item: Item } | { error: string }>();
      if (!res.ok) {
        setError("error" in data ? data.error : "Failed to add item.");
        return;
      }
      if ("item" in data) {
        setItems((prev) => [...prev, data.item]);
        setName("");
      }
    } catch {
      setError("Network error — is the API worker running?");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">next-cloud</span>
          <Badge variant="outline">boilerplate</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Next.js 16</Badge>
          <Badge variant="secondary">Hono</Badge>
          <Badge variant="secondary">Cloudflare Workers</Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Hero */}
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Cloudflare + Next.js Boilerplate
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Production-ready starter with Next.js on Cloudflare Workers, a Hono
            API worker, and service bindings wired up end-to-end. Replace this
            page with your app.
          </p>
        </section>

        {/* Stack cards */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Stack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border">
            {STACK.map((item) => (
              <Card key={item.title} className="rounded-none ring-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{item.title}</CardTitle>
                    <Badge variant={item.badgeVariant}>{item.badge}</Badge>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* API demo */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Live API Demo — /api/items → api-worker
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
            {/* Items list */}
            <Card className="rounded-none ring-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Items</CardTitle>
                  <Badge variant="outline">{items.length}</Badge>
                </div>
                <CardDescription>
                  Fetched via GET /api/items → service binding → Hono worker
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 min-h-[120px]">
                {loading ? (
                  <p className="text-xs text-muted-foreground">Loading…</p>
                ) : items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No items yet. Add one →
                  </p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border border-border px-3 py-2"
                    >
                      <span className="text-xs">{item.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        #{item.id}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchItems}
                  disabled={loading}
                >
                  {loading ? "Refreshing…" : "Refresh"}
                </Button>
              </CardFooter>
            </Card>

            {/* Add item form */}
            <Card className="rounded-none ring-0">
              <CardHeader>
                <CardTitle>Add Item</CardTitle>
                <CardDescription>
                  POST /api/items → service binding → Hono worker
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={addItem} className="space-y-3">
                  <Input
                    placeholder="Item name…"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={adding}
                  />
                  {error && (
                    <p className="text-xs text-destructive">{error}</p>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={adding || !name.trim()}
                    className="w-full"
                  >
                    {adding ? "Adding…" : "Add Item"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Data lives in the Hono worker in-memory. Restart resets it.
                </p>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Getting started */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Getting Started
          </h2>
          <Card className="rounded-none ring-0">
            <CardContent className="pt-4 space-y-2">
              {[
                ["Start all dev servers", "pnpm dev:all"],
                ["Deploy everything", "pnpm deploy:all"],
                ["Regenerate types after binding changes", "pnpm cf-typegen"],
              ].map(([label, cmd]) => (
                <div
                  key={cmd}
                  className="flex items-center justify-between border border-border px-3 py-2"
                >
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <code className="text-xs font-mono bg-muted px-2 py-0.5">
                    {cmd}
                  </code>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
