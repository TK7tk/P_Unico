"use client";

import { useState } from "react";
import { Search, MapPin, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function HeroSearch() {
  const [area, setArea] = useState("");
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (area) params.append("area", area);
    if (keyword) params.append("q", keyword);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="max-w-2xl mx-auto flex items-center bg-white rounded-full p-2 shadow-xl border-primary/20 border"
    >
      <div className="flex-1 flex items-center px-4 gap-2 border-r">
        <MapPin className="w-5 h-5 text-primary" />
        <input 
          type="text" 
          placeholder="エリア・駅で探す" 
          className="w-full bg-transparent outline-none text-sm py-2"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>
      <div className="flex-1 flex items-center px-4 gap-2">
        <Building2 className="w-5 h-5 text-primary" />
        <input 
          type="text" 
          placeholder="店名・キーワード" 
          className="w-full bg-transparent outline-none text-sm py-2"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>
      <button 
        onClick={handleSearch}
        className="bg-primary hover:bg-primary-dark text-white p-3 rounded-full transition-transform active:scale-95"
      >
        <Search className="w-6 h-6" />
      </button>
    </motion.div>
  );
}









