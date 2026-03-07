import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

interface BannerSectionProps {
  position: string;
}

export async function BannerSection({ position }: BannerSectionProps) {
  try {
    const now = new Date();
    const banners = await prisma.banner.findMany({
    where: {
      position,
      isActive: true,
      AND: [
        {
          OR: [
            { startDate: null },
            { startDate: { lte: now } },
          ],
        },
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ],
    },
    take: 3,
  });

    if (banners.length === 0) {
      return null;
    }
  } catch (error) {
    return null;
  }

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.link || "#"}
              className="relative h-48 rounded-xl overflow-hidden group"
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-semibold text-lg">
                  {banner.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

