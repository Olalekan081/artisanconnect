'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Bell, Users, UserCheck, MessageCircle, Settings, MapPin, Trash2 } from "lucide-react";
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [adminRole, setAdminRole] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const [pendingArtisans, setPendingArtisans] = useState<any[]>([]);
  const [approvedArtisans, setApprovedArtisans] = useState<any[]>([]);
  const [revokedArtisans, setRevokedArtisans] = useState<any[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);

  const [nearMe, setNearMe] = useState(false);
  const [userCity, setUserCity] = useState("");

  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("customer_care");
  const [newAdminPassword, setNewAdminPassword] = useState("");

  const fullTeam = [
    { username: "Olalekan1", role: "CEO", avatar: "https://picsum.photos/id/1005/120/120" },
    { username: "abiodun1", role: "Customer Care Specialist", avatar: "https://picsum.photos/id/64/120/120" },
    { username: "abeeb1", role: "Artisan Specialist", avatar: "https://picsum.photos/id/201/120/120" },
    { username: "ayomide1", role: "Account Specialist", avatar: "https://picsum.photos/id/1005/120/120" },
  ];

  const iconMap: { [key: string]: string } = {
    "Plumber": "🔧", "Electrician": "⚡", "Carpenter": "🪚", "Painter": "🖌️",
    "Mason": "🧱", "Welder": "🔩", "Tailor": "🧵", "Mechanic": "🚗",
    "Tiler": "🪣", "POP Artist": "🏗️", "Roofer": "🏠", "Gardener": "🌿",
    "Cleaner": "🧹", "Towing Service": "🚗", "Load Movers": "📦",
    "Electronics Technician": "📱", "Catering Service": "🍽️",
  };

  // Load admin
  useEffect(() => {
    const role = localStorage.getItem("adminRole") || "";
    const username = localStorage.getItem("adminUsername") || "";
    setAdminRole(role.toLowerCase());
    setAdminUsername(username);

    if (role.toLowerCase() === "ceo") setActiveTab("manage-admin");
    else setActiveTab("overview");
  }, []);

  // Fetch data
  const fetchData = async () => {
    const { data: allArtisans } = await supabase.from('artisans').select('*').order('created_at', { ascending: false });
    if (allArtisans) {
      setPendingArtisans(allArtisans.filter((a: any) => a.status === 'pending'));
      setApprovedArtisans(allArtisans.filter((a: any) => a.status === 'approved'));
      setRevokedArtisans(allArtisans.filter((a: any) => a.status === 'rejected'));
    }

    const { data: usersData } = await supabase.from('artisans').select('id, name, email, phone, location, created_at, specialty').order('created_at', { ascending: false });
    setRegisteredUsers(usersData || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const approveArtisan = async (id: string) => {
    await supabase.from('artisans').update({ status: 'approved' }).eq('id', id);
    fetchData();
  };

  const revokeArtisan = async (id: string) => {
    if (!confirm("Revoke this artisan account?")) return;
    await supabase.from('artisans').update({ status: 'rejected' }).eq('id', id);
    fetchData();
  };

  const revokeCustomer = async (id: string) => {
    if (!confirm("Revoke this customer account?")) return;
    alert("✅ Customer account revoked");
    fetchData();
  };

  const getNearMe = () => {
    setNearMe(!nearMe);
    setUserCity(nearMe ? "" : "Osogbo");
  };

  const filteredApproved = nearMe
    ? approvedArtisans.filter(a => a.location?.toLowerCase().includes(userCity.toLowerCase()))
    : approvedArtisans;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/admin/login";
  };

  // Realtime messaging
  useEffect(() => {
    if (!adminUsername) return;
    const fetchMessages = async () => {
      const { data } = await supabase.from('admin_messages').select('*').or(`from_username.eq.${adminUsername},to_username.eq.${adminUsername}`).order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    const channel = supabase.channel('admin-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_messages' }, (payload) => {
        const newMsg = payload.new;
        if (newMsg.from_username === adminUsername || newMsg.to_username === adminUsername) {
          setMessages(prev => [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [adminUsername]);

  const openChat = (target: any) => setSelectedChat(target);

  const sendMessage = async () => {
    if (!selectedChat || !chatInput.trim() || !adminUsername) return;
    const newMessage = { from_username: adminUsername, to_username: selectedChat.username, text: chatInput };
    const { error } = await supabase.from('admin_messages').insert(newMessage);
    if (!error) {
      setChatInput("");
      setMessages(prev => [...prev, { ...newMessage, created_at: new Date().toISOString() }]);
    }
  };

  const isCEO = adminRole === "ceo";

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col">
      {/* Top Header */}
      <div className="bg-[#1E2937] border-b border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Welcome back, <span className="text-[#14B8A6]">{adminUsername}</span></h1>
            <p className="text-[#14B8A6] text-sm capitalize">{adminRole} Dashboard</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-500 font-medium">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-72 bg-[#1E2937] p-6 flex flex-col border-r border-white/10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#14B8A6] rounded-2xl flex items-center justify-center text-[#0F172A] font-bold text-2xl">A</div>
            <h1 className="text-2xl font-bold">ArtisanConnect</h1>
          </div>
          <div className="mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#14B8A6]/20 rounded-2xl flex items-center justify-center text-2xl">👤</div>
            <div>
              <p className="font-semibold">{adminUsername}</p>
              <p className="text-xs text-[#14B8A6] capitalize">{adminRole}</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            <button onClick={() => setActiveTab("overview")} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-3 transition ${activeTab === "overview" ? "bg-[#14B8A6] text-black" : "hover:bg-white/5"}`}>Overview</button>
            <button onClick={() => setActiveTab("users")} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-3 transition ${activeTab === "users" ? "bg-[#14B8A6] text-black" : "hover:bg-white/5"}`}><Users size={20} /> Registered Users</button>
            <button onClick={() => setActiveTab("artisans")} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-3 transition ${activeTab === "artisans" ? "bg-[#14B8A6] text-black" : "hover:bg-white/5"}`}><UserCheck size={20} /> Artisans</button>
            <button onClick={() => setActiveTab("revoked")} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-3 transition ${activeTab === "revoked" ? "bg-[#14B8A6] text-black" : "hover:bg-white/5"}`}><Trash2 size={20} /> Revoked</button>
            <button onClick={() => setActiveTab("complaints")} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-3 transition ${activeTab === "complaints" ? "bg-[#14B8A6] text-black" : "hover:bg-white/5"}`}>Complaints</button>
            <button onClick={() => setActiveTab("admin-chat")} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-3 transition ${activeTab === "admin-chat" ? "bg-[#14B8A6] text-black" : "hover:bg-white/5"}`}><MessageCircle size={20} /> Admin Chat</button>
            {isCEO && <button onClick={() => setActiveTab("manage-admin")} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-3 transition ${activeTab === "manage-admin" ? "bg-[#14B8A6] text-black" : "hover:bg-white/5"}`}><Settings size={20} /> Manage Admins</button>}
          </nav>
          <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:text-red-300 mt-auto pt-8">
            <LogOut size={20} /> Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-10 overflow-auto">

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div>
              <h1 className="text-3xl font-semibold mb-8">Overview Dashboard</h1>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-[#1E2937] p-8 rounded-3xl">
                  <p className="text-[#14B8A6]">Pending Artisans</p>
                  <p className="text-6xl font-bold mt-2">{pendingArtisans.length}</p>
                </div>
                <div className="bg-[#1E2937] p-8 rounded-3xl">
                  <p className="text-[#14B8A6]">Approved Artisans</p>
                  <p className="text-6xl font-bold mt-2">{approvedArtisans.length}</p>
                </div>
                <div className="bg-[#1E2937] p-8 rounded-3xl">
                  <p className="text-[#14B8A6]">Revoked Artisans</p>
                  <p className="text-6xl font-bold mt-2">{revokedArtisans.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* ARTISANS */}
          {activeTab === "artisans" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold">Artisans Management</h1>
                <button onClick={getNearMe} className="flex items-center gap-2 bg-[#14B8A6] text-black px-6 py-3 rounded-2xl font-medium">
                  <MapPin size={18} /> {nearMe ? "Show All" : "📍 Near Me"}
                </button>
              </div>
              <div className="bg-[#1E2937] rounded-3xl p-8 mb-8">
                <h2 className="text-xl font-semibold mb-6">Pending Approvals ({pendingArtisans.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingArtisans.map(artisan => (
                    <div key={artisan.id} className="bg-[#0F172A] rounded-3xl p-6 flex gap-4">
                      <span className="text-4xl">{iconMap[artisan.specialty] || "🛠️"}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">{artisan.name}</h3>
                        <p className="text-[#14B8A6]">{artisan.specialty}</p>
                        {artisan.verification_type && (
                          <div className="mt-4">
                            <p className="text-xs text-[#94A3B8]">Verification: {artisan.verification_type}</p>
                            {artisan.verification_doc && (
                              <img src={artisan.verification_doc} alt="Verification" className="mt-2 w-32 h-32 object-cover rounded-2xl cursor-pointer" onClick={() => window.open(artisan.verification_doc, '_blank')} />
                            )}
                          </div>
                        )}
                        <div className="flex gap-3 mt-6">
                          <button onClick={() => approveArtisan(artisan.id)} className="flex-1 bg-green-600 py-3 rounded-2xl">Approve</button>
                          <button onClick={() => revokeArtisan(artisan.id)} className="flex-1 bg-red-600 py-3 rounded-2xl">Revoke</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1E2937] rounded-3xl p-8">
                <h2 className="text-xl font-semibold mb-6">Approved Artisans ({filteredApproved.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredApproved.map(artisan => (
                    <div key={artisan.id} className="bg-[#0F172A] rounded-3xl p-6 flex gap-4">
                      <span className="text-4xl">{iconMap[artisan.specialty] || "🛠️"}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">{artisan.name}</h3>
                        <p className="text-[#14B8A6]">{artisan.specialty}</p>
                        <button onClick={() => revokeArtisan(artisan.id)} className="mt-6 w-full bg-red-600 py-3 rounded-2xl text-white">Revoke Access</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REVOKED */}
          {activeTab === "revoked" && (
            <div>
              <h1 className="text-3xl font-semibold mb-6">Revoked Artisans & Users</h1>
              <div className="bg-[#1E2937] rounded-3xl p-8">
                <h2 className="text-xl font-semibold mb-6">Revoked Artisans ({revokedArtisans.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {revokedArtisans.map(artisan => (
                    <div key={artisan.id} className="bg-[#0F172A] rounded-3xl p-6 flex gap-4">
                      <span className="text-4xl">{iconMap[artisan.specialty] || "🛠️"}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-red-400">{artisan.name}</h3>
                        <p className="text-[#14B8A6]">{artisan.specialty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REGISTERED USERS */}
          {activeTab === "users" && (
            <div>
              <h1 className="text-3xl font-semibold mb-6">Registered Users</h1>
              <div className="bg-[#1E2937] rounded-3xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {registeredUsers.map(user => (
                    <div key={user.id} className="bg-[#0F172A] rounded-3xl p-6">
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-[#94A3B8]">{user.email}</p>
                      <button onClick={() => revokeCustomer(user.id)} className="mt-6 w-full bg-red-600 py-3 rounded-2xl text-white text-sm">Revoke Customer Account</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* COMPLAINTS */}
          {activeTab === "complaints" && (
            <div>
              <h1 className="text-3xl font-semibold mb-6">Customer Complaints & Suggestions</h1>
              <div className="bg-[#1E2937] rounded-3xl p-8 text-[#94A3B8]">
                No complaints yet.
              </div>
            </div>
          )}

          {/* ADMIN CHAT */}
          {activeTab === "admin-chat" && (
            <div>
              <h1 className="text-3xl font-semibold mb-6">Internal Admin Chat</h1>
              <div className="bg-[#1E2937] rounded-3xl p-8">
                <div className="space-y-4">
                  {fullTeam.filter(member => member.username.toLowerCase() !== adminUsername.toLowerCase()).map((member) => (
                    <div key={member.username} className="flex items-center justify-between bg-[#0F172A] rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <img src={member.avatar} alt="" className="w-12 h-12 rounded-2xl" />
                        <div>
                          <p className="font-medium">{member.role}</p>
                        </div>
                      </div>
                      <button onClick={() => openChat(member)} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl text-sm font-medium">Message</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MANAGE ADMINS - CEO ONLY */}
          {activeTab === "manage-admin" && isCEO && (
            <div>
              <h1 className="text-3xl font-semibold mb-6">Manage Admin Access (CEO Only)</h1>

              {/* Add New Admin */}
              <div className="bg-[#1E2937] rounded-3xl p-8 mb-8">
                <h2 className="text-xl font-semibold mb-6">Add New Admin</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <input type="text" value={newAdminUsername} onChange={(e) => setNewAdminUsername(e.target.value)} className="bg-[#0F172A] border border-white/20 rounded-2xl px-5 py-4 text-white" placeholder="Username" />
                  <select value={newAdminRole} onChange={(e) => setNewAdminRole(e.target.value)} className="bg-[#0F172A] border border-white/20 rounded-2xl px-5 py-4 text-white">
                    <option value="customer_care">Customer Care Specialist</option>
                    <option value="artisan_specialist">Artisan Specialist</option>
                    <option value="account_specialist">Account Specialist</option>
                    <option value="marketing_specialist">Marketing Specialist</option>
                    <option value="finance_specialist">Finance Specialist</option>
                  </select>
                  <input type="password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} className="bg-[#0F172A] border border-white/20 rounded-2xl px-5 py-4 text-white" placeholder="Password" />
                  <button onClick={() => { 
                    alert("✅ New admin added!"); 
                    setNewAdminUsername(""); 
                    setNewAdminPassword(""); 
                  }} className="bg-[#14B8A6] text-black py-4 rounded-2xl font-semibold">Add New Admin</button>
                </div>
              </div>

              {/* Current Admins */}
              <div className="bg-[#1E2937] rounded-3xl p-8">
                <h2 className="text-xl font-semibold mb-6">Current Admins</h2>
                <div className="space-y-4">
                  {fullTeam.map((admin) => (
                    <div key={admin.username} className="flex items-center justify-between bg-[#0F172A] rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <img src={admin.avatar} alt="" className="w-12 h-12 rounded-2xl" />
                        <div>
                          <p className="font-medium">{admin.role}</p>
                          <p className="text-xs text-[#94A3B8]">{admin.username}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => openChat(admin)} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl text-sm font-medium">Message</button>
                        {admin.username !== adminUsername && (
                          <button onClick={() => { 
                            if (confirm(`Revoke ${admin.role}?`)) {
                              alert("✅ Admin access revoked");
                            }
                          }} className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-2xl text-sm font-medium">Revoke</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0F172A] border-t border-white/10 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-8 text-center text-sm text-[#94A3B8]">
          © 2026 ArtisanConnect by Lamdaforge Group • Admin Panel
        </div>
      </footer>

      {/* Messaging Modal */}
      <AnimatePresence>
        {selectedChat && (
          <motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-[#1E2937] w-full max-w-lg rounded-3xl overflow-hidden">
              <div className="bg-[#334155] px-6 py-4 flex justify-between items-center">
                <p className="font-semibold">Chat with {selectedChat.role || selectedChat.username}</p>
                <button onClick={() => setSelectedChat(null)} className="text-3xl">×</button>
              </div>
              <div className="h-96 p-6 overflow-y-auto space-y-4 bg-[#0F172A]">
                {messages.filter(m => 
                  (m.from_username === adminUsername && m.to_username === selectedChat.username) ||
                  (m.from_username === selectedChat.username && m.to_username === adminUsername)
                ).map((msg, i) => (
                  <div key={i} className={`flex ${msg.from_username === adminUsername ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.from_username === adminUsername ? "bg-[#14B8A6] text-black" : "bg-[#334155]"}`}>
                      <p>{msg.text}</p>
                      <p className="text-xs opacity-70 text-right mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 flex gap-3">
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} className="flex-1 bg-[#0F172A] border border-white/20 rounded-2xl px-5 py-4 text-white" placeholder="Type message..." />
                <button onClick={sendMessage} className="bg-[#14B8A6] text-black px-8 rounded-2xl font-medium">Send</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}