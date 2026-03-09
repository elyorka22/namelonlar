"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Category } from "@prisma/client";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadImage } from "@/app/actions/upload";

const listingSchema = z.object({
  title: z.string().min(5, "Kamida 5 belgi").max(200, "Maksimal 200 belgi"),
  description: z.string().min(20, "Kamida 20 belgi").max(5000, "Maksimal 5000 belgi"),
  price: z.number().min(0).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Kategoriyani tanlang"),
  location: z.string().optional(),
  city: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactTelegram: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

export type ListingFormDefaultValues = {
  title?: string;
  description?: string;
  price?: number | null;
  categoryId?: string;
  city?: string;
  location?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactTelegram?: string;
};

interface CreateListingFormProps {
  categories: Category[];
  defaultValues?: ListingFormDefaultValues | null;
  onBack?: () => void;
}

export function CreateListingForm({ categories, defaultValues, onBack }: CreateListingFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: defaultValues
      ? {
          title: defaultValues.title ?? "",
          description: defaultValues.description ?? "",
          price: defaultValues.price ?? "",
          categoryId: defaultValues.categoryId ?? "",
          city: defaultValues.city ?? "",
          location: defaultValues.location ?? "",
          contactPhone: defaultValues.contactPhone ?? "",
          contactEmail: defaultValues.contactEmail ?? "",
          contactTelegram: defaultValues.contactTelegram ?? "",
        }
      : undefined,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadImage(formData);
        return result.url;
      });

      const urls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Rasmlarni yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ListingFormData) => {
    if (images.length === 0) {
      alert("Kamida bitta rasm qo'shing");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          images,
          price: data.price === "" ? null : data.price,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create listing");
      }

      const listing = await response.json();
      router.push(`/listing/${listing.id}`);
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("E'lon yaratishda xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rasmlar (kamida 1 ta)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {images.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {images.length < 10 && (
            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <Loader2 className="animate-spin text-gray-400" size={24} />
              ) : (
                <Upload className="text-gray-400" size={24} />
              )}
            </label>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nomi *
        </label>
        <input
          {...register("title")}
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Masalan: iPhone 14 Pro Max 256GB"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kategoriya *
        </label>
        <select
          {...register("categoryId")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Kategoriyani tanlang</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Narx (UZS)
        </label>
        <input
          {...register("price", { valueAsNumber: true })}
          type="number"
          step="1000"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="0"
        />
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tavsif *
        </label>
        <textarea
          {...register("description")}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Mahsulot yoki xizmatni batafsil tavsiflang..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shahar
          </label>
          <input
            {...register("city")}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Namangan"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manzil
          </label>
          <input
            {...register("location")}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Tuman, ko'cha"
          />
        </div>
      </div>

      {/* Contacts */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Aloqa ma'lumotlari
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              {...register("contactPhone")}
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="+998 90 123 45 67"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              {...register("contactEmail")}
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="example@mail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telegram
            </label>
            <input
              {...register("contactTelegram")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="@username"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack ? () => onBack() : () => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Bekor qilish
        </button>
        <button
          type="submit"
          disabled={submitting || images.length === 0}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>E'lon qilinmoqda...</span>
            </>
          ) : (
            "E'lon qilish"
          )}
        </button>
      </div>
    </form>
  );
}

