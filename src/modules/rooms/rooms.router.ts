import { Router } from "express";
import { prisma } from "../../db/prisma";
import { authGuard, AuthedRequest } from "../../middlewares/authGuard";

const r = Router();

r.post("/", authGuard, async (req: AuthedRequest, res) => {
  const { name, type } = req.body as { name?: string; type: "dm" | "group" };
  const room = await prisma.room.create({
    data: { name, type, createdBy: req.user!.id },
  });
  await prisma.roomMember.create({
    data: { roomId: room.id, userId: req.user!.id, role: "owner" },
  });
  res.json(room);
});

r.get("/:id", authGuard, async (req: AuthedRequest, res) => {
  const room = await prisma.room.findUnique({
    where: { id: req.params.id },
    include: { members: true },
  });
  if (!room) return res.status(404).json({ error: "Not found" });
  res.json(room);
});

export default r;
