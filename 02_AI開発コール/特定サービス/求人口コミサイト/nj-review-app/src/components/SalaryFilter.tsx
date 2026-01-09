"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SalaryFilter({ currentMin, currentMax }: { currentMin?: string, currentMax?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMinChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "none") {
      params.delete("min_pay");
    } else {
      params.set("min_pay", val);
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleMaxChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "none") {
      params.delete("max_pay");
    } else {
      params.set("max_pay", val);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="space-y-4 border-t pt-6">
      <h4 className="font-bold text-sm">給与条件 (時給)</h4>
      <div className="space-y-4">
        <select 
          className="w-full bg-muted border-none rounded-xl px-4 py-3 text-sm outline-none appearance-none cursor-pointer"
          value={currentMin || "none"}
          onChange={(e) => handleMinChange(e.target.value)}
        >
          <option value="none">下限なし</option>
          <option value="3000">¥3,000〜</option>
          <option value="5000">¥5,000〜</option>
          <option value="7000">¥7,000〜</option>
          <option value="10000">¥10,000〜</option>
        </select>
        <div className="text-center text-muted-foreground text-xs">〜</div>
        <select 
          className="w-full bg-muted border-none rounded-xl px-4 py-3 text-sm outline-none appearance-none cursor-pointer"
          value={currentMax || "none"}
          onChange={(e) => handleMaxChange(e.target.value)}
        >
          <option value="none">上限なし</option>
          <option value="5000">〜¥5,000</option>
          <option value="10000">〜¥10,000</option>
          <option value="15000">〜¥15,000</option>
        </select>
      </div>
    </section>
  );
}









