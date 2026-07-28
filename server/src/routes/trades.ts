import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../auth";

const router = Router();

router.get("/mine", requireAuth, async (req, res) => {
  const userId = req.userId!;

  const trades = await prisma.trade.findMany({
    where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
    orderBy: { completedAt: "desc" },
  });

  res.json(
    trades.map((trade) => {
      const iAmSender = trade.fromUserId === userId;
      const mine = iAmSender
        ? {
            title: trade.fromTitle,
            series: trade.fromSeries,
            imageUrls: trade.fromImageUrls,
            character: { name: trade.fromCharacterName, slug: trade.fromCharacterSlug },
          }
        : {
            title: trade.toTitle,
            series: trade.toSeries,
            imageUrls: trade.toImageUrls,
            character: { name: trade.toCharacterName, slug: trade.toCharacterSlug },
          };
      const theirs = iAmSender
        ? {
            title: trade.toTitle,
            series: trade.toSeries,
            imageUrls: trade.toImageUrls,
            character: { name: trade.toCharacterName, slug: trade.toCharacterSlug },
          }
        : {
            title: trade.fromTitle,
            series: trade.fromSeries,
            imageUrls: trade.fromImageUrls,
            character: { name: trade.fromCharacterName, slug: trade.fromCharacterSlug },
          };

      return {
        id: trade.id,
        completedAt: trade.completedAt,
        mine,
        theirs,
      };
    })
  );
});

export default router;
