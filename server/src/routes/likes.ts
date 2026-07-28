import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../auth";
import { serializeListing } from "./listings";

const router = Router();

router.get("/mine", requireAuth, async (req, res) => {
  const userId = req.userId!;

  const likes = await prisma.like.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: { seller: true, character: true, _count: { select: { likes: true } } },
      },
    },
  });

  res.json(likes.map(({ listing }) => serializeListing(listing, true)));
});

export default router;
