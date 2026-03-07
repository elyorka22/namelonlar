"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface SearchFiltersProps {
  searchParams: {
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    city?: string;
  };
}

export function SearchFilters({ searchParams }: SearchFiltersProps) {
  const router = useRouter();
  const [filters, setFilters] = useState({
    minPrice: searchParams.minPrice || "",
    maxPrice: searchParams.maxPrice || "",
    city: searchParams.city || "",
  });

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchParams.q) params.set("q", searchParams.q);
    if (searchParams.category) params.set("category", searchParams.category);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.city) params.set("city", filters.city);

    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (searchParams.q) params.set("q", searchParams.q);
    if (searchParams.category) params.set("category", searchParams.category);
    router.push(`/search?${params.toString()}`);
    setFilters({ minPrice: "", maxPrice: "", city: "" });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimal narx
        </label>
        <input
          type="number"
          value={filters.minPrice}
          onChange={(e) =>
            setFilters({ ...filters, minPrice: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maksimal narx
        </label>
        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) =>
            setFilters({ ...filters, maxPrice: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="1000000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shahar
        </label>
        <input
          type="text"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Наманган"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          onClick={applyFilters}
          className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Qo'llash
        </button>
        <button
          onClick={clearFilters}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Tozalash
        </button>
      </div>
    </div>
  );
}

