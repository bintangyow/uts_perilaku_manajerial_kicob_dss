"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Sparkles, AlertCircle, UserPlus, LogIn } from "lucide-react";

// SVG Component representing Behavioral DSS & Team Composition
function SystemGraphic() {
  return (
    <div className="relative w-full h-40 flex items-center justify-center mb-6 overflow-hidden rounded-2xl bg-primary/5 border border-primary/10">
      <motion.svg
        viewBox="0 0 400 200"
        className="w-full h-full"
        initial="hidden"
        animate="visible"
      >
        <motion.path
          d="M200 100 L120 60 M200 100 L280 60 M200 100 L120 140 M200 100 L280 140"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-primary/30"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: { duration: 1.5, ease: "easeInOut" },
            },
          }}
        />
        <motion.circle
          cx="200"
          cy="100"
          r="60"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="text-primary/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "200px 100px" }}
        />
        {[
          { cx: 120, cy: 60, delay: 0.2 },
          { cx: 280, cy: 60, delay: 0.4 },
          { cx: 120, cy: 140, delay: 0.6 },
          { cx: 280, cy: 140, delay: 0.8 },
        ].map((node, i) => (
          <motion.g
            key={i}
            variants={{
              hidden: { scale: 0, opacity: 0 },
              visible: {
                scale: 1,
                opacity: 1,
                transition: { delay: node.delay, type: "spring" },
              },
            }}
          >
            <circle
              cx={node.cx}
              cy={node.cy}
              r="16"
              className="fill-popover stroke-border"
              strokeWidth="2"
            />
            <circle cx={node.cx} cy={node.cy} r="6" className="fill-primary" />
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r="16"
              className="stroke-primary fill-none"
              strokeWidth="1"
              animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: node.delay }}
            />
          </motion.g>
        ))}
        <motion.g
          variants={{
            hidden: { scale: 0 },
            visible: {
              scale: 1,
              transition: { delay: 1, type: "spring", stiffness: 200 },
            },
          }}
        >
          <circle cx="200" cy="100" r="28" className="fill-primary" />
          <circle cx="200" cy="100" r="14" className="fill-background" />
          <motion.circle
            cx="200"
            cy="100"
            r="36"
            className="stroke-primary/50 fill-none"
            strokeWidth="2"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>
      </motion.svg>
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
    </div>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "login") {
        const result = await login(email, password);
        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }
      } else {
        if (!name.trim()) {
          setError("Nama harus diisi");
          setIsLoading(false);
          return;
        }
        const result = await register(name, email, password);
        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }
      }
      router.push("/");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="bg-orb w-96 h-96 -top-20 -left-20 bg-[oklch(0.4_0.15_260)]" />
      <div
        className="bg-orb w-80 h-80 bottom-10 right-10 bg-[oklch(0.35_0.18_280)]"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="bg-orb w-64 h-64 top-1/2 left-1/2 bg-[oklch(0.3_0.12_240)]"
        style={{ animationDelay: "5s" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card rounded-3xl p-8 md:p-10 border border-border/40 shadow-2xl">
          <SystemGraphic />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gradient mb-2">KiCob</h1>
            <p className="text-muted-foreground text-sm">
              Behavioral DSS for Strategic Team Composition
            </p>
          </div>

          {/* Toggle login/register */}
          <div className="flex rounded-xl bg-muted/20 p-1 mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "login"
                  ? "bg-primary text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-1.5" />
              Masuk
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "register"
                  ? "bg-primary text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-1.5" />
              Daftar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {mode === "register" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-foreground/80 pl-1">
                  Nama Lengkap
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama..."
                  className="h-12 bg-input/50 border-border/50 rounded-xl"
                  required
                />
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@kicob.id"
                  className="pl-10 h-12 bg-input/50 border-border/50 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 pl-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-input/50 border-border/50 rounded-xl"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full h-12 mt-2 rounded-xl glow-button text-white font-semibold text-base disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  {mode === "login" ? "Memverifikasi..." : "Mendaftarkan..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {mode === "login" ? "Masuk ke Sistem" : "Buat Akun"}
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground/50 mt-6">
            {mode === "login"
              ? "Belum punya akun? Klik Daftar di atas."
              : "Sudah punya akun? Klik Masuk di atas."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
