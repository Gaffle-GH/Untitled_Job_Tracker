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

export const POP_STAGGER = 0.07;

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
