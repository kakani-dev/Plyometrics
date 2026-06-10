import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import examsRouter from "./routes/exams.js";

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/exams", examsRouter(prisma));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
