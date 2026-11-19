import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import ContactManager from "./ContactManager";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  await requireAdmin();

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <ContactManager messages={messages} />;
}
