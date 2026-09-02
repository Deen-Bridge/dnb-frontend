"use client";

import { useState } from "react";
import { Activity, Radio, ShieldAlert, Users } from "lucide-react";
import EmergencyStopSpaceDialog from "@/components/admin/EmergencyStopSpaceDialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const INITIAL_SPACES = [
  {
    id: "space-live-101",
    roomName: "Seerah Community Q&A",
    hostId: "host-104",
    hostName: "Amina Yusuf",
    participants: 84,
    status: "live",
  },
  {
    id: "space-live-102",
    roomName: "Arabic Study Circle",
    hostId: "host-207",
    hostName: "Bilal Karim",
    participants: 31,
    status: "live",
  },
  {
    id: "space-live-103",
    roomName: "New Educator Welcome",
    hostId: "host-315",
    hostName: "Zaynab Idris",
    participants: 17,
    status: "live",
  },
];

const CURRENT_ADMIN = {
  id: "admin-current",
  name: "Current administrator",
};

export default function ActivityMonitorPage() {
  const [spaces, setSpaces] = useState(INITIAL_SPACES);
  const [lastOutcome, setLastOutcome] = useState(null);

  function handleOutcome(spaceId, outcome) {
    setLastOutcome({ spaceId, ...outcome });
    if (outcome.result?.status === "ended") {
      setSpaces((current) =>
        current.map((space) =>
          space.id === spaceId ? { ...space, status: "ended" } : space
        )
      );
    }
  }

  const liveCount = spaces.filter((space) => space.status === "live").length;
  const participantCount = spaces
    .filter((space) => space.status === "live")
    .reduce((total, space) => total + space.participants, 0);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-destructive">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-semibold uppercase tracking-wide">Admin safety controls</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Live activity monitor</h1>
        <p className="max-w-3xl text-muted-foreground">
          Monitor active spaces and use emergency stop only for immediate policy,
          safety, or operational incidents.
        </p>
      </header>

      {lastOutcome ? (
        <div
          role={lastOutcome.kind === "error" ? "alert" : "status"}
          className={
            lastOutcome.kind === "success"
              ? "rounded-lg border border-emerald-600/30 bg-emerald-600/10 p-4 text-sm text-emerald-700"
              : lastOutcome.kind === "warning"
                ? "rounded-lg border border-amber-600/30 bg-amber-600/10 p-4 text-sm text-amber-700"
                : "rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          }
        >
          {lastOutcome.message}
        </div>
      ) : null}

      <section aria-label="Live activity summary" className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-destructive/10 p-3 text-destructive">
              <Radio className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Live spaces</p>
              <p className="text-2xl font-semibold">{liveCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current participants</p>
              <p className="text-2xl font-semibold">{participantCount}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="active-spaces-heading">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle id="active-spaces-heading">Active live spaces</CardTitle>
            </div>
            <CardDescription>
              Ending a session requires an audit reason and exact room-name confirmation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {spaces.map((space) => {
              const isLive = space.status === "live";
              return (
                <article
                  key={space.id}
                  className="flex flex-col gap-4 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-foreground">{space.roomName}</h2>
                      <Badge variant={isLive ? "destructive" : "secondary"}>
                        {isLive ? "Live" : "Ended"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Hosted by {space.hostName} · {space.participants} participants
                    </p>
                  </div>

                  <EmergencyStopSpaceDialog
                    space={space}
                    actor={CURRENT_ADMIN}
                    disabled={!isLive}
                    onOutcome={(outcome) => handleOutcome(space.id, outcome)}
                  />
                </article>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
