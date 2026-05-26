'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from '@/lib/supabase';

export default function Login() {
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

const { data, error: authError } = await supabase.auth.signInWithPassword({
email,
password,
});

if (authError) {
setError(authError.message);
} else if (data.user) {
localStorage.setItem("userEmail", email);
localStorage.setItem("isLoggedIn", "true");
localStorage.setItem("userRole", "customer");
localStorage.setItem("lastActive", Date.now().toString());
router.push("/dashboard");
}
setLoading(false);
};

return (
<div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
<div className="max-w-md w-full">
<div className="bg-[#1E2937] rounded-3xl p-10">
<div className="text-center mb-8">
<h1 className="text-4xl font-bold text-white">Welcome Back</h1>
<p className="text-[#94A3B8] mt-2">Sign in to find trusted artisans</p>
</div>

<form onSubmit={handleLogin} className="space-y-6">
<div>
<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full bg-[#0F172A] border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-[#14B8A6] outline-none" required />
</div>

<div className="relative">
<input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-[#0F172A] border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-[#14B8A6] outline-none" required />
<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-xl">
{showPassword ? "🙈" : "👁️"}
</button>
</div>

{error && <p className="text-red-500 text-center">{error}</p>}

<button type="submit" disabled={loading} className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-black font-semibold py-4 rounded-2xl text-lg disabled:opacity-70">
{loading ? "Signing in..." : "Sign In"}
</button>
</form>

<div className="text-center mt-8 text-sm">
<p className="text-[#94A3B8]">Don't have an account? <Link href="/register" className="text-[#14B8A6] hover:underline">Create one</Link></p>
<Link href="/" className="text-[#94A3B8] hover:text-white mt-4 block">← Back to Homepage</Link>
</div>
</div>
</div>
</div>
);
}