"use client";

import { useState } from "react";
import { Sparkles, Edit3 } from "lucide-react";
import { CreateListingForm } from "./create-listing-form";
import { Category } from "@prisma/client";

type FlowStep = "choice" | "manual-category" | "manual-form" | "ai-input" | "ai-form";

export type ListingDefaultValues = {
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

interface NewListingFlowProps {
  categories: Category[];
}

export function NewListingFlow({ categories }: NewListingFlowProps) {
  const [step, setStep] = useState<FlowStep>("choice");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [aiDefaults, setAiDefaults] = useState<ListingDefaultValues | null>(null);

  const handleChooseManual = () => {
    setStep("manual-category");
  };

  const handleChooseAi = () => {
    setStep("ai-input");
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setStep("manual-form");
  };

  const handleBackFromCategory = () => {
    setStep("choice");
    setSelectedCategoryId(null);
  };

  const handleBackFromForm = () => {
    if (step === "manual-form") {
      setStep("manual-category");
      setSelectedCategoryId(null);
    } else {
      setStep("ai-input");
      setAiDefaults(null);
    }
  };

  if (step === "choice") {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <p className="text-gray-600 mb-6">
          E&apos;lonni qanday yaratmoqchisiz?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleChooseAi}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-primary-200 bg-primary-50 hover:bg-primary-100 hover:border-primary-300 transition-colors text-left"
          >
            <Sparkles className="text-primary-600" size={40} />
            <span className="font-semibold text-gray-900">Yordamchi AI bilan</span>
            <span className="text-sm text-gray-600 text-center">
              Nima sotmoqchi yoki xizmat ko&apos;rsatmoqchi ekaningizni yozing — AI kategoriya va barcha maydonlarni to&apos;ldiradi
            </span>
          </button>
          <button
            type="button"
            onClick={handleChooseManual}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
          >
            <Edit3 className="text-gray-600" size={40} />
            <span className="font-semibold text-gray-900">O&apos;zim to&apos;ldiraman</span>
            <span className="text-sm text-gray-600 text-center">
              Avval kategoriyani tanlang, keyin forma ochiladi
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (step === "manual-category") {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Kategoriyani tanlang
        </h2>
        <p className="text-gray-600 mb-6">
          Keyin shu kategoriya uchun forma ochiladi
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              className="p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
            >
              <span className="font-medium text-gray-900">{cat.name}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleBackFromCategory}
          className="mt-6 text-gray-600 hover:text-gray-900 underline"
        >
          ← Orqaga
        </button>
      </div>
    );
  }

  if (step === "ai-input") {
    return (
      <AiInputStep
        categories={categories}
        onGenerated={(defaults) => {
          setAiDefaults(defaults);
          setStep("ai-form");
        }}
        onBack={() => setStep("choice")}
      />
    );
  }

  const defaultValues: ListingDefaultValues | undefined =
    step === "manual-form" && selectedCategoryId
      ? { categoryId: selectedCategoryId }
      : step === "ai-form" && aiDefaults
        ? aiDefaults
        : undefined;

  return (
    <div>
      {step === "manual-form" && (
        <button
          type="button"
          onClick={handleBackFromForm}
          className="mb-4 text-gray-600 hover:text-gray-900 underline"
        >
          ← Kategoriyani o&apos;zgartirish
        </button>
      )}
      {step === "ai-form" && (
        <button
          type="button"
          onClick={handleBackFromForm}
          className="mb-4 text-gray-600 hover:text-gray-900 underline"
        >
          ← Matnni o&apos;zgartirish
        </button>
      )}
      <CreateListingForm
        categories={categories}
        defaultValues={defaultValues}
        onBack={step === "manual-form" || step === "ai-form" ? handleBackFromForm : undefined}
      />
    </div>
  );
}

interface AiInputStepProps {
  categories: Category[];
  onGenerated: (defaults: ListingDefaultValues) => void;
  onBack: () => void;
}

function AiInputStep({ categories, onGenerated, onBack }: AiInputStepProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categoryList = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  const handleGenerate = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Matnni kiriting");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/listings/generate-with-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: trimmed,
          categories: categoryList,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "AI javob bermadi");
      }
      const data = await res.json();
      onGenerated({
        title: data.title,
        description: data.description,
        price: data.price ?? null,
        categoryId: data.categoryId,
        city: data.city,
        location: data.location,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Nima sotmoqchi yoki xizmat ko&apos;rsatmoqchisiz?
      </h2>
      <p className="text-gray-600 mb-4">
        Qisqacha yozing — AI kategoriya, sarlavha, tavsif va narxni to&apos;ldiradi. Keyin siz rasmlar qo&apos;shasiz va kerak bo&apos;lsa tuzatasiz.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Masalan: iPhone 14 Pro 256GB, yaxshi holatda, Namangan shahrida..."
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        disabled={loading}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 underline"
        >
          Orqaga
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              To&apos;ldirilmoqda...
            </>
          ) : (
            "To&apos;ldirish"
          )}
        </button>
      </div>
    </div>
  );
}
