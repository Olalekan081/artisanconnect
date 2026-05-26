'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, X, Mail, Globe } from "lucide-react";

export default function AboutCreator() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Navbar */}
      <nav className="bg-[#1E2937] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
              <div className="w-9 h-9 bg-[#14B8A6] rounded-2xl flex items-center justify-center text-[#0F172A] font-bold text-2xl">A</div>
              <span className="text-2xl font-semibold">ArtisanConnect</span>
            </Link>
          </div>
          <Link href="/" className="flex items-center gap-2 text-[#14B8A6] hover:text-white transition">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-6xl font-bold tracking-tighter">Meet the Creators</h1>
          <p className="mt-4 text-[#14B8A6] text-2xl">The passionate team behind ArtisanConnect</p>
        </motion.div>
      </div>

      {/* Creators Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-12">

          {/* Olalekan Dauda */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1E2937] rounded-3xl overflow-hidden">
            <div className="h-96 flex items-center justify-center bg-[#334155]">
              <img 
                src="https://gkokymkfutussfvekehe.supabase.co/storage/v1/object/public/creators%20images/Olalekan%20Dauda.png" 
                alt="Olalekan Dauda" 
                className="w-80 h-80 object-cover rounded-3xl border-8 border-[#14B8A6] shadow-2xl"
              />
            </div>
            <div className="p-10">
              <h2 className="text-4xl font-semibold">Olalekan Dauda</h2>
              <p className="text-[#14B8A6] text-2xl mt-1">Founder &amp; CEO</p>
              <p className="mt-8 text-[#94A3B8] leading-relaxed text-lg">
                A passionate entrepreneur from Osun State, Nigeria, on a mission to connect everyday Nigerians with trusted local artisans, eliminating brokers, building transparency, and empowering real professionals.
              </p>
              <div className="flex gap-6 mt-10">
                <a href="https://x.com/LamdaCollins" target="_blank" className="flex items-center gap-3 text-[#14B8A6] hover:text-white transition">
                  <X size={26} /> X
                </a>
                <a href="mailto:CEO@lamdaforge.com" className="flex items-center gap-3 text-[#14B8A6] hover:text-white transition">
                  <Mail size={26} /> Email
                </a>
              </div>
            </div>
          </motion.div>

          {/* Lateef Abiodun */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#1E2937] rounded-3xl overflow-hidden">
            <div className="h-96 flex items-center justify-center bg-[#334155]">
              <img 
                src="https://gkokymkfutussfvekehe.supabase.co/storage/v1/object/public/creators%20images/Abiodun%20lateef.jpeg" 
                alt="Lateef Abiodun" 
                className="w-80 h-80 object-cover rounded-3xl border-8 border-[#14B8A6] shadow-2xl"
              />
            </div>
            <div className="p-10">
              <h2 className="text-4xl font-semibold">Lateef Abiodun</h2>
              <p className="text-[#14B8A6] text-2xl mt-1">Customer Care Representative &amp; Sales Specialist</p>
              <p className="mt-8 text-[#94A3B8] leading-relaxed text-lg">
                Helps coaches, entrepreneurs, and startup founders simplify operations, manage deadlines, and keep their teams and tasks on track. So they can focus on growth, not chaos.
              </p>
              <div className="flex gap-6 mt-10">
                <a href="mailto:Salesspecialist@lamdaforge.com" className="flex items-center gap-3 text-[#14B8A6] hover:text-white transition">
                  <Mail size={26} /> Email
                </a>
              </div>
            </div>
          </motion.div>

          {/* Olawale Abeeb */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#1E2937] rounded-3xl overflow-hidden">
            <div className="h-96 flex items-center justify-center bg-[#334155]">
              <img 
                src="https://gkokymkfutussfvekehe.supabase.co/storage/v1/object/public/creators%20images/Olawale%20Abeeb.jpeg" 
                alt="Olawale Abeeb" 
                className="w-80 h-80 object-cover rounded-3xl border-8 border-[#14B8A6] shadow-2xl"
              />
            </div>
            <div className="p-10">
              <h2 className="text-4xl font-semibold">Olawale Abeeb</h2>
              <p className="text-[#14B8A6] text-2xl mt-1">Artisan Specialist</p>
              <p className="mt-8 text-[#94A3B8] leading-relaxed text-lg">
                Envision a world where handcraft excellence becomes the standard for quality, authenticity, and meaningful design.
              </p>
              <div className="flex gap-6 mt-10">
                <a href="mailto:ArtisanSpecialist@lamdaforge.com" className="flex items-center gap-3 text-[#14B8A6] hover:text-white transition">
                  <Mail size={26} /> Email
                </a>
              </div>
            </div>
          </motion.div>

          {/* Ayomide Rasaq */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#1E2937] rounded-3xl overflow-hidden">
            <div className="h-96 flex items-center justify-center bg-[#334155]">
              <img 
                src="https://gkokymkfutussfvekehe.supabase.co/storage/v1/object/public/creators%20images/Ayomide%20Rasaq.jpeg" 
                alt="Ayomide Rasaq" 
                className="w-80 h-80 object-cover rounded-3xl border-8 border-[#14B8A6] shadow-2xl"
              />
            </div>
            <div className="p-10">
              <h2 className="text-4xl font-semibold">Ayomide Rasaq</h2>
              <p className="text-[#14B8A6] text-2xl mt-1">Customer Account and Review Specialist</p>
              <p className="mt-8 text-[#94A3B8] leading-relaxed text-lg">
                Skilled artisans struggle to get steady jobs and customers struggle to find trusted help. We close that gap and make sure all our registered artisans are certified.
              </p>
              <div className="flex gap-6 mt-10">
                <a href="mailto:Accountsspecialist@lamdaforge.com" className="flex items-center gap-3 text-[#14B8A6] hover:text-white transition">
                  <Mail size={26} /> Email
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0F172A] border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-[#94A3B8]">
          © 2026 ArtisanConnect by Lamdaforge Group • Built with passion in Osun State, Nigeria
        </div>
      </footer>
    </div>
  );
}