"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/app/lib/api";

const EMPTY_PRODUCT = { name: "", category: "", price: 0, quantity: 1, expiryDate: "", supplier: "", sku: "" };

export default function InventoryManagementPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [userRole, setUserRole] = useState<string>("viewer");

  useEffect(() => { 
    fetchProducts(); 
    const storedUser = localStorage.getItem("inventory_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role || "viewer");
      } catch (e) {
        console.error("Failed to parse user role", e);
      }
    }
  }, []);

  const isReadOnly = userRole === "viewer";

  const fetchProducts = () => {
    fetch(`${API_URL}/products`)
      .then(r => r.json())
      .then(data => setProducts(data))
      .catch(console.error);
  };

  const openAdd = () => {
    if (isReadOnly) return;
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    if (isReadOnly) return;
    setEditingProduct(p);
    setForm({ name: p.name, category: p.category || "", price: p.price, quantity: p.quantity, expiryDate: p.expiryDate || "", supplier: p.supplier || "", sku: p.sku || "" });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    try {
      if (editingProduct) {
        // UPDATE existing
        await fetch(`${API_URL}/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editingProduct, ...form }),
        });
      } else {
        // Compute next sequential ID
        const maxId = products.reduce((max: number, p: any) => {
          const n = parseInt(p.id);
          return isNaN(n) ? max : Math.max(max, n);
        }, 0);
        await fetch(`${API_URL}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, id: String(maxId + 1), sku: form.sku || "SKU-" + String(maxId + 1) }),
        });
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (isReadOnly) return;
    if (!confirm("Delete this product permanently?")) return;
    try {
      await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-[#1e1b4b] uppercase tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 mt-2 text-lg">
            {isReadOnly ? "View real-time stock levels." : "View and manage your stock levels."}
          </p>
        </div>
        {!isReadOnly && (
          <button onClick={openAdd} className="bg-[#5a4bfa] hover:bg-[#4b3de6] text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md flex items-center space-x-2">
            <span>+</span><span>Add Product</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 uppercase tracking-widest text-[10px] font-black text-[#8b8d98]">
                <th className="py-4 px-4 w-16">ID</th>
                <th className="py-4 px-4">Product</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Quantity</th>
                <th className="py-4 px-4">Expiry</th>
                <th className="py-4 px-4">Status</th>
                {!isReadOnly && <th className="py-4 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {products.map((p) => {
                const isLow = p.quantity <= 5;
                const isOut = p.quantity === 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-5 px-4 font-bold text-slate-500 text-sm">{p.id}</td>
                    <td className="py-5 px-4 font-black text-[#1e1b4b]">{p.name}</td>
                    <td className="py-5 px-4 font-bold text-slate-500 text-sm">{p.category || "N/A"}</td>
                    <td className="py-5 px-4 font-black text-[#1e1b4b]">${Number(p.price).toFixed(2)}</td>
                    <td className="py-5 px-4 font-bold text-[#1e1b4b] text-sm">{p.quantity}</td>
                    <td className="py-5 px-4 font-bold text-slate-500 text-sm">{p.expiryDate || "N/A"}</td>
                    <td className="py-5 px-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${isOut ? "bg-red-50 text-red-600" : isLow ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-emerald-500"}`}>
                        {isOut ? "OUT OF STOCK" : isLow ? "LOW STOCK" : "IN STOCK"}
                      </span>
                    </td>
                    {!isReadOnly && (
                      <td className="py-5 px-4 text-right space-x-2">
                        <button onClick={() => openEdit(p)} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm transition-colors uppercase tracking-widest">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#ef4444] text-white hover:bg-red-600 shadow-sm transition-colors uppercase tracking-widest">
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-slate-500">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl relative">
            <h3 className="text-2xl font-black text-[#1e1b4b] uppercase mb-6">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black tracking-widest text-[#8b8d98] uppercase mb-1 block">Product Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa]" />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-[#8b8d98] uppercase mb-1 block">Category</label>
                  <input type="text" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa]" />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-[#8b8d98] uppercase mb-1 block">SKU</label>
                  <input type="text" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa]" />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-[#8b8d98] uppercase mb-1 block">Price ($)</label>
                  <input type="number" required min="0" step="0.01" value={form.price || ""} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa]" />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-[#8b8d98] uppercase mb-1 block">Quantity</label>
                  <input type="number" required min="0" value={form.quantity || ""} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) })}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa]" />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-[#8b8d98] uppercase mb-1 block">Supplier</label>
                  <input type="text" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa]" />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest text-[#8b8d98] uppercase mb-1 block">Expiry Date</label>
                  <input type="text" placeholder="YYYY-MM-DD or N/A" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa]" />
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-[#5a4bfa] text-white hover:bg-[#4b3de6] transition-colors">
                {editingProduct ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
