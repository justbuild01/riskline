import * as React from "react";
import type { AssetRiskDetail, CorrelationEntry } from "@repo/types";

export interface CorrelationClusterMapProps {
  assets: AssetRiskDetail[];
  correlations: CorrelationEntry[];
}

const CENTER = 150;
const RADIUS = 95;
const MIN_NODE_R = 14;
const MAX_NODE_R = 34;

/**
 * Signature element (ruleset 8.1 Step 3): assets placed as nodes around a
 * circle, edges colored/weighted by correlation strength — coral for
 * highly-correlated pairs (concentrated risk), teal for diversifying ones.
 * Deliberately not a flat heatmap grid.
 */
export function CorrelationClusterMap({ assets, correlations }: CorrelationClusterMapProps) {
  const nodeAssets = assets.filter((a) => a.hasReturnData && !a.isStablecoin);

  if (nodeAssets.length < 2) {
    return (
      <div className="flex h-[300px] items-center justify-center px-6 text-center font-body text-sm text-ink-muted">
        Not enough priced, non-stablecoin holdings yet to map correlations — this fills in once at
        least two assets have usable price data.
      </div>
    );
  }

  const positions = new Map<string, { x: number; y: number }>();
  nodeAssets.forEach((asset, i) => {
    const angle = (2 * Math.PI * i) / nodeAssets.length - Math.PI / 2;
    positions.set(asset.asset, {
      x: CENTER + RADIUS * Math.cos(angle),
      y: CENTER + RADIUS * Math.sin(angle),
    });
  });

  const maxWeight = Math.max(...nodeAssets.map((a) => a.weight), 0.0001);

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[340px] mx-auto">
      {correlations.map((c) => {
        const from = positions.get(c.assetA);
        const to = positions.get(c.assetB);
        if (!from || !to) return null;

        const isRisky = c.correlation > 0;
        const color = isRisky ? "#E8654F" : "#4FB8A8";
        const strokeWidth = 1 + Math.abs(c.correlation) * 6;

        return (
          <line
            key={`${c.assetA}-${c.assetB}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeOpacity={0.35 + Math.abs(c.correlation) * 0.5}
          />
        );
      })}

      {nodeAssets.map((asset) => {
        const pos = positions.get(asset.asset)!;
        const r = MIN_NODE_R + (asset.weight / maxWeight) * (MAX_NODE_R - MIN_NODE_R);

        return (
          <g key={asset.asset}>
            <circle cx={pos.x} cy={pos.y} r={r} fill="#1C2447" stroke="#E8A93B" strokeWidth={2} />
            <text
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              fontFamily="var(--font-space-grotesk), sans-serif"
              fontWeight={600}
              fontSize={12}
              fill="#EDE6D8"
            >
              {asset.asset}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
