'use client';

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CustomerRegister() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { fullName: formData.fullName } }
      });

      if (authError) throw authError;

      // Save customer profile
      const { error: insertError } = await supabase.from('users').insert({
        user_id: authData.user?.id,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
      });

      if (insertError) throw insertError;

      setMessage({
        type: "success",
        text: "✅ Registration successful!\n\nPlease check your email for the verification link."
      });

      // Reset form
      setFormData({ fullName: "", email: "", password: "", confirmPassword: "", phone: "", location: "" });

    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Registration failed" });
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
          <Link href="/" className="text-[#0F172A]">
            <ArrowLeft size={28} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Join as Customer</h1>
            <p className="text-[#0F172A]/80 text-sm">Find skilled artisans near you</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm mb-2">Full Name</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full bg-[#334155] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#14B8A6]"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full bg-[#334155] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#14B8A6]"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Phone Number</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full bg-[#334155] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#14B8A6]"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">City / Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g. Osogbo"
              required
              className="w-full bg-[#334155] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#14B8A6]"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full bg-[#334155] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#14B8A6]"
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

          <div>
            <label className="block text-sm mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full bg-[#334155] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#14B8A6]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-center font-medium ${message.type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-[#0F172A] py-5 rounded-3xl font-semibold text-lg transition disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Register as Customer"}
          </button>

          <p className="text-center text-sm text-[#94A3B8]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#14B8A6] hover:underline">Login here</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}