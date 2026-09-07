import "dotenv/config";
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: webOrigin }));
app.use(express.json());

app.use("/health", healthRouter);

// Agent OS MCP client + portfolio/risk routes are NOT mounted here yet —
// that's Session 2+ theme-specific work per BUILD_ROADMAP.md, not this
// session's scope.

app.listen(port, () => {
  console.log(`api listening on http://localhost:${port}`);
});
