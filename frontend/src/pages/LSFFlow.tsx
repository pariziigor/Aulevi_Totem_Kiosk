import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useKioskStore } from '../store/useKioskStore';
import { LeadCaptureModal } from '../components/LeadCaptureModal';
import { KioskService } from '../services/api';
import { ChevronLeft, Check, MapPin, Search, X } from 'lucide-react';

interface IBGEMunicipio {
  nome: string;
  microrregiao?: {
    mesorregiao?: {
      UF?: {
        sigla: string;
      };
    };
  };
}

const formatNameTitleCase = (text: string) => {
  return text.replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
};

const LSFFlow: React.FC = () => {
  const navigate = useNavigate();
  const { quoteData, setQuoteData, resetSession } = useKioskStore();
  
  const [step, setStep] = useState(0);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [allCities, setAllCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios?ordenacao=nome");
        if (!response.ok) throw new Error("Falha ao buscar cidades");
        
        const data: IBGEMunicipio[] = await response.json();
        
        const formattedCities = data.map(item => {
          const uf = item.microrregiao?.mesorregiao?.UF?.sigla;
          return uf ? `${item.nome} - ${uf}` : item.nome;
        });
        
        setAllCities(formattedCities);
      } catch (error) {
        console.error("Erro ao carregar lista de cidades do IBGE:", error);
        setAllCities(["São Paulo - SP", "Rio de Janeiro - RJ", "Belo Horizonte - MG", "Curitiba - PR"]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  const handleNext = () => {
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleCancelOperation = () => {
    resetSession();
    navigate('/');
  };

  const submitQuoteFlow = async (name: string, phone: string) => {
    setIsProcessing(true);
    try {
      const payload = {
        module: 'LSF',
        lead_name: name,
        lead_phone: phone,
        tipo: quoteData.tipo,
        padrao: quoteData.padrao,
        has_facade: quoteData.has_facade ?? false,
        has_project: quoteData.has_project ?? false,
        has_land: quoteData.has_land ?? false,
        own_resources: quoteData.own_resources ?? false,
        city: quoteData.city || 'Não informado',
        area: parseFloat(quoteData.area)
      };

      await KioskService.submitQuote(payload);
      
      alert(`ORÇAMENTO GERADO COM SUCESSO!\n\nO arquivo PDF com o detalhamento completo do Light Steel Frame foi baixado.`);
      
      resetSession();
      navigate('/');
    } catch (error) {
      console.error("Falha na comunicação com a API:", error);
      alert("ERRO: Falha ao processar orçamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const Numpad = () => {
    const keys = ['1','2','3','4','5','6','7','8','9','0','APAGAR'];
    const handleKey = (k: string) => {
      if (k === 'APAGAR') setQuoteData({ area: quoteData.area.slice(0, -1) });
      else if (quoteData.area.length < 4) setQuoteData({ area: quoteData.area + k });
    };

    return (
      <div className="grid grid-cols-3 gap-2 md:gap-3 xl:gap-4 w-full max-w-[280px] md:max-w-lg mx-auto mt-6">
        {keys.map(k => (
          <motion.button 
            key={k} 
            whileTap={{ scale: 0.95 }}
            onClick={() => handleKey(k)} 
            className={`
              bg-white border border-slate-200 shadow-sm rounded-xl md:rounded-2xl flex items-center justify-center h-14 md:h-16 xl:h-20 transition-all hover:shadow-md hover:border-orange-300
              ${k === '0' ? 'col-span-2' : ''}
              ${k === 'APAGAR' ? 'text-sm md:text-lg xl:text-xl font-bold text-rose-500 bg-rose-50/50 hover:bg-rose-100 border-rose-100' : 'text-2xl md:text-3xl xl:text-4xl font-bold text-slate-700'}
            `}
          >
            {k}
          </motion.button>
        ))}
      </div>
    );
  };

  const Step3Toggle = ({ label, value, onChange }: { label: string, value: boolean, onChange: () => void }) => (
    <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center gap-3 md:gap-5 shadow-sm w-full">
      <span className="text-sm md:text-lg xl:text-xl font-bold text-slate-700 text-center md:h-12 flex items-center uppercase tracking-tight">
        {label}
      </span>
      <div className="flex items-center justify-center gap-3 md:gap-4 xl:gap-6">
        <span className={`text-sm md:text-xl font-black transition-colors duration-300 ${!value ? 'text-slate-800' : 'text-slate-300'}`}>NÃO</span>
        <div
          onClick={onChange}
          className={`w-16 md:w-20 xl:w-28 h-8 md:h-10 xl:h-14 rounded-full p-1 md:p-1.5 flex items-center cursor-pointer transition-colors duration-300 shadow-inner ${value ? 'bg-orange-500 justify-end' : 'bg-slate-300 justify-start'}`}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 700, damping: 30 }}
            className="w-6 h-6 md:w-8 md:h-8 xl:w-11 xl:h-11 bg-white rounded-full shadow-md"
          />
        </div>
        <span className={`text-sm md:text-xl font-black transition-colors duration-300 ${value ? 'text-orange-600' : 'text-slate-300'}`}>SIM</span>
      </div>
    </div>
  );

  const renderCityModal = () => {
    const normalizeText = (text: string) => 
      text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const filteredCities = allCities.filter(c => 
      normalizeText(c).includes(normalizeText(citySearch))
    );

    const cityKeyboard = [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ç"],
      ["z", "x", "c", "v", "b", "n", "m", "-", "APAGAR"]
    ];

    const handleCityKeyPress = (key: string) => {
      if (key === 'APAGAR') {
        setCitySearch(prev => prev.slice(0, -1));
      } else {
        setCitySearch(prev => formatNameTitleCase(prev + key.toLowerCase()));
      }
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4 xl:p-8 select-none"
      >
        <div className="bg-slate-50 w-full max-w-5xl rounded-2xl md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden h-[90vh] lg:h-auto lg:max-h-[1000px]">
          
          <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center flex-none">
            <h3 className="text-lg md:text-2xl font-bold text-slate-800 uppercase flex items-center gap-2">
              <Search className="text-orange-500 w-5 h-5 md:w-6 md:h-6" /> Buscar Cidade
            </h3>
            <button onClick={() => setShowCityModal(false)} className="bg-slate-100 text-slate-600 p-2 md:p-3 rounded-full hover:bg-slate-200">
              <X className="w-5 h-5 md:w-7 md:h-7" />
            </button>
          </header>

          {/* Híbrido: Input nativo que abre teclado no celular, mas aceita cliques do teclado virtual no Totem */}
          <div className="p-4 md:p-6 bg-white border-b border-slate-100 flex-none">
            <div className="w-full bg-slate-50 border-2 border-orange-500 ring-2 md:ring-4 ring-orange-50 rounded-xl md:rounded-2xl h-14 md:h-16 xl:h-20 flex items-center px-4 md:px-6 shadow-inner relative">
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(formatNameTitleCase(e.target.value))}
                placeholder="Digite o nome da cidade..."
                className="w-full h-full bg-transparent outline-none text-lg md:text-2xl xl:text-3xl font-bold text-slate-800"
              />
            </div>
          </div>

          {/* Lista de Resultados Dinâmica */}
          <div className="flex-1 lg:flex-none h-auto lg:h-48 xl:h-64 overflow-y-auto bg-slate-100 p-3 md:p-4 flex flex-col gap-2 custom-scrollbar">
            {citySearch.length > 0 ? (
              filteredCities.length > 0 ? (
                filteredCities.slice(0, 15).map((city, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setQuoteData({ city: city });
                      setCitySearch(city);
                      setShowCityModal(false);
                    }}
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

          {/* Teclado Virtual Exclusivo (Oculto no Celular) */}
          <div className="hidden lg:flex flex-none bg-white p-6 flex-col justify-center gap-2 xl:gap-3">
            {cityKeyboard.map((row, rowIndex) => (
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
                onClick={() => setCitySearch(prev => prev + ' ')}
                className="w-full border border-slate-200 rounded-xl h-14 xl:h-16 text-lg xl:text-xl font-bold uppercase shadow-sm bg-white text-slate-700 hover:border-orange-300 transition-colors"
              >
                ESPAÇO
              </motion.button>
            </div>
            
            <div className="mt-4 flex justify-end">
               <motion.button
                 whileTap={{ scale: 0.95 }}
                 onClick={() => {
                   setQuoteData({ city: citySearch });
                   setShowCityModal(false);
                 }}
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

  const renderStep = () => {
    const stepVariants = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
      exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    switch(step) {
      case 0:
        return (
          <motion.div key="step0" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-2xl md:text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-2 md:mb-4">Informe a Área (m²)</h2>
            <p className="text-slate-500 text-sm md:text-lg xl:text-xl mb-6 md:mb-8 text-center px-4">Digite o tamanho estimado do projeto</p>
            
            <div className="text-5xl md:text-6xl xl:text-8xl font-black text-orange-600 border-b-4 border-slate-200 w-48 md:w-64 text-center pb-2 tracking-tighter">
              {quoteData.area || <span className="text-slate-200">0</span>}
            </div>
            
            <Numpad />
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleNext} disabled={!quoteData.area || parseFloat(quoteData.area) <= 0}
              className="mt-8 md:mt-10 bg-orange-600 text-white rounded-full px-8 md:px-12 py-3 md:py-4 xl:py-5 text-lg md:text-xl xl:text-2xl font-bold disabled:opacity-40 disabled:bg-slate-300 disabled:scale-100 shadow-md hover:bg-orange-700 transition-all flex items-center gap-2"
            >
              Avançar <Check className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-2xl md:text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-6 md:mb-8 xl:mb-12">Selecione o Tipo</h2>
            {/* Grid ajustado: 1 coluna no celular, 2 a partir de telas médias */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 xl:gap-12 w-full max-w-5xl px-4 md:px-0">
              {[
                { label: 'Casa 1 Pavimento', icon: '/assets/menu_lsf/casa_1_pav.png' },
                { label: 'Casa 2 Pavimentos', icon: '/assets/menu_lsf/casa_2_pav.png' }
              ].map(t => (
                <motion.button key={t.label} 
                  whileTap={{ scale: 0.98 }} 
                  onClick={() => { setQuoteData({ tipo: t.label }); handleNext(); }}
                  // Altura adaptável no mobile
                  className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm p-6 md:p-8 xl:p-12 flex flex-col md:flex-row lg:flex-col items-center justify-center lg:justify-center gap-4 md:gap-6 xl:gap-8 h-auto md:h-80 xl:h-[450px] transition-all hover:shadow-xl hover:border-orange-400 hover:text-orange-700 group w-full text-left md:text-center"
                >
                  <div className="w-24 h-24 md:w-40 md:h-40 xl:w-56 xl:h-56 flex items-center justify-center flex-shrink-0">
                    <img src={t.icon} alt={t.label} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-lg md:text-2xl xl:text-4xl font-bold text-slate-700 flex-1">{t.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-2xl md:text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-6 md:mb-8 xl:mb-12">Padrão de Acabamento</h2>
            {/* Grid: 1 col mobile, 2 col md */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 xl:gap-8 w-full max-w-5xl px-4 md:px-0">
              {[
                { label: 'Popular', icon: '/assets/menu_lsf/casa_popular.png' },
                { label: 'Médio', icon: '/assets/menu_lsf/casa_medio.png' },
                { label: 'Alto', icon: '/assets/menu_lsf/casa_alto.png' },
                { label: 'Não se aplica', icon: '/assets/menu_lsf/nao_aplica.png' }
              ].map(p => (
                <motion.button key={p.label} 
                  whileTap={{ scale: 0.98 }} 
                  onClick={() => { setQuoteData({ padrao: p.label }); handleNext(); }}
                  className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm p-4 md:p-6 xl:p-8 flex flex-row lg:flex-col items-center justify-start lg:justify-center gap-4 md:gap-6 h-auto md:h-64 xl:h-80 transition-all hover:shadow-xl hover:border-orange-400 hover:text-orange-700 group w-full text-left md:text-center"
                >
                  <div className="w-16 h-16 md:w-24 md:h-24 xl:w-36 xl:h-36 flex items-center justify-center flex-shrink-0">
                    <img src={p.icon} alt={p.label} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-base md:text-2xl xl:text-3xl font-bold text-slate-700 flex-1">{p.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      case 3: {
        const handleStep3Next = () => {
          if (!quoteData.city || quoteData.city.trim().length < 2) {
            setShowCityModal(true);
          } else {
            handleNext();
          }
        };

        return (
          <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full relative z-0">
            <h2 className="text-2xl md:text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-2 text-center">Qualificação do Projeto</h2>
            <p className="text-slate-500 text-sm md:text-lg xl:text-xl font-medium mb-6 md:mb-8 xl:mb-10 text-center">Precisamos de alguns detalhes finais</p>

            <div className="flex flex-col gap-6 md:gap-8 w-full max-w-4xl px-4 md:px-0">
              {/* Grid: 1 col no mobile, empilha perfeitamente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 xl:gap-6">
                <Step3Toggle label="Fachada Frontal?" value={!!quoteData.has_facade} onChange={() => setQuoteData({ has_facade: !quoteData.has_facade })} />
                <Step3Toggle label="Projeto Arquitetônico?" value={!!quoteData.has_project} onChange={() => setQuoteData({ has_project: !quoteData.has_project })} />
                <Step3Toggle label="Possui Terreno?" value={!!quoteData.has_land} onChange={() => setQuoteData({ has_land: !quoteData.has_land })} />
                <Step3Toggle label="Recurso Próprio?" value={!!quoteData.own_resources} onChange={() => setQuoteData({ own_resources: !quoteData.own_resources })} />
              </div>

              <div className="w-full relative bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm">
                <label className="text-xs md:text-sm xl:text-base font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-orange-500 md:w-5 md:h-5" /> Local da Obra
                </label>
                
                <button 
                  type="button"
                  onClick={() => {
                    setCitySearch(quoteData.city && quoteData.city !== 'Não informado' ? quoteData.city : "");
                    setShowCityModal(true);
                  }}
                  className="w-full text-left pl-4 md:pl-6 pr-3 md:pr-4 py-3 md:py-4 xl:py-5 bg-slate-50 border-2 border-slate-200 rounded-xl md:rounded-2xl text-sm md:text-xl xl:text-2xl font-bold text-slate-800 cursor-pointer hover:border-orange-400 hover:shadow-md transition-all flex items-center justify-between outline-none"
                >
                  <span className={`truncate mr-2 ${quoteData.city ? "text-slate-800" : "text-slate-400"}`}>
                    {quoteData.city || (isLoadingCities ? "Carregando IBGE..." : "Toque para buscar cidade...")}
                  </span>
                  <Search className="text-slate-400 flex-shrink-0 w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

            </div>
            
            <motion.button 
              whileTap={{ scale: 0.95 }} 
              onClick={handleStep3Next} 
              className="mt-8 md:mt-12 relative z-10 w-full max-w-[90%] md:max-w-md mx-auto flex items-center justify-center gap-2 md:gap-3 bg-slate-800 text-white rounded-full px-6 md:px-12 py-3 md:py-4 xl:py-5 text-base md:text-xl xl:text-2xl font-bold shadow-md hover:bg-slate-900 transition-all outline-none"
            >
              Ver Resumo Completo <ChevronLeft className="rotate-180 w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </motion.div>
        );
      }
      case 4: {
        return (
          <motion.div key="step4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full px-4 md:px-0">
            <h2 className="text-2xl md:text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-6 md:mb-8 text-center">Resumo do Pedido</h2>
            
            <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 xl:p-10 shadow-md text-sm md:text-lg xl:text-xl font-medium text-slate-600 flex flex-col gap-3 md:gap-4 xl:gap-5 mb-8 md:mb-10">
              
              <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                <span className="text-slate-400 uppercase font-bold text-xs md:text-sm">Construção</span>
                <span className="font-bold text-slate-800 text-right">{quoteData.tipo} ({quoteData.area} m²)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                <span className="text-slate-400 uppercase font-bold text-xs md:text-sm">Padrão / Fachada</span>
                <span className="font-bold text-slate-800 text-right">{quoteData.padrao} • Fachada: {quoteData.has_facade ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                <span className="text-slate-400 uppercase font-bold text-xs md:text-sm">Localização</span>
                <span className="font-bold text-orange-600 text-right truncate">{quoteData.city}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                <span className="text-slate-400 uppercase font-bold text-xs md:text-sm">Projeto?</span>
                <span className="font-bold text-slate-800 text-right">{quoteData.has_project ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                <span className="text-slate-400 uppercase font-bold text-xs md:text-sm">Terreno?</span>
                <span className="font-bold text-slate-800 text-right">{quoteData.has_land ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between pb-1 gap-4">
                <span className="text-slate-400 uppercase font-bold text-xs md:text-sm">Recurso Próprio?</span>
                <span className="font-bold text-slate-800 text-right">{quoteData.own_resources ? 'Sim' : 'Não'}</span>
              </div>

            </div>

            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowLeadModal(true)} 
              className="bg-orange-600 text-white rounded-full px-6 md:px-10 py-4 md:py-5 xl:py-6 text-lg md:text-2xl xl:text-3xl font-bold w-full max-w-4xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all flex justify-center items-center gap-2 md:gap-3">
              <Check className="w-6 h-6 md:w-8 md:h-8" /> Confirmar e Gerar Orçamento
            </motion.button>
          </motion.div>
        );
      }
      default:
        return null;
    }
  };

  return (
    // min-h-screen permite rolar em telas pequenas. Remove overflow-hidden rígido.
    <div className="min-h-screen lg:h-screen w-full bg-slate-50 text-slate-800 flex flex-col p-4 md:p-6 xl:p-12 select-none overflow-x-hidden lg:overflow-hidden font-sans">
      
      {/* Header Responsivo */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 flex-none w-full gap-4 md:gap-0">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-2xl md:text-3xl xl:text-4xl font-black tracking-tight text-slate-900 uppercase">Light Steel Frame</h1>
          <div className="h-1 w-16 md:w-24 bg-orange-500 rounded-full"></div>
        </div>
        <div className="bg-white border border-slate-200 px-4 md:px-6 py-1.5 md:py-2 rounded-full shadow-sm">
          <span className="text-sm md:text-lg xl:text-xl font-bold text-slate-500">Etapa <span className="text-orange-600">{step + 1}</span> de 5</span>
        </div>
      </header>

      {/* Conteúdo Dinâmico com Padding para não colar no rodapé do mobile */}
      <div className="flex-grow flex items-start md:items-center justify-center relative w-full h-auto lg:h-full lg:min-h-0 pb-10 md:pb-0">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      {/* Footer Responsivo: Empilha botões no mobile */}
      <footer className="mt-4 md:mt-8 flex flex-col-reverse md:flex-row justify-between items-center flex-none w-full relative gap-3 md:gap-0">
        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={handleBack} 
          className="w-full md:w-auto bg-white text-slate-600 border border-slate-200 rounded-full px-6 md:px-8 py-3 md:py-3 xl:px-10 xl:py-4 text-base md:text-lg xl:text-xl font-bold shadow-sm hover:bg-slate-100 transition-colors flex justify-center items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" /> {step === 0 ? 'Cancelar' : 'Voltar'}
        </motion.button>

        {step > 0 && (
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            onClick={handleCancelOperation} 
            className="w-full md:w-auto bg-white text-slate-500 border border-slate-200 rounded-full px-6 md:px-8 py-3 md:py-3 xl:px-10 xl:py-4 text-base md:text-lg xl:text-xl font-bold shadow-sm hover:bg-slate-100 hover:text-slate-800 transition-colors flex justify-center items-center gap-2"
          >
            Cancelar Operação
          </motion.button>
        )}
      </footer>

      <AnimatePresence>
        {showCityModal && renderCityModal()}
      </AnimatePresence>

      {showLeadModal && (
        <LeadCaptureModal onConfirm={submitQuoteFlow} onCancel={() => setShowLeadModal(false)} />
      )}
      
      {isProcessing && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-slate-50/90 backdrop-blur-sm z-[200] flex items-center justify-center flex-col px-4 text-center"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin shadow-md"></div>
          <p className="text-xl md:text-2xl font-bold text-slate-800 mt-6 md:mt-8 tracking-tight">Calculando Materiais...</p>
          <p className="text-sm md:text-base text-slate-500 mt-2">Isso levará apenas alguns segundos</p>
        </motion.div>
      )}
    </div>
  );
};

export default LSFFlow;