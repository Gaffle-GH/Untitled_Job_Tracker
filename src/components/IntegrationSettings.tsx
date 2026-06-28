"use client";

import { Check, ExternalLink, Link2, Unlink } from "lucide-react";
import clsx from "clsx";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { useApp } from "@/lib/store";
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
    description: "Sync campus recruiting applications and career fair leads.",
    accent: "cyan",
    companyDomain: "joinhandshake.com",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Import Easy Apply jobs and track LinkedIn application status.",
    accent: "yellow",
    companyDomain: "linkedin.com",
  },
  {
    id: "indeed",
    name: "Indeed",
    description: "Pull applications from Indeed and local job alerts.",
    accent: "pink",
    companyDomain: "indeed.com",
  },
];

export function IntegrationSettings() {
  const { integrations, connectIntegration, disconnectIntegration } = useApp();

  return (
    <div className="space-y-4">
      {providers.map((provider) => {
        const connection = integrations.find((i) => i.provider === provider.id);
        const connected = connection?.connected ?? false;

        return (
          <Card key={provider.id} accent={provider.accent} className="gap-0">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
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
                    <Link2 className="h-5 w-5" />
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
                  </div>
                  <p className="mt-1 text-sm font-medium">{provider.description}</p>
                  {connected && connection?.email && (
                    <p className="mt-1 text-xs font-bold">{connection.email}</p>
                  )}
                </div>
              </div>

              <Button
                variant={connected ? "outline" : "default"}
                onClick={() =>
                  connected ? disconnectIntegration(provider.id) : connectIntegration(provider.id)
                }
                className={clsx("gap-2", connected && "hover:bg-accent-pink/30")}
              >
                {connected ? (
                  <>
                    <Unlink className="h-4 w-4" />
                    Disconnect
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}

      <div className="border-[3px] border-black bg-accent-yellow p-4 text-sm font-medium brutal-shadow-sm">
        OAuth with Handshake, LinkedIn, and Indeed requires developer API access. Connect
        buttons simulate syncing sample data for now.
      </div>
    </div>
  );
}
