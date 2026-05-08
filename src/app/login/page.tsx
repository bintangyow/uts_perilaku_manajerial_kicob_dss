"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Sparkles, AlertCircle, UserPlus, LogIn, Users, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const isLogout = window.location.search.includes("logout=1");
    if (!authLoading && isAuthenticated && !isLogout) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router, mounted]);

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
    <div className="min-h-screen w-full flex overflow-x-hidden bg-background">
      {/* Background Animations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="bg-orb w-[600px] h-[600px] -top-40 -left-40 bg-primary/20 opacity-20 animate-pulse" />
        <div className="bg-orb w-[500px] h-[500px] bottom-10 right-10 bg-primary/10 opacity-10" style={{ animationDelay: "3s" }} />
        
        {/* Animated Particles */}
        {mounted && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5
            }}
            animate={{ 
              y: [null, "-20%", "20%"],
              x: [null, "-10%", "10%"],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 5 + Math.random() * 10, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        ))}

        {/* Floating Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Left Section: Illustration & Branding (Visible on LG+) */}
      <motion.div 
        layout
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ 
          layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 0.8 },
          x: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }}
        className="hidden lg:flex lg:w-1/2 sticky top-0 h-screen relative flex-col justify-center items-center p-12 overflow-hidden border-r border-white/5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background z-0" />
        
        <motion.div layout="position" className="relative z-10 w-full max-w-[420px] text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-10 relative w-full max-w-[320px] aspect-square"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-full h-auto"
            >
              <Image 
                src="/images/login-illustration.png" 
                alt="Collaboration Illustration" 
                width={320} 
                height={320}
                className="drop-shadow-2xl"
                priority
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-4 tracking-tight">
              <span className="text-gradient glow-text">KiCob</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium mb-8">
              Behavioral DSS for Strategic Team Composition
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {[
                { icon: <CheckCircle2 className="w-4 h-4 text-primary" />, text: "Professional Analytics" },
                { icon: <Users className="w-4 h-4 text-primary" />, text: "Team Optimization" },
                { icon: <Sparkles className="w-4 h-4 text-primary" />, text: "AI-Driven Insights" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full glass-card border-white/10">
                  {item.icon}
                  <span className="text-foreground/80">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
        
        {/* Animated Background Decoration */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Right Section: Form */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10"
      >
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-4xl font-bold text-gradient glow-text mb-2">KiCob</h1>
            <p className="text-muted-foreground text-sm">Behavioral DSS & Team Composition</p>
          </div>

          <motion.div
            layout
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.3 }
            }}
            className="glass-card rounded-3xl p-8 md:p-10 border border-border/40 shadow-2xl relative overflow-hidden"
          >
            {/* Subtle light effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/2" />

            <motion.div layout="position" className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {mode === "login" ? "Selamat Datang Kembali" : "Buat Akun Baru"}
              </h2>
              <p className="text-muted-foreground text-sm h-5">
                {mode === "login" 
                  ? "Silakan masuk ke akun Anda untuk melanjutkan." 
                  : "Daftar sekarang untuk mengoptimalkan tim."}
              </p>
            </motion.div>

            {/* Toggle login/register */}
            <motion.div layout="position" className="flex rounded-xl bg-muted/20 p-1 mb-8">
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                  mode === "login"
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LogIn className="w-4 h-4" />
                Masuk
              </button>
              <button
                onClick={() => { setMode("register"); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                  mode === "register"
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Daftar
              </button>
            </motion.div>

            <motion.form layout onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {mode === "register" && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-foreground/80 pl-1">
                      Nama Lengkap
                    </label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama Anda..."
                      className="h-12 bg-input/40 border-border/40 rounded-xl focus:ring-primary/20"
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 pl-1">
                  Alamat Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh@kicob.id"
                    className="pl-11 h-12 bg-input/40 border-border/40 rounded-xl focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-sm font-medium text-foreground/80">
                    Password
                  </label>
                  {mode === "login" && (
                    <button type="button" className="text-xs text-primary hover:underline font-medium">
                      Lupa password?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-11 h-12 bg-input/40 border-border/40 rounded-xl focus:ring-primary/20"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <motion.div layout="position">
                <Button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full h-12 mt-4 rounded-xl glow-button text-white font-semibold text-base disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span>{mode === "login" ? "Memverifikasi..." : "Mendaftarkan..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>{mode === "login" ? "Masuk ke Sistem" : "Buat Akun Sekarang"}</span>
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>

            <motion.div layout="position" className="mt-8 pt-8 border-t border-border/30 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === "login" ? "Belum memiliki akses?" : "Sudah memiliki akun?"}{" "}
                <button 
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="text-primary font-semibold hover:underline"
                >
                  {mode === "login" ? "Daftar Gratis" : "Masuk Sekarang"}
                </button>
              </p>
            </motion.div>
          </motion.div>
          
          <p className="text-center text-xs text-muted-foreground/40 mt-8">
            &copy; {new Date().getFullYear()} KiCob Platform. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
