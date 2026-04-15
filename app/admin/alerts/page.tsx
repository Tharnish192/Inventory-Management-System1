"use client";

import { useState, useEffect } from "react";
import { X, Truck, Package, PackageX } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlertData();
  }, []);

  const fetchAlertData = async () => {
    try {
      const [prodRes, purchRes] = await Promise.all([
        fetch("http://localhost:5000/products"),
        fetch("http://localhost:5000/purchases")
      ]);
      const products = await prodRes.json();
      const purchases = await purchRes.json();

      const newAlerts: any[] = [];

      // 1. Pending Purchase Orders
      purchases.filter((p: any) => p.status === "PENDING").forEach((p: any) => {
        const product = products.find((pr: any) => pr.id === p.productId);
        newAlerts.push({
          id: `purch-${p.id}`,
          type: "ORDER",
          title: "Pending Purchase Order",
          message: `Order #${p.id} for ${product?.name || "Product"} from ${p.supplier} is pending.`,
          status: "ACTIVE",
          icon: Truck,
          color: "blue"
        });
      });

      // 2. Low Stock Alerts
      products.filter((p: any) => p.quantity > 0 && p.quantity <= 5).forEach((p: any) => {
        newAlerts.push({
          id: `stock-${p.id}`,
          type: "LOW_STOCK",
          title: "Low Stock Alert",
          message: `${p.name} is down to ${p.quantity} units.`,
          status: "ACTIVE",
          icon: Package,
          color: "yellow"
        });
      });

      // 3. Out of Stock
      products.filter((p: any) => p.quantity === 0).forEach((p: any) => {
        newAlerts.push({
          id: `out-${p.id}`,
          type: "OUT_OF_STOCK",
          title: "Out of Stock",
          message: `${p.name} is completely out of stock.`,
          status: "CRITICAL",
          icon: PackageX,
          color: "red"
        });
      });

      setAlerts(newAlerts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 flex items-start justify-center h-full pt-12 p-4">
      <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="p-8 pb-6 flex justify-between items-start border-b border-slate-50">
          <div>
            <h2 className="text-xl font-black text-[#1e1b4b] uppercase tracking-widest">
              Real-Time Alerts
            </h2>
            <p className="text-[10px] font-bold text-[#8b8d98] uppercase tracking-widest mt-1">
              {alerts.length} Active Notifications
            </p>
          </div>
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-slate-50 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
              Loading Alerts...
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
              No active alerts
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="p-8 flex gap-6 hover:bg-slate-50/50 transition-colors">
                <div className={`w-12 h-12 rounded-xl flex justify-center items-center shrink-0 ${
                  alert.color === 'blue' ? 'bg-blue-50 text-blue-500' :
                  alert.color === 'yellow' ? 'bg-yellow-50 text-[#f59e0b]' :
                  'bg-red-50 text-[#ef4444]'
                }`}>
                  <alert.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-black text-[#1e1b4b] uppercase tracking-wider">{alert.title}</h3>
                    <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                      alert.color === 'blue' ? 'bg-blue-100/50 text-blue-600' :
                      alert.color === 'yellow' ? 'bg-yellow-100/50 text-[#d97706]' :
                      'bg-red-100/50 text-[#ef4444]'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 text-center border-t border-slate-50">
          <button className="text-xs font-black text-[#5a4bfa] uppercase tracking-widest hover:underline px-4 py-2">
            View Operational History
          </button>
        </div>

      </div>
    </div>
  );
}
