import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import listingsRouter from "./routes/listings";
import charactersRouter from "./routes/characters";
import authRouter from "./routes/auth";
import tradesRouter from "./routes/trades";
import likesRouter from "./routes/likes";
import tradeRequestsRouter from "./routes/tradeRequests";

const app = express();

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: WEB_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/listings", listingsRouter);
app.use("/api/characters", charactersRouter);
app.use("/api/auth", authRouter);
app.use("/api/trades", tradesRouter);
app.use("/api/likes", likesRouter);
app.use("/api/trade-requests", tradeRequestsRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(400).json({ error: err.message || "Something went wrong" });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`gotcha API listening on http://localhost:${port}`);
});
