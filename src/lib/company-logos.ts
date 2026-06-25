/** Well-known company name → domain (lowercase keys). */
const KNOWN_COMPANY_DOMAINS: Record<string, string> = {
  stripe: "stripe.com",
  notion: "notion.so",
  airbnb: "airbnb.com",
  figma: "figma.com",
  shopify: "shopify.com",
  datadog: "datadoghq.com",
  linear: "linear.app",
  vercel: "vercel.com",
  anthropic: "anthropic.com",
  spotify: "spotify.com",
  cloudflare: "cloudflare.com",
  ramp: "ramp.com",
  discord: "discord.com",
  canva: "canva.com",
  google: "google.com",
  meta: "meta.com",
  apple: "apple.com",
  microsoft: "microsoft.com",
  amazon: "amazon.com",
  netflix: "netflix.com",
  uber: "uber.com",
  lyft: "lyft.com",
  coinbase: "coinbase.com",
  robinhood: "robinhood.com",
  plaid: "plaid.com",
  brex: "brex.com",
  databricks: "databricks.com",
  snowflake: "snowflake.com",
  openai: "openai.com",
  github: "github.com",
  slack: "slack.com",
  salesforce: "salesforce.com",
  adobe: "adobe.com",
  twilio: "twilio.com",
  mongodb: "mongodb.com",
  redis: "redis.io",
  elastic: "elastic.co",
  hashicorp: "hashicorp.com",
  docker: "docker.com",
  atlassian: "atlassian.com",
  zoom: "zoom.us",
  dropbox: "dropbox.com",
  pinterest: "pinterest.com",
  snap: "snap.com",
  snapchat: "snap.com",
  tiktok: "tiktok.com",
  bytedance: "bytedance.com",
  palantir: "palantir.com",
  anduril: "anduril.com",
  spacex: "spacex.com",
  tesla: "tesla.com",
  nvidia: "nvidia.com",
  intel: "intel.com",
  amd: "amd.com",
  qualcomm: "qualcomm.com",
  cisco: "cisco.com",
  oracle: "oracle.com",
  ibm: "ibm.com",
  deloitte: "deloitte.com",
  accenture: "accenture.com",
  mckinsey: "mckinsey.com",
  goldman: "goldmansachs.com",
  "goldman sachs": "goldmansachs.com",
  jpmorgan: "jpmorganchase.com",
  "jp morgan": "jpmorganchase.com",
  capital: "capitalone.com",
  "capital one": "capitalone.com",
};

export interface CompanyBrandInput {
  company: string;
  url?: string;
  companyDomain?: string;
  logoUrl?: string;
}

function normalizeCompanyKey(company: string): string {
  return company.trim().toLowerCase().replace(/[,.']/g, "");
}

export function extractDomainFromUrl(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return hostname || null;
  } catch {
    return null;
  }
}

/** Resolve the best domain for logo lookup. */
export function resolveCompanyDomain({
  company,
  url,
  companyDomain,
}: CompanyBrandInput): string | null {
  if (companyDomain) return companyDomain.replace(/^www\./, "");
  if (url) {
    const fromUrl = extractDomainFromUrl(url);
    if (fromUrl) return fromUrl;
  }

  const key = normalizeCompanyKey(company);
  if (KNOWN_COMPANY_DOMAINS[key]) return KNOWN_COMPANY_DOMAINS[key];

  // Partial match for names like "Stripe Inc"
  for (const [name, domain] of Object.entries(KNOWN_COMPANY_DOMAINS)) {
    if (key.includes(name) || name.includes(key)) return domain;
  }

  return null;
}

/** Max sizes supported by logo providers. */
export const LOGO_HD_CLEARBIT_SIZE = 512;
export const LOGO_HD_FAVICON_SIZE = 256;

export function getHdFetchSize(displayPx: number, devicePixelRatio = 2): number {
  return Math.min(
    LOGO_HD_CLEARBIT_SIZE,
    Math.ceil(displayPx * Math.max(devicePixelRatio, 2)),
  );
}

export function getClearbitLogoUrl(domain: string, size = LOGO_HD_CLEARBIT_SIZE): string {
  return `https://logo.clearbit.com/${domain}?size=${size}`;
}

/** Native-resolution Clearbit logo (no size cap — highest quality). */
export function getClearbitLogoUrlHd(domain: string): string {
  return `https://logo.clearbit.com/${domain}`;
}

export function getGoogleFaviconUrl(domain: string, size = LOGO_HD_FAVICON_SIZE): string {
  const clamped = Math.min(size, LOGO_HD_FAVICON_SIZE);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${clamped}`;
}

/** Ordered logo URLs to try; explicit logoUrl first, then HD Clearbit, then HD favicon. */
export function getLogoCandidates(
  input: CompanyBrandInput,
  displayPx = 128,
  devicePixelRatio = 2,
): string[] {
  const candidates: string[] = [];
  const fetchSize = getHdFetchSize(displayPx, devicePixelRatio);

  if (input.logoUrl) candidates.push(input.logoUrl);

  const domain = resolveCompanyDomain(input);
  if (domain) {
    candidates.push(getClearbitLogoUrlHd(domain));
    candidates.push(getClearbitLogoUrl(domain, fetchSize));
    candidates.push(getGoogleFaviconUrl(domain, LOGO_HD_FAVICON_SIZE));
  }

  return [...new Set(candidates)];
}

export function getCompanyInitials(company: string): string {
  const words = company.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return company.slice(0, 2).toUpperCase();
}

export const COMPANY_GRADIENTS = [
  "from-sky-400 to-blue-600",
  "from-violet-400 to-purple-600",
  "from-emerald-400 to-teal-600",
  "from-orange-400 to-rose-500",
  "from-indigo-400 to-fuchsia-600",
  "from-amber-400 to-orange-600",
  "from-cyan-400 to-blue-500",
  "from-rose-400 to-pink-600",
];

export function enrichCompanyBrand<T extends CompanyBrandInput>(item: T): T {
  const domain = item.companyDomain ?? resolveCompanyDomain(item) ?? undefined;
  return domain ? { ...item, companyDomain: domain } : item;
}

export function gradientForCompany(company: string): string {
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COMPANY_GRADIENTS[Math.abs(hash) % COMPANY_GRADIENTS.length];
}
