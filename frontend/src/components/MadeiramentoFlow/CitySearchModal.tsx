import React from "react";
import { motion } from "framer-motion";
import { Check, MapPin, Search, X } from "lucide-react";
import { CITY_KEYBOARD_LAYOUT } from "../../constants/madeiramentoFlowConstants";
import { formatTitleCase } from "../../utils/textFormat";

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

export const CitySearchModal: React.FC<CitySearchModalProps> = ({
  isOpen,
  onClose,
  searchValue,
  onSearchChange,
  filteredCities,
  isLoading,
  onSelectCity,
  onConfirmCustomCity,
}) => {
  if (!isOpen) return null;

  const handleKey = (key: string) => {
    if (key === "APAGAR") {
      onSearchChange(searchValue.slice(0, -1));
      return;
    }

    onSearchChange(formatTitleCase(searchValue + key.toLowerCase()));
  };

  const displayCities = filteredCities.slice(0, 15);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4 lg:p-6 select-none"
    >
      <div className="bg-slate-50 w-full max-w-4xl rounded-2xl md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden h-[90vh] lg:h-auto lg:max-h-[900px]">
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center flex-none">
          <h3 className="text-lg md:text-2xl font-bold text-slate-800 uppercase flex items-center gap-2">
            <Search className="text-orange-500 w-5 h-5 md:w-6 md:h-6" /> Buscar Cidade
          </h3>
          <button type="button" onClick={onClose} className="bg-slate-100 text-slate-600 p-2 md:p-3 rounded-full hover:bg-slate-200">
            <X className="w-5 h-5 md:w-7 md:h-7" />
          </button>
        </header>

        <div className="p-4 md:p-6 bg-white border-b border-slate-100 flex-none">
          <div className="w-full bg-slate-50 border-2 border-orange-500 ring-2 md:ring-4 ring-orange-50 rounded-xl md:rounded-2xl h-14 md:h-16 lg:h-16 flex items-center px-4 md:px-6 shadow-inner relative">
            <input
              type="text"
              value={searchValue}
              onChange={(event) => onSearchChange(formatTitleCase(event.target.value))}
              placeholder="Digite o nome da cidade..."
              className="w-full h-full bg-transparent outline-none text-lg md:text-2xl lg:text-2xl font-bold text-slate-800"
            />
          </div>
        </div>

        <div className="flex-1 lg:flex-none h-auto lg:h-48 xl:h-56 overflow-y-auto bg-slate-100 p-3 md:p-4 flex flex-col gap-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-base md:text-xl text-slate-400 font-medium">
              Carregando cidades...
            </div>
          ) : searchValue.length > 0 ? (
            displayCities.length > 0 ? (
              displayCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => onSelectCity(city)}
                  className="w-full text-left bg-white px-4 md:px-6 py-3 md:py-4 rounded-xl border border-slate-200 text-sm md:text-xl font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all shadow-sm flex items-center gap-2 md:gap-3 flex-none"
                >
                  <MapPin className="text-slate-400 w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                  <span className="truncate">{city}</span>
                </button>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-base md:text-xl text-slate-400 font-medium">
                Nenhuma cidade encontrada...
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-base md:text-xl text-slate-400 font-medium text-center px-4">
              Comece a digitar para ver os resultados
            </div>
          )}
        </div>

        <div className="hidden lg:flex flex-none bg-white p-6 flex-col justify-center gap-2 xl:gap-3">
          {CITY_KEYBOARD_LAYOUT.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-2 xl:gap-3 w-full">
              {row.map((key) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleKey(key)}
                  className={`flex items-center justify-center border border-slate-200 rounded-xl h-14 lg:h-14 text-lg lg:text-lg font-bold uppercase shadow-sm transition-colors hover:border-orange-300
                    ${key === "APAGAR" ? "flex-[1.5] bg-slate-200 text-slate-700 hover:bg-slate-300" : "flex-1 bg-white text-slate-700"}`}
                >
                  {key}
                </motion.button>
              ))}
            </div>
          ))}

          <div className="flex justify-center w-full mt-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => onSearchChange(`${searchValue} `)}
              className="w-full border border-slate-200 rounded-xl h-14 lg:h-14 text-lg lg:text-lg font-bold uppercase shadow-sm bg-white text-slate-700 hover:border-orange-300 transition-colors"
            >
              ESPAÇO
            </motion.button>
          </div>
          <div className="mt-4 flex justify-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
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
