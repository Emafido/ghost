"use client";
import { useState } from "react";
import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { GHOST_CREDITS_ADDRESS, GHOST_CREDITS_ABI } from "../constants";
import { Copy, User, Trophy, Users, History } from "lucide-react";

export default function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [myNewCode, setMyNewCode] = useState("");

  // 1. READ: Get Reputation (Score & Level)
  const { data: reputation } = useReadContract({
    address: GHOST_CREDITS_ADDRESS,
    abi: GHOST_CREDITS_ABI,
    functionName: "getReputation",
    args: [address as `0x${string}`],
  });

  // 2. READ: Get Referral Info
  const { data: referralInfo } = useReadContract({
    address: GHOST_CREDITS_ADDRESS,
    abi: GHOST_CREDITS_ABI,
    functionName: "getReferralInfo",
    args: [address as `0x${string}`],
  });

  // 3. READ: Search Count
  const { data: searchCount } = useReadContract({
    address: GHOST_CREDITS_ADDRESS,
    abi: GHOST_CREDITS_ABI,
    functionName: "getSearchCount",
    args: [address as `0x${string}`],
  });

  // 4. WRITE: Create Referral Code
  const handleCreateCode = () => {
    writeContract({
      address: GHOST_CREDITS_ADDRESS,
      abi: GHOST_CREDITS_ABI,
      functionName: "createReferralCode",
      args: [myNewCode],
    });
  };

  // 5. WRITE: Use Referral Code
  const handleRedeemCode = () => {
    writeContract({
      address: GHOST_CREDITS_ADDRESS,
      abi: GHOST_CREDITS_ABI,
      functionName: "useReferralCode",
      args: [referralCodeInput],
    });
  };

  if (!isOpen || !address) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#111] border border-white/10 w-full max-w-lg rounded-3xl p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600/20 rounded-full text-blue-500"><User className="w-6 h-6" /></div>
          <div>
            <h2 className="text-xl font-bold text-white">Ghost ID</h2>
            <p className="text-xs font-mono text-gray-500">{address}</p>
          </div>
        </div>

        {/* REPUTATION STATS */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-yellow-500 mb-1"><Trophy className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Reputation</span></div>
            <div className="text-2xl font-black text-white">{reputation ? reputation[0].toString() : "0"}</div>
            <div className="text-xs text-gray-500">Level {reputation ? reputation[1].toString() : "0"} Agent</div>
          </div>
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-purple-500 mb-1"><History className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Total Searches</span></div>
            <div className="text-2xl font-black text-white">{searchCount ? searchCount.toString() : "0"}</div>
            <div className="text-xs text-gray-500">Lifetime Intel</div>
          </div>
        </div>

        {/* REFERRAL SYSTEM */}
        <div className="space-y-4">
          <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-blue-400 mb-2"><Users className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Your Referral Network</span></div>
            
            {/* Show My Code or Create Input */}
            {referralInfo && referralInfo[0] ? (
              <div className="flex justify-between items-center bg-black/50 p-3 rounded-lg border border-white/5">
                <div>
                  <p className="text-xs text-gray-400">Your Code</p>
                  <p className="text-lg font-mono font-bold text-white">{referralInfo[0]}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Refers</p>
                  <p className="text-lg font-bold text-white">{referralInfo[1].toString()}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Create your code (e.g. GHOST007)" 
                  className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-blue-500"
                  value={myNewCode}
                  onChange={(e) => setMyNewCode(e.target.value)}
                />
                <button onClick={handleCreateCode} className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-500">Create</button>
              </div>
            )}
          </div>

          {/* Redeem Code Section */}
          <div className="bg-white/5 p-4 rounded-xl">
             <p className="text-xs text-gray-400 mb-2">Redeem a Referral Code (+Bonus Credits)</p>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter friend's code..." 
                  className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-white"
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value)}
                />
                <button onClick={handleRedeemCode} className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200">Redeem</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}