"use client";

import * as React from "react";
import { cn } from "./cn";

export interface GaugeProps {
  label: string;
  /** 0..1 */
  fraction: number;
  displayValue: string;
  color?: string;
  className?: string;
}

const R = 50;
const CX = 60;
const CY = 65;
const CIRCUMFERENCE = Math.PI * R;

export function Gauge({ label, fraction, displayValue, color = "#E8A93B", className }: GaugeProps) {
  const clamped = Math.max(0, Math.min(1, fraction));
  const [animatedFraction, setAnimatedFraction] = React.useState(0);

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setAnimatedFraction(clamped);
      return;
    }

    // Sweep on next tick so the CSS transition actually animates from 0.
    const frame = requestAnimationFrame(() => setAnimatedFraction(clamped));
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  const offset = CIRCUMFERENCE * (1 - animatedFraction);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <svg viewBox="0 0 120 80" className="w-full max-w-[140px]">
        <path
          d={`M ${CX - R},${CY} A ${R},${R} 0 1 1 ${CX + R},${CY}`}
          fill="none"
          stroke="#2C3560"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <path
          d={`M ${CX - R},${CY} A ${R},${R} 0 1 1 ${CX + R},${CY}`}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms ease-out" }}
        />
        <text
          x={CX}
          y={CY - 6}
          textAnchor="middle"
          fontFamily="var(--font-space-grotesk), sans-serif"
          fontWeight={600}
          fontSize={20}
          fill="#EDE6D8"
        >
          {displayValue}
        </text>
      </svg>
      <span className="font-body text-xs uppercase tracking-wider text-ink-muted">{label}</span>
    </div>
  );
}
