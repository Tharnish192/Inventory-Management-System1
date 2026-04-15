"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, PackagePlus, FileText, ArrowRight } from "lucide-react";
import { API_URL } from "@/app/lib/api";

export default function StaffOperationsPage() {
  const [activeTab, setActiveTab] = useState("sale");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [saleProductId, setSaleProductId] = useState("");
  const [saleQuantity, setSaleQuantity] = useState(1);

  const [entryProductId, setEntryProductId] = useState("");
  const [entryQuantity, setEntryQuantity] = useState(1);

  const [purchaseSupplier, setPurchaseSupplier] = useState("");
  const [purchaseProductId, setPurchaseProductId] = useState("");
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleProcessSale = async () => {
    if (!saleProductId) return showMessage("Please select a product.");
    const product = products.find(p => p.id === saleProductId);
    if (!product) return;
    
    if (product.quantity < saleQuantity) {
      return showMessage(`Not enough stock. Only ${product.quantity} left.`);
    }

    setLoading(true);
    try {
      // Step 1: Update product stock
      const updatedQuantity = product.quantity - saleQuantity;
      await fetch(`${API_URL}/products/${saleProductId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: updatedQuantity }),
      });

      // Step 2: Record Order
      const newOrder = {
        id: Date.now().toString(),
        productId: saleProductId,
        quantity: saleQuantity,
        totalPrice: product.price * saleQuantity,
        orderStatus: "COMPLETED",
        date: new Date().toISOString(),
      };
      await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      showMessage("Sale order processed successfully!");
      setSaleProductId("");
      setSaleQuantity(1);
      fetchProducts(); // Refresh stock
    } catch (e) {
      showMessage("Error processing sale.");
    } finally {
      setLoading(false);
    }
  };

  const handleStockEntry = async () => {
    if (!entryProductId) return showMessage("Please select a product.");
    const product = products.find(p => p.id === entryProductId);
    if (!product) return;

    setLoading(true);
    try {
      const updatedQuantity = product.quantity + entryQuantity;
      await fetch(`${API_URL}/products/${entryProductId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: updatedQuantity }),
      });

      showMessage("Stock updated successfully!");
      setEntryProductId("");
      setEntryQuantity(1);
      fetchProducts();
    } catch (e) {
      showMessage("Error entering stock.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePurchaseOrder = async () => {
    if (!purchaseSupplier || !purchaseProductId) {
      return showMessage("Please fill in all fields.");
    }

    setLoading(true);
    try {
      const newPurchase = {
        id: Date.now().toString(),
        supplier: purchaseSupplier,
        productId: purchaseProductId,
        quantity: purchaseQuantity,
        status: "PENDING",
        date: new Date().toISOString(),
      };

      await fetch(`${API_URL}/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPurchase),
      });

      showMessage("Purchase order generated successfully!");
      setPurchaseSupplier("");
      setPurchaseProductId("");
      setPurchaseQuantity(1);
    } catch (e) {
      showMessage("Error generating purchase order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-black text-[#1e1b4b] uppercase tracking-tight">
          Staff Operations
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Manage sales, stock entry, and purchase orders.
        </p>
      </div>

      <div className="flex bg-white rounded-full p-2 shadow-sm border border-slate-100 overflow-hidden w-full lg:w-max mx-auto lg:mx-0">
        <button
          onClick={() => setActiveTab("sale")}
          className={`flex-1 lg:flex-none flex items-center justify-center space-x-2 px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === "sale" 
              ? "bg-[#5a4bfa] text-white shadow-md relative z-10" 
              : "text-[#8b8d98] hover:bg-slate-50 relative z-0"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Sale Order</span>
        </button>
        <button
          onClick={() => setActiveTab("entry")}
          className={`flex-1 lg:flex-none flex items-center justify-center space-x-2 px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === "entry" 
              ? "bg-[#5a4bfa] text-white shadow-md relative z-10" 
              : "text-[#8b8d98] hover:bg-slate-50 relative z-0 -ml-2"
          }`}
        >
          <PackagePlus className="w-4 h-4" />
          <span>Stock Entry</span>
        </button>
        <button
          onClick={() => setActiveTab("purchase")}
          className={`flex-1 lg:flex-none flex items-center justify-center space-x-2 px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === "purchase" 
              ? "bg-[#5a4bfa] text-white shadow-md relative z-10" 
              : "text-[#8b8d98] hover:bg-slate-50 relative z-0 -ml-2"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Purchase Orders</span>
        </button>
      </div>

      {message && (
        <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-4 rounded-xl font-bold text-sm text-center shadow-sm">
          {message}
        </div>
      )}

      <div className="bg-white rounded-[32px] p-8 lg:p-12 shadow-sm border border-slate-100">
        {activeTab === "sale" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="space-y-3">
              <label className="text-xs font-bold tracking-widest text-[#8b8d98] uppercase">
                Select Product
              </label>
              <select 
                value={saleProductId}
                onChange={(e) => setSaleProductId(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-6 py-4 text-[#1e1b4b] font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] focus:border-transparent appearance-none"
              >
                <option value="">Choose a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - ${p.price} ({p.quantity} left)</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold tracking-widest text-[#8b8d98] uppercase">
                Quantity
              </label>
              <input 
                type="number" 
                min="1"
                value={saleQuantity}
                onChange={(e) => setSaleQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-6 py-4 text-[#1e1b4b] font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] focus:border-transparent" 
              />
            </div>

            <button 
              onClick={handleProcessSale}
              disabled={loading}
              className="w-full bg-[#a78bfa] hover:bg-[#8b5cf6] disabled:opacity-50 text-white rounded-xl py-5 font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors mt-12 shadow-md"
            >
              <span>{loading ? "Processing..." : "Process Sale Order"}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        )}

        {activeTab === "entry" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="space-y-3">
              <label className="text-xs font-bold tracking-widest text-[#8b8d98] uppercase">
                Select Product
              </label>
              <select 
                value={entryProductId}
                onChange={(e) => setEntryProductId(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-6 py-4 text-[#1e1b4b] font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] focus:border-transparent appearance-none"
              >
                <option value="">Choose a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.quantity} currently)</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold tracking-widest text-[#8b8d98] uppercase">
                Quantity to Add
              </label>
              <input 
                type="number" 
                min="1"
                value={entryQuantity}
                onChange={(e) => setEntryQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-6 py-4 text-[#1e1b4b] font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] focus:border-transparent" 
              />
            </div>

            <button 
              onClick={handleStockEntry}
              disabled={loading}
              className="w-full bg-[#86d3b3] hover:bg-[#68c59f] disabled:opacity-50 text-white rounded-xl py-5 font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors mt-12 shadow-md"
            >
              <span>{loading ? "Processing..." : "Complete Stock Entry"}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        )}

        {activeTab === "purchase" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <h2 className="text-2xl font-black text-[#1e1b4b] uppercase tracking-tight mb-6">
              Create Purchase Order
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold tracking-widest text-[#8b8d98] uppercase">
                  Supplier Name
                </label>
                <input 
                  type="text" 
                  value={purchaseSupplier}
                  onChange={(e) => setPurchaseSupplier(e.target.value)}
                  placeholder="Enter supplier..."
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-6 py-4 text-[#1e1b4b] font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] focus:border-transparent" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold tracking-widest text-[#8b8d98] uppercase">
                  Product
                </label>
                <select 
                  value={purchaseProductId}
                  onChange={(e) => setPurchaseProductId(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-6 py-4 text-[#1e1b4b] font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] focus:border-transparent appearance-none"
                >
                  <option value="">Select product...</option>
                  {products.map(p => (
                     <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold tracking-widest text-[#8b8d98] uppercase">
                  Quantity
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-6 py-4 text-[#1e1b4b] font-bold focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] focus:border-transparent" 
                />
              </div>
            </div>

            <button 
              onClick={handleGeneratePurchaseOrder}
              disabled={loading}
              className="w-full bg-[#5a4bfa] hover:bg-[#4b3de6] disabled:opacity-50 text-white rounded-xl py-5 font-black tracking-widest flex items-center justify-center transition-colors mt-8 shadow-md"
            >
              {loading ? "Generating..." : "Generate Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
