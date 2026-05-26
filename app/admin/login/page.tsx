'use client';

import { useState } from "react";
import Link from "next/link";

const admins = {
  "olalekan1": { password: "Collins@081", role: "ceo", name: "CEO Olalekan" },
  "abiodun1": { password: "Hyberbole1@", role: "customer_care", name: "Customer Care" },
  "abeeb1": { password: "Daredevil1@", role: "artisan_specialist", name: "Artisan Specialist" },
  "ayomide1": { password: "Peacebeuntoyou1@", role: "account_specialist", name: "Account Specialist" },
};

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const lowerUsername = username.toLowerCase().trim();
    const admin = admins[lowerUsername as keyof typeof admins];

    if (admin && admin.password === password) {
      localStorage.setItem("adminUsername", lowerUsername);
      localStorage.setItem("adminRole", admin.role);
      localStorage.setItem("adminName", admin.name);
      window.location.href = "/admin/dashboard";
    } else {
      setError("Invalid username or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#1E2937] rounded-3xl p-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Login</h1>
          <p className="text-[#14B8A6] mt-2">ArtisanConnect Control Panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm text-white/70 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0F172A] border border-white/20 focus:border-[#14B8A6] rounded-2xl px-5 py-4 text-white outline-none"
              placeholder="abiodun1"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F172A] border border-white/20 focus:border-[#14B8A6] rounded-2xl px-5 py-4 text-white outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 text-[#94A3B8]"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-[#0F172A] py-4 rounded-2xl font-semibold text-lg transition disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login to Dashboard"}
          </button>
        </form>

        <div className="text-center mt-8">
          <Link href="/" className="text-white/50 hover:text-white text-sm">← Back to Homepage</Link>
        </div>
      </div>
    </div>
  );
}