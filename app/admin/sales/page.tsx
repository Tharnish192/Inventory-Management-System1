"use client";

import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";

export default function SalesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/orders").then(r => r.json()),
      fetch("http://localhost:5000/products").then(r => r.json())
    ])
    .then(([ordersData, productsData]) => {
      setOrders(ordersData);
      setProducts(productsData);
    })
    .catch(console.error);
  }, []);

  const getProductName = (id: string) => {
    const p = products.find(p => p.id === id);
    return p ? p.name : "Unknown Product";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-[#1e1b4b] uppercase tracking-tight">
          Sales History
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Track and review all processed sales operations.
        </p>
      </div>

      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 uppercase tracking-widest text-[10px] font-black text-[#8b8d98]">
                <th className="py-4 px-4 w-16">Icon</th>
                <th className="py-4 px-4">Order ID</th>
                <th className="py-4 px-4">Product Name</th>
                <th className="py-4 px-4">Quantity</th>
                <th className="py-4 px-4">Total Revenue</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-5 px-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#5a4bfa]">
                      <Receipt className="w-4 h-4" />
                    </div>
                  </td>
                  <td className="py-5 px-4 font-bold text-slate-500 text-xs">#{o.id}</td>
                  <td className="py-5 px-4 font-black text-[#1e1b4b]">{getProductName(o.productId)}</td>
                  <td className="py-5 px-4 font-bold text-[#1e1b4b]">{o.quantity} Units</td>
                  <td className="py-5 px-4 font-black text-[#10b981]">${Number(o.totalPrice).toFixed(2)}</td>
                  <td className="py-5 px-4 font-bold text-slate-500 text-xs">
                    {new Date(o.date).toLocaleString()}
                  </td>
                  <td className="py-5 px-4">
                    <span className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase bg-green-50 text-emerald-500">
                      {o.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    No sales recorded yet. Process a sale in Staff Operations to see it here!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
