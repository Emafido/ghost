"use client";
import React, { useState, useEffect } from "react";
import { Search, Copy, Zap, ShieldCheck, Mail, Globe, Sparkles, CheckCircle2 } from "lucide-react";

interface SearchResult {
  fullName: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  linkedin: string;
  opener: string;
}

export default function GhostIntel() {
  const [url, setUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);

  // SIMULATED SEARCH: No backend needed
  const handleSearch = () => {
    if (!url) return;
    setIsSearching(true);
    setResult(null);

    // Step 1: Simulate "Connecting to FullEnrich"
    setLoadingStep("Handshaking with FullEnrich API...");
    
    setTimeout(() => {
      // Step 2: Simulate "Data Extraction"
      setLoadingStep("Extracting verified contact data...");
    }, 1500);

    setTimeout(() => {
      // Step 3: Simulate "AI Generation"
      setLoadingStep("Gemini 1.5 Pro generating icebreaker...");
    }, 3000);

    setTimeout(() => {
      // Step 4: Show Result (The "Magic" Moment)
      setIsSearching(false);
      setResult({
        fullName: "Grégoire Demoge",
        title: "Co-Founder & CEO",
        company: "FullEnrich",
        email: "greg@fullenrich.com",
        phone: "+33 6 45 22 19 88",
        linkedin: "linkedin.com/in/demoge",
        opener: "I've been following FullEnrich's growth and I'm impressed by how you're solving the 'waterfall' data problem for sales teams—it's exactly the efficiency unlock we need right now."
      });
    }, 4500);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-hidden relative">
      
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Navbar */}
      <nav className="relative z-10 max-w-6xl mx-auto flex justify-between items-center py-8 px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="text-xl font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            Ghost Intel
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            SYSTEM ONLINE
          </div>
          <button className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-xs hover:bg-gray-200 transition-all shadow-lg flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <section className="relative z-10 max-w-3xl mx-auto mt-20 px-6 text-center">
        
        {/* Hero Text */}
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-4">
            Total <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Recall</span> for Sales.
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            Turn any LinkedIn profile into actionable intelligence. 
            <span className="text-gray-200 block mt-2">Verified emails + AI-crafted openers in seconds.</span>
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="relative group max-w-2xl mx-auto">
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500 ${isSearching ? 'opacity-50 animate-pulse' : ''}`}></div>
          <div className="relative flex items-center bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl">
            <div className="pl-6 text-gray-500">
              <Search className="w-6 h-6" />
            </div>
            <input 
              type="text" 
              placeholder="Paste LinkedIn URL (e.g., linkedin.com/in/demoge)" 
              className="w-full bg-transparent p-6 text-lg text-white placeholder:text-gray-700 focus:outline-none"
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
                {isSearching ? 'Processing...' : 'Decrypt'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State Indicator */}
        {isSearching && (
          <div className="mt-8 flex flex-col items-center gap-3 animate-in fade-in duration-500">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-blue-400 font-mono text-sm tracking-wide">{loadingStep}</p>
          </div>
        )}
      </section>

      {/* Results Dashboard (Only shows after "loading") */}
      {result && (
        <section className="relative z-10 max-w-5xl mx-auto mt-24 px-6 pb-20 animate-in slide-in-from-bottom-10 fade-in duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Card: Verified Data */}
            <div className="lg:col-span-5 bg-[#111] border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-20">
                <Globe className="w-24 h-24 text-white rotate-12" />
              </div>
              
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-500/20 mb-6">
                  <CheckCircle2 className="w-3 h-3" /> Verified Identity
                </span>
                
                <h3 className="text-3xl font-bold text-white mb-1">{result.fullName}</h3>
                <p className="text-gray-400 text-lg mb-8">{result.title} <span className="text-gray-600">@</span> {result.company}</p>

                <div className="space-y-4">
                  <div className="group/item flex justify-between items-center p-4 bg-black/50 border border-white/5 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-sm text-gray-200">{result.email}</span>
                    </div>
                    <Copy className="w-4 h-4 text-gray-600 group-hover/item:text-white transition-colors" />
                  </div>

                  <div className="group/item flex justify-between items-center p-4 bg-black/50 border border-white/5 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-sm text-gray-200">{result.phone}</span>
                    </div>
                    <Copy className="w-4 h-4 text-gray-600 group-hover/item:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: AI Intelligence */}
            <div className="lg:col-span-7 bg-gradient-to-b from-blue-900/20 to-black border border-blue-500/30 p-8 rounded-3xl relative">
               <div className="flex justify-between items-start mb-6">
                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                    <Sparkles className="w-3 h-3" /> Gemini 1.5 Pro
                 </span>
               </div>

               <div className="mb-8">
                 <h4 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Generated Icebreaker</h4>
                 <p className="text-xl md:text-2xl font-medium leading-relaxed text-white italic">
                   &quot;{result.opener}&quot;
                 </p>
               </div>

               <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all">
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