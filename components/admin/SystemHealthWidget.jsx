"use client";

import { useCallback, useEffect, useState } from "react";
import { HeartPulse, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/config/env";

const SERVICES = [
  { id: "backend", label: "dnb-backend", baseUrl: () => config.apiUrl },
  { id: "ai", label: "dnb-ai", baseUrl: () => config.aiApiUrl },
];

async function checkService(service) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const url = new URL("/health", service.baseUrl()).toString();
    let response = await fetch(url, { method: "HEAD", cache: "no-store", signal: controller.signal });
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, { method: "GET", cache: "no-store", signal: controller.signal });
    }
    return { id: service.id, status: response.ok ? "reachable" : "unreachable" };
  } catch {
    return { id: service.id, status: "unreachable" };
  } finally {
    clearTimeout(timeout);
  }
}

const DOT_STYLES = {
  reachable: "bg-emerald-500",
  unreachable: "bg-red-500",
  checking: "bg-amber-400 animate-pulse",
  unchecked: "bg-muted-foreground/40",
};

export default function SystemHealthWidget() {
  const [statuses, setStatuses] = useState({ backend: "unchecked", ai: "unchecked" });
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const refresh = useCallback(async () => {
    setChecking(true);
    setStatuses((current) => ({
      backend: current.backend === "unchecked" ? "checking" : current.backend,
      ai: current.ai === "unchecked" ? "checking" : current.ai,
    }));
    const results = await Promise.all(SERVICES.map(checkService));
    setStatuses(Object.fromEntries(results.map(({ id, status }) => [id, status])));
    setLastChecked(new Date());
    setChecking(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <HeartPulse className="h-4 w-4 text-accent" aria-hidden="true" />
            System health
          </CardTitle>
          <CardDescription className="mt-1">Service reachability from this browser</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={checking}>
          <RefreshCw className={`mr-2 h-4 w-4 ${checking ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {SERVICES.map((service) => {
          const status = checking ? "checking" : statuses[service.id];
          const label = status === "reachable" ? "Reachable" : status === "checking" ? "Checking" : status === "unchecked" ? "Not checked" : "Unreachable";
          return (
            <div key={service.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{service.label}</span>
              <span className="inline-flex items-center gap-2 text-muted-foreground" role="status">
                <span className={`h-2.5 w-2.5 rounded-full ${DOT_STYLES[status]}`} aria-hidden="true" />
                {label}
              </span>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {lastChecked ? `Last checked ${lastChecked.toLocaleTimeString()}` : "Not checked yet"}
        </p>
      </CardContent>
    </Card>
  );
}
