import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const oldPath = formData.get("oldPath") as string; // Ambil path file lama jika ada

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // already exists
    }

    // 1. Hapus file lama jika ada dan valid
    if (oldPath && oldPath.startsWith("/uploads/")) {
      try {
        const oldFilePath = join(process.cwd(), "public", oldPath);
        await unlink(oldFilePath);
      } catch (e) {
        console.error("Gagal menghapus file lama:", e);
        // Lanjut saja jika gagal hapus (mungkin file sudah tidak ada)
      }
    }

    // 2. Generate unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const path = join(uploadDir, filename);

    // 3. Simpan file baru
    await writeFile(path, buffer);
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal menyimpan file" }, { status: 500 });
  }
}
