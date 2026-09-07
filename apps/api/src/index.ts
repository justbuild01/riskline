import "dotenv/config";
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health";
import { ingestRouter } from "./routes/ingest";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: webOrigin }));
app.use(express.json());

app.use("/health", healthRouter);
app.use("/ingest", ingestRouter);

// Risk/correlation computation routes are NOT mounted here yet — that's
// Session 3's scope per BUILD_ROADMAP.md. This session only receives and
// stores already-assembled snapshots; it never talks to Binance directly.

app.listen(port, () => {
  console.log(`api listening on http://localhost:${port}`);
});
