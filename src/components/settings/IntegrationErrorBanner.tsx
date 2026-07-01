"use client";

import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: "OAuth sign-in was cancelled or failed. Try connecting again.",
  connect_failed: "Could not connect that platform. Check your credentials and try again.",
  token_exchange_failed: "Token exchange failed. The platform may be misconfigured.",
};

export function IntegrationErrorBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;

  const message = ERROR_MESSAGES[error] ?? "Something went wrong connecting your account.";

  return (
    <div
      role="alert"
      className="mb-8 flex items-start gap-3 border-[3px] border-black bg-accent-pink p-4 brutal-shadow-sm"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-bold uppercase">Connection failed</p>
        <p className="mt-1 text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
