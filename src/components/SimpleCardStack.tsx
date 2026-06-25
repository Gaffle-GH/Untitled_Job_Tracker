"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Button } from "@/components/ui";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type PanInfo,
  type Variants,
} from "framer-motion";
import {
  DEFAULT_CARD_STACK_SETTINGS,
  accentForCard,
  createCardVariants,
  getDealInInitial,
  shouldSwipe,
  tagAccentFor,
  type BrutalAccent,
  type CardStackSettings,
} from "@/lib/card-stack";
import { POP_IN_SPRING } from "@/lib/motion-presets";
import "./card-stack.css";

export interface StackCard {
  id: string;
  title: string;
  location?: string;
  accent: BrutalAccent;
  company?: string;
  companyDomain?: string;
  logoUrl?: string;
  url?: string;
  description?: string;
  tags?: string[];
  salary?: string;
  remote?: boolean;
  employmentType?: string;
  benefits?: string[];
}

interface SimpleCardStackProps {
  cards: StackCard[];
  settings?: Partial<CardStackSettings>;
  dealEnter?: boolean;
  onSwipe?: (card: StackCard, direction: "left" | "right") => void;
}

interface CardContentProps {
  card: StackCard;
  quickMetadata: string | null;
  compensation: string | null;
}

const SENIORITY_PATTERN = /\b(Senior|Staff|Principal|Lead|Junior|Intern)\b/i;
const SWIPE_EXIT = { type: "spring" as const, stiffness: 320, damping: 30, mass: 0.75 };
const SWIPE_RESET = { type: "spring" as const, stiffness: 520, damping: 34, mass: 0.6 };
const SCREEN_EDGE_INSET = 56;

