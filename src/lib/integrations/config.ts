import type { IntegrationProvider } from "@/lib/types";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getAppUrl() {
  return appUrl();
}

export function getCallbackUrl(provider: IntegrationProvider) {
  return `${appUrl()}/api/integrations/${provider}/callback`;
}

export function isHandshakeLive() {
  return Boolean(process.env.HANDSHAKE_API_KEY && process.env.HANDSHAKE_EDU_ID);
}

export function isLinkedInLive() {
  return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
}

export function isIndeedLive() {
  return Boolean(process.env.INDEED_CLIENT_ID && process.env.INDEED_CLIENT_SECRET);
}

export function isProviderLive(provider: IntegrationProvider) {
  if (provider === "handshake") return isHandshakeLive();
  if (provider === "linkedin") return isLinkedInLive();
  return isIndeedLive();
}

export function getLinkedInAuthUrl(state: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: getCallbackUrl("linkedin"),
    state,
    scope: "openid profile email",
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

export function getIndeedAuthUrl(state: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.INDEED_CLIENT_ID!,
    redirect_uri: getCallbackUrl("indeed"),
    state,
    scope: "employer_access",
  });
  return `https://secure.indeed.com/oauth/v2/authorize?${params}`;
}
