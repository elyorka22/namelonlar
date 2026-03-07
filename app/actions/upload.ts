"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "crypto";

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  // Проверяем размер файла (макс 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File size exceeds 5MB limit");
  }

  // Проверяем тип файла
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Генерируем уникальное имя файла
  const fileExt = file.name.split(".").pop();
  const fileName = `${randomUUID()}.${fileExt}`;
  const filePath = `listings/${fileName}`;

  try {
    // Загружаем файл в Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Получаем публичный URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("images").getPublicUrl(filePath);

    return { url: publicUrl };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

