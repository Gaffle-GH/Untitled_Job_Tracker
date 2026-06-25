"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  type CompanyBrandInput,
  getCompanyInitials,
  getLogoCandidates,
  gradientForCompany,
} from "@/lib/company-logos";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

/** Display box sizes in CSS pixels; `fetch` is minimum HD source size to request. */
const SIZE_CLASSES: Record<LogoSize, { box: string; text: string; displayPx: number; padding: string }> = {
  xs: { box: "h-6 w-6", text: "text-[9px]", displayPx: 24, padding: "p-0.5" },
  sm: { box: "h-8 w-8", text: "text-[10px]", displayPx: 32, padding: "p-0.5" },
  md: { box: "h-10 w-10", text: "text-xs", displayPx: 40, padding: "p-1" },
  lg: { box: "h-14 w-14", text: "text-sm", displayPx: 56, padding: "p-1" },
  xl: { box: "h-20 w-20", text: "text-xl", displayPx: 80, padding: "p-1.5" },
  hero: { box: "h-32 w-32", text: "text-3xl", displayPx: 128, padding: "p-2" },
};

function useDevicePixelRatio(): number {
  const [dpr, setDpr] = useState(2);

  useEffect(() => {
    const update = () => setDpr(window.devicePixelRatio || 2);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return dpr;
}

interface CompanyLogoProps extends CompanyBrandInput {
  size?: LogoSize;
  className?: string;
  rounded?: "md" | "lg" | "xl" | "full";
  showRing?: boolean;
}

export function CompanyLogo({
  company,
  url,
  companyDomain,
  logoUrl,
  size = "md",
  className,
  rounded = "lg",
  showRing = false,
}: CompanyLogoProps) {
  const dpr = useDevicePixelRatio();
  const sizeConfig = SIZE_CLASSES[size];

  const candidates = useMemo(
    () =>
      getLogoCandidates(
        { company, url, companyDomain, logoUrl },
        sizeConfig.displayPx,
        dpr,
      ),
    [company, url, companyDomain, logoUrl, sizeConfig.displayPx, dpr],
  );

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCandidateIndex(0);
    setFailed(false);
  }, [company, url, companyDomain, logoUrl, size]);

  const handleError = useCallback(() => {
    setCandidateIndex((prev) => {
      const next = prev + 1;
      if (next >= candidates.length) setFailed(true);
      return next;
    });
  }, [candidates.length]);

  const initials = getCompanyInitials(company);
  const gradient = gradientForCompany(company);
  const { box, text, padding } = sizeConfig;
  const roundedClass = {
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  }[rounded];

  const ringClass = showRing ? "ring-2 ring-white shadow-md" : "";

  if (failed || candidates.length === 0) {
    return (
      <div
        className={clsx(
          "flex shrink-0 items-center justify-center bg-gradient-to-br font-bold text-white",
          box,
          roundedClass,
          ringClass,
          gradient,
          className,
        )}
        title={company}
        aria-label={`${company} logo`}
      >
        <span className={text}>{initials}</span>
      </div>
    );
  }

  const src = candidates[candidateIndex];

  return (
    <div
      className={clsx(
        "relative shrink-0 overflow-hidden bg-white",
        box,
        roundedClass,
        ringClass,
        className,
      )}
      title={company}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        src={src}
        alt={`${company} logo`}
        className={clsx("h-full w-full object-contain", padding)}
        onError={handleError}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </div>
  );
}

interface CompanyLogoBannerProps extends CompanyBrandInput {
  className?: string;
}

/** Large banner for application cards — logo centered on soft background. */
export function CompanyLogoBanner({
  company,
  url,
  companyDomain,
  logoUrl,
  className,
}: CompanyLogoBannerProps) {
  const gradient = gradientForCompany(company);

  return (
    <div
      className={clsx(
        "relative flex aspect-[4/3] items-center justify-center overflow-hidden",
        className,
      )}
    >
      <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-15", gradient)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.04),transparent_60%)]" />
      <CompanyLogo
        company={company}
        url={url}
        companyDomain={companyDomain}
        logoUrl={logoUrl}
        size="hero"
        rounded="xl"
        showRing
        className="relative z-10 shadow-lg"
      />
    </div>
  );
}
