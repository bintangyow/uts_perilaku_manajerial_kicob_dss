import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const oldUrl = formData.get("oldPath") as string; // Ambil URL file lama jika ada

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    // 1. Hapus file lama dari Vercel Blob jika ada
    if (oldUrl && oldUrl.includes("public.blob.vercel-storage.com")) {
      try {
        await del(oldUrl);
      } catch (e) {
        console.error("Gagal menghapus file lama dari Blob:", e);
      }
    }

    // 2. Upload file baru ke Vercel Blob
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal menyimpan file ke cloud" }, { status: 500 });
  }
}
