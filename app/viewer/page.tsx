"use client";

import { useEffect, useState } from "react";
import { Package, Search } from "lucide-react";
import Link from "next/link";

export default function ViewerDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then(r => r.json())
      .then(data => setProducts(data))
      .catch(console.error);
  }, []);

  const filtered = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const inStock = products.filter((p: any) => p.quantity > 5).length;
  const lowStock = products.filter((p: any) => p.quantity > 0 && p.quantity <= 5).length;
  const outOfStock = products.filter((p: any) => p.quantity === 0).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#1e1b4b] tracking-tight">Viewer Dashboard</h1>
          <p className="text-slate-500 mt-2 text-lg">Real-time view of current inventory levels.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8d98]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "In Stock Items", value: inStock, color: "text-[#10b981]" },
          { label: "Low Stock Items", value: lowStock, color: "text-orange-500" },
          { label: "Out of Stock", value: outOfStock, color: "text-red-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            <p className="text-[11px] font-black tracking-widest text-[#8b8d98] uppercase mb-4">{stat.label}</p>
            <h3 className={`text-4xl font-black ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-[#1e1b4b] uppercase">All Products</h3>
          <Link href="/viewer/inventory" className="text-xs font-black text-[#5a4bfa] uppercase tracking-widest hover:underline">
            Full Inventory
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p: any) => (
            <div key={p.id} className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-100 flex flex-col hover:border-slate-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-white shadow-sm text-[#5a4bfa]">
                  <Package className="w-5 h-5" />
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                  p.quantity > 5 ? "bg-green-50 text-emerald-500" :
                  p.quantity > 0 ? "bg-orange-50 text-orange-500" :
                  "bg-red-50 text-red-500"
                }`}>
                  {p.quantity > 5 ? "In Stock" : p.quantity > 0 ? "Low Stock" : "Out of Stock"}
                </span>
              </div>
              <h3 className="font-black text-[#1e1b4b] mb-1">{p.name}</h3>
              <p className="text-xs text-[#8b8d98] font-bold uppercase tracking-widest mb-4">{p.category} • {p.sku}</p>
              <div className="mt-auto pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-[#8b8d98]">{p.quantity} Units</span>
                <span className="font-black text-[#1e1b4b]">${Number(p.price).toFixed(2)}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 py-12 text-center text-slate-400 font-medium">
              No products found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
