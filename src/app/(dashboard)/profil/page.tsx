"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordForm } from "@/components/settings/password-form";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export default function ProfilPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!currentUser) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Link href="/">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold">Pengaturan Akun</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Personal Settings</p>
        </div>
      </motion.div>

      <div className="flex flex-col gap-6">
        {/* User Card - Compact Top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-4 flex items-center gap-4 shadow-xl border border-primary/10"
        >
          <Avatar className="w-16 h-16 border-2 border-primary/20 bg-background">
            <AvatarImage src={currentUser.image || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              {currentUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base truncate">{currentUser.name}</h2>
              <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold uppercase tracking-wider">
                {currentUser.role}
              </div>
            </div>
            <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
          </div>
        </motion.div>

        {/* Forms with Animated Height */}
        <div className="w-full">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-input/20 border border-border/30 rounded-2xl p-1 h-10 shadow-inner">
              <TabsTrigger value="profile" className="rounded-xl text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                <User className="w-3.5 h-3.5 mr-2" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-xl text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                <Shield className="w-3.5 h-3.5 mr-2" />
                Keamanan
              </TabsTrigger>
            </TabsList>

            <motion.div 
              layout 
              className="mt-4 glass-card rounded-2xl overflow-hidden shadow-2xl border border-primary/10"
              transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            >
              <div className="p-5">
                <AnimatePresence mode="wait">
                  {activeTab === "profile" ? (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-primary/80">Info Profil</h3>
                      </div>
                      <ProfileForm />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="security"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-primary/80">Keamanan Akun</h3>
                      </div>
                      <PasswordForm />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
