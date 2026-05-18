import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronDown } from "lucide-react";

interface LeadCaptureModalProps {
  onConfirm: (name: string, phone: string) => void;
  onCancel: () => void;
}

interface CountryDDI {
  code: string;
  flagUrl: string; // Trocamos o emoji pela URL da imagem
  name: string;
  cca2?: string;
}

interface RestCountryResponse {
  name: { common: string; };
  cca2: string;
  idd: { root?: string; suffixes?: string[]; };
  flags: { svg: string; }; // Nova tipagem para pegar a imagem
  translations?: { por?: { common: string; }; };
}

// Fallback agora usa imagens da flagcdn (mesma CDN oficial da API)
const FALLBACK_COUNTRIES: CountryDDI[] = [
  { code: "+55", flagUrl: "https://flagcdn.com/br.svg", name: "Brasil", cca2: "BR" },
  { code: "+1", flagUrl: "https://flagcdn.com/us.svg", name: "EUA/Canadá", cca2: "US" },
  { code: "+351", flagUrl: "https://flagcdn.com/pt.svg", name: "Portugal", cca2: "PT" },
  { code: "+54", flagUrl: "https://flagcdn.com/ar.svg", name: "Argentina", cca2: "AR" },
];

const formatNameTitleCase = (text: string) => {
  return text.replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
};

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  onConfirm,
  onCancel,
}) => {
  const [inputName, setInputName] = useState<string>("");
  const [inputPhone, setInputPhone] = useState<string>("");
  const [activeInput, setActiveInput] = useState<"name" | "phone">("name");
  const [lgpdConsent, setLgpdConsent] = useState<boolean>(false);
  
  const [countries, setCountries] = useState<CountryDDI[]>(FALLBACK_COUNTRIES);
  const [selectedDDI, setSelectedDDI] = useState<CountryDDI>(FALLBACK_COUNTRIES[0]);
  const [showDdiDropdown, setShowDdiDropdown] = useState<boolean>(false);
  const [isLoadingDDI, setIsLoadingDDI] = useState<boolean>(true);

  useEffect(() => {
    const fetchGlobalCountries = async () => {
      try {
        // Pedimos "flags" ao invés de "flag"
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,idd,flags,translations,cca2");
        if (!response.ok) throw new Error("Falha ao acessar API de países");
        
        const data: RestCountryResponse[] = await response.json();
        
        let globalList: CountryDDI[] = data
          .filter((c) => c.idd && c.idd.root)
          .map((c) => {
            let code = c.idd.root || "";
            if (c.idd.suffixes && c.idd.suffixes.length === 1) {
              code += c.idd.suffixes[0];
            }
            return {
              code: code,
              flagUrl: c.flags.svg, // Pega a imagem vetorizada perfeita
              name: c.translations?.por?.common || c.name.common,
              cca2: c.cca2
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        globalList = globalList.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i);

        setCountries(globalList);

        const brazil = globalList.find((c) => c.cca2 === "BR");
        if (brazil) setSelectedDDI(brazil);

      } catch (error) {
        console.error("Erro ao buscar DDIs globais. Mantendo lista de fallback.", error);
      } finally {
        setIsLoadingDDI(false);
      }
    };

    fetchGlobalCountries();
  }, []);

  const handleKeyPress = (key: string) => {
    if (key === "APAGAR") {
      if (activeInput === "name") setInputName((prev) => prev.slice(0, -1));
      if (activeInput === "phone") setInputPhone((prev) => prev.slice(0, -1));
      return;
    }

    if (key === "ESPAÇO") {
      if (activeInput === "name") setInputName((prev) => prev + " ");
      return;
    }

    const finalKey = key.toLowerCase();

    if (activeInput === "name") {
      if (inputName.length < 50) {
        setInputName((prev) => formatNameTitleCase(prev + finalKey));
      }
    } else {
      if (/[0-9]/.test(finalKey) && inputPhone.length < 15) {
        setInputPhone((prev) => prev + finalKey);
      }
    }
  };

  const handleSubmit = () => {
    if (
      inputName.length > 2 &&
      inputPhone.length >= 8 && 
      lgpdConsent === true
    ) {
      const fullInternationalPhone = `${selectedDDI.code} ${inputPhone}`;
      onConfirm(inputName, fullInternationalPhone);
    } else {
      alert("ATENÇÃO: Preencha todos os campos corretamente e aceite os termos de uso.");
    }
  };

  const keyboardLayout = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "APAGAR"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  ];

  const renderKey = (key: string) => {
    let flexClass = "flex-1";
    if (key === "APAGAR") { flexClass = "flex-[1.5]"; }

    const isPhoneField = activeInput === "phone";
    const isAllowedInPhone = /^[0-9]$/.test(key) || key === "APAGAR";
    const isDisabled = isPhoneField && !isAllowedInPhone;
    const isSpecialKey = key === "APAGAR";

    return (
      <motion.button
        key={key}
        whileTap={isDisabled ? {} : { scale: 0.95, backgroundColor: "#f1f5f9" }}
        onClick={() => !isDisabled && handleKeyPress(key)}
        disabled={isDisabled}
        className={`${flexClass} flex items-center justify-center border border-slate-200 rounded-lg xl:rounded-xl h-10 xl:h-14 text-sm xl:text-lg font-bold uppercase transition-all shadow-sm
          ${
            isDisabled
              ? "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed shadow-none"
              : isSpecialKey
              ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
              : "bg-white text-slate-700 hover:border-orange-300 hover:shadow-md"
          }
        `}
      >
        {key}
      </motion.button>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 xl:p-8 select-none"
    >
      <div className="bg-slate-50 w-full max-w-6xl h-full max-h-[1080px] rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative">
        
        <header className="bg-white border-b border-slate-200 px-6 xl:px-10 py-4 xl:py-6 flex-none flex flex-col items-center text-center">
          <h2 className="text-2xl xl:text-4xl font-bold tracking-tight text-slate-900 uppercase">
            Identificação Necessária
          </h2>
          <p className="text-base xl:text-xl mt-1 xl:mt-2 text-slate-500 font-medium">
            Informe seus dados para gerar o orçamento detalhado.
          </p>
        </header>

        <div className="flex flex-col gap-3 xl:gap-5 w-full max-w-5xl mx-auto flex-none px-6 xl:px-12 mt-4 xl:mt-6">
          
          <div onClick={() => { setActiveInput("name"); setShowDdiDropdown(false); }} className="flex flex-col gap-1.5 cursor-pointer group">
            <label className="text-sm xl:text-lg font-bold uppercase text-slate-500 ml-2 group-hover:text-orange-600 transition-colors">
              Nome Completo
            </label>
            <div className={`border-2 p-3 xl:p-5 rounded-xl text-xl xl:text-2xl font-bold transition-all min-h-[56px] xl:min-h-[72px] flex items-center shadow-sm ${
                activeInput === "name" ? "border-orange-500 ring-4 ring-orange-50 bg-white text-slate-900" : "border-slate-200 bg-slate-100 text-slate-600 hover:border-orange-300"
              }`}>
              {inputName || <span className="text-slate-400 font-medium">TOQUE PARA DIGITAR</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 group">
            <label className="text-sm xl:text-lg font-bold uppercase text-slate-500 ml-2 group-hover:text-emerald-600 transition-colors">
              WhatsApp (DDD + Número)
            </label>
            
            <div className="flex gap-3 w-full relative z-20">
              <div className="relative">
                <button
                  disabled={isLoadingDDI}
                  onClick={() => setShowDdiDropdown(!showDdiDropdown)}
                  className={`border-2 px-4 xl:px-6 rounded-xl text-xl xl:text-2xl font-bold transition-all h-[56px] xl:h-[72px] flex items-center justify-center gap-3 shadow-sm ${
                    showDdiDropdown ? "border-emerald-500 ring-4 ring-emerald-50 bg-white text-slate-900" : "border-slate-200 bg-slate-100 text-slate-700 hover:border-emerald-300"
                  } ${isLoadingDDI ? "opacity-70 cursor-wait" : ""}`}
                >
                  <img src={selectedDDI.flagUrl} alt={selectedDDI.name} className="w-8 h-auto object-contain rounded-sm shadow-sm" />
                  <span>{selectedDDI.code}</span>
                  <ChevronDown size={20} className="text-slate-400" />
                </button>

                <AnimatePresence>
                  {showDdiDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto custom-scrollbar"
                    >
                      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }`}</style>
                      
                      {countries.map((country, idx) => (
                        <button
                          key={`${country.code}-${idx}`}
                          onClick={() => {
                            setSelectedDDI(country);
                            setShowDdiDropdown(false);
                            setActiveInput("phone");
                          }}
                          className="w-full px-5 py-4 border-b border-slate-50 text-left text-lg font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-4 transition-colors"
                        >
                          <img src={country.flagUrl} alt={country.name} className="w-8 h-auto object-contain rounded-sm shadow-sm" />
                          <span className="w-14 text-slate-500">{country.code}</span>
                          <span className="text-base font-medium truncate flex-1">{country.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div
                onClick={() => { setActiveInput("phone"); setShowDdiDropdown(false); }}
                className={`flex-1 border-2 p-3 xl:p-5 rounded-xl text-xl xl:text-2xl font-bold transition-all h-[56px] xl:h-[72px] flex items-center shadow-sm cursor-pointer ${
                  activeInput === "phone" ? "border-emerald-500 ring-4 ring-emerald-50 bg-white text-slate-900" : "border-slate-200 bg-slate-100 text-slate-600 hover:border-emerald-300"
                }`}
              >
                {inputPhone || <span className="text-slate-400 font-medium">TOQUE PARA DIGITAR O NÚMERO</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1 ml-2">
            <input
              type="checkbox" id="lgpd" checked={lgpdConsent} onChange={(e) => setLgpdConsent(e.target.checked)}
              className="w-6 h-6 xl:w-8 xl:h-8 border-2 border-slate-300 rounded-lg accent-orange-600 cursor-pointer transition-all"
            />
            <label htmlFor="lgpd" className="text-sm xl:text-lg font-medium text-slate-600 cursor-pointer select-none">
              Autorizo o armazenamento dos meus dados (LGPD).
            </label>
          </div>
        </div>

        <div onClick={() => setShowDdiDropdown(false)} className="flex-grow flex flex-col justify-center gap-1.5 xl:gap-2.5 overflow-hidden w-full max-w-5xl mx-auto px-4 xl:px-8 mt-2 mb-4 xl:mb-6 z-10">
          {keyboardLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1.5 xl:gap-2.5 w-full">
              {row.map((key) => renderKey(key))}
            </div>
          ))}
          <div className="flex justify-center gap-1.5 xl:gap-2.5 w-full mt-1">
            <motion.button
              whileTap={activeInput === "phone" ? {} : { scale: 0.98, backgroundColor: "#f1f5f9" }}
              onClick={() => activeInput !== "phone" && handleKeyPress("ESPAÇO")}
              disabled={activeInput === "phone"}
              className={`w-full flex items-center justify-center border border-slate-200 rounded-xl h-12 xl:h-16 text-lg xl:text-xl font-bold uppercase transition-all shadow-sm
                  ${activeInput === "phone" ? "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed shadow-none" : "bg-white text-slate-700 hover:border-orange-300 hover:shadow-md"}
                `}
            >
              ESPAÇO
            </motion.button>
          </div>
        </div>

        <div className="bg-white border-t border-slate-200 px-6 xl:px-10 py-4 xl:py-6 flex justify-between items-center flex-none relative z-20">
          <motion.button whileTap={{ scale: 0.95 }} onClick={onCancel} className="bg-white text-slate-600 border border-slate-200 rounded-full px-6 xl:px-10 py-3 xl:py-4 text-lg xl:text-xl font-bold uppercase hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2">
            <X size={24} /> Cancelar
          </motion.button>
          
          <motion.button
            whileTap={lgpdConsent ? { scale: 0.95 } : {}} onClick={handleSubmit} disabled={lgpdConsent === false}
            className={`rounded-full px-6 xl:px-10 py-3 xl:py-4 text-lg xl:text-xl font-bold uppercase transition-all flex items-center gap-2 shadow-md ${
              lgpdConsent === true ? "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200" : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            <Check size={24} /> Confirmar e Gerar
          </motion.button>
        </div>

      </div>
    </motion.div>
  );
};