"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { MapPin, RotateCcw } from "lucide-react";
import { useApp } from "@/lib/store";
import { DiscoverRefreshButton } from "@/components/DiscoverRefreshButton";
import { SimpleCardStack, cardsToStackCards } from "@/components/SimpleCardStack";
import { Button } from "@/components/ui";
import { formatLocationDisplay } from "@/lib/location-normalize";

function DiscoverToolbar({
  deckCount,
  reviewedCount,
  canUndoDiscover,
  onUndo,
}: {
  deckCount: number;
  reviewedCount: number;
  canUndoDiscover: boolean;
  onUndo: () => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-2 md:mb-6">
      {deckCount > 0 ? (
        <span className="border-2 border-black bg-accent-yellow px-3 py-1 text-[10px] font-bold uppercase tracking-wide">
          {deckCount} left in deck
        </span>
      ) : (
        <span className="border-2 border-black bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-black/60">
          Deck empty
        </span>
      )}
      {reviewedCount > 0 ? (
        <span className="border-2 border-black bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-black/60">
          {reviewedCount} reviewed
        </span>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!canUndoDiscover}
        onClick={onUndo}
        className="gap-1"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Undo
      </Button>
      <DiscoverRefreshButton />
    </div>
  );
}

function DiscoverEmptyState({
  isRefreshing,
  reviewedCount,
}: {
  isRefreshing: boolean;
  reviewedCount: number;
}) {
  return (
    <div className="flex w-full flex-col items-center justify-center py-10 text-center md:py-16">
      <div className="w-full max-w-md border-[3px] border-black bg-accent-yellow p-6 brutal-shadow-lg md:p-8">
        {isRefreshing ? (
          <>
            <h3 className="brutal-heading text-xl">Loading jobs…</h3>
            <p className="mt-3 text-sm font-bold text-black/70">
              Fetching listings near your location.
            </p>
          </>
        ) : (
          <>
            <h3 className="brutal-heading text-xl">All caught up!</h3>
            <p className="mt-3 text-sm font-bold leading-relaxed">
              {reviewedCount > 0
                ? `You reviewed ${reviewedCount} job${reviewedCount === 1 ? "" : "s"}. Refresh to load a new deck.`
                : "No jobs left in your deck. Refresh to shuffle in more listings."}
            </p>
            <p className="mt-2 text-xs font-medium text-black/55">
              Try updating your location or target role in Settings for different matches.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <DiscoverRefreshButton />
              <Link href="/settings">
                <Button type="button" variant="outline" size="sm" className="normal-case tracking-normal">
                  Edit profile
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function CardStack() {
  const {
    discoverJobs,
    swipeDiscoverJob,
    discoverRefreshKey,
    undoDiscoverSwipe,
    canUndoDiscover,
    savedDiscoverIds,
    passedDiscoverIds,
    refreshDiscoverJobs,
    profile,
    hydrated,
    isRefreshingDiscover,
  } = useApp();
  const didAutoRefresh = useRef(false);

  useEffect(() => {
    if (!hydrated || didAutoRefresh.current || !profile.location.trim()) return;
    didAutoRefresh.current = true;
    refreshDiscoverJobs();
  }, [hydrated, profile.location, refreshDiscoverJobs]);

  const stackCards = useMemo(() => cardsToStackCards(discoverJobs), [discoverJobs]);
  const showStack = discoverJobs.length > 0;
  const reviewedCount = savedDiscoverIds.length + passedDiscoverIds.length;

  return (
    <div className="relative w-full min-h-[min(620px,calc(100dvh-14rem))] pb-24 md:min-h-[520px] md:pb-0">
      {profile.location.trim() ? (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 border-2 border-black bg-accent-cyan/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wide">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            Searching near {formatLocationDisplay(profile.location, profile.zipCode)}
          </span>
          <Link
            href="/settings"
            className="text-[10px] font-bold uppercase tracking-wide text-black/55 underline-offset-2 hover:underline"
          >
            Change location
          </Link>
        </div>
      ) : (
        <div className="mb-4 text-center">
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 border-2 border-black bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide hover:bg-accent-yellow/50"
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            Add your location in Settings
          </Link>
        </div>
      )}

      <DiscoverToolbar
        deckCount={discoverJobs.length}
        reviewedCount={reviewedCount}
        canUndoDiscover={canUndoDiscover}
        onUndo={undoDiscoverSwipe}
      />

      {showStack ? (
        <div key={`discover-deck-${discoverRefreshKey}`} className="w-full">
          <SimpleCardStack
            dealEnter
            cards={stackCards}
            onSwipe={(card, direction) => {
              swipeDiscoverJob(card.id, direction === "right" ? "save" : "pass");
            }}
          />
        </div>
      ) : (
        <DiscoverEmptyState isRefreshing={isRefreshingDiscover} reviewedCount={reviewedCount} />
      )}
    </div>
  );
}
