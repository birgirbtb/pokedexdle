"use client";

/* -------------------------------------------------------------------------- */
/*                                  Animated                                  */
/* -------------------------------------------------------------------------- */
/*
  Small animation helpers for UI parts.

  Exports:
  - FadeSlideIn: used for hint reveal chips
  - SlideDown: used for dropdowns / expanding panels
*/

import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*                                FadeSlideIn                                 */
/* -------------------------------------------------------------------------- */
/*
  Fade + slight upward slide.
  Use `index` to stagger multiple items.
*/

type FadeSlideInProps = {
  children: ReactNode;
  index?: number;
};

export function FadeSlideIn({ children, index = 0 }: FadeSlideInProps) {
  return (
    <div
      className="will-change-[opacity,transform]"
      style={{
        animation: "fadeSlideIn 2000ms ease-out both",
        animationDelay: `${index * 60}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  SlideDown                                 */
/* -------------------------------------------------------------------------- */
/*
  Smooth expand/collapse that does NOT shrink width:
  - Keeps children mounted
  - Animates grid rows (0fr -> 1fr)
  - Adds opacity + small translate for nicer motion
*/

type SlideDownProps = {
  show: boolean;
  children: ReactNode;
};

export function SlideDown({ show, children }: SlideDownProps) {
  return (
    <div className="w-full">
      <div
        className={[
          "grid",
          "w-full",
          "transition-[grid-template-rows,opacity,transform]",
          "duration-100",
          "ease-out",
          show
            ? "grid-rows-[1fr] opacity-100 translate-y-0"
            : "grid-rows-[0fr] opacity-0 -translate-y-1",
        ].join(" ")}
      >
        <div className="min-h-0 overflow-hidden w-full">
          <div className="w-full">{children}</div>
        </div>
      </div>

      {/* Global keyframes for FadeSlideIn */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}