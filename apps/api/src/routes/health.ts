import { Router } from "express";
import type { ApiResponse, HealthCheckResponse } from "@repo/types";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  const body: ApiResponse<HealthCheckResponse> = {
    ok: true,
    data: {
      status: "ok",
      service: "api",
      timestamp: new Date().toISOString(),
    },
  };
  res.json(body);
});
