"use client";

import Link from "next/link";
import { Car } from "lucide-react";

export function PromoBanner() {
  return (
    <Link
      href="/category/avtomobili"
      className="block bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 mb-6"
    >
      <div className="relative p-6 md:p-8 lg:p-12">
        <div className="flex items-center justify-between">
          <div className="flex-1 z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Car size={32} className="text-white" />
              </div>
              <h3 className="text-white font-bold text-xl md:text-2xl">
                Namangan Avto
              </h3>
            </div>
            <h2 className="text-white font-bold text-2xl md:text-4xl mb-2">
              Mashina sotib oling foydali
            </h2>
            <p className="text-white/90 text-sm md:text-base">
              Minglab mashinalar bir joyda
            </p>
          </div>
          <div className="hidden md:block relative w-48 h-48 lg:w-64 lg:h-64">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Car size={120} className="text-white/20" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

