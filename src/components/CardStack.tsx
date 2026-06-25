"use client";

import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useApp } from "@/lib/store";
import { DiscoverRefreshButton } from "@/components/DiscoverRefreshButton";
import { SimpleCardStack, cardsToStackCards } from "@/components/SimpleCardStack";
import { POP_SOFT_SPRING } from "@/lib/motion-presets";

export function CardStack() {
  const { discoverJobs, swipeDiscoverJob, discoverRefreshKey } = useApp();
  const reduceMotion = useReducedMotion();
  const stackCards = useMemo(() => cardsToStackCards(discoverJobs), [discoverJobs]);
  const showStack = discoverJobs.length > 0;

  return (
    <div className="relative w-full min-h-[620px]">
      <AnimatePresence mode="wait" initial={false}>
        {!showStack ? (
          <motion.div
            key="discover-empty"
            className="flex w-full flex-col items-center justify-center py-16 text-center"
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -24, scale: 0.94 }}
            transition={POP_SOFT_SPRING}
          >
            <div className="border-[3px] border-black bg-accent-yellow p-8 brutal-shadow-lg">
              <h3 className="brutal-heading text-xl">All caught up!</h3>
              <p className="mt-3 max-w-xs text-sm font-bold">
                No more jobs in your area. Hit refresh to shuffle the deck.
              </p>
              <div className="mt-6">
                <DiscoverRefreshButton />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`discover-deck-${discoverRefreshKey}`}
            className="w-full"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 }}
            transition={POP_SOFT_SPRING}
          >
            <SimpleCardStack
              dealEnter
              cards={stackCards}
              onSwipe={(card, direction) => {
                swipeDiscoverJob(card.id, direction === "right" ? "save" : "pass");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
