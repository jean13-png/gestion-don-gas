import prisma from "@/lib/prisma";

export async function checkRateLimit(key: string, windowMs: number, maxRequests: number) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "updatedAt")
    VALUES (${key}, 1, ${resetAt}, ${now})
    ON CONFLICT ("key") DO UPDATE
    SET
      "count" = CASE
        WHEN "RateLimitBucket"."resetAt" <= ${now} THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "resetAt" = CASE
        WHEN "RateLimitBucket"."resetAt" <= ${now} THEN ${resetAt}
        ELSE "RateLimitBucket"."resetAt"
      END,
      "updatedAt" = ${now}
    RETURNING "count"
  `;

  return Number(rows[0]?.count ?? maxRequests + 1) <= maxRequests;
}

export async function resetRateLimit(key: string) {
  await prisma.rateLimitBucket.deleteMany({ where: { key } });
}

export async function cleanupRateLimitEntries() {
  await prisma.rateLimitBucket.deleteMany({
    where: { resetAt: { lt: new Date() } },
  });
}
