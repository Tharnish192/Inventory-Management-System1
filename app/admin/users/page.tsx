"use client";

import { useEffect, useState } from "react";

const EMPTY_USER = { name: "", username: "", role: "viewer", password: "123" };

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_USER);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = () => {
    fetch("http://localhost:5000/users")
      .then(r => r.json())
      .then(data => setUsers(data))
      .catch(console.error);
  };

  const openAdd = () => {
    setEditingUser(null);
    setForm(EMPTY_USER);
    setShowModal(true);
  };

  const openEdit = (u: any) => {
    setEditingUser(u);
    setForm({ name: u.name, username: u.username, role: u.role, password: u.password });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await fetch(`http://localhost:5000/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editingUser, ...form }),
        });
      } else {
        // Compute next sequential ID
        const maxId = users.reduce((max: number, u: any) => {
          const n = parseInt(u.id);
          return isNaN(n) ? max : Math.max(max, n);
        }, 0);
        await fetch("http://localhost:5000/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, id: String(maxId + 1) }),
        });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`http://localhost:5000/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-[#1e1b4b] tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-2 text-lg">Register new users and manage system access roles.</p>
        </div>
        <button onClick={openAdd} className="bg-[#5a4bfa] hover:bg-[#4b3de6] text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md flex items-center space-x-2">
          <span>+</span><span>Register User</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <p className="text-slate-700">
          <strong>Note:</strong> User management is connected to the live JSON backend. Status toggles and deletions are persistent.
        </p>
      </div>

      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 uppercase tracking-widest text-xs font-bold text-[#8b8d98]">
                <th className="py-4 px-4 w-16">ID</th>
                <th className="py-4 px-4">Name</th>
                <th className="py-4 px-4">Username</th>
                <th className="py-4 px-4">Role</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-500">{u.id}</td>
                  <td className="py-4 px-4 font-black text-[#1e1b4b]">{u.name}</td>
                  <td className="py-4 px-4 font-bold text-slate-500">{u.username}</td>
                  <td className="py-4 px-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${
                      u.role === "admin" ? "bg-indigo-50 text-indigo-600" :
                      u.role === "staff" ? "bg-green-50 text-green-600" :
                      "bg-yellow-50 text-yellow-600"
                    }`}>{u.role}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase bg-green-50 text-emerald-500 border border-emerald-100">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button onClick={() => openEdit(u)} className="px-4 py-1.5 rounded-lg text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="px-4 py-1.5 rounded-lg text-sm font-bold bg-[#ef4444] text-white hover:bg-red-600 shadow-sm transition-colors">
                      Del
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-slate-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="text-2xl font-black text-[#1e1b4b] uppercase mb-6">
              {editingUser ? "Edit User" : "Register New User"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black tracking-widest text-[#8b8d98] uppercase mb-1 block">Full Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa]" />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest text-[#8b8d98] uppercase mb-1 block">Username</label>
                <input type="text" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa]" />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest text-[#8b8d98] uppercase mb-1 block">Password</label>
                <input type="text" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa]" />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest text-[#8b8d98] uppercase mb-1 block">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa]">
                  <option value="viewer">Viewer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-[#5a4bfa] text-white hover:bg-[#4b3de6] transition-colors">
                {editingUser ? "Save Changes" : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
