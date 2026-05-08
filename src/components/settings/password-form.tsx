"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2, CheckCircle2, Lock } from "lucide-react";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi password baru tidak cocok" });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password baru minimal 8 karakter" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) throw new Error(error.message || "Gagal mengganti password");

      setMessage({ type: "success", text: "Password berhasil diperbarui!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleChangePassword} className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="currentPass" className="text-sm font-medium">Password Sekarang</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="currentPass"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10 bg-input/30 border-border/30 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="newPass" className="text-sm font-medium">Password Baru</Label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="newPass"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="pl-10 bg-input/30 border-border/30 rounded-xl"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPass" className="text-sm font-medium">Konfirmasi Password Baru</Label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirmPass"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="pl-10 bg-input/30 border-border/30 rounded-xl"
              required
            />
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
          message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : null}
          {message.text}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full glow-button text-white rounded-xl font-semibold h-11"
      >
        {isSubmitting ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
        ) : (
          <><ShieldCheck className="w-4 h-4 mr-2" /> Ganti Password</>
        )}
      </Button>
    </form>
  );
}
