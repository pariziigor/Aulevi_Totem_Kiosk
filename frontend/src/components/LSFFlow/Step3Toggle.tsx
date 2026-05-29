import React from 'react';
import { motion } from 'framer-motion';

interface Step3ToggleProps {
  label: string;
  value: boolean;
  onChange: () => void;
}

export const Step3Toggle: React.FC<Step3ToggleProps> = ({ label, value, onChange }) => (
  <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-4 flex flex-col items-center justify-center gap-3 md:gap-4 lg:gap-3 shadow-sm w-full">
    <span className="text-sm md:text-lg lg:text-base font-bold text-slate-700 text-center md:h-10 lg:h-8 flex items-center uppercase tracking-tight">
      {label}
    </span>
    <div className="flex items-center justify-center gap-3 md:gap-4 lg:gap-4">
      <span className={`text-sm md:text-xl font-black transition-colors duration-300 ${!value ? 'text-slate-800' : 'text-slate-300'}`}>NÃO</span>
      <div
        onClick={onChange}
        className={`w-16 md:w-20 lg:w-24 h-8 md:h-10 lg:h-12 rounded-full p-1 md:p-1.5 flex items-center cursor-pointer transition-colors duration-300 shadow-inner ${value ? 'bg-orange-500 justify-end' : 'bg-slate-300 justify-start'}`}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className="w-6 h-6 md:w-8 md:h-8 lg:w-9 lg:h-9 bg-white rounded-full shadow-md"
        />
      </div>
      <span className={`text-sm md:text-xl font-black transition-colors duration-300 ${value ? 'text-orange-600' : 'text-slate-300'}`}>SIM</span>
    </div>
  </div>
);
