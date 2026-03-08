"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, ShoppingCart } from "lucide-react";

export function CompactSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="bg-primary-600 px-4 py-3">
      <div className="container mx-auto">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Qidiruv barcha hududlarda"
                className="w-full px-4 py-2.5 pl-10 pr-4 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 bg-white"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Search size={18} />
              </button>
            </div>
            <button
              type="button"
              className="bg-white rounded-lg p-2.5 hover:bg-gray-50 transition-colors"
              aria-label="Filter"
            >
              <Filter size={18} className="text-gray-700" />
            </button>
            <button
              type="button"
              className="bg-white rounded-lg p-2.5 hover:bg-gray-50 transition-colors relative"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={18} className="text-gray-700" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

