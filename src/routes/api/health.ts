import { createFileRoute } from "@tanstack/react-router";
import { createServerPublicClient, jsonResponse } from "@/lib/isl/server-db.server";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        let database = "unknown";
        try {
          const client = createServerPublicClient();
          const { error } = await client.from("system_settings").select("key").limit(1);
          database = error ? "error" : "ok";
        } catch {
          database = "error";
        }
        return jsonResponse({
          status: database === "ok" ? "ok" : "degraded",
          service: "isl-converter-api",
          database,
          time: new Date().toISOString(),
        });
      },
    },
  },
});
