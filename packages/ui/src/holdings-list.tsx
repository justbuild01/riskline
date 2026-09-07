import * as React from "react";
import type { AssetRiskDetail } from "@repo/types";

export function HoldingsList({ assets }: { assets: AssetRiskDetail[] }) {
  const sorted = [...assets].sort((a, b) => b.weight - a.weight);

  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((asset) => (
        <li key={asset.asset} className="flex items-center gap-3">
          <span className="w-14 shrink-0 font-display text-sm font-semibold">{asset.asset}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.round(asset.weight * 100)}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right font-body text-sm text-ink-muted">
            {Math.round(asset.weight * 100)}%
          </span>
        </li>
      ))}
    </ul>
  );
}
