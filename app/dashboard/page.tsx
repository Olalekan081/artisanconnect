'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Home, Calendar, Heart, MessageCircle, Bell, Plus, CheckCircle, Clock, XCircle, Send, Menu, X } from "lucide-react";
import Link from "next/link";
import { supabase } from '@/lib/supabase';
import { useInactivityTimeout } from "@/components/hooks/useInactivityTimeout";

export default function CustomerDashboard() {
const [userName, setUserName] = useState("Customer");
const [userEmail, setUserEmail] = useState("");
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState("dashboard");
const [supportOpen, setSupportOpen] = useState(false);
const [supportMessages, setSupportMessages] = useState<any[]>([]);
const [supportInput, setSupportInput] = useState("");
const [bookings, setBookings] = useState<any[]>([]);
const [favorites, setFavorites] = useState<any[]>([]);
const [messages, setMessages] = useState<any[]>([]);
const [showRequestModal, setShowRequestModal] = useState(false);
const [requestArtisan, setRequestArtisan] = useState("");
const [requestMessage, setRequestMessage] = useState("");
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const router = useRouter();

// 5 Minute Inactivity Timeout
useInactivityTimeout(300000); // 5 minutes

const fetchAllData = async () => {
if (!userEmail) return;

const { data: bookingData } = await supabase
.from('bookings')
.select('*')
.eq('customer_email', userEmail)
.order('created_at', { ascending: false });
setBookings(bookingData || []);

setFavorites([
{ id: 1, artisan_name: "Ahmed Musa", specialty: "Master Carpenter", photo: "https://picsum.photos/id/1015/300/300" },
{ id: 2, artisan_name: "Fatima Bello", specialty: "Professional Painter", photo: "https://picsum.photos/id/64/300/300" }
]);

setMessages([
{ id: 1, from_artisan: "Ahmed Musa", time: "10:45 AM", text: "Your bookshelf is ready", unread: true },
{ id: 2, from_artisan: "Fatima Bello", time: "Yesterday", text: "Painting completed", unread: false }
]);
};

useEffect(() => {
const timer = setTimeout(async () => {
const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
const storedName = localStorage.getItem("username") || "Customer";
const storedEmail = localStorage.getItem("userEmail") || "";

if (!isLoggedIn) {
router.push("/login");
} else {
setUserName(storedName);
setUserEmail(storedEmail);
setLoading(false);
await fetchAllData();
}
}, 800);
return () => clearTimeout(timer);
}, [router]);

useEffect(() => {
if (userEmail && (activeTab === "bookings" || activeTab === "favorites" || activeTab === "messages")) {
fetchAllData();
}
}, [activeTab, userEmail]);

const handleLogout = async () => {
await supabase.auth.signOut();
localStorage.clear();
router.push("/login");
};

const sendSupportMessage = () => {
if (!supportInput.trim()) return;
setSupportMessages(prev => [...prev, { id: Date.now(), from: "You", text: supportInput, time: "just now" }]);
setSupportInput("");
setTimeout(() => {
setSupportMessages(prev => [...prev, { id: Date.now(), from: "Support", text: "Thank you! Our team will reply shortly.", time: "just now" }]);
}, 1000);
};

const handleRequestBooking = async () => {
if (!requestArtisan || !requestMessage || !userEmail) {
alert("Please fill all fields");
return;
}

const { error } = await supabase
.from('bookings')
.insert({
customer_email: userEmail,
artisan_name: requestArtisan,
message: requestMessage,
status: 'pending'
});

if (error) alert("Failed to send request");
else {
alert("✅ Booking request sent successfully!");
setShowRequestModal(false);
setRequestArtisan("");
setRequestMessage("");
fetchAllData();
}
};

if (loading) {
return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white text-xl">Loading dashboard...</div>;
}

return (
<div className="min-h-screen bg-[#0F172A] text-white flex flex-col">
{/* Mobile Header */}
<div className="md:hidden bg-[#1E2937] px-6 py-4 flex items-center justify-between border-b border-white/10">
<div className="flex items-center gap-3">
<div className="w-8 h-8 bg-[#14B8A6] rounded-2xl flex items-center justify-center text-xl">🔨</div>
<span className="font-bold text-xl">ArtisanConnect</span>
</div>
<button onClick={() => setMobileMenuOpen(true)} className="text-white">
<Menu size={28} />
</button>
</div>

<div className="flex flex-1">
{/* Sidebar */}
<div className={`w-64 bg-[#1E2937] p-6 flex flex-col fixed md:static inset-y-0 left-0 z-50 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-white/10 md:border-r-0`}>
<button onClick={() => setMobileMenuOpen(false)} className="md:hidden absolute top-6 right-6 text-white"><X size={28} /></button>

<div className="flex items-center gap-3 mb-10">
<div className="w-10 h-10 bg-[#14B8A6] rounded-2xl flex items-center justify-center text-2xl">🔨</div>
<div>
<p className="font-semibold text-lg">ArtisanConnect</p>
<p className="text-xs text-[#94A3B8]">Welcome, {userName}</p>
</div>
</div>

<nav className="flex-1 space-y-2">
<button onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${activeTab === "dashboard" ? "bg-[#14B8A6] text-black" : "hover:bg-white/10"}`}>
<Home size={20} /> Dashboard
</button>
<button onClick={() => { setActiveTab("bookings"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${activeTab === "bookings" ? "bg-[#14B8A6] text-black" : "hover:bg-white/10"}`}>
<Calendar size={20} /> My Bookings
</button>
<button onClick={() => { setActiveTab("favorites"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${activeTab === "favorites" ? "bg-[#14B8A6] text-black" : "hover:bg-white/10"}`}>
<Heart size={20} /> Favorites
</button>
<button onClick={() => { setActiveTab("messages"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${activeTab === "messages" ? "bg-[#14B8A6] text-black" : "hover:bg-white/10"}`}>
<MessageCircle size={20} /> Messages
</button>
<button onClick={() => { setSupportOpen(true); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/10 transition text-[#14B8A6]">
<MessageCircle size={20} /> Message Support
</button>
</nav>

<button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 rounded-2xl transition">
<LogOut size={20} /> Logout
</button>
</div>

{/* Main Content */}
<div className="flex-1 p-4 md:p-10 overflow-auto">
<div className="max-w-6xl mx-auto">
<div className="hidden md:flex justify-between items-center mb-10">
<h1 className="text-4xl font-semibold">Welcome back, <span className="text-[#14B8A6]">{userName}</span>!</h1>
<div className="flex items-center gap-4">
<button className="flex items-center gap-2 px-5 py-3 bg-[#1E2937] hover:bg-white/10 rounded-3xl transition">
<Bell size={20} />
</button>
<div className="flex items-center gap-3">
<div className="w-9 h-9 bg-[#14B8A6] rounded-2xl flex items-center justify-center text-2xl">👤</div>
<div>
<p className="font-medium">{userName}</p>
<p className="text-xs text-[#94A3B8]">Customer</p>
</div>
</div>
</div>
</div>

{/* All your existing tabs remain unchanged */}
{activeTab === "dashboard" && (
<div className="space-y-8">
<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
<div className="bg-[#1E2937] rounded-3xl p-6 text-center">
<p className="text-[#94A3B8]">Active Bookings</p>
<p className="text-6xl font-bold text-[#14B8A6] mt-2">{bookings.length}</p>
</div>
<div className="bg-[#1E2937] rounded-3xl p-6 text-center">
<p className="text-[#94A3B8]">Favorites</p>
<p className="text-6xl font-bold text-[#14B8A6] mt-2">{favorites.length}</p>
</div>
<div className="bg-[#1E2937] rounded-3xl p-6 text-center">
<p className="text-[#94A3B8]">Messages</p>
<p className="text-6xl font-bold text-[#14B8A6] mt-2">{messages.length}</p>
</div>
</div>
<button onClick={() => setShowRequestModal(true)} className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-black py-5 rounded-3xl font-semibold flex items-center justify-center gap-3 text-xl">
<Plus size={24} /> Request a New Job
</button>
</div>
)}

{activeTab === "bookings" && (
<div className="bg-[#1E2937] rounded-3xl p-8">
<h2 className="text-2xl font-semibold mb-6">My Bookings</h2>
{bookings.length === 0 ? (
<p className="text-[#94A3B8] text-center py-12">No bookings yet. Request your first job above!</p>
) : (
<div className="space-y-4">
{bookings.map((booking: any) => (
<div key={booking.id} className="flex flex-col md:flex-row justify-between bg-[#0F172A] p-6 rounded-2xl gap-4">
<div>
<p className="font-medium">{booking.artisan_name}</p>
<p className="text-sm text-[#94A3B8]">{booking.created_at?.split('T')[0]}</p>
<p className="text-sm mt-2">{booking.message}</p>
</div>
<div className={`px-5 py-2 rounded-2xl text-sm font-medium flex items-center gap-2 self-start md:self-center
${booking.status === "accepted" ? "bg-green-500/20 text-green-400" :
booking.status === "pending" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>
{booking.status === "accepted" && <CheckCircle size={18} />}
{booking.status === "pending" && <Clock size={18} />}
{booking.status === "rejected" && <XCircle size={18} />}
{booking.status.toUpperCase()}
</div>
</div>
))}
</div>
)}
</div>
)}

{activeTab === "favorites" && (
<div className="bg-[#1E2937] rounded-3xl p-8">
<h2 className="text-2xl font-semibold mb-6">My Favorite Artisans</h2>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
{favorites.map((fav: any) => (
<div key={fav.id} className="bg-[#0F172A] rounded-3xl overflow-hidden">
<img src={fav.photo} alt={fav.artisan_name} className="w-full h-40 object-cover" />
<div className="p-4">
<p className="font-medium">{fav.artisan_name}</p>
<p className="text-sm text-[#14B8A6]">{fav.specialty}</p>
</div>
</div>
))}
</div>
</div>
)}

{activeTab === "messages" && (
<div className="bg-[#1E2937] rounded-3xl p-8">
<h2 className="text-2xl font-semibold mb-6">Messages</h2>
<div className="space-y-4">
{messages.map((msg: any) => (
<div key={msg.id} className="flex gap-4 bg-[#0F172A] p-6 rounded-2xl hover:bg-white/5 transition cursor-pointer">
<div className="w-10 h-10 bg-[#14B8A6] rounded-2xl flex-shrink-0 flex items-center justify-center text-xl">👷</div>
<div className="flex-1">
<div className="flex justify-between">
<p className="font-medium">{msg.from_artisan}</p>
<p className="text-xs text-[#94A3B8]">{msg.time}</p>
</div>
<p className="text-sm text-[#94A3B8] mt-1">{msg.text}</p>
</div>
{msg.unread && <div className="w-3 h-3 bg-[#14B8A6] rounded-full mt-2"></div>}
</div>
))}
</div>
</div>
)}
</div>
</div>
</div>

{/* Request New Job Modal */}
{showRequestModal && (
<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
<div className="bg-[#1E2937] w-full max-w-md rounded-3xl overflow-hidden">
<div className="bg-[#334155] px-6 py-4 flex justify-between">
<p className="font-semibold">Request a New Job</p>
<button onClick={() => setShowRequestModal(false)} className="text-3xl">×</button>
</div>
<div className="p-6 space-y-6">
<input type="text" placeholder="Artisan name or specialty" value={requestArtisan} onChange={(e) => setRequestArtisan(e.target.value)} className="w-full bg-[#0F172A] border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40" />
<textarea placeholder="Describe the job you need..." value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} rows={4} className="w-full bg-[#0F172A] border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40" />
<button onClick={handleRequestBooking} className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-black py-4 rounded-2xl font-semibold">Send Booking Request</button>
</div>
</div>
</div>
)}

{/* Support Chat Modal */}
{supportOpen && (
<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
<div className="bg-[#1E2937] w-full max-w-lg rounded-3xl overflow-hidden">
<div className="bg-[#334155] px-6 py-4 flex justify-between items-center">
<div>
<p className="font-semibold">Chat with Support</p>
<p className="text-xs text-[#14B8A6]">We reply within minutes</p>
</div>
<button onClick={() => setSupportOpen(false)} className="text-3xl text-white/70">×</button>
</div>
<div className="h-80 overflow-y-auto p-6 space-y-4 bg-[#1E2937]">
{supportMessages.length === 0 && <p className="text-center text-[#94A3B8] mt-16">Start chatting with support...</p>}
{supportMessages.map(msg => (
<div key={msg.id} className={`flex ${msg.from === "You" ? "justify-end" : "justify-start"}`}>
<div className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.from === "You" ? "bg-[#14B8A6] text-black" : "bg-[#334155]"}`}>
{msg.text}
<div className="text-xs opacity-60 mt-1 text-right">{msg.time}</div>
</div>
</div>
))}
</div>
<div className="p-4 bg-[#334155] flex gap-3">
<input type="text" value={supportInput} onChange={(e) => setSupportInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendSupportMessage()} placeholder="Type your message..." className="flex-1 bg-[#1E2937] border border-white/10 px-4 py-3 rounded-2xl focus:outline-none text-white" />
<button onClick={sendSupportMessage} className="bg-[#14B8A6] hover:bg-[#0D9488] text-black px-6 rounded-2xl font-semibold flex items-center">
<Send size={22} />
</button>
</div>
</div>
</div>
)}

{/* Footer */}
<footer className="bg-[#0F172A] border-t border-white/10 py-12 mt-auto">
<div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
<div>
<div className="flex items-center gap-3">
<div className="w-8 h-8 bg-[#14B8A6] rounded-2xl flex items-center justify-center text-xl">🔨</div>
<span className="font-bold text-2xl">ArtisanConnect</span>
</div>
<p className="text-[#94A3B8] mt-3 text-sm">Connecting you with trusted local artisans in Osun State and beyond.</p>
</div>
<div>
<p className="font-semibold mb-4">Quick Links</p>
<ul className="space-y-2 text-sm text-[#94A3B8]">
<li><Link href="/" className="hover:text-white">Home</Link></li>
<li><Link href="/artisans" className="hover:text-white">Find Artisans</Link></li>
<li><Link href="/register" className="hover:text-white">Join as Artisan</Link></li>
</ul>
</div>
<div>
<p className="font-semibold mb-4">Company</p>
<ul className="space-y-2 text-sm text-[#94A3B8]">
<li><Link href="#" className="hover:text-white">About Us</Link></li>
<li><Link href="#" className="hover:text-white">How It Works</Link></li>
<li><Link href="#" className="hover:text-white">Blog</Link></li>
</ul>
</div>
<div>
<p className="font-semibold mb-4">Contact</p>
<p className="text-sm text-[#94A3B8]">Lagos, Nigeria</p>
<p className="text-sm text-[#94A3B8]">support@artisanconnect.ng</p>
<p className="text-sm text-[#94A3B8]">+234 801 234 5678</p>
</div>
</div>
<div className="text-center text-xs text-[#94A3B8] mt-12 border-t border-white/10 pt-6">
© 2026 ArtisanConnect. All rights reserved.
</div>
</footer>
</div>
);
}