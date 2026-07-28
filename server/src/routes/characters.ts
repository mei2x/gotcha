import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/", async (_req, res) => {
  const characters = await prisma.character.findMany({
    orderBy: { name: "asc" },
  });
  res.json(characters);
});

export default router;
