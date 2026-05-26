'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Calendar, Image as ImageIcon, MessageCircle, User, CheckCircle, XCircle, Menu, X, Save, Camera, Trash2, Send } from "lucide-react";
import Link from "next/link";
import { supabase } from '@/lib/supabase';

export default function ArtisanDashboard() {
const [activeTab, setActiveTab] = useState("bookings");
const [artisanEmail, setArtisanEmail] = useState("");
const [artisanName, setArtisanName] = useState("Artisan");
const [loading, setLoading] = useState(true);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

const [bookings, setBookings] = useState<any[]>([]);
const [profile, setProfile] = useState<any>({});
const [saving, setSaving] = useState(false);
const [portfolioImages, setPortfolioImages] = useState<string[]>([]);

// Real-time Chat
const [messages, setMessages] = useState<any[]>([]);
const [newMessage, setNewMessage] = useState("");
const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

const router = useRouter();

const fetchData = async () => {
if (!artisanEmail) return;

const { data: profileData } = await supabase
.from('artisans')
.select('*')
.eq('email', artisanEmail)
.single();

if (profileData) {
setProfile(profileData);
setPortfolioImages(profileData.portfolio || []);
setArtisanName(profileData.name || artisanEmail.split('@')[0]);
}

const { data: bookingData } = await supabase
.from('bookings')
.select('*')
.eq('artisan_email', artisanEmail)
.order('created_at', { ascending: false });

setBookings(bookingData || []);
};

useEffect(() => {
const email = localStorage.getItem("artisanEmail") || "";
if (!email) {
router.push("/artisan/login");
return;
}
setArtisanEmail(email);
setLoading(false);
fetchData();
}, [router]);

const updateBookingStatus = async (id: string, status: 'accepted' | 'rejected') => {
const { error } = await supabase
.from('bookings')
.update({ status })
.eq('id', id);
if (error) alert("Failed to update");
else {
alert(`Booking ${status.toUpperCase()} successfully!`);
fetchData();
}
};

const handleSaveProfile = async () => {
setSaving(true);
const { error } = await supabase
.from('artisans')
.update({
name: profile.name,
bio: profile.bio,
phone: profile.phone,
location: profile.location,
portfolio: portfolioImages
})
.eq('email', artisanEmail);
setSaving(false);
if (error) alert("Failed to save");
else {
alert("✅ Profile saved!");
fetchData();
}
};

const uploadImage = async (file: File, type: 'photo' | 'portfolio') => {
const fileName = `${Date.now()}-${file.name}`;
const folder = type === 'photo' ? 'profile' : 'portfolio';
const { data, error } = await supabase.storage
.from('artisan-images')
.upload(`${folder}/${fileName}`, file);

if (error) return alert("Upload failed: " + error.message);

const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artisan-images/${data.path}`;

if (type === 'photo') {
setProfile({ ...profile, photo: publicUrl });
} else if (portfolioImages.length < 4) {
setPortfolioImages([...portfolioImages, publicUrl]);
} else {
alert("Maximum 4 images allowed");
}
};

const deletePortfolioImage = (index: number) => {
setPortfolioImages(portfolioImages.filter((_, i) => i !== index));
};

// Real-time Messages Tab
const loadMessages = async (customerEmail: string) => {
setSelectedCustomer(customerEmail);
const { data } = await supabase
.from('messages')
.select('*')
.or(`from_email.eq.${artisanEmail},to_email.eq.${artisanEmail}`)
.order('created_at', { ascending: true });
if (data) setMessages(data);
};

const sendReply = async () => {
if (!selectedCustomer || !newMessage.trim()) return;

const newMsg = {
from_email: artisanEmail,
to_email: selectedCustomer,
text: newMessage.trim()
};

const { error } = await supabase.from('messages').insert(newMsg);
if (!error) {
setMessages(prev => [...prev, newMsg]);
setNewMessage("");
}
};

if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white text-xl">Loading Artisan Dashboard...</div>;

return (
<div className="min-h-screen bg-[#0F172A] text-white flex flex-col">
{/* Mobile Header */}
<div className="md:hidden bg-[#1E2937] px-6 py-4 flex items-center justify-between border-b border-white/10">
<div className="flex items-center gap-3">
<div className="w-8 h-8 bg-[#14B8A6] rounded-2xl flex items-center justify-center text-xl">🔨</div>
<span className="font-bold text-xl">ArtisanConnect</span>
</div>
<button onClick={() => setMobileMenuOpen(true)} className="text-white"><Menu size={28} /></button>
</div>

<div className="flex flex-1">
{/* Sidebar */}
<div className={`w-64 bg-[#1E2937] p-6 flex flex-col fixed md:static inset-y-0 left-0 z-50 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-white/10 md:border-r-0`}>
<button onClick={() => setMobileMenuOpen(false)} className="md:hidden absolute top-6 right-6 text-white"><X size={28} /></button>

<div className="flex items-center gap-3 mb-10">
<div className="w-10 h-10 bg-[#14B8A6] rounded-2xl flex items-center justify-center text-2xl">🔨</div>
<div>
<p className="font-semibold text-lg">ArtisanConnect</p>
<p className="text-xs text-[#94A3B8]">Welcome, {artisanName}</p>
</div>
</div>

<nav className="flex-1 space-y-2">
<button onClick={() => { setActiveTab("bookings"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${activeTab === "bookings" ? "bg-[#14B8A6] text-black" : "hover:bg-white/10"}`}>
<Calendar size={20} /> Bookings
</button>
<button onClick={() => { setActiveTab("profile"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${activeTab === "profile" ? "bg-[#14B8A6] text-black" : "hover:bg-white/10"}`}>
<User size={20} /> Profile
</button>
<button onClick={() => { setActiveTab("portfolio"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${activeTab === "portfolio" ? "bg-[#14B8A6] text-black" : "hover:bg-white/10"}`}>
<ImageIcon size={20} /> Portfolio
</button>
<button onClick={() => { setActiveTab("messages"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${activeTab === "messages" ? "bg-[#14B8A6] text-black" : "hover:bg-white/10"}`}>
<MessageCircle size={20} /> Messages
</button>
</nav>

<button onClick={() => { localStorage.clear(); router.push("/artisan/login"); }} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 rounded-2xl transition">
<LogOut size={20} /> Logout
</button>
</div>

{/* Main Content */}
<div className="flex-1 p-4 md:p-10 overflow-auto">
<div className="max-w-6xl mx-auto">
<div className="hidden md:flex justify-between items-center mb-10">
<h1 className="text-4xl font-semibold">Welcome back, <span className="text-[#14B8A6]">{artisanName}</span>!</h1>
</div>

{/* BOOKINGS TAB */}
{activeTab === "bookings" && (
<div className="bg-[#1E2937] rounded-3xl p-8">
<h2 className="text-3xl font-semibold mb-6">Booking Requests</h2>
{bookings.length === 0 ? (
<p className="text-[#94A3B8] text-center py-16">No booking requests yet.</p>
) : (
<div className="space-y-6">
{bookings.map((booking: any) => (
<div key={booking.id} className="bg-[#0F172A] p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
<div className="flex-1">
<p className="font-medium text-lg">From: <span className="text-[#14B8A6]">{booking.customer_email}</span></p>
<p className="text-sm text-[#94A3B8] mt-1">{booking.created_at?.split('T')[0]}</p>
<p className="mt-4 text-white">{booking.job_description}</p>
</div>
<div className="flex gap-3">
{booking.status === 'pending' && (
<>
<button onClick={() => updateBookingStatus(booking.id, 'accepted')} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-6 py-3 rounded-2xl font-medium">
<CheckCircle size={20} /> Accept
</button>
<button onClick={() => updateBookingStatus(booking.id, 'rejected')} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-6 py-3 rounded-2xl font-medium">
<XCircle size={20} /> Reject
</button>
</>
)}
{booking.status !== 'pending' && (
<span className={`px-5 py-2 rounded-2xl text-sm font-medium ${booking.status === 'accepted' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
{booking.status.toUpperCase()}
</span>
)}
</div>
</div>
))}
</div>
)}
</div>
)}

{/* PROFILE TAB */}
{activeTab === "profile" && (
<div className="bg-[#1E2937] rounded-3xl p-8">
<h2 className="text-3xl font-semibold mb-6">My Profile</h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div>
<label className="block text-sm mb-2">Profile Photo</label>
<div className="relative w-40 h-40 mx-auto">
<img src={profile.photo || "https://picsum.photos/id/1015/300/300"} className="w-40 h-40 rounded-3xl object-cover border-4 border-[#14B8A6]" alt="Profile" />
<label className="absolute bottom-2 right-2 bg-[#14B8A6] p-3 rounded-2xl cursor-pointer">
<Camera size={20} className="text-black" />
<input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && uploadImage(e.target.files[0], 'photo')} />
</label>
</div>
</div>
<div className="space-y-6">
<div>
<label className="block text-sm mb-2">Full Name</label>
<input type="text" value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full bg-[#0F172A] border border-white/20 rounded-2xl px-5 py-4" />
</div>
<div>
<label className="block text-sm mb-2">Bio</label>
<textarea value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} className="w-full bg-[#0F172A] border border-white/20 rounded-2xl px-5 py-4" />
</div>
<button onClick={handleSaveProfile} disabled={saving} className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-black py-5 rounded-3xl font-semibold">
{saving ? "Saving..." : "Save Profile"}
</button>
</div>
</div>
</div>
)}

{/* PORTFOLIO TAB */}
{activeTab === "portfolio" && (
<div className="bg-[#1E2937] rounded-3xl p-8">
<h2 className="text-3xl font-semibold mb-6">My Portfolio (up to 4 images)</h2>
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
{portfolioImages.map((url, i) => (
<div key={i} className="relative group">
<img src={url} className="w-full h-48 object-cover rounded-3xl" />
<button onClick={() => deletePortfolioImage(i)} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition">
<Trash2 size={18} />
</button>
</div>
))}
{portfolioImages.length < 4 && (
<label className="border-2 border-dashed border-[#14B8A6] rounded-3xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5">
<Camera size={40} className="text-[#14B8A6]" />
<p className="text-sm mt-3">Add Photo</p>
<input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && uploadImage(e.target.files[0], 'portfolio')} />
</label>
)}
</div>
<button onClick={handleSaveProfile} className="mt-8 w-full bg-[#14B8A6] hover:bg-[#0D9488] text-black py-5 rounded-3xl font-semibold">Save Portfolio</button>
</div>
)}

{/* MESSAGES TAB - REAL-TIME */}
{activeTab === "messages" && (
<div className="bg-[#1E2937] rounded-3xl p-8">
<h2 className="text-3xl font-semibold mb-6">Messages</h2>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
{/* Customer List */}
<div className="lg:col-span-1 border-r border-white/10 pr-6">
<h3 className="font-medium mb-4">Customers</h3>
{/* This will be populated later with real customers who messaged you */}
<p className="text-[#94A3B8] text-sm">No messages yet. Customers will appear here when they message you.</p>
</div>

{/* Chat Area */}
<div className="lg:col-span-2">
<div className="h-96 overflow-y-auto p-6 space-y-4 bg-[#0F172A] rounded-2xl mb-4">
{messages.length === 0 && <p className="text-center text-[#94A3B8] mt-20">Select a customer to start chatting</p>}
{messages.map((msg, index) => (
<div key={index} className={`flex ${msg.from_email === artisanEmail ? "justify-end" : "justify-start"}`}>
<div className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.from_email === artisanEmail ? "bg-[#14B8A6] text-black" : "bg-[#334155]"}`}>
{msg.text}
</div>
</div>
))}
</div>
<div className="flex gap-3">
<input
type="text"
value={newMessage}
onChange={(e) => setNewMessage(e.target.value)}
onKeyDown={(e) => e.key === "Enter" && sendReply()}
placeholder="Type your reply..."
className="flex-1 bg-[#0F172A] border border-white/10 px-4 py-3 rounded-2xl focus:outline-none"
/>
<button onClick={sendReply} className="bg-[#14B8A6] hover:bg-[#0D9488] text-black px-6 rounded-2xl font-semibold">Send</button>
</div>
</div>
</div>
</div>
)}
</div>
</div>
</div>

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
<p className="text-sm text-[#94A3B8]">Osun State, Nigeria</p>
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