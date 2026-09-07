/**
 * Pure, dependency-free statistics helpers. Verified against known-answer
 * cases in a scratch harness before this file was written for real — see
 * SESSION_REPORT.md Session 3 for the verification log.
 */

export function toReturns(closes: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    out.push((closes[i] - closes[i - 1]) / closes[i - 1]);
  }
  return out;
}

export function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Sample standard deviation (n-1 denominator). Returns 0 for fewer than 2 points. */
export function stddev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const variance = xs.reduce((sum, x) => sum + (x - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(variance);
}

/** Pearson correlation coefficient. Returns null if inputs are mismatched, too short, or degenerate. */
export function pearsonCorrelation(a: number[], b: number[]): number | null {
  if (a.length !== b.length || a.length < 2) return null;
  const ma = mean(a);
  const mb = mean(b);
  let cov = 0;
  let va = 0;
  let vb = 0;
  for (let i = 0; i < a.length; i++) {
    cov += (a[i] - ma) * (b[i] - mb);
    va += (a[i] - ma) ** 2;
    vb += (b[i] - mb) ** 2;
  }
  const denom = Math.sqrt(va * vb);
  if (denom === 0) return null;
  return cov / denom;
}
