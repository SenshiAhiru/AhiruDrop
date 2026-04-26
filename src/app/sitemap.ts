import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ahirudrop.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/raffles`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/winners`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/register`, changeFrequency: "yearly", priority: 0.4 },
  ];

  try {
    // Active + closed + drawn raffles are indexable
    const raffles = await prisma.raffle.findMany({
      where: { status: { in: ["ACTIVE", "CLOSED", "DRAWN"] } },
      select: { slug: true, updatedAt: true, status: true },
      take: 500,
    });

    const raffleRoutes: MetadataRoute.Sitemap = raffles.flatMap((r) => {
      const base = {
        url: `${SITE_URL}/raffles/${r.slug}`,
        lastModified: r.updatedAt,
        changeFrequency: (r.status === "ACTIVE" ? "hourly" : "weekly") as
          | "hourly"
          | "weekly",
        priority: r.status === "ACTIVE" ? 0.8 : 0.6,
      };
      const routes: MetadataRoute.Sitemap = [base];
      // Drawn raffles also expose /verify
      if (r.status === "DRAWN") {
        routes.push({
          url: `${SITE_URL}/raffles/${r.slug}/verify`,
          lastModified: r.updatedAt,
          changeFrequency: "never",
          priority: 0.5,
        });
      }
      return routes;
    });

    return [...staticRoutes, ...raffleRoutes];
  } catch {
    return staticRoutes;
  }
}
