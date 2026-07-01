export const POP_SPRING = {
  type: "spring" as const,
  stiffness: 480,
  damping: 24,
  mass: 0.65,
};

export const POP_IN_SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 22,
  mass: 0.75,
};

export const POP_SOFT_SPRING = {
  type: "spring" as const,
  stiffness: 340,
  damping: 28,
  mass: 0.85,
};

export const POP_TAP_SPRING = {
  type: "spring" as const,
  stiffness: 700,
  damping: 18,
  mass: 0.5,
};

export const MODAL_SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
  mass: 0.8,
};

export const PAGE_SPRING = {
  type: "spring" as const,
  stiffness: 360,
  damping: 32,
  mass: 0.9,
};

export const FADE_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.7,
};

export const POP_STAGGER = 0.07;
export const POP_STAGGER_FAST = 0.05;

export const popHover = {
  x: -2,
  y: -2,
  boxShadow: "6px 6px 0 0 #000000",
};

export const popTap = {
  x: 2,
  y: 2,
  boxShadow: "2px 2px 0 0 #000000",
};

export const popRestShadow = "4px 4px 0 0 #000000";

export const popSmRestShadow = "2px 2px 0 0 #000000";

export const popSmHover = {
  scale: 1.04,
  x: -2,
  y: -2,
  boxShadow: "5px 5px 0 0 #000000",
};

export const popSmTap = {
  scale: 0.92,
  x: 2,
  y: 2,
  boxShadow: "0px 0px 0 0 #000000",
};

export const popScaleHover = { scale: 1.05, y: -2 };
export const popScaleTap = { scale: 0.9, y: 0 };

export const popInHidden = { opacity: 0, scale: 0.94, y: 14, rotate: -0.6 };
export const popInVisible = { opacity: 1, scale: 1, y: 0, rotate: 0 };

export const popListItemHidden = { opacity: 0, scale: 0.92, y: 12 };
export const popListItemVisible = { opacity: 1, scale: 1, y: 0 };

export const NAV_PAGE_TRANSITION = {
  type: "tween" as const,
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const NAV_PAGE_EXIT_TRANSITION = {
  type: "tween" as const,
  duration: 0.12,
  ease: [0.4, 0, 0.6, 1] as const,
};

export const popNavEnter = { opacity: 0, y: 6 };
export const popNavActive = { opacity: 1, y: 0 };
export const popNavExit = { opacity: 0, y: -4 };

/** @deprecated Use popNav* presets — kept for reference */
export const popPageHidden = popNavEnter;
export const popPageVisible = popNavActive;
export const popPageExit = popNavExit;

export const popSwapHidden = { opacity: 0, scale: 0.95, y: 10 };
export const popSwapVisible = { opacity: 1, scale: 1, y: 0 };
export const popSwapExit = { opacity: 0, scale: 0.97, y: -8 };

export const popModalBackdropHidden = { opacity: 0 };
export const popModalBackdropVisible = { opacity: 1 };

export const popModalPanelHidden = { opacity: 0, scale: 0.9, y: 28 };
export const popModalPanelVisible = { opacity: 1, scale: 1, y: 0 };
export const popModalPanelExit = { opacity: 0, scale: 0.95, y: 18 };