function buildQuickMetadata(card: StackCard): string | null {
  const parts: string[] = [];
  const seniority = card.title.match(SENIORITY_PATTERN)?.[1];

  if (seniority) {
    parts.push(seniority.charAt(0).toUpperCase() + seniority.slice(1).toLowerCase());
  }

  if (card.employmentType) {
    parts.push(card.employmentType);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

function buildCompensationLine(card: StackCard): string | null {
  const parts: string[] = [];

  if (card.salary) {
    parts.push(card.salary);
  }

  if (card.remote !== undefined) {
    parts.push(card.remote ? "Remote" : "On-site");
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

const CardContent = memo(function CardContent({
  card,
  quickMetadata,
  compensation,
}: CardContentProps) {
  const salary = card.salary ?? null;

  return (
    <>
      <div className="card-accent-rail" style={{ background: card.accent }} aria-hidden />

      <div className="card-panel">
        <header className="card-brand">
          {card.company ? (
            <div className="card-brand-mark">
              <CompanyLogo
                company={card.company}
                url={card.url}
                companyDomain={card.companyDomain}
                logoUrl={card.logoUrl}
                size="md"
                rounded="md"
              />
            </div>
          ) : null}
          <div className="card-brand-copy">
            {card.company ? <p className="card-brand-name">{card.company}</p> : null}
            <div className="card-badges">
              {quickMetadata ? <span className="card-badge">{quickMetadata}</span> : null}
              {card.remote !== undefined ? (
                <span className={`card-badge ${card.remote ? "card-badge--remote" : ""}`}>
                  {card.remote ? "Remote" : "On-site"}
                </span>
              ) : null}
            </div>
          </div>
        </header>

        <h2 className="card-title">{card.title}</h2>

        {card.location ? (
          <p className="card-location">
            <span className="card-location-label">Based in</span>
            {card.location}
          </p>
        ) : null}

        {salary ? (
          <div className="card-salary" style={{ background: card.accent }}>
            <span className="card-salary-label">Comp</span>
            <span className="card-salary-value">{salary}</span>
          </div>
        ) : compensation && !salary ? (
          <div className="card-salary" style={{ background: card.accent }}>
            <span className="card-salary-label">Comp</span>
            <span className="card-salary-value">{compensation}</span>
          </div>
        ) : null}

        {(card.description || card.benefits?.length) ? (
          <div className="card-copy">
            {card.description ? <p className="card-description">{card.description}</p> : null}
            {card.benefits?.length ? (
              <ul className="card-benefits">
                {card.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {card.tags?.length ? (
          <div className="card-tags" aria-label="Skills and technologies">
            {card.tags.map((tag, index) => (
              <span
                key={tag}
                className="card-tag"
                style={{ background: tagAccentFor(card.id, tag, index) }}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <footer className="card-footer">
          {card.url ? (
            <a
              className="card-cta"
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={(event) => event.stopPropagation()}
            >
              View position
            </a>
          ) : (
            <span className="card-cta card-cta--static">View position</span>
          )}
        </footer>
      </div>
    </>
  );
});

function getSwipeExitX(direction: "left" | "right") {
  const distance = typeof window !== "undefined" ? window.innerWidth * 0.65 : 480;
  return direction === "right" ? distance : -distance;
}

interface StackCardItemProps {
  card: StackCard;
  stackIndex: number;
  isTop: boolean;
  dealAnimating: boolean;
  dragX?: MotionValue<number>;
  variants: Variants;
  settings: CardStackSettings;
  onExitStart?: (card: StackCard, direction: "left" | "right", startX: number) => void;
  quickMetadata: string | null;
  compensation: string | null;
}

interface ExitingCardState {
  card: StackCard;
  direction: "left" | "right";
  startX: number;
  quickMetadata: string | null;
  compensation: string | null;
}

const ExitCardOverlay = memo(function ExitCardOverlay({
  exiting,
  onComplete,
}: {
  exiting: ExitingCardState;
  onComplete: () => void;
}) {
  const x = useMotionValue(exiting.startX);
  const dragRotate = useTransform(x, [-280, 0, 280], [-14, 0, 14]);
  const dragScale = useTransform(x, [-180, 0, 180], [0.985, 1.02, 0.985]);
  const dragOpacity = useTransform(x, [-400, -120, 0, 120, 400], [0.55, 0.92, 1, 0.92, 0.55]);

  useEffect(() => {
    void animate(x, getSwipeExitX(exiting.direction), SWIPE_EXIT).then(onComplete);
  }, [exiting.direction, onComplete, x]);

  return (
    <motion.div className="card card-0 card-exit-overlay" style={{ pointerEvents: "none" }}>
      <motion.div
        className="card-interactive"
        style={{
          x,
          rotate: dragRotate,
          scale: dragScale,
          opacity: dragOpacity,
        }}
      >
        <CardContent
          card={exiting.card}
          quickMetadata={exiting.quickMetadata}
          compensation={exiting.compensation}
        />
      </motion.div>
    </motion.div>
  );
});

const StackCardItem = memo(function StackCardItem({
  card,
  stackIndex,
  isTop,
  dealAnimating,
  dragX,
  variants,
  settings,
  onExitStart,
  quickMetadata,
  compensation,
}: StackCardItemProps) {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const committingRef = useRef(false);
  const localX = useMotionValue(0);
  const x = dragX ?? localX;
  const dragRotate = useTransform(x, [-280, 0, 280], [-14, 0, 14]);
  const dragScale = useTransform(x, [-180, 0, 180], [0.985, 1.02, 0.985]);
  const dragOpacity = useTransform(x, [-400, -120, 0, 120, 400], [0.55, 0.92, 1, 0.92, 0.55]);

  const setDragging = useCallback((dragging: boolean) => {
    interactiveRef.current?.classList.toggle("card-dragging", dragging);
  }, []);

  useEffect(() => {
    committingRef.current = false;
  }, [card.id]);

  const commitSwipe = useCallback(
    (direction: "left" | "right") => {
      if (!isTop || committingRef.current) {
        return;
      }

      committingRef.current = true;
      setDragging(false);
      onExitStart?.(card, direction, x.get());
    },
    [card, isTop, onExitStart, setDragging, x],
  );

  const handleDrag = useCallback(() => {
    if (!isTop || committingRef.current) {
      return;
    }

    const rect = interactiveRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    if (rect.left <= SCREEN_EDGE_INSET) {
      commitSwipe("left");
      return;
    }

    if (rect.right >= window.innerWidth - SCREEN_EDGE_INSET) {
      commitSwipe("right");
    }
  }, [commitSwipe, isTop]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (!isTop || committingRef.current) {
        return;
      }

      setDragging(false);

      const direction = shouldSwipe(info.offset.x, info.velocity.x, settings);

      if (direction === "right") {
        commitSwipe("right");
        return;
      }

      if (direction === "left") {
        commitSwipe("left");
        return;
      }

      void animate(x, 0, SWIPE_RESET);
    },
    [commitSwipe, isTop, setDragging, settings, x],
  );

  return (
    <motion.div
      custom={stackIndex}
      variants={variants}
      initial={dealAnimating ? getDealInInitial(stackIndex) : false}
      animate="visible"
      layout={false}
      className={`card card-${stackIndex}`}
      style={{ pointerEvents: isTop ? "auto" : "none" }}
    >
      <motion.div
        ref={interactiveRef}
        className="card-interactive"
        drag={isTop ? "x" : false}
        dragConstraints={{ left: -900, right: 900 }}
        dragElastic={0.35}
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
        onDragStart={() => isTop && setDragging(true)}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{
          x: isTop ? x : 0,
          rotate: isTop ? dragRotate : 0,
          scale: isTop ? dragScale : 1,
          opacity: isTop ? dragOpacity : 1,
          touchAction: isTop ? "none" : "auto",
        }}
      >
        <CardContent
          card={card}
          quickMetadata={quickMetadata}
          compensation={compensation}
        />
      </motion.div>
    </motion.div>
  );
});

export function SimpleCardStack({
  cards,
  settings: settingsOverride,
  dealEnter = false,
  onSwipe,
}: SimpleCardStackProps) {
  const reduceMotion = useReducedMotion();
  const settings = useMemo(
    () => ({ ...DEFAULT_CARD_STACK_SETTINGS, ...settingsOverride }),
    [settingsOverride],
  );
  const [dealAnimating, setDealAnimating] = useState(dealEnter && !reduceMotion);
  const variants = useMemo(
    () => createCardVariants(settings, { dealDelay: dealAnimating }),
    [dealAnimating, settings],
  );
  const topCardX = useMotionValue(0);
  const [exitingCard, setExitingCard] = useState<ExitingCardState | null>(null);

  useEffect(() => {
    if (!dealEnter || reduceMotion) {
      setDealAnimating(false);
      return;
    }

    setDealAnimating(true);
    const id = window.setTimeout(() => setDealAnimating(false), 620);
    return () => window.clearTimeout(id);
  }, [dealEnter, reduceMotion]);

  const visibleCards = cards.slice(0, 4);

  const handleExitStart = useCallback(
    (card: StackCard, direction: "left" | "right", startX: number) => {
      setExitingCard({
        card,
        direction,
        startX,
        quickMetadata: buildQuickMetadata(card),
        compensation: buildCompensationLine(card),
      });
      topCardX.set(0);
      onSwipe?.(card, direction);
    },
    [onSwipe, topCardX],
  );

  const handleExitComplete = useCallback(() => {
    setExitingCard(null);
  }, []);

  const swipeTopCard = useCallback(
    (direction: "left" | "right") => {
      const card = visibleCards[0];
      if (!card || exitingCard) return;

      handleExitStart(card, direction, topCardX.get());
    },
    [exitingCard, handleExitStart, topCardX, visibleCards],
  );

  if (visibleCards.length === 0) {
    return null;
  }

  return (
    <div className="discover-stack-scene">
      <div className="content-container">
        {visibleCards.map((card, stackIndex) => (
          <StackCardItem
            key={card.id}
            card={card}
            stackIndex={stackIndex}
            isTop={stackIndex === 0}
            dealAnimating={dealAnimating}
            dragX={stackIndex === 0 ? topCardX : undefined}
            variants={variants}
            settings={settings}
            onExitStart={handleExitStart}
            quickMetadata={buildQuickMetadata(card)}
            compensation={buildCompensationLine(card)}
          />
        ))}
        {exitingCard ? (
          <ExitCardOverlay exiting={exitingCard} onComplete={handleExitComplete} />
        ) : null}
      </div>
      <motion.div
        className="mt-10 flex justify-center gap-4"
        initial={dealEnter && !reduceMotion ? { opacity: 0, y: 22 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...POP_IN_SPRING, delay: dealEnter && !reduceMotion ? 0.4 : 0 }}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={Boolean(exitingCard)}
          onClick={() => swipeTopCard("left")}
        >
          Pass
        </Button>
        <Button
          type="button"
          variant="lime"
          size="sm"
          disabled={Boolean(exitingCard)}
          onClick={() => swipeTopCard("right")}
        >
          Save
        </Button>
      </motion.div>
    </div>
  );
}

export function cardsToStackCards<
  T extends {
    id: string;
    title: string;
    company: string;
    location: string;
    companyDomain?: string;
    logoUrl?: string;
    url?: string;
    description?: string;
    tags?: string[];
    salary?: string;
    remote?: boolean;
    employmentType?: string;
    benefits?: string[];
  },
>(items: T[]): StackCard[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    location: item.location,
    accent: accentForCard(item.company),
    company: item.company,
    companyDomain: item.companyDomain,
    logoUrl: item.logoUrl,
    url: item.url,
    description: item.description,
    tags: item.tags,
    salary: item.salary,
    remote: item.remote,
    employmentType: item.employmentType,
    benefits: item.benefits,
  }));
}
