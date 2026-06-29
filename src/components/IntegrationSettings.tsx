"use client";

import { Check, ExternalLink, RefreshCw, Unlink } from "lucide-react";
import clsx from "clsx";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { useApp } from "@/lib/store";
import { SOURCE_LABELS } from "@/lib/types";
import type { IntegrationProvider } from "@/lib/types";

const providers: {
  id: IntegrationProvider;
  name: string;
  description: string;
  accent: "cyan" | "yellow" | "pink";
  companyDomain: string;
}[] = [
  {
    id: "handshake",
    name: "Handshake",
    description: "Sync your applications and browse campus recruiting jobs.",
    accent: "cyan",
    companyDomain: "joinhandshake.com",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Import Easy Apply history and open roles from LinkedIn.",
    accent: "yellow",
    companyDomain: "linkedin.com",
  },
  {
    id: "indeed",
    name: "Indeed",
    description: "Pull Indeed Apply applications and local job listings.",
    accent: "pink",
    companyDomain: "indeed.com",
  },
];

function formatSyncedAt(value?: string) {
  if (!value) return null;
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function IntegrationSettings() {
  const {
    integrations,
    connectIntegration,
    disconnectIntegration,
    syncIntegration,
    integrationBusy,
  } = useApp();

  return (
    <div className="space-y-4">
      {providers.map((provider) => {
        const connection = integrations.find((item) => item.provider === provider.id);
        const connected = connection?.connected ?? false;
        const busy = integrationBusy === provider.id;

        return (
          <Card key={provider.id} accent={provider.accent} className="gap-0">
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex shrink-0 items-center gap-2">
                  <CompanyLogo
                    company={provider.name}
                    companyDomain={provider.companyDomain}
                    size="md"
                    rounded="md"
                    className="border-[3px] border-black brutal-shadow-sm"
                  />
                  <div className="flex h-10 w-10 items-center justify-center border-[3px] border-black bg-black text-white brutal-shadow-sm">
                    <ExternalLink className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black uppercase">{provider.name}</h3>
                    {connected && (
                      <Badge variant="lime">
                        <Check className="mr-1 h-3 w-3" />
                        Connected
                      </Badge>
                    )}
                    {connected && connection?.mode && (
                      <Badge variant={connection.mode === "live" ? "cyan" : "secondary"}>
                        {connection.mode === "live" ? "Live API" : "Demo"}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium">{provider.description}</p>
                  {connected && connection?.email && (
                    <p className="mt-1 text-xs font-bold">{connection.email}</p>
                  )}
                  {connected && (
                    <p className="mt-2 text-xs font-medium">
                      {connection?.applicationCount ?? 0} applications ·{" "}
                      {connection?.availableJobCount ?? 0} open roles
                      {connection?.lastSyncedAt
                        ? ` · Synced ${formatSyncedAt(connection.lastSyncedAt)}`
                        : ""}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {connected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      disabled={busy}
                      onClick={() => void syncIntegration(provider.id)}
                    >
                      <RefreshCw className={clsx("h-4 w-4", busy && "animate-spin")} />
                      Sync
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 hover:bg-accent-pink/30"
                      disabled={busy}
                      onClick={() => void disconnectIntegration(provider.id)}
                    >
                      <Unlink className="h-4 w-4" />
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2"
                    disabled={busy}
                    onClick={() => connectIntegration(provider.id)}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="space-y-2 border-[3px] border-black bg-accent-yellow p-4 text-sm font-medium brutal-shadow-sm">
        <p>
          Connect opens OAuth (or Handshake EDU API when configured). Sync imports your applications
          and open roles into Applications and Discover.
        </p>
        <p className="text-xs">
          Without API keys, demo mode uses sample {SOURCE_LABELS.handshake},{" "}
          {SOURCE_LABELS.linkedin}, and {SOURCE_LABELS.indeed} data. Add credentials in{" "}
          <code className="font-bold">.env.local</code> for live sync — see <code>.env.example</code>
          .
        </p>
      </div>
    </div>
  );
}
