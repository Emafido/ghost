"use client";
import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { 
  useAccount, 
  useConnect, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain 
} from "wagmi";
import { parseEther } from "viem";
import { Search, Copy, Zap, Mail, Globe, Sparkles, CheckCircle2, Wallet, History, AlertCircle, User, Trophy, Users, X } from "lucide-react";
import { GHOST_CREDITS_ADDRESS } from "./constants";

// 🌐 CONFIGURATION
const API_BASE = "https://ghost-intel-backend.onrender.com/api";

// --- TYPES & INTERFACES ---
type ReputationResult = readonly [bigint, bigint]; 
type ReferralResult = readonly [string, bigint, string]; 

const GHOST_CREDITS_ABI = [
  { inputs: [{ name: "user", type: "address" }], name: "getCredits", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getReputation", outputs: [{ name: "score", type: "uint256" }, { name: "level", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getReferralInfo", outputs: [{ name: "code", type: "string" }, { name: "count", type: "uint256" }, { name: "referrer", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getSearchCount", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "purchaseCreditsETH", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "code", type: "string" }], name: "createReferralCode", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "code", type: "string" }], name: "useReferralCode", outputs: [], stateMutability: "nonpayable", type: "function" },
] as const;

interface BackendResponse {
  data: {
    fullName: string;
    jobTitle: string;
    companyName: string;
    email: string;
    phone: string;
    opener: string;
  };
}

export default function GhostIntel() {
  // 1. Hydration Fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Web3 Hooks & Network Checks
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { writeContract, data: hash, isPending: isTxPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  
  // Base Sepolia Network Logic
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isWrongNetwork = chainId !== 84532; // 84532 is Base Sepolia

  // 3. READ: Get Credits & Profile Data
  const { data: creditBalance, refetch: refetchCredits } = useReadContract({
    address: GHOST_CREDITS_ADDRESS,
    abi: GHOST_CREDITS_ABI,
    functionName: "getCredits",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: reputationRaw } = useReadContract({
    address: GHOST_CREDITS_ADDRESS,
    abi: GHOST_CREDITS_ABI,
    functionName: "getReputation",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const reputation = reputationRaw as ReputationResult | undefined;

  const { data: searchCount } = useReadContract({
    address: GHOST_CREDITS_ADDRESS,
    abi: GHOST_CREDITS_ABI,
    functionName: "getSearchCount",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: referralInfoRaw } = useReadContract({
    address: GHOST_CREDITS_ADDRESS,
    abi: GHOST_CREDITS_ABI,
    functionName: "getReferralInfo",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const referralInfo = referralInfoRaw as ReferralResult | undefined;

  // 4. Local State
  const [url, setUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult] = useState<BackendResponse["data"] | null>(null);
  const [error, setError] = useState("");
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [myNewCode, setMyNewCode] = useState("");
  const [friendCode, setFriendCode] = useState("");

  // 5. Search Logic
  const handleSearch = async () => {
    if (!url) return;
    if (!isConnected || !address) {
      alert("Please connect your wallet first!");
      return;
    }
    if (isWrongNetwork) {
      alert("Please switch to Base Sepolia Network first.");
      if (switchChain) switchChain({ chainId: 84532 });
      return;
    }
    
    const balance = creditBalance ? Number(creditBalance) : 0;
    if (balance < 1) {
      setError("Insufficient Credits. Please top up.");
      setShowBuyModal(true);
      return;
    }

    setIsSearching(true);
    setResult(null);
    setError("");
    setLoadingStep("Handshaking with Ghost Backend...");
    
    try {
      const response = await axios.post(`${API_BASE}/search`, {
        linkedinUrl: url,
        wallet: address 
      });

      setResult(response.data.data);
      refetchCredits(); 

    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (axiosError.response) {
        if (axiosError.response.status === 402) setError("Insufficient credits!");
        else if (axiosError.response.status === 400) setError("Invalid LinkedIn URL.");
        else setError("Server error. Try again later.");
      } else {
        setError("Network error.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleBuyCredits = () => {
    writeContract({
      address: GHOST_CREDITS_ADDRESS,
      abi: GHOST_CREDITS_ABI,
      functionName: "purchaseCreditsETH",
      value: parseEther("0.001"), 
    });
  };

  const handleCreateCode = () => {
    writeContract({
      address: GHOST_CREDITS_ADDRESS,
      abi: GHOST_CREDITS_ABI,
      functionName: "createReferralCode",
      args: [myNewCode],
    });
  };

  const handleUseCode = () => {
    writeContract({
      address: GHOST_CREDITS_ADDRESS,
      abi: GHOST_CREDITS_ABI,
      functionName: "useReferralCode",
      args: [friendCode],
    });
  };

  useEffect(() => {
    if (isConfirmed) {
      refetchCredits();
      setShowBuyModal(false);
    }
  }, [isConfirmed, refetchCredits]);

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-hidden relative font-sans">
      
      {/* Background Ambience - Tailwind v4 classes applied */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto flex justify-between items-center py-8 px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="text-xl font-black tracking-widest uppercase bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
            Ghost Intel
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Hydration Fix: Only show connected state if mounted on client */}
          {mounted && isConnected ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#111] rounded-full border border-white/10">
                <Zap className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-sm font-bold text-white">
                  {creditBalance ? creditBalance.toString() : "0"} Credits
                </span>
                <button 
                  onClick={() => setShowBuyModal(true)}
                  className="ml-2 text-xs bg-blue-600 px-2 py-0.5 rounded text-white font-bold hover:bg-blue-500 transition"
                >
                  + BUY
                </button>
              </div>
              
              {/* Profile Button - Now shows Red if wrong network */}
              <button 
                onClick={() => {
                  if (isWrongNetwork && switchChain) {
                    switchChain({ chainId: 84532 });
                  } else {
                    setShowProfileModal(true);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${
                  isWrongNetwork ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-[#111] border-white/10 hover:bg-white/5"
                }`}
              >
                <div className={`w-2 h-2 rounded-full animate-pulse ${isWrongNetwork ? "bg-red-500" : "bg-green-500"}`} />
                <span className="text-xs font-mono">
                  {isWrongNetwork ? "Wrong Network" : address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
                </span>
              </button>
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
            Total <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-500">Recall</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            Instant lead enrichment powered by <span className="text-white font-bold">FullEnrich</span> & <span className="text-white font-bold">Gemini AI</span>.
            <span className="block mt-2 text-sm text-gray-500">Secured on Base Sepolia Network.</span>
          </p>
        </div>

        <div className="relative group max-w-2xl mx-auto">
          <div className={`absolute -inset-0.5 bg-linear-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500 ${isSearching ? 'opacity-50 animate-pulse' : ''}`}></div>
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
              disabled={isSearching || isWrongNetwork}
            />
            <div className="pr-2">
              <button 
                onClick={handleSearch}
                disabled={!url || isSearching || isWrongNetwork}
                className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
                  url && !isSearching && !isWrongNetwork
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSearching ? 'Decrypting...' : 'Decrypt'}
              </button>
            </div>
          </div>
        </div>

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
            <div className="lg:col-span-5 bg-[#111] border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Globe className="w-32 h-32 text-white rotate-12" /></div>
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-500/20 mb-6">
                  <CheckCircle2 className="w-3 h-3" /> Verified Identity
                </span>
                <h3 className="text-3xl font-bold text-white mb-2">{result.fullName}</h3>
                <p className="text-gray-400 text-lg mb-8">{result.jobTitle} <span className="text-gray-600">@</span> {result.companyName}</p>
                <div className="flex justify-between items-center p-4 bg-black/50 border border-white/5 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer group/item"
                       onClick={() => navigator.clipboard.writeText(result.email)}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Mail className="w-5 h-5" /></div>
                    <span className="font-mono text-sm text-gray-200">{result.email}</span>
                  </div>
                  <Copy className="w-4 h-4 text-gray-600 group-hover/item:text-white" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-linear-to-b from-blue-900/10 to-black border border-blue-500/20 p-8 rounded-3xl relative flex flex-col justify-between">
               <div>
                 <div className="flex justify-between items-start mb-6">
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                      <Sparkles className="w-3 h-3" /> Gemini 1.5 Pro
                   </span>
                   <button className="text-gray-500 hover:text-white transition"><History className="w-4 h-4" /></button>
                 </div>
                 <div className="mb-8">
                   <h4 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Icebreaker Strategy</h4>
                   {/* ESLint Fix: Quotations are now properly escaped! */}
                   <p className="text-xl md:text-2xl font-medium leading-relaxed text-white italic">&quot;{result.opener}&quot;</p>
                 </div>
               </div>
               <button onClick={() => navigator.clipboard.writeText(result.opener)}
                 className="w-full py-4 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-500 rounded-xl font-bold text-blue-400 hover:text-white transition-all flex items-center justify-center gap-2">
                 <Copy className="w-4 h-4" /> Copy to Clipboard
               </button>
            </div>
          </div>
        </section>
      )}

      {/* --- MODALS --- */}

      {/* BUY CREDITS MODAL */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowBuyModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4"><Zap className="w-8 h-8 text-blue-500 fill-current" /></div>
              <h2 className="text-2xl font-bold text-white mb-2">Top Up Credits</h2>
              <p className="text-gray-400">0.001 ETH = 1 Credit</p>
            </div>
            
            {/* Network Smart Button */}
            <button 
              onClick={() => {
                if (isWrongNetwork && switchChain) {
                  switchChain({ chainId: 84532 });
                } else {
                  handleBuyCredits();
                }
              }}
              disabled={isTxPending || isConfirming}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all disabled:opacity-50 flex justify-center items-center gap-2 ${
                isWrongNetwork ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {isWrongNetwork 
                ? "⚠️ Switch to Base Sepolia" 
                : isTxPending 
                  ? "Check Wallet..." 
                  : isConfirming 
                    ? "Confirming..." 
                    : "Confirm Purchase"}
            </button>

          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#111] border border-white/10 w-full max-w-lg rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-600/20 rounded-full text-blue-500"><User className="w-6 h-6" /></div>
              <div>
                <h2 className="text-xl font-bold text-white">Ghost ID</h2>
                <p className="text-xs font-mono text-gray-500">{address}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-yellow-500 mb-1"><Trophy className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Reputation</span></div>
                <div className="text-2xl font-black text-white">{reputation ? reputation[0].toString() : "0"}</div>
                <div className="text-xs text-gray-500">Level {reputation ? reputation[1].toString() : "0"} Agent</div>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-purple-500 mb-1"><History className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Total Searches</span></div>
                <div className="text-2xl font-black text-white">{searchCount ? searchCount.toString() : "0"}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-blue-400 mb-2"><Users className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Your Referral Network</span></div>
                {referralInfo && referralInfo[0] ? (
                  <div className="flex justify-between items-center bg-black/50 p-3 rounded-lg border border-white/5">
                    <div><p className="text-xs text-gray-400">Your Code</p><p className="text-lg font-mono font-bold text-white">{referralInfo[0]}</p></div>
                    <div className="text-right"><p className="text-xs text-gray-400">Refers</p><p className="text-lg font-bold text-white">{referralInfo[1].toString()}</p></div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" placeholder="Create code (e.g. GHOST007)" className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-blue-500" value={myNewCode} onChange={(e) => setMyNewCode(e.target.value)} />
                    <button onClick={handleCreateCode} disabled={isTxPending} className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-500">Create</button>
                  </div>
                )}
              </div>

              <div className="bg-white/5 p-4 rounded-xl">
                 <p className="text-xs text-gray-400 mb-2">Redeem a Referral Code (+Bonus Credits)</p>
                 <div className="flex gap-2">
                    <input type="text" placeholder="Enter friend's code..." className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-white" value={friendCode} onChange={(e) => setFriendCode(e.target.value)} />
                    <button onClick={handleUseCode} disabled={isTxPending} className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200">Redeem</button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}