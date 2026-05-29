import React from "react";
import { motion } from "framer-motion";

interface NumpadMedidaProps {
  value: string;
  onChange: (value: string) => void;
  maxLen?: number;
}

export const NumpadMedida: React.FC<NumpadMedidaProps> = ({
  value,
  onChange,
  maxLen = 5,
}) => {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "APAGAR"];

  const handleKey = (key: string) => {
    if (key === "APAGAR") {
      onChange(value.slice(0, -1));
      return;
    }

    if (key === "," && value.includes(",")) return;
    if (value.length >= maxLen) return;
    onChange(value + key);
  };

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3 w-full">
      {keys.map((key) => (
        <motion.button
          key={key}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => handleKey(key)}
          className={`
            border shadow-sm rounded-xl md:rounded-2xl flex items-center justify-center h-12 md:h-14 transition-all hover:shadow-md hover:border-orange-300
            ${
              key === "APAGAR"
                ? "text-xs md:text-sm font-bold text-rose-500 bg-rose-50 border-rose-100 hover:bg-rose-100"
                : "text-xl md:text-2xl lg:text-2xl font-bold text-slate-700 bg-white border-slate-200"
            }
          `}
        >
          {key}
        </motion.button>
      ))}
    </div>
  );
};
