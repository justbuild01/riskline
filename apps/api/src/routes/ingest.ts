import { Router } from "express";
import type { ApiResponse } from "@repo/types";
import { ingestPortfolioSnapshot, IngestValidationError } from "../lib/ingest";

export const ingestRouter = Router();

ingestRouter.post("/portfolio-snapshot", async (req, res) => {
  const secret = process.env.INGEST_SECRET;
  const provided = req.header("x-ingest-secret");

  if (!secret) {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "INGEST_SECRET is not configured on the server" },
    };
    res.status(500).json(body);
    return;
  }

  if (provided !== secret) {
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "unauthorized", code: "INGEST_UNAUTHORIZED" },
    };
    res.status(401).json(body);
    return;
  }

  try {
    const record = await ingestPortfolioSnapshot(req.body);
    const body: ApiResponse<typeof record> = { ok: true, data: record };
    res.status(201).json(body);
  } catch (err) {
    if (err instanceof IngestValidationError) {
      const body: ApiResponse<never> = {
        ok: false,
        error: {
          message: "validation failed",
          code: "INGEST_VALIDATION_ERROR",
        },
      };
      res.status(400).json({ ...body, details: err.zodError.flatten() });
      return;
    }

    console.error("ingest failed:", err);
    const body: ApiResponse<never> = {
      ok: false,
      error: { message: "internal error persisting snapshot" },
    };
    res.status(500).json(body);
  }
});
