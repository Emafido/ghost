"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { useAccount, useConnect } from "wagmi";
import { Search, Copy, Zap, ShieldCheck, Mail, Globe, Sparkles, CheckCircle2, Wallet, History, AlertCircle } from "lucide-react";

// 🌐 CONFIGURATION
const API_BASE = "https://ghost-intel-backend.onrender.com/api";

// Types based on the Backend README
interface OpenerHistoryItem {
  opener: string;
  timestamp?: string;
}

interface BackendResponse {
  data: {
    fullName: string;
    jobTitle: string;
    companyName: string;
    email: string;
    phone: string;
    opener: string;
    openerHistory: OpenerHistoryItem[];
  };
}

export default function GhostIntel() {
  // 1. Web3 Hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // 2. Local State
  const [url, setUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult] = useState<BackendResponse["data"] | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [error, setError] = useState("");

  // 3. FETCH CREDITS (Hit GET /api/credits/:wallet)
  const fetchCredits = useCallback(async () => {
    if (!address) return;
    try {
      const res = await axios.get(`${API_BASE}/credits/${address}`);
      setCredits(res.data.balance);
    } catch (err) {
      console.error("Failed to fetch credits:", err);
    }
  }, [address]);

  // Refresh credits when wallet changes or connects
  useEffect(() => {
    if (isConnected && address) {
      fetchCredits();
    }
  }, [isConnected, address, fetchCredits]);

  // 4. REAL SEARCH (Hit POST /api/search)
  const handleSearch = async () => {
    if (!url) return;
    if (!isConnected || !address) {
      alert("Please connect your wallet first!");
      return;
    }

    setIsSearching(true);
    setResult(null);
    setError("");

    // Visual Feedback Steps
    setLoadingStep("Handshaking with Ghost Backend...");
    
    try {
      // Step 1: Send Request
      // Note: The backend README says it deducts 1 credit automatically
      const response = await axios.post(`${API_BASE}/search`, {
        linkedinUrl: url,
        wallet: address 
      });

      // Step 2: Show Success
      setResult(response.data.data);
      
      // Step 3: Refresh Credits (since 1 was just used)
      fetchCredits();

    } catch (err: AxiosError | unknown) {
      // Handle Errors based on README
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 402) {
          setError("Insufficient credits! Please top up.");
        } else if (err.response.status === 400) {
          setError("Invalid LinkedIn URL.");
        } else {
          setError("Server error. Try again later.");
        }
      } else {
        setError("Network error. Check console.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  // 5. BUY CREDITS (Mock for Hackathon Demo)
  // The backend has a /buy-credits endpoint, but usually you'd verify a tx first.
  // For the demo, we will just hit the endpoint to give them credits.
  const handleBuyCredits = async () => {
    if (!address) return;
    try {
      // Simulate "Buying" 5 credits
      await axios.post(`${API_BASE}/buy-credits`, {
        wallet: address,
        amount: 5
      });
      alert("Purchase Successful! +5 Credits");
      fetchCredits();
    } catch (err) {
      alert("Purchase failed.");
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-hidden relative font-sans">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto flex justify-between items-center py-8 px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="text-xl font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Ghost Intel
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#111] rounded-full border border-white/10">
                <Zap className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-sm font-bold text-white">
                  {credits !== null ? credits : "..."} Credits
                </span>
                <button 
                  onClick={handleBuyCredits}
                  className="ml-2 text-xs bg-blue-600 px-2 py-0.5 rounded text-white font-bold hover:bg-blue-500 transition"
                >
                  + BUY
                </button>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#111] rounded-full border border-white/10">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-gray-400">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            </>
          ) : (
            <button 
              onClick={() => connect({ connector: connectors[0] })} 
              className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-xs hover:bg-gray-200 transition-all shadow-lg flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      {/* Main Search Section */}
      <section className="relative z-10 max-w-3xl mx-auto mt-20 px-6 text-center">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4">
            Total <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Recall</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            Instant lead enrichment powered by <span className="text-white font-bold">FullEnrich</span> & <span className="text-white font-bold">Gemini AI</span>.
            <span className="block mt-2 text-sm text-gray-500">Secured on Base Sepolia Network.</span>
          </p>
        </div>

        {/* Input Field */}
        <div className="relative group max-w-2xl mx-auto">
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500 ${isSearching ? 'opacity-50 animate-pulse' : ''}`}></div>
          <div className="relative flex items-center bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl">
            <div className="pl-6 text-gray-500">
              <Search className="w-6 h-6" />
            </div>
            <input 
              type="text" 
              placeholder="Paste LinkedIn URL (e.g., linkedin.com/in/demoge)" 
              className="w-full bg-transparent p-6 text-lg text-white placeholder:text-gray-700 focus:outline-none font-medium"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isSearching}
            />
            <div className="pr-2">
              <button 
                onClick={handleSearch}
                disabled={!url || isSearching}
                className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
                  url && !isSearching 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSearching ? 'Decrypting...' : 'Decrypt'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {isSearching && (
          <div className="mt-12 flex flex-col items-center gap-4 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-500 fill-current animate-pulse" />
              </div>
            </div>
            <p className="text-blue-400 font-mono text-sm tracking-widest uppercase">{loadingStep}</p>
          </div>
        )}

        {error && (
            <div className="mt-8 flex items-center justify-center gap-2 text-red-400 bg-red-500/10 py-3 px-6 rounded-xl border border-red-500/20">
                <AlertCircle className="w-5 h-5" />
                <span className="font-bold">{error}</span>
            </div>
        )}
      </section>

      {/* Results Dashboard */}
      {result && (
        <section className="relative z-10 max-w-5xl mx-auto mt-24 px-6 pb-20 animate-in slide-in-from-bottom-10 fade-in duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Contact Card */}
            <div className="lg:col-span-5 bg-[#111] border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Globe className="w-32 h-32 text-white rotate-12" />
              </div>
              
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-500/20 mb-6">
                  <CheckCircle2 className="w-3 h-3" /> Verified Identity
                </span>
                
                <h3 className="text-3xl font-bold text-white mb-2">{result.fullName}</h3>
                <p className="text-gray-400 text-lg mb-8">{result.jobTitle} <span className="text-gray-600">@</span> {result.companyName}</p>

                <div className="space-y-4">
                  {/* Email Row */}
                  <div className="flex justify-between items-center p-4 bg-black/50 border border-white/5 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer group/item"
                       onClick={() => navigator.clipboard.writeText(result.email)}>
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-sm text-gray-200">{result.email}</span>
                    </div>
                    <Copy className="w-4 h-4 text-gray-600 group-hover/item:text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Intelligence Card */}
            <div className="lg:col-span-7 bg-gradient-to-b from-blue-900/10 to-black border border-blue-500/20 p-8 rounded-3xl relative flex flex-col justify-between">
               <div>
                 <div className="flex justify-between items-start mb-6">
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                      <Sparkles className="w-3 h-3" /> Gemini 1.5 Pro
                   </span>
                   <button className="text-gray-500 hover:text-white transition">
                      <History className="w-4 h-4" />
                   </button>
                 </div>

                 <div className="mb-8">
                   <h4 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Icebreaker Strategy</h4>
                   <p className="text-xl md:text-2xl font-medium leading-relaxed text-white italic">
                     &quot;{result.opener}&quot;
                   </p>
                 </div>
               </div>

               <button 
                 onClick={() => navigator.clipboard.writeText(result.opener)}
                 className="w-full py-4 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-500 rounded-xl font-bold text-blue-400 hover:text-white transition-all flex items-center justify-center gap-2"
               >
                 <Copy className="w-4 h-4" />
                 Copy to Clipboard
               </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}