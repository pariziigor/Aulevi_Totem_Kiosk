import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Search, X, Check, MapPin } from 'lucide-react';
import { CITY_KEYBOARD_LAYOUT } from '../constants/lsfFlowConstants';

interface CitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filteredCities: string[];
  isLoading: boolean;
  onSelectCity: (city: string) => void;
  onConfirmCustomCity: (city: string) => void;
}

const formatNameTitleCase = (text: string) => {
  return text.replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
};

export const CitySearchModal: React.FC<CitySearchModalProps> = ({
  isOpen,
  onClose,
  searchValue,
  onSearchChange,
  filteredCities,
  isLoading,
  onSelectCity,
  onConfirmCustomCity
}) => {
  if (!isOpen) return null;

  const handleCityKeyPress = (key: string) => {
    if (key === 'APAGAR') {
      onSearchChange(searchValue.slice(0, -1));
    } else {
      onSearchChange(formatNameTitleCase(searchValue + key.toLowerCase()));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4 xl:p-8 select-none"
    >
      <div className="bg-slate-50 w-full max-w-5xl rounded-2xl md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden h-[90vh] lg:h-auto lg:max-h-[1000px]">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center flex-none">
          <h3 className="text-lg md:text-2xl font-bold text-slate-800 uppercase flex items-center gap-2">
            <Search className="text-orange-500 w-5 h-5 md:w-6 md:h-6" /> Buscar Cidade
          </h3>
          <button onClick={onClose} className="bg-slate-100 text-slate-600 p-2 md:p-3 rounded-full hover:bg-slate-200">
            <X className="w-5 h-5 md:w-7 md:h-7" />
          </button>
        </header>

        {/* Search Input */}
        <div className="p-4 md:p-6 bg-white border-b border-slate-100 flex-none">
          <div className="w-full bg-slate-50 border-2 border-orange-500 ring-2 md:ring-4 ring-orange-50 rounded-xl md:rounded-2xl h-14 md:h-16 xl:h-20 flex items-center px-4 md:px-6 shadow-inner relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(formatNameTitleCase(e.target.value))}
              placeholder="Digite o nome da cidade..."
              className="w-full h-full bg-transparent outline-none text-lg md:text-2xl xl:text-3xl font-bold text-slate-800"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 lg:flex-none h-auto lg:h-48 xl:h-64 overflow-y-auto bg-slate-100 p-3 md:p-4 flex flex-col gap-2 custom-scrollbar">
          {searchValue.length > 0 ? (
            filteredCities.length > 0 ? (
              filteredCities.slice(0, 15).map((city, idx) => (
                <button 
                  key={idx}
                  onClick={() => onSelectCity(city)}
                  className="w-full text-left bg-white px-4 md:px-6 py-3 md:py-4 rounded-xl border border-slate-200 text-sm md:text-xl font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all shadow-sm flex items-center gap-2 md:gap-3 flex-none"
                >
                  <MapPin className="text-slate-400 w-5 h-5 md:w-6 md:h-6 flex-shrink-0" /> <span className="truncate">{city}</span>
                </button>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-base md:text-xl text-slate-400 font-medium">Nenhuma cidade encontrada...</div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-base md:text-xl text-slate-400 font-medium text-center px-4">Comece a digitar para ver os resultados</div>
          )}
        </div>

        {/* Virtual Keyboard (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-none bg-white p-6 flex-col justify-center gap-2 xl:gap-3">
          {CITY_KEYBOARD_LAYOUT.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-2 xl:gap-3 w-full">
              {row.map((key) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.95, backgroundColor: "#f1f5f9" }}
                  onClick={() => handleCityKeyPress(key)}
                  className={`flex items-center justify-center border border-slate-200 rounded-xl h-14 xl:h-16 text-lg xl:text-xl font-bold uppercase shadow-sm transition-colors hover:border-orange-300
                    ${key === 'APAGAR' ? "flex-[1.5] bg-slate-200 text-slate-700 hover:bg-slate-300" : "flex-1 bg-white text-slate-700"}
                  `}
                >
                  {key}
                </motion.button>
              ))}
            </div>
          ))}
          <div className="flex justify-center w-full mt-1">
            <motion.button
              whileTap={{ scale: 0.95, backgroundColor: "#f1f5f9" }}
              onClick={() => onSearchChange(searchValue + ' ')}
              className="w-full border border-slate-200 rounded-xl h-14 xl:h-16 text-lg xl:text-xl font-bold uppercase shadow-sm bg-white text-slate-700 hover:border-orange-300 transition-colors"
            >
              ESPAÇO
            </motion.button>
          </div>
          
          <div className="mt-4 flex justify-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onConfirmCustomCity(searchValue)}
              className="bg-slate-800 text-white px-8 py-4 rounded-xl text-lg font-bold uppercase shadow-md hover:bg-slate-900 flex items-center gap-2"
            >
              <Check size={24} /> Confirmar Nome Digitado
            </motion.button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
