'use client';

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Upload, Camera } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { useRouter } from "next/navigation";

export default function ArtisanRegister() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    specialty: "",
    bio: "",
    verification_type: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [verificationDoc, setVerificationDoc] = useState<File | null>(null);
  const [verificationPreview, setVerificationPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Full list of trades with icons (same as homepage)
  const allTrades = [
    { name: "Plumber", icon: "🔧" },
    { name: "Electrician", icon: "⚡" },
    { name: "Carpenter", icon: "🪚" },
    { name: "Painter", icon: "🖌️" },
    { name: "Mason", icon: "🧱" },
    { name: "Welder", icon: "🔩" },
    { name: "Tailor", icon: "🧵" },
    { name: "Mechanic", icon: "🚗" },
    { name: "Tiler", icon: "🪣" },
    { name: "POP Artist", icon: "🏗️" },
    { name: "Roofer", icon: "🏠" },
    { name: "Gardener", icon: "🌿" },
    { name: "Cleaner", icon: "🧹" },
    { name: "Towing Service", icon: "🚗" },
    { name: "Load Movers", icon: "📦" },
    { name: "Electronics Technician", icon: "📱" },
    { name: "Catering Service", icon: "🍽️" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVerificationDoc(file);
      setVerificationPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setLoading(false);
      return;
    }

    if (!formData.verification_type || !verificationDoc) {
      setMessage({ type: "error", text: "Please select and upload a verification document (ID Card, NIN Slip or Driver's License)" });
      setLoading(false);
      return;
    }

    try {
      // 1. Create auth user
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { fullName: formData.fullName } }
      });
      if (authError) throw authError;

      // 2. Upload profile photo
      let photoUrl = "https://picsum.photos/id/64/400/400";
      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData } = await supabase.storage
          .from('artisan-images')
          .upload(`profile/${fileName}`, photo, { upsert: true });
        if (uploadData) {
          photoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artisan-images/${uploadData.path}`;
        }
      }

      // 3. Upload verification document
      let verificationUrl = "";
      const verExt = verificationDoc.name.split('.').pop();
      const verName = `${Date.now()}_ver.${verExt}`;
      const { data: verUpload } = await supabase.storage
        .from('artisan-images')
        .upload(`verification/${verName}`, verificationDoc, { upsert: true });
      if (verUpload) {
        verificationUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artisan-images/${verUpload.path}`;
      }

      // 4. Save to artisans table
      const { error: insertError } = await supabase
        .from('artisans')
        .insert({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          specialty: formData.specialty,
          bio: formData.bio,
          photo: photoUrl,
          verification_type: formData.verification_type,
          verification_doc: verificationUrl,
          status: 'pending'
        });

      if (insertError) throw insertError;

      setMessage({ type: "success", text: "✅ Registration successful! Your profile and verification document are now under admin review." });
      
      setTimeout(() => {
        router.push("/artisan/login");
      }, 2500);

    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-[#1E2937] rounded-3xl p-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Join as an Artisan</h1>
          <p className="text-[#94A3B8]">Get verified and start receiving job requests today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm mb-2">Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full bg-[#0F172A] border border-white/20 focus:border-[#14B8A6] rounded-2xl px-5 py-4 outline-none" placeholder="Ahmed Musa" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-2">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-[#0F172A] border border-white/20 focus:border-[#14B8A6] rounded-2xl px-5 py-4 outline-none" placeholder="you@example.com" />
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required className="w-full bg-[#0F172A] border border-white/20 focus:border-[#14B8A6] rounded-2xl px-5 py-4 outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#94A3B8]">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Confirm Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full bg-[#0F172A] border border-white/20 focus:border-[#14B8A6] rounded-2xl px-5 py-4 outline-none" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#94A3B8]">{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
            </div>
          </div>

          {/* Phone & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-[#0F172A] border border-white/20 focus:border-[#14B8A6] rounded-2xl px-5 py-4 outline-none" placeholder="+234 801 234 5678" />
            </div>
            <div>
              <label className="block text-sm mb-2">Location (Osun State)</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full bg-[#0F172A] border border-white/20 focus:border-[#14B8A6] rounded-2xl px-5 py-4 outline-none" placeholder="Osogbo, Ile-Ife, etc." />
            </div>
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-sm mb-2">Specialty / Trade</label>
            <select name="specialty" value={formData.specialty} onChange={handleChange} required className="w-full bg-[#0F172A] border border-white/20 focus:border-[#14B8A6] rounded-2xl px-5 py-4 outline-none">
              <option value="">Select your trade</option>
              {allTrades.map((trade) => (
                <option key={trade.name} value={trade.name}>
                  {trade.icon} {trade.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm mb-2">Bio / Experience</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full bg-[#0F172A] border border-white/20 focus:border-[#14B8A6] rounded-2xl px-5 py-4 outline-none" placeholder="Tell customers about your experience..." />
          </div>

          {/* Profile Photo */}
          <div>
            <label className="block text-sm mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-24 h-24 object-cover rounded-2xl" />
              ) : (
                <div className="w-24 h-24 bg-[#0F172A] border border-dashed border-white/30 rounded-2xl flex items-center justify-center">
                  <Camera className="w-8 h-8 text-[#94A3B8]" />
                </div>
              )}
              <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-6 py-4 rounded-2xl flex items-center gap-2">
                <Upload size={20} />
                <span>Upload Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
          </div>

          {/* Verification Document - NEW */}
          <div>
            <label className="block text-sm mb-2">Verification Document <span className="text-red-400">(Required)</span></label>
            <select name="verification_type" value={formData.verification_type} onChange={handleChange} required className="w-full bg-[#0F172A] border border-white/20 focus:border-[#14B8A6] rounded-2xl px-5 py-4 outline-none mb-4">
              <option value="">Select document type</option>
              <option value="ID Card">ID Card</option>
              <option value="NIN Slip">NIN Slip</option>
              <option value="Driver License">Driver's License</option>
            </select>

            <div className="flex items-center gap-4">
              {verificationPreview ? (
                <img src={verificationPreview} alt="Verification Preview" className="w-24 h-24 object-cover rounded-2xl" />
              ) : (
                <div className="w-24 h-24 bg-[#0F172A] border border-dashed border-white/30 rounded-2xl flex items-center justify-center">
                  <Camera className="w-8 h-8 text-[#94A3B8]" />
                </div>
              )}
              <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-6 py-4 rounded-2xl flex items-center gap-2">
                <Upload size={20} />
                <span>Upload Document</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleVerificationChange} />
              </label>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-center ${message.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
              {message.text}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-[#0F172A] py-5 rounded-3xl font-semibold text-lg transition disabled:opacity-70">
            {loading ? "Registering..." : "Create Artisan Account"}
          </button>

          <p className="text-center text-sm text-[#94A3B8]">
            Already have an account?{" "}
            <Link href="/artisan/login" className="text-[#14B8A6] hover:underline">Login here</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}