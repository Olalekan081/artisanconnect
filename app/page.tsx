'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
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

const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
const [loadingTestimonials, setLoadingTestimonials] = useState(true);

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

const displayedTrades = showAllTrades ? allTrades : allTrades.slice(0, 8);

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

// Real-time Chat
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
<div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
{/* Navbar */}
<nav className="bg-[#0F172A] border-b border-white/10 sticky top-0 z-50">
<div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
<div className="flex items-center gap-4">
<div className="w-11 h-11 bg-[#14B8A6] rounded-2xl flex items-center justify-center text-[#0F172A] font-bold text-3xl">A</div>
<div>
<h1 className="text-3xl font-semibold tracking-tight">ArtisanConnect</h1>
<p className="text-xs text-[#14B8A6] -mt-1">BY LAMDAFORGE GROUP</p>
</div>
</div>

<div className="hidden md:flex items-center gap-10 text-sm font-medium">
<Link href="#how" className="hover:text-[#14B8A6] transition">How it Works</Link>
<Link href="#trades" className="hover:text-[#14B8A6] transition">Trades</Link>
<Link href="/about-creator" className="hover:text-[#14B8A6] transition">The Creator</Link>
<Link href="/admin/login" className="hover:text-[#14B8A6] transition font-medium">Admin</Link>
</div>

<div className="flex items-center gap-4">
{isLoggedIn ? (
<>
<span className="text-[#14B8A6] font-medium">Hi, {username}</span>
<Link href="/dashboard" className="px-5 py-2 text-sm border border-[#14B8A6] text-[#14B8A6] rounded-2xl hover:bg-[#14B8A6] hover:text-white transition">Go to Dashboard</Link>
<button onClick={handleLogout} className="px-5 py-2 text-sm border border-white/20 rounded-2xl hover:bg-white/5 transition">Logout</button>
</>
) : (
<Link href="/login" className="hidden md:block px-6 py-3 text-sm border border-white/20 rounded-2xl hover:bg-white/5 transition">Sign In</Link>
)}
<Link href="/register" className="hidden md:block px-8 py-3 bg-[#14B8A6] hover:bg-[#0D9488] text-[#0F172A] rounded-2xl text-sm font-semibold transition">Get Started</Link>
</div>
</div>
</nav>

{/* Hero */}
<section className="bg-[#0F172A] py-20 border-b border-white/10">
<div className="max-w-5xl mx-auto px-6 text-center">
<h1 className="text-6xl md:text-7xl font-semibold tracking-tighter leading-none mb-4">
Connect with Skilled Artisans
</h1>
<p className="text-xl text-[#94A3B8] max-w-3xl mx-auto mb-10">
Find trusted, verified artisans in your area from plumbers and electricians to tailors and mechanics. Get the job done right.
</p>
<div className="flex flex-col sm:flex-row gap-4 justify-center">
<Link href="/register" className="bg-[#14B8A6] hover:bg-[#0D9488] text-[#0F172A] px-10 py-4 rounded-2xl font-semibold text-lg transition">I Need an Artisan</Link>
<Link href="/artisan/register" className="border border-white/30 hover:bg-white/5 px-10 py-4 rounded-2xl font-semibold text-lg transition">I’m an Artisan</Link>
</div>
</div>
</section>

{/* Trades */}
<section id="trades" className="max-w-7xl mx-auto px-6 py-16">
<div className="flex justify-between items-center mb-8">
<div>
<span className="text-4xl font-semibold">Browse by Trade</span>
</div>
<div className="flex items-center gap-4">
<button onClick={getNearMe} disabled={locationLoading} className="flex items-center gap-2 bg-[#14B8A6] hover:bg-[#0D9488] text-[#0F172A] px-6 py-3 rounded-2xl font-semibold transition disabled:opacity-70">
{locationLoading ? "🔍 Detecting..." : "📍 Near Me"}
</button>
<button onClick={() => setShowAllTrades(!showAllTrades)} className="text-[#14B8A6] hover:underline font-medium transition">
{showAllTrades ? "Show Less" : "View All"}
</button>
</div>
</div>

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
</section>

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

{/* Artisan Detail Modal */}
<AnimatePresence>
{showArtisanDetail && detailArtisan && (
<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000] p-4">
<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#1E2937] w-full max-w-2xl rounded-3xl overflow-hidden">
<div className="p-8">
<img src={detailArtisan.photo} className="w-full h-48 object-cover rounded-2xl shadow-xl" alt={detailArtisan.name} />
<h2 className="text-4xl font-bold mt-6">{detailArtisan.name}</h2>
<p className="text-2xl text-[#14B8A6]">{detailArtisan.specialty}</p>
<p className="mt-6 text-lg leading-relaxed">{detailArtisan.bio}</p>

{isLoggedIn ? (
<div className="mt-8 p-6 bg-[#0F172A] rounded-2xl">
<p className="text-sm text-[#94A3B8] mb-4">Contact Information</p>
<div className="flex flex-col gap-4">
{detailArtisan.email && (
<a href={`mailto:${detailArtisan.email}`} className="flex items-center gap-3 text-[#14B8A6] hover:underline">
<Mail size={22} />
<span>{detailArtisan.email}</span>
</a>
)}
{detailArtisan.phone && (
<a href={`tel:${detailArtisan.phone}`} className="flex items-center gap-3 text-[#14B8A6] hover:underline">
<span className="text-xl">📞</span>
<span>{detailArtisan.phone}</span>
</a>
)}
</div>
</div>
) : (
<div className="mt-8 p-6 bg-[#0F172A] rounded-2xl text-center">
<p className="text-[#94A3B8]">Login to see contact details (email &amp; phone)</p>
</div>
)}
</div>

<div className="p-8 border-t border-white/10 flex gap-4">
<button onClick={() => openChat(detailArtisan)} className="flex-1 border border-white/30 hover:bg-white/10 py-5 rounded-3xl font-semibold text-lg">Send Message</button>
<button onClick={() => openRequestModal(detailArtisan)} className="flex-1 bg-[#14B8A6] hover:bg-[#0D9488] text-black py-5 rounded-3xl font-semibold text-lg">Send Job Request</button>
</div>
<button onClick={() => setShowArtisanDetail(false)} className="absolute top-6 right-6 text-4xl text-white">×</button>
</motion.div>
</div>
)}
</AnimatePresence>

{/* Job Request Modal */}
<AnimatePresence>
{showRequestModal && detailArtisan && (
<motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[11000] p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
<div className="bg-[#1E2937] w-full max-w-lg rounded-3xl overflow-hidden">
<div className="bg-[#334155] px-6 py-4 flex justify-between items-center">
<p className="font-semibold">Request Job from {detailArtisan.name}</p>
<button onClick={() => setShowRequestModal(false)} className="text-3xl">×</button>
</div>
<div className="p-8">
<textarea value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} placeholder="Describe the job you need done..." className="w-full h-40 bg-[#0F172A] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#14B8A6]" />
</div>
<div className="p-4 bg-[#334155] flex gap-3">
<button onClick={() => setShowRequestModal(false)} className="flex-1 py-4 bg-white/10 rounded-2xl font-medium">Cancel</button>
<button onClick={sendBookingRequest} className="flex-1 py-4 bg-[#14B8A6] text-[#0F172A] rounded-2xl font-semibold">Send Request</button>
</div>
</div>
</motion.div>
)}
</AnimatePresence>

{/* Real-time Chat Modal */}
{chatOpen && selectedArtisan && (
<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] p-4">
<div className="bg-[#1E2937] w-full max-w-lg rounded-3xl overflow-hidden">
<div className="bg-[#334155] px-6 py-4 flex justify-between items-center">
<div>
<p className="font-semibold">Chat with {selectedArtisan.name}</p>
<p className="text-xs text-[#14B8A6]">Chatting as {username}</p>
</div>
<button onClick={closeChat} className="text-3xl">×</button>
</div>
<div className="h-80 overflow-y-auto p-6 space-y-4 bg-[#1E2937]">
{messages.length === 0 && <p className="text-center text-[#94A3B8] mt-16">Start the conversation...</p>}
{messages.map((msg, index) => (
<div key={index} className={`flex ${msg.from_email === userEmail ? "justify-end" : "justify-start"}`}>
<div className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.from_email === userEmail ? "bg-[#14B8A6] text-[#0F172A]" : "bg-[#1E2937]"}`}>
{msg.text}
</div>
</div>
))}
</div>
<div className="p-4 bg-[#334155] flex gap-3">
<input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type your message..." className="flex-1 bg-[#1E2937] border border-white/10 px-4 py-3 rounded-2xl focus:outline-none" />
<button onClick={sendMessage} className="bg-[#14B8A6] hover:bg-[#0D9488] text-[#0F172A] px-6 rounded-2xl font-semibold">Send</button>
</div>
</div>
</div>
)}

{/* How It Works */}
<section className="max-w-7xl mx-auto px-6 py-16 bg-[#1E2937] rounded-3xl">
<h2 className="text-4xl font-semibold text-center mb-12">How It Works</h2>
<div className="grid md:grid-cols-3 gap-8">
<div className="text-center px-4">
<div className="text-[#14B8A6] text-5xl mb-4">01</div>
<h3 className="text-xl font-semibold mb-2">Choose a Trade</h3>
<p className="text-[#94A3B8]">Browse categories and select the skill you need.</p>
</div>
<div className="text-center px-4">
<div className="text-[#14B8A6] text-5xl mb-4">02</div>
<h3 className="text-xl font-semibold mb-2">Find Local Artisans</h3>
<p className="text-[#94A3B8]">View verified professionals near you.</p>
</div>
<div className="text-center px-4">
<div className="text-[#14B8A6] text-5xl mb-4">03</div>
<h3 className="text-xl font-semibold mb-2">Chat & Hire</h3>
<p className="text-[#94A3B8]">Message directly and get the job done.</p>
</div>
</div>
</section>

{/* Testimonials */}
<section className="max-w-7xl mx-auto px-6 py-16">
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
<div className="max-w-7xl mx-auto px-6">
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