import { prisma } from "../../db/prisma";
import { translate } from "../ai/translate";

export async function getOrCreateTranslation(
  messageId: string,
  target: string
) {
  const hit = await prisma.messageTranslation.findFirst({
    where: { messageId, targetLocale: target },
  });
  if (hit) return hit;
  const msg = await prisma.message.findUnique({ where: { id: messageId } });
  if (!msg) throw new Error("Message not found");
  const translated = await translate(msg.body, target);
  return prisma.messageTranslation.create({
    data: { messageId, targetLocale: target, translated, engine: "openai" },
  });
}
