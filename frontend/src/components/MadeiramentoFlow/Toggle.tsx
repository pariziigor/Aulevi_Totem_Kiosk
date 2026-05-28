import React from "react";
import { motion } from "framer-motion";

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: () => void;
}

export const Toggle: React.FC<ToggleProps> = ({ label, value, onChange }) => (
  <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-4 md:p-5 flex items-center justify-between gap-4 md:gap-6 shadow-sm">
    <span className="text-sm md:text-lg xl:text-xl font-bold text-slate-700 uppercase tracking-tight flex-1">
      {label}
    </span>
    <div className="flex items-center gap-3 md:gap-4 shrink-0">
      <span className={`text-sm md:text-lg font-black transition-colors ${!value ? "text-slate-800" : "text-slate-300"}`}>
        NÃO
      </span>
      <button
        type="button"
        onClick={onChange}
        className={`w-14 md:w-20 xl:w-24 h-8 md:h-10 xl:h-12 rounded-full p-1 md:p-1.5 flex items-center cursor-pointer transition-colors duration-300 shadow-inner ${value ? "bg-orange-500 justify-end" : "bg-slate-300 justify-start"}`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className="w-6 h-6 md:w-7 md:h-7 xl:w-9 xl:h-9 bg-white rounded-full shadow-md"
        />
      </button>
      <span className={`text-sm md:text-lg font-black transition-colors ${value ? "text-orange-600" : "text-slate-300"}`}>
        SIM
      </span>
    </div>
  </div>
);
