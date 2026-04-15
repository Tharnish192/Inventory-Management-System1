"use client";

import { useEffect, useState } from "react";
import { Package, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, alerts: 0, users: 0 });

  useEffect(() => {
    // In a real app we'd fetch this in parallel
    Promise.all([
      fetch("http://localhost:5000/products").then(r => r.json()),
      fetch("http://localhost:5000/alerts").then(r => r.json()),
      fetch("http://localhost:5000/users").then(r => r.json()),
    ]).then(([products, alerts, users]) => {
      setStats({
        products: products.length,
        alerts: alerts.filter((a: any) => a.status === "unread").length,
        users: users.length
      });
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-[#1e1b4b] tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Welcome back, <span className="font-bold text-[#5a4bfa]">System Admin</span>. Here's what's happening with the inventory today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Products", value: stats.products || "3", color: "text-[#5a4bfa]" },
          { label: "Inventory Value", value: "$25,852.31", color: "text-[#5a4bfa]" },
          { label: "Total Sales", value: "$3799.98", color: "text-[#5a4bfa]" },
          { label: "Active Alerts", value: stats.alerts || "2", color: "text-[#10b981]" }, // Emerald green
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col justify-center min-h-[160px]">
             <p className="text-[11px] font-black tracking-widest text-[#8b8d98] uppercase mb-4">{stat.label}</p>
             <h3 className={`text-4xl font-black tracking-tight ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>
      
      {/* System Alerts */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 max-w-4xl">
        <h3 className="text-2xl font-black text-[#1e1b4b] uppercase mb-8">System Alerts</h3>
        
        <div className="space-y-4">
          <div className="bg-[#f8fafc] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 rounded-full bg-orange-400 shrink-0"></div>
              <div>
                <h4 className="font-black text-[#1e1b4b] uppercase">Printer Ink</h4>
                <p className="text-xs font-bold text-[#8b8d98] uppercase tracking-widest mt-1">Low Stock Alert</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <span className="font-bold text-[#1e1b4b]">5 Units Left</span>
              <button className="text-xs font-black text-[#5a4bfa] uppercase tracking-widest hover:underline whitespace-nowrap">
                Manage Item
              </button>
            </div>
          </div>
          
          <div className="bg-[#f8fafc] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 rounded-full bg-red-500 shrink-0"></div>
              <div>
                <h4 className="font-black text-[#1e1b4b] uppercase">Premium Copy Paper</h4>
                <p className="text-xs font-bold text-[#8b8d98] uppercase tracking-widest mt-1">Out of stock</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <span className="font-bold text-[#1e1b4b]">0 Units Left</span>
              <button className="text-xs font-black text-[#5a4bfa] uppercase tracking-widest hover:underline whitespace-nowrap">
                Reorder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
