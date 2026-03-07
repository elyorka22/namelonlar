import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = "UZS"): string {
  const formatter = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(price);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "hozirgina";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} min. oldin`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} soat oldin`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} kun oldin`;

  return formatDate(d);
}

