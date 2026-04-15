"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, Eye, ShieldCheck, PenTool, EyeIcon } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [roleMode, setRoleMode] = useState<"admin" | "staff" | "viewer">("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/users");
      const users = await res.json();
      
      const user = users.find(
        (u: any) => u.username === username && u.password === password && u.role === roleMode
      );

      if (user) {
        localStorage.setItem("inventory_user", JSON.stringify(user));
        
        if (user.role === "admin") router.push("/admin");
        else if (user.role === "staff") router.push("/staff/operations");
        else if (user.role === "viewer") router.push("/viewer");
      } else {
        setError(`Invalid credentials for ${roleMode} portal`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: "admin", label: "ADMIN", icon: ShieldCheck, subtitle: "SYSTEM CONFIGURATION & CONTROL" },
    { id: "staff", label: "STAFF", icon: PenTool, subtitle: "INVENTORY & SALES MANAGEMENT" },
    { id: "viewer", label: "VIEWER", icon: EyeIcon, subtitle: "READ-ONLY READINGS & REPORTS" }
  ];

  const currentRole = roles.find(r => r.id === roleMode);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#171332] relative overflow-hidden font-sans">
      {/* Background glow effect behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5a4bfa] opacity-20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="relative w-full max-w-[420px] bg-[#1e1a3f] rounded-[32px] p-8 shadow-2xl border border-white/5">
        
        {/* Role Toggle Tabs */}
        <div className="flex p-1 bg-[#15112c] rounded-xl mb-12">
          {roles.map((r) => (
            <button
              type="button"
              key={r.id}
              onClick={() => setRoleMode(r.id as any)}
              className={`flex-1 flex justify-center items-center space-x-2 py-2.5 rounded-lg text-xs font-black tracking-widest transition-all ${
                roleMode === r.id 
                  ? "bg-[#2c2658] text-white shadow-lg" 
                  : "text-[#6b678e] hover:text-[#8b87a8]"
              }`}
            >
              <r.icon className="w-3.5 h-3.5" />
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        <div className="text-center mb-10 text-white">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#15112c] border border-white/10 flex items-center justify-center mb-6 shadow-inner">
            <Lock className="w-7 h-7 text-[#5a4bfa]" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">{roleMode} PORTAL</h2>
          <p className="text-[10px] font-bold tracking-widest text-[#6b678e] uppercase">
            {currentRole?.subtitle}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10 w-full">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-bold text-center mb-4">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-widest text-[#6b678e] uppercase ml-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-[#6b678e]" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-[#15112c] border border-transparent rounded-xl text-white placeholder-[#4a4665] focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] focus:border-transparent transition-all font-semibold"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-widest text-[#6b678e] uppercase ml-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-[#6b678e]" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-16 py-4 bg-[#15112c] border border-transparent rounded-xl text-white placeholder-[#4a4665] focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] focus:border-transparent transition-all font-semibold"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[10px] font-bold text-[#6b678e] hover:text-white tracking-widest transition-colors"
              >
                SHOW
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center space-x-2 py-4 rounded-xl text-sm font-black text-white bg-[#5a4bfa] hover:bg-[#4b3de6] transition-colors shadow-[0_0_20px_rgba(90,75,250,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            <span>{loading ? "AUTHENTICATING..." : "SIGN IN TO DASHBOARD"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
          
          <div className="mt-8 relative flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-white/5"></div>
            <span className="bg-[#1e1a3f] px-4 text-[9px] font-bold tracking-widest text-[#4a4665] uppercase z-10">
              New to IMS?
            </span>
          </div>
          <Link href="/signup"
            className="mt-4 w-full flex justify-center items-center py-4 rounded-xl text-sm font-black text-[#5a4bfa] border border-[#5a4bfa]/30 hover:bg-[#5a4bfa]/10 transition-colors">
            Create an Account
          </Link>
          <div className="mt-4 text-[10px] font-bold text-[#6b678e] text-center tracking-wider">
            Demo: admin/123 • staff/123 • viewer/123
          </div>
        </form>
      </div>
    </div>
  );
}
