import React from 'react';
import { motion } from 'framer-motion';
import { NUMPAD_KEYS } from '../../constants/lsfFlowConstants';

interface NumpadProps {
  value: string;
  onChange: (value: string) => void;
}

export const Numpad: React.FC<NumpadProps> = ({ value, onChange }) => {
  const handleKey = (k: string) => {
    if (k === 'APAGAR') {
      onChange(value.slice(0, -1));
    } else if (value.length < 4) {
      onChange(value + k);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3 lg:gap-3 w-full max-w-[280px] md:max-w-lg lg:max-w-md mx-auto mt-6">
      {NUMPAD_KEYS.map((k: string) => (
        <motion.button 
          key={k} 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleKey(k)} 
          className={`
            bg-white border border-slate-200 shadow-sm rounded-xl md:rounded-2xl flex items-center justify-center h-14 md:h-16 lg:h-16 transition-all hover:shadow-md hover:border-orange-300
            ${k === '0' ? 'col-span-2' : ''}
            ${k === 'APAGAR' ? 'text-sm md:text-lg lg:text-lg font-bold text-rose-500 bg-rose-50/50 hover:bg-rose-100 border-rose-100' : 'text-2xl md:text-3xl lg:text-3xl font-bold text-slate-700'}
          `}
        >
          {k}
        </motion.button>
      ))}
    </div>
  );
};
