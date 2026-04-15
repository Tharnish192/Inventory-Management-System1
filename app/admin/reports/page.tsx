"use client";

import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { API_URL } from "@/app/lib/api";
import Link from "next/link";

export default function ReportsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [role, setRole] = useState("admin");

  useEffect(() => {
    const storedUser = localStorage.getItem("inventory_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setRole(user.role || "admin");
      } catch (e) {}
    }

    Promise.all([
      fetch(`${API_URL}/orders`).then(r => r.json()),
      fetch(`${API_URL}/products`).then(r => r.json()),
    ]).then(([o, p]) => {
      setOrders(o);
      setProducts(p);
    }).catch(console.error);
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalPrice), 0);
  const totalSales = orders.length;
  const avgOrder = totalSales > 0 ? totalRevenue / totalSales : 0;
  const stockValuation = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity)), 0);

  // Category breakdown for stock valuation
  const categoryMap: Record<string, number> = {};
  products.forEach(p => {
    const cat = p.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + (Number(p.price) * Number(p.quantity));
  });
  const categories = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
    pct: stockValuation > 0 ? Math.round((value / stockValuation) * 100) : 0,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-[#1e1b4b] uppercase tracking-tight">
          Inventory Reports
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          View detailed analytics on sales performance and inventory valuation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <div className="lg:col-span-2 bg-[#5a4bfa] rounded-[32px] p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-bold tracking-widest text-[#a5a0ff] uppercase mb-2">Total Revenue</p>
            <h2 className="text-6xl font-black tracking-tight mb-12">${totalRevenue.toFixed(2)}</h2>
            <div className="flex space-x-16">
              <div>
                <p className="text-xs font-bold tracking-widest text-[#a5a0ff] uppercase mb-1">Total Sales</p>
                <p className="text-2xl font-black">{totalSales}</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-[#a5a0ff] uppercase mb-1">Avg. Order</p>
                <p className="text-2xl font-black">${avgOrder.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
        </div>

        {/* Stock Valuation Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-[#8b8d98] mb-4 uppercase tracking-widest text-xs font-bold">
              <Package className="w-4 h-4" />
              <span>Stock Valuation</span>
            </div>
            <h2 className="text-4xl font-black text-[#1e1b4b]">${stockValuation.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
          <div className="space-y-4 mt-8">
            {categories.length > 0 ? categories.map((cat, i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] font-bold text-[#8b8d98] uppercase mb-1.5">
                  <span>{cat.name}</span>
                  <span>{cat.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-[#5a4bfa] rounded-full transition-all duration-700" style={{ width: `${cat.pct}%` }}></div>
                </div>
              </div>
            )) : (
              <p className="text-slate-400 text-sm">No product data.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-[#1e1b4b] uppercase">Recent Activity</h3>
          {(role === "admin" || role === "staff") && (
            <Link href={`/${role}/sales`} className="text-xs font-black text-[#5a4bfa] uppercase tracking-widest hover:underline">
              View All
            </Link>
          )}
        </div>
        {orders.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-slate-400">
            No sales activity yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {orders.slice(-5).reverse().map((o: any) => {
              const product = products.find(p => p.id === o.productId);
              return (
                <div key={o.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-black text-[#1e1b4b]">{product?.name || "Unknown Product"}</p>
                    <p className="text-xs text-[#8b8d98] font-bold mt-0.5">{new Date(o.date).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#10b981]">${Number(o.totalPrice).toFixed(2)}</p>
                    <p className="text-xs text-[#8b8d98] font-bold mt-0.5">{o.quantity} units</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
