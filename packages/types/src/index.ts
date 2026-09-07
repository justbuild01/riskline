/**
 * Shared, theme-agnostic types. Portfolio/risk/Agent OS-specific types are
 * intentionally NOT here yet — those get added in Session 2+ when that logic
 * is actually built, per the ruleset's "no invented scope" rule.
 */

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; code?: string } };

export interface HealthCheckResponse {
  status: "ok";
  service: string;
  timestamp: string;
}

export interface AppUser {
  id: string;
  email: string;
}
