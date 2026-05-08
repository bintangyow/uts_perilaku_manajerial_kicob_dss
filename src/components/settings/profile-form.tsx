"use client";

import { useState, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, UserCircle, Loader2, CheckCircle2, Camera, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileForm() {
  const { currentUser } = useAuth();
  const [name, setName] = useState(currentUser?.name || "");
  const [image, setImage] = useState(currentUser?.image || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Ukuran file maksimal 2MB" });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    if (image) {
      formData.append("oldPath", image); // Kirim path lama untuk dihapus
    }

    try {
      const res = await fetch("/api/user/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload gagal");

      setImage(data.url);
      setMessage({ type: "success", text: "Foto diunggah! Klik simpan." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const { error } = await authClient.updateUser({
        name,
        image: image || undefined,
      });

      if (error) throw new Error(error.message || "Gagal memperbarui profil");

      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-6">
      <div className="flex items-center gap-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
        <div className="relative group">
          <Avatar className="w-16 h-16 border-2 border-primary/20 shadow-md">
            <AvatarImage src={image} />
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-xs font-semibold">Foto Profil</h4>
          <p className="text-[10px] text-muted-foreground">Klik foto untuk mengganti file gambar.</p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Nama Lengkap</Label>
          <div className="relative">
            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Anda"
              className="pl-10 bg-input/20 border-border/20 rounded-xl h-10 text-sm"
              required
            />
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-2.5 rounded-xl text-[11px] flex items-center gap-2 ${
          message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : null}
          <span className="flex-1">{message.text}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || isUploading}
        className="w-full glow-button text-white rounded-xl font-semibold h-10 text-sm shadow-md"
      >
        {isSubmitting ? (
          <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Menyimpan...</>
        ) : (
          <><Save className="w-3.5 h-3.5 mr-2" /> Simpan</>
        )}
      </Button>
    </form>
  );
}
