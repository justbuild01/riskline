import "dotenv/config";
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health";
import { ingestRouter } from "./routes/ingest";
import { riskRouter } from "./routes/risk";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: webOrigin }));
app.use(express.json());

app.use("/health", healthRouter);
app.use("/ingest", ingestRouter);
app.use("/risk", riskRouter);

// Kimi narrative generation is NOT wired up here yet — that's Session 4's
// scope per BUILD_ROADMAP.md (dashboard + plain-English narrative).

app.listen(port, () => {
  console.log(`api listening on http://localhost:${port}`);
});
