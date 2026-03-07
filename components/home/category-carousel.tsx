"use client";

import { useRef } from "react";
import Link from "next/link";
import { Category } from "@prisma/client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryCarouselProps {
  categories: (Category & { children: Category[] })[];
}

const categoryIcons: Record<string, string> = {
  nedvizhimost: "🏠",
  avtomobili: "🚗",
  elektronika: "📱",
  rabota: "💼",
  uslugi: "🔧",
  arenda: "🏢",
};

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Left Arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors hidden md:flex items-center justify-center"
        aria-label="Oldingi kategoriyalar"
      >
        <ChevronLeft size={24} className="text-gray-700" />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 md:px-0 -mx-2 md:mx-0"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group flex-shrink-0 bg-white rounded-xl p-5 hover:shadow-xl transition-all duration-200 border-2 border-gray-200 hover:border-primary-400 min-w-[150px] w-[150px] md:min-w-[180px] md:w-[180px] flex flex-col items-center justify-center"
          >
            <div className="text-5xl mb-3 text-center">
              {categoryIcons[category.slug] || "📦"}
            </div>
            <h3 className="text-center font-bold text-sm md:text-base text-gray-900 group-hover:text-primary-600 transition-colors">
              {category.name}
            </h3>
            {category.children && category.children.length > 0 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                {category.children.length} ta kategoriya
              </p>
            )}
          </Link>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors hidden md:flex items-center justify-center"
        aria-label="Keyingi kategoriyalar"
      >
        <ChevronRight size={24} className="text-gray-700" />
      </button>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

