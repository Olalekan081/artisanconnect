'use client';

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ArtisanLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Login with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // 2. Check if email is confirmed
      if (!data.user?.email_confirmed_at) {
        setError("Please check your email and click the verification link first.");
        return;
      }

      // 3. Check if admin has approved the artisan
      const { data: artisan } = await supabase
        .from('artisans')
        .select('status, name')
        .eq('email', email)
        .single();

      if (!artisan || artisan.status !== 'approved') {
        setError("Your profile is still under review by the admin.");
        return;
      }

      // 4. Success - save session and go to dashboard
      localStorage.setItem("artisanLoggedIn", "true");
      localStorage.setItem("artisanEmail", email);
      localStorage.setItem("artisanName", artisan.name);

      router.push("/artisan/dashboard");

    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#1E2937] rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="bg-[#14B8A6] px-8 py-6 flex items-center gap-4">
          <Link href="/" className="text-[#0F172A] hover:scale-110 transition">
            <ArrowLeft size={28} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Artisan Login</h1>
            <p className="text-[#0F172A]/80 text-sm">Access your dashboard</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-8">
          <div>
            <label className="block text-sm mb-2 font-medium">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#334155] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#14B8A6]"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#334155] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#14B8A6]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-400 p-4 rounded-2xl text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-[#0F172A] py-5 rounded-3xl font-semibold text-lg transition disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login to Dashboard"}
          </button>

          <div className="text-center text-sm text-[#94A3B8]">
            Don't have an account?{" "}
            <Link href="/artisan/register" className="text-[#14B8A6] hover:underline">
              Register here
            </Link>
          </div>

          <div className="text-center">
            <Link href="/" className="text-[#94A3B8] hover:text-white text-sm">
              ← Back to Homepage
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}