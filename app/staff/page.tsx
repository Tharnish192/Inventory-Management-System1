"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function StaffDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/products").then(r => r.json()),
      fetch("http://localhost:5000/orders").then(r => r.json()),
    ]).then(([p, o]) => {
      setProducts(p);
      setOrders(o);
    }).catch(console.error);
  }, []);

  const totalItems = products.reduce((sum: number, p: any) => sum + p.quantity, 0);
  const lowStock = products.filter((p: any) => p.quantity <= 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-[#1e1b4b] tracking-tight">Staff Dashboard</h1>
        <p className="text-slate-500 mt-2 text-lg">Overview of your daily operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Stock Units", value: totalItems, icon: Package, color: "text-[#5a4bfa]" },
          { label: "Orders Processed", value: orders.length, icon: ShoppingCart, color: "text-[#10b981]" },
          { label: "Low Stock Items", value: lowStock.length, icon: TrendingUp, color: "text-orange-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            <p className="text-[11px] font-black tracking-widest text-[#8b8d98] uppercase mb-4">{stat.label}</p>
            <h3 className={`text-4xl font-black ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Inventory Summary */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-[#1e1b4b] uppercase">Stock Overview</h3>
            <Link href="/staff/inventory" className="text-xs font-black text-[#5a4bfa] uppercase tracking-widest hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {products.slice(0, 4).map((p: any) => (
              <div key={p.id} className="flex justify-between items-center py-3 border-b border-slate-50">
                <div>
                  <p className="font-black text-[#1e1b4b] text-sm">{p.name}</p>
                  <p className="text-xs text-[#8b8d98] font-bold uppercase">{p.category}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  p.quantity <= 5 ? "bg-orange-50 text-orange-600" : "bg-green-50 text-emerald-500"
                }`}>
                  {p.quantity} units
                </span>
              </div>
            ))}
            {products.length === 0 && <p className="text-slate-400 text-center py-4">Loading...</p>}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-[#1e1b4b] uppercase">Recent Orders</h3>
            <Link href="/staff/sales" className="text-xs font-black text-[#5a4bfa] uppercase tracking-widest hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {orders.slice(-4).reverse().map((o: any) => (
              <div key={o.id} className="flex justify-between items-center py-3 border-b border-slate-50">
                <div>
                  <p className="font-black text-[#1e1b4b] text-sm">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-[#8b8d98] font-bold">{new Date(o.date).toLocaleDateString()}</p>
                </div>
                <span className="font-black text-[#10b981]">${Number(o.totalPrice).toFixed(2)}</span>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-slate-400 text-center py-8 text-sm">No orders processed yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#5a4bfa] rounded-[32px] p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black uppercase">Quick Actions</h3>
          <p className="text-indigo-200 mt-1 font-medium">Jump directly to your most used tools.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/staff/operations" className="px-6 py-3 bg-white text-[#5a4bfa] rounded-xl font-black text-sm hover:bg-indigo-50 transition-colors uppercase tracking-widest">
            Process Sale
          </Link>
          <Link href="/staff/operations" className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-black text-sm hover:bg-indigo-600 transition-colors uppercase tracking-widest">
            Add Stock
          </Link>
        </div>
      </div>
    </div>
  );
}
