export interface CardStackSettings {
  springDuration: number;
  springBounce: number;
  xSpringDuration: number;
  xSpringBounce: number;
  dragElastic: number;
  swipeOffsetThreshold: number;
  swipeVelocityThreshold: number;
  zIndexDelay: number;
}

export const DEFAULT_CARD_STACK_SETTINGS: CardStackSettings = {
  springDuration: 0.45,
  springBounce: 0.25,
  xSpringDuration: 0.5,
  xSpringBounce: 0.15,
  dragElastic: 0.85,
  swipeOffsetThreshold: 90,
  swipeVelocityThreshold: 300,
  zIndexDelay: 0.04,
};

export function shouldSwipe(offsetX: number, velocityX: number, settings: CardStackSettings) {
  if (offsetX > settings.swipeOffsetThreshold || velocityX > settings.swipeVelocityThreshold) {
    return "right" as const;
  }
  if (offsetX < -settings.swipeOffsetThreshold || velocityX < -settings.swipeVelocityThreshold) {
    return "left" as const;
  }
  return null;
}

export const STACK_DEPTH = 4;

/** Figma simple-card-stack layout: centered deck, back cards peek from top. */
export const STACK_LAYOUT = {
  scale: [1, 0.97, 0.94, 0.91],
  y: [0, -14, -28, -42],
  rotate: [0, 2.5, 5, 7.5],
  x: [0, 6, 12, 18],
} as const;

export function createCardVariants(
  settings: CardStackSettings,
  options?: { dealDelay?: boolean },
) {
  const stackSpring = {
    type: "spring" as const,
    stiffness: 460,
    damping: 28,
    mass: 0.68,
  };

  return {
    visible: (index: number) => ({
      opacity: 1,
      scale: STACK_LAYOUT.scale[index] ?? STACK_LAYOUT.scale.at(-1),
      y: STACK_LAYOUT.y[index] ?? STACK_LAYOUT.y.at(-1),
      rotate: STACK_LAYOUT.rotate[index] ?? STACK_LAYOUT.rotate.at(-1),
      x: STACK_LAYOUT.x[index] ?? STACK_LAYOUT.x.at(-1),
      transition: {
        default: {
          ...stackSpring,
          stiffness: options?.dealDelay ? 480 : 520,
          damping: options?.dealDelay ? 26 : 32,
          mass: options?.dealDelay ? 0.7 : 0.58,
          delay: options?.dealDelay ? getDealInDelay(index) : 0,
        },
      },
    }),
    exit: {
      opacity: 0,
      scale: 0.88,
      transition: { duration: 0.15 },
    },
  };
}

/** Back cards land first; top card settles last. */
export function getDealInDelay(stackIndex: number) {
  return (STACK_DEPTH - 1 - stackIndex) * 0.09;
}

export function getDealInInitial(stackIndex: number) {
  const baseY = STACK_LAYOUT.y[stackIndex] ?? STACK_LAYOUT.y.at(-1)!;
  const baseX = STACK_LAYOUT.x[stackIndex] ?? STACK_LAYOUT.x.at(-1)!;

  return {
    opacity: 0,
    scale: 0.86,
    y: baseY - 110,
    rotate: -8 + stackIndex * 2.5,
    x: baseX + 16,
  };
}

/** Neo-brutalist flat accent fills. */
export const BRUTAL_CARD_ACCENTS = [
  "#ffe066",
  "#70d6ff",
  "#ff6b9d",
  "#c8ff00",
  "#b388ff",
] as const;

export type BrutalAccent = (typeof BRUTAL_CARD_ACCENTS)[number];

function hashString(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function accentForCard(seed: string): BrutalAccent {
  return BRUTAL_CARD_ACCENTS[hashString(seed) % BRUTAL_CARD_ACCENTS.length];
}

/** Stable per-tag color for a card — does not change when stack position shifts. */
export function tagAccentFor(cardId: string, tag: string, tagIndex: number): BrutalAccent {
  return BRUTAL_CARD_ACCENTS[
    (tagIndex + hashString(`${cardId}:${tag}`)) % BRUTAL_CARD_ACCENTS.length
  ];
}

export function gradientForCard(seed: string): string {
  return accentForCard(seed);
}
