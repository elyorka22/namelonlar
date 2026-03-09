import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/data/categories";
import { CreateListingForm } from "@/components/listings/create-listing-form";

export default async function NewListingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin?callbackUrl=/listing/new");
  }

  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          E'lon joylashtirish
        </h1>
        <CreateListingForm categories={categories} />
      </div>
    </div>
  );
}

