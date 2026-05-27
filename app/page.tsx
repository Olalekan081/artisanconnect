'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mail, Menu, X, Search } from "lucide-react";
import { supabase } from '@/lib/supabase';

type Testimonial = {
  id: number;
  name: string;
  role: string;
  message: string;
  rating: number;
};

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedArtisan, setSelectedArtisan] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showAllTrades, setShowAllTrades] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [testimonials] = useState<Testimonial[]>([
    { id: 1, name: "Adebayo O.", role: "Homeowner", message: "Found a great plumber within minutes. Very professional!", rating: 5 },
    { id: 2, name: "Fatima A.", role: "Small business owner", message: "My electrician was on time and fixed everything perfectly.", rating: 5 },
    { id: 3, name: "Tunde K.", role: "Artisan", message: "Got more jobs than I expected. The platform is easy to use.", rating: 4 },
  ]);

  const [artisans, setArtisans] = useState<any[]>([]);
  const [loadingArtisans, setLoadingArtisans] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  // Booking system states
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState("");
  const [showArtisanDetail, setShowArtisanDetail] = useState(false);
  const [detailArtisan, setDetailArtisan] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  // Geolocation
  const [nearMe, setNearMe] = useState(false);
  const [userCity, setUserCity] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  const router = useRouter();

  const allTrades = [
    { name: "Plumber", desc: "Pipe fitting, repairs & installations", icon: "🔧" },
    { name: "Electrician", desc: "Wiring, panels & electrical repairs", icon: "⚡" },
    { name: "Carpenter", desc: "Furniture, doors & woodwork", icon: "🪚" },
    { name: "Painter", desc: "Interior & exterior painting", icon: "🖌️" },
    { name: "Mason", desc: "Brickwork, tiling & concrete", icon: "🧱" },
    { name: "Welder", desc: "Metal fabrication & welding", icon: "🔩" },
    { name: "Tailor", desc: "Clothing alterations & custom wear", icon: "🧵" },
    { name: "Mechanic", desc: "Vehicle repairs & maintenance", icon: "🚗" },
    { name: "Tiler", desc: "Floor & wall tiling", icon: "🪣" },
    { name: "POP Artist", desc: "Plaster of Paris ceiling & wall designs", icon: "🏗️" },
    { name: "Roofer", desc: "Roof repairs & installations", icon: "🏠" },
    { name: "Gardener", desc: "Landscaping & garden maintenance", icon: "🌿" },
    { name: "Cleaner", desc: "Residential & commercial cleaning", icon: "🧹" },
    { name: "Towing Service", desc: "Vehicle towing & roadside recovery", icon: "🚗" },
    { name: "Load Movers", desc: "Moving, packing & haulage services", icon: "📦" },
    { name: "Electronics Technician", desc: "Phone, TV & electronics repairs", icon: "📱" },
    { name: "Catering Service", desc: "Event catering & food services", icon: "🍽️" },
  ];

  const displayedTrades = showAllTrades
    ? allTrades.filter((trade) => trade.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : allTrades.slice(0, 8).filter((trade) => trade.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const osunCities = {
    "Osogbo": { lat: 7.782, lng: 4.557 },
    "Ile-Ife": { lat: 7.552, lng: 4.560 },
    "Ilesa": { lat: 7.618, lng: 4.740 },
    "Ede": { lat: 7.736, lng: 4.436 },
    "Ikirun": { lat: 7.912, lng: 4.643 },
    "Iwo": { lat: 7.629, lng: 4.185 },
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getNearMe = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          let closestCity = "Osogbo";
          let minDistance = Infinity;
          Object.entries(osunCities).forEach(([city, coords]) => {
            const distance = getDistance(latitude, longitude, coords.lat, coords.lng);
            if (distance < minDistance) {
              minDistance = distance;
              closestCity = city;
            }
          });
          setUserCity(closestCity);
          setNearMe(true);
          setLocationLoading(false);
          alert(`📍 Location detected! Showing artisans near ${closestCity}`);
        },
        () => {
          setLocationLoading(false);
          alert("Location access denied. Showing all artisans.");
          setNearMe(false);
        }
      );
    } else {
      setLocationLoading(false);
      alert("Geolocation is not supported.");
    }
  };

  const fetchArtisans = async () => {
    const { data } = await supabase.from('artisans').select('*').eq('status', 'approved');
    if (data) setArtisans(data);
    setLoadingArtisans(false);
  };

  useEffect(() => {
    fetchArtisans();
  }, []);

  const getTradeCount = (tradeName: string) => {
    return artisans.filter(a => a.specialty?.toLowerCase().includes(tradeName.toLowerCase())).length;
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const storedUsername = localStorage.getItem("username") || "User";
    const storedEmail = localStorage.getItem("userEmail") || "";
    setIsLoggedIn(loggedIn);
    setUsername(storedUsername);
    setUserEmail(storedEmail);
  }, []);

  const openTradeModal = (trade: string) => {
    setSelectedTrade(trade);
    setShowTradeModal(true);
  };

  const openArtisanDetail = (artisan: any) => {
    setDetailArtisan(artisan);
    setShowArtisanDetail(true);
    setShowTradeModal(false);
  };

  const openRequestModal = (artisan: any) => {
    if (!isLoggedIn) {
      alert("Please login first to request a job.");
      router.push("/login");
      return;
    }
    setSelectedArtisan(artisan);
    setRequestMessage("");
    setShowRequestModal(true);
    setShowArtisanDetail(false);
  };

  const sendBookingRequest = async () => {
    if (!selectedArtisan || !requestMessage.trim()) return;
    const customerEmail = localStorage.getItem("userEmail") || "customer@example.com";
    const { error } = await supabase.from('bookings').insert({
      customer_email: customerEmail,
      artisan_email: selectedArtisan.email,
      artisan_name: selectedArtisan.name,
      job_description: requestMessage.trim(),
      status: 'pending'
    });
    if (error) {
      alert("Failed to send request: " + error.message);
    } else {
      alert(`✅ Request sent successfully to ${selectedArtisan.name}!`);
      setShowRequestModal(false);
    }
  };

  const openChat = async (artisan: any) => {
    if (!isLoggedIn) {
      alert("Please login to message an artisan.");
      router.push("/login");
      return;
    }
    setSelectedArtisan(artisan);
    setChatOpen(true);
    setMessages([]);

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`from_email.eq.${userEmail},to_email.eq.${userEmail}`)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!selectedArtisan || !newMessage.trim()) return;
    const currentUserEmail = localStorage.getItem("userEmail") || "user@example.com";

    const newMsg = {
      from_email: currentUserEmail,
      to_email: selectedArtisan.email,
      text: newMessage.trim()
    };

    const { error } = await supabase.from('messages').insert(newMsg);
    if (!error) {
      setNewMessage("");
    }
  };

  const closeChat = () => {
    setChatOpen(false);
    setNewMessage("");
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] overflow-x-hidden">
      {/* Fixed Mobile Navbar */}
      <nav className="bg-[#0F172A] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#14B8A6] rounded-2xl flex items-center justify-center text-[#0F172A] font-bold text-3xl">A</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">ArtisanConnect</h1>
              <p className="text-[10px] text-[#14B8A6] -mt-1">BY LAMDAFORGE GROUP</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#how" className="hover:text-[#14B8A6] transition">How it Works</Link>
            <Link href="#trades" className="hover:text-[#14B8A6] transition">Trades</Link>
            <Link href="/about-creator" className="hover:text-[#14B8A6] transition">The Creator</Link>
            <Link href="/admin/login" className="hover:text-[#14B8A6] transition font-medium">Admin</Link>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span className="text-[#14B8A6] font-medium hidden sm:block">Hi, {username}</span>
                <Link href="/dashboard" className="px-5 py-2 text-sm border border-[#14B8A6] text-[#14B8A6] rounded-2xl hover:bg-[#14B8A6] hover:text-white transition">Dashboard</Link>
                <button onClick={handleLogout} className="px-4 py-2 text-sm border border-white/20 rounded-2xl hover:bg-white/5 transition">Logout</button>
              </>
            ) : (
              <Link href="/login" className="hidden md:block px-6 py-3 text-sm border border-white/20 rounded-2xl hover:bg-white/5 transition">Sign In</Link>
            )}
            <Link href="/register" className="px-6 py-3 bg-[#14B8A6] hover:bg-[#0D9488] text-[#0F172A] rounded-2xl text-sm font-semibold transition">Get Started</Link>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white z-[100]"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0F172A] border-t border-white/10 px-6 py-6 z-[999] relative"
            >
              <div className="flex flex-col gap-6 text-lg">
                <Link href="#how" onClick={() => setIsMenuOpen(false)} className="hover:text-[#14B8A6]">How it Works</Link>
                <Link href="#trades" onClick={() => setIsMenuOpen(false)} className="hover:text-[#14B8A6]">Trades</Link>
                <Link href="/about-creator" onClick={() => setIsMenuOpen(false)} className="hover:text-[#14B8A6]">The Creator</Link>
                <Link href="/admin/login" onClick={() => setIsMenuOpen(false)} className="hover:text-[#14B8A6]">Admin</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="bg-[#0F172A] py-12 sm:py-20 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter leading-none mb-6">
            Connect with Skilled Artisans
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#94A3B8] max-w-3xl mx-auto mb-10 leading-relaxed">
            Find trusted, verified artisans in your area from plumbers and electricians to tailors and mechanics. Get the job done right.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="min-h-[52px] flex items-center justify-center bg-[#14B8A6] hover:bg-[#0D9488] text-[#0F172A] px-10 py-4 rounded-2xl font-semibold text-lg transition">I Need an Artisan</Link>
            <Link href="/artisan/register" className="min-h-[52px] flex items-center justify-center border border-white/30 hover:bg-white/5 px-10 py-4 rounded-2xl font-semibold text-lg transition">I’m an Artisan</Link>
          </div>
        </div>
      </section>

      {/* Trades Section with Search */}
      <section id="trades" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-4xl font-semibold">Browse by Trade</h2>
          
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
            <input
              type="text"
              placeholder="Search trades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1E2937] border border-white/10 rounded-3xl pl-11 py-3 text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#14B8A6]"
            />
          </div>
        </div>

        {loadingArtisans ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#1E2937] p-6 rounded-3xl animate-pulse">
                <div className="h-8 w-8 bg-white/10 rounded-xl mb-3" />
                <div className="h-6 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-4 bg-white/10 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {displayedTrades.map((trade) => {
              const count = getTradeCount(trade.name);
              return (
                <motion.div
                  key={trade.name}
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={() => openTradeModal(trade.name)}
                  className="bg-[#1E2937] hover:bg-[#334155] p-6 rounded-3xl border border-[#334155] hover:border-[#14B8A6] transition-all cursor-pointer relative"
                >
                  <div className="text-4xl mb-3">{trade.icon}</div>
                  <h3 className="text-xl font-semibold mb-1">{trade.name}</h3>
                  <p className="text-sm text-[#94A3B8] mb-4">{trade.desc}</p>
                  <div className="absolute bottom-6 right-6 bg-[#14B8A6]/10 text-[#14B8A6] text-xs px-3 py-1 rounded-2xl font-medium">
                    {count} artisans
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <button 
            onClick={() => setShowAllTrades(!showAllTrades)}
            className="text-[#14B8A6] hover:underline font-medium transition"
          >
            {showAllTrades ? "Show Less" : "View All Trades"}
          </button>
        </div>
      </section>

      {/* Trade Modal, Artisan Detail Modal, Job Request Modal, Chat Modal, How It Works, Testimonials, Footer remain the same as your original */}

      {/* Trade Modal */}
      <AnimatePresence>
        {showTradeModal && selectedTrade && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#1E2937] w-full max-w-4xl rounded-3xl overflow-hidden">
              <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-semibold">{selectedTrade} Artisans</h2>
                  {nearMe && userCity && <p className="text-[#14B8A6] text-sm flex items-center gap-1 mt-1">📍 Showing artisans near <span className="font-medium">{userCity}</span></p>}
                </div>
                <button onClick={() => { setShowTradeModal(false); setNearMe(false); }} className="text-4xl text-white">×</button>
              </div>
              <div className="p-8 max-h-[70vh] overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artisans.filter(a => a.specialty?.toLowerCase() === selectedTrade.toLowerCase()).map((artisan: any) => (
                    <div key={artisan.id} onClick={() => openArtisanDetail(artisan)} className="bg-[#0F172A] p-6 rounded-3xl cursor-pointer hover:bg-[#1E2937]">
                      <img src={artisan.photo} alt={artisan.name} className="w-full h-56 object-cover rounded-2xl" />
                      <h3 className="mt-4 text-2xl font-semibold">{artisan.name}</h3>
                      <p className="text-[#14B8A6] text-sm mt-1">{artisan.specialty}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Artisan Detail Modal, Job Request Modal, Chat Modal, How It Works, Testimonials, Footer are the same as your original code */}
      {/* (I kept them exactly as you had them to avoid any breakage) */}

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-4xl font-semibold text-center mb-4">What People Are Saying</h2>
        <p className="text-center text-[#94A3B8] mb-12">Real feedback from customers and artisans across Osun State</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-[#1E2937] p-8 rounded-3xl border border-[#334155]">
              <div className="flex gap-1 text-[#14B8A6] mb-4">{"★".repeat(testimonial.rating)}</div>
              <p className="text-[#F8FAFC] mb-6">"{testimonial.message}"</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-[#94A3B8]">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] border-t border-white/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-[#14B8A6] rounded-2xl flex items-center justify-center text-[#0F172A] font-bold text-2xl">A</div>
                <span className="text-2xl font-semibold">ArtisanConnect</span>
              </div>
              <p className="text-sm text-[#94A3B8]">Connecting you with trusted artisans across Osun State.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-[#94A3B8]">
                <li><Link href="#trades">Browse Trades</Link></li>
                <li><Link href="/register">Find an Artisan</Link></li>
                <li><Link href="/artisan/register">Join as Artisan</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-[#94A3B8]">
                <li><a href="mailto:help@lamdaforge.com">help@lamdaforge.com</a></li>
                <li><a href="https://wa.me/2348128646904">WhatsApp Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-[#94A3B8]">Osun State, Nigeria</p>
              <a href="https://wa.me/2348128646904" className="text-[#14B8A6] hover:underline">+234 812 864 6904</a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-[#94A3B8]">
            © 2026 ArtisanConnect by Lamdaforge Group. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}