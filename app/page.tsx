// app/page.tsx
"use client";

import { useState } from "react";

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState(0); // 0: Landing, 1: Auth, 2: Dashboard
  const [urlInput, setUrlInput] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["Twitter / X"]);
  const [statusMessage, setStatusMessage] = useState("System idle. Waiting for payload trigger...");
  const [loading, setLoading] = useState(false);
  const [developerEmail, setDeveloperEmail] = useState("");

  const togglePlatform = (platform: string) => {
    setPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const triggerPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (platforms.length === 0) {
      setStatusMessage("🔴 Exception: Select at least one distribution target channel.");
      return;
    }
    setLoading(true);
    setStatusMessage("Encrypting payload arrays and transmitting to runtime queue...");

    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: developerEmail || "demo-user-001",
          rawPrompt: urlInput,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          channels: platforms
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMessage(`🟢 Success: Asset array index locked! ID: ${result.id || "MOCK_ID"}`);
      } else {
        setStatusMessage(`🔴 Exception: ${result.error || "Route handling failed."}`);
      }
    } catch (err) {
      setStatusMessage("🔴 Telemetry Error: Could not connect to API framework.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white p-6 relative overflow-hidden">
      {/* Premium Ambient Background Blur Radial Rings */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Global Framework Header Navigation */}
      <header className="absolute top-0 w-full max-w-6xl flex justify-between items-center py-6 px-4 border-b border-zinc-900/40 backdrop-blur-sm z-50">
        <div className="font-mono text-xs tracking-widest text-zinc-400 font-bold">OMNIPOST // AI</div>
        <div className="flex items-center space-x-6 text-xs font-mono text-zinc-500">
          <span className={currentStep === 0 ? "text-amber-400" : ""}>01 // INDEX</span>
          <span className={currentStep === 1 ? "text-amber-400" : ""}>02 // AUTH</span>
          <span className={currentStep === 2 ? "text-amber-400" : ""}>03 // CONSOLE</span>
        </div>
      </header>

      <div className="w-full max-w-xl z-10 space-y-8 mt-12">
        
        {/* ================= STAGE 0: HIGH-END EDITORIAL LANDING ================= */}
        {currentStep === 0 && (
          <div className="space-y-8 animate-fade-in text-center py-12">
            <div className="space-y-4">
              <span className="inline-flex px-3 py-1 text-[10px] font-mono bg-zinc-900 border border-zinc-800 rounded-full text-amber-400/80 tracking-wider uppercase">
                Now Live in Public Beta
              </span>
              <h1 className="text-5xl font-black tracking-tight leading-none bg-gradient-to-b from-zinc-50 via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                Automate Multi-Channel Product Distribution.
              </h1>
              <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
                Drop your startup context. Our background execution engine structures customized content matrices and handles distribution parameters simultaneously.
              </p>
            </div>
            
            <div className="pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-zinc-100 hover:bg-white text-zinc-950 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-xl hover:shadow-zinc-100/5 active:scale-[0.98]"
              >
                Launch Developer Terminal →
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 1: SYSTEM AUTHENTICATION INITIALIZATION ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Initialize Identity Node</h2>
              <p className="text-zinc-500 text-xs font-mono">Secure telemetry handshake verification required.</p>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">Developer Access Key (Email)</label>
                <input
                  type="email"
                  value={developerEmail}
                  onChange={(e) => setDeveloperEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-all font-mono"
                />
              </div>

              <button
                onClick={() => {
                  if (developerEmail.trim()) setCurrentStep(2);
                  else alert("Key authentication missing.");
                }}
                className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 font-semibold py-3 px-4 rounded-xl text-sm transition-all active:scale-[0.99]"
              >
                Establish Secure Connection ⚡
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 2: THE MAIN COMMAND INTERFACE ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <form onSubmit={triggerPipeline} className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-2xl">
              
              {/* Context Prompt Input Block */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">Startup Context String</label>
                <input
                  type="text"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="e.g., https://sortedd.com - luxury architecture workspace"
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
                />
              </div>

              {/* Checkbox Platform Distribution Grid Array */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">Target Telemetry Channels</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Twitter / X", "LinkedIn", "Discord"].map((platform) => (
                    <div 
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`flex items-center space-x-3 border rounded-xl p-3 font-mono text-[11px] cursor-pointer select-none transition-all ${
                        platforms.includes(platform) 
                          ? "bg-amber-500/5 border-amber-500/40 text-amber-200" 
                          : "bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={platforms.includes(platform)}
                        readOnly
                        className="accent-amber-500 h-3.5 w-3.5 pointer-events-none rounded"
                      />
                      <span>{platform.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? "Transmitting Chunks..." : "Deploy Asset Engine 🚀"}
              </button>
            </form>

            {/* System Logs Telemetry Screen */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 font-mono text-[11px] space-y-1 text-zinc-500 shadow-inner">
              <div className="text-zinc-400 font-semibold flex justify-between items-center mb-1">
                <span>📟 CORE TELEMETRY STATUS</span>
                <span className="text-[10px] text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800/40">MOCK_MODE_ACTIVE</span>
              </div>
              <div className="text-amber-400/90">{statusMessage}</div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}