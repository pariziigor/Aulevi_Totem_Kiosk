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

// Formatador automático de Maiúsculas
const formatNameTitleCase = (text: string) => {
  return text.replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
};

const LSFFlow: React.FC = () => {
  const navigate = useNavigate();
  const { quoteData, setQuoteData, resetSession } = useKioskStore();
  
  const [step, setStep] = useState(0);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para o Modal da Cidade e API do IBGE
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

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => step > 0 ? setStep((s) => s - 1) : navigate('/');

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

      // O arquivo já é baixado automaticamente aqui dentro
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
      <div className="grid grid-cols-3 gap-3 xl:gap-4 w-full max-w-lg mx-auto mt-6">
        {keys.map(k => (
          <motion.button 
            key={k} 
            whileTap={{ scale: 0.95 }}
            onClick={() => handleKey(k)} 
            className={`
              bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center h-16 xl:h-20 transition-all hover:shadow-md hover:border-orange-300
              ${k === '0' ? 'col-span-2' : ''}
              ${k === 'APAGAR' ? 'text-lg xl:text-xl font-bold text-rose-500 bg-rose-50/50 hover:bg-rose-100 border-rose-100' : 'text-3xl xl:text-4xl font-bold text-slate-700'}
            `}
          >
            {k}
          </motion.button>
        ))}
      </div>
    );
  };

  const Step3Toggle = ({ label, value, onChange }: { label: string, value: boolean, onChange: () => void }) => (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-5 shadow-sm">
      <span className="text-lg xl:text-xl font-bold text-slate-700 text-center h-12 flex items-center uppercase tracking-tight">
        {label}
      </span>
      <div className="flex items-center justify-center gap-4 xl:gap-6">
        <span className={`text-xl font-black transition-colors duration-300 ${!value ? 'text-slate-800' : 'text-slate-300'}`}>NÃO</span>
        <div
          onClick={onChange}
          className={`w-20 xl:w-28 h-10 xl:h-14 rounded-full p-1.5 flex items-center cursor-pointer transition-colors duration-300 shadow-inner ${value ? 'bg-orange-500 justify-end' : 'bg-slate-300 justify-start'}`}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 700, damping: 30 }}
            className="w-8 h-8 xl:w-11 xl:h-11 bg-white rounded-full shadow-md"
          />
        </div>
        <span className={`text-xl font-black transition-colors duration-300 ${value ? 'text-orange-600' : 'text-slate-300'}`}>SIM</span>
      </div>
    </div>
  );

  // === RENDERIZAÇÃO DO MODAL DE BUSCA DA CIDADE ===
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
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 xl:p-8 select-none"
      >
        <div className="bg-slate-50 w-full max-w-5xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden max-h-[1000px]">
          
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-slate-800 uppercase flex items-center gap-2">
              <Search className="text-orange-500" /> Buscar Cidade
            </h3>
            <button onClick={() => setShowCityModal(false)} className="bg-slate-100 text-slate-600 p-3 rounded-full hover:bg-slate-200">
              <X size={28} />
            </button>
          </header>

          {/* Input Falso Animado */}
          <div className="p-6 bg-white border-b border-slate-100 flex-none">
            <div className="w-full bg-slate-50 border-2 border-orange-500 ring-4 ring-orange-50 rounded-2xl h-16 xl:h-20 flex items-center px-6 shadow-inner">
              <span className="text-2xl xl:text-3xl font-bold text-slate-800">
                {citySearch || <span className="text-slate-400 font-medium">Toque nas teclas abaixo...</span>}
              </span>
              <span className="ml-1 w-1 h-8 xl:h-10 bg-orange-500 animate-pulse"></span>
            </div>
          </div>

          {/* Lista de Resultados Acima do Teclado */}
          <div className="h-48 xl:h-64 overflow-y-auto bg-slate-100 p-4 flex flex-col gap-2">
            {citySearch.length > 0 ? (
              filteredCities.length > 0 ? (
                filteredCities.slice(0, 10).map((city, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setQuoteData({ city: city });
                      setCitySearch(city); // Salva para a próxima vez que abrir
                      setShowCityModal(false);
                    }}
                    className="w-full text-left bg-white px-6 py-4 rounded-xl border border-slate-200 text-xl font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all shadow-sm flex items-center gap-3"
                  >
                    <MapPin size={24} className="text-slate-400" /> {city}
                  </button>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-xl text-slate-400 font-medium">Nenhuma cidade encontrada...</div>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-xl text-slate-400 font-medium">Comece a digitar para ver os resultados</div>
            )}
          </div>

          {/* Teclado Virtual Exclusivo */}
          <div className="flex-grow bg-white p-6 flex flex-col justify-center gap-2 xl:gap-3">
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
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-4">Informe a Área (m²)</h2>
            <p className="text-slate-500 text-lg xl:text-xl mb-8">Digite o tamanho estimado do projeto</p>
            
            <div className="text-6xl xl:text-8xl font-black text-orange-600 border-b-4 border-slate-200 w-64 text-center pb-2 tracking-tighter">
              {quoteData.area || <span className="text-slate-200">0</span>}
            </div>
            
            <Numpad />
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleNext} disabled={!quoteData.area || parseFloat(quoteData.area) <= 0}
              className="mt-10 bg-orange-600 text-white rounded-full px-12 py-4 xl:py-5 text-xl xl:text-2xl font-bold disabled:opacity-40 disabled:bg-slate-300 disabled:scale-100 shadow-md hover:bg-orange-700 transition-all flex items-center gap-2"
            >
              Avançar <Check size={24} />
            </motion.button>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-8 xl:mb-12">Selecione o Tipo</h2>
            <div className="grid grid-cols-2 gap-8 xl:gap-12 w-full max-w-5xl">
              {[
                { label: 'Casa 1 Pavimento', icon: '/assets/menu_lsf/casa_1_pav.png' },
                { label: 'Casa 2 Pavimentos', icon: '/assets/menu_lsf/casa_2_pav.png' }
              ].map(t => (
                <motion.button key={t.label} 
                  whileTap={{ scale: 0.98 }} 
                  onClick={() => { setQuoteData({ tipo: t.label }); handleNext(); }}
                  className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-8 xl:p-12 flex flex-col items-center justify-center gap-6 xl:gap-8 h-80 xl:h-[450px] transition-all hover:shadow-xl hover:border-orange-400 hover:text-orange-700 group"
                >
                  <div className="w-40 h-40 xl:w-56 xl:h-56 flex items-center justify-center">
                    <img src={t.icon} alt={t.label} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-2xl xl:text-4xl font-bold text-slate-700">{t.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-8 xl:mb-12">Padrão de Acabamento</h2>
            <div className="grid grid-cols-2 gap-6 xl:gap-8 w-full max-w-5xl">
              {[
                { label: 'Popular', icon: '/assets/menu_lsf/casa_popular.png' },
                { label: 'Médio', icon: '/assets/menu_lsf/casa_medio.png' },
                { label: 'Alto', icon: '/assets/menu_lsf/casa_alto.png' },
                { label: 'Não se aplica', icon: '/assets/menu_lsf/nao_aplica.png' }
              ].map(p => (
                <motion.button key={p.label} 
                  whileTap={{ scale: 0.98 }} 
                  onClick={() => { setQuoteData({ padrao: p.label }); handleNext(); }}
                  className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-6 xl:p-8 flex flex-col items-center justify-center gap-4 xl:gap-6 h-64 xl:h-80 transition-all hover:shadow-xl hover:border-orange-400 hover:text-orange-700 group"
                >
                  <div className="w-24 h-24 xl:w-36 xl:h-36 flex items-center justify-center">
                    <img src={p.icon} alt={p.label} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-2xl xl:text-3xl font-bold text-slate-700">{p.label}</span>
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
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-2">Qualificação do Projeto</h2>
            <p className="text-slate-500 text-lg xl:text-xl font-medium mb-8 xl:mb-10">Precisamos de alguns detalhes finais</p>

            <div className="flex flex-col gap-8 w-full max-w-4xl px-4">
              <div className="grid grid-cols-2 gap-4 xl:gap-6">
                <Step3Toggle label="Fachada Frontal?" value={!!quoteData.has_facade} onChange={() => setQuoteData({ has_facade: !quoteData.has_facade })} />
                <Step3Toggle label="Projeto Arquitetônico?" value={!!quoteData.has_project} onChange={() => setQuoteData({ has_project: !quoteData.has_project })} />
                <Step3Toggle label="Possui Terreno?" value={!!quoteData.has_land} onChange={() => setQuoteData({ has_land: !quoteData.has_land })} />
                <Step3Toggle label="Recurso Próprio?" value={!!quoteData.own_resources} onChange={() => setQuoteData({ own_resources: !quoteData.own_resources })} />
              </div>

              {/* Botão nativo para evitar bugs de hit-box */}
              <div className="w-full relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <label className="text-sm xl:text-base font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MapPin size={20} className="text-orange-500" /> Local da Obra
                </label>
                
                <button 
                  type="button"
                  onClick={() => {
                    setCitySearch(quoteData.city && quoteData.city !== 'Não informado' ? quoteData.city : "");
                    setShowCityModal(true);
                  }}
                  className="w-full text-left pl-6 pr-4 py-4 xl:py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xl xl:text-2xl font-bold text-slate-800 cursor-pointer hover:border-orange-400 hover:shadow-md transition-all flex items-center justify-between outline-none"
                >
                  <span className={quoteData.city ? "text-slate-800" : "text-slate-400"}>
                    {quoteData.city || (isLoadingCities ? "Carregando cidades do IBGE..." : "Toque para buscar a cidade do projeto...")}
                  </span>
                  <Search className="text-slate-400" />
                </button>
              </div>

            </div>
            
            {/* Botão 100% isolado com z-index e max-width centralizado */}
            <motion.button 
              whileTap={{ scale: 0.95 }} 
              onClick={handleStep3Next} 
              className="mt-12 relative z-10 w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-slate-800 text-white rounded-full px-12 py-4 xl:py-5 text-xl xl:text-2xl font-bold shadow-md hover:bg-slate-900 transition-all outline-none"
            >
              Ver Resumo Completo <ChevronLeft className="rotate-180" size={24} />
            </motion.button>
          </motion.div>
        );
      }
      case 4: {
        return (
          <motion.div key="step4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-8">Resumo do Pedido</h2>
            
            <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-[2rem] p-8 xl:p-10 shadow-md text-lg xl:text-xl font-medium text-slate-600 flex flex-col gap-3 xl:gap-5 mb-10">
              
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 uppercase font-bold text-sm">Construção</span>
                <span className="font-bold text-slate-800">{quoteData.tipo} ({quoteData.area} m²)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 uppercase font-bold text-sm">Padrão e Fachada</span>
                <span className="font-bold text-slate-800">{quoteData.padrao} • Fachada: {quoteData.has_facade ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 uppercase font-bold text-sm">Localização</span>
                <span className="font-bold text-orange-600">{quoteData.city}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 uppercase font-bold text-sm">Possui Projeto?</span>
                <span className="font-bold text-slate-800">{quoteData.has_project ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 uppercase font-bold text-sm">Possui Terreno?</span>
                <span className="font-bold text-slate-800">{quoteData.has_land ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-400 uppercase font-bold text-sm">Recurso Próprio?</span>
                <span className="font-bold text-slate-800">{quoteData.own_resources ? 'Sim' : 'Não'}</span>
              </div>

            </div>

            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowLeadModal(true)} 
              className="bg-orange-600 text-white rounded-full px-10 py-5 xl:py-6 text-2xl xl:text-3xl font-bold w-full max-w-4xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all flex justify-center items-center gap-3">
              <Check size={32} /> Confirmar e Gerar Orçamento
            </motion.button>
          </motion.div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-800 flex flex-col p-6 xl:p-12 select-none overflow-hidden font-sans">
      
      <header className="flex justify-between items-center mb-8 flex-none w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-slate-900 uppercase">Light Steel Frame</h1>
          <div className="h-1 w-24 bg-orange-500 rounded-full"></div>
        </div>
        <div className="bg-white border border-slate-200 px-6 py-2 rounded-full shadow-sm">
          <span className="text-lg xl:text-xl font-bold text-slate-500">Etapa <span className="text-orange-600">{step + 1}</span> de 5</span>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center relative w-full h-full min-h-0">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      <footer className="mt-8 flex justify-between items-center flex-none w-full relative">
        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={handleBack} 
          className="bg-white text-slate-600 border border-slate-200 rounded-full px-8 py-3 xl:px-10 xl:py-4 text-lg xl:text-xl font-bold shadow-sm hover:bg-slate-100 transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={24} /> {step === 0 ? 'Cancelar' : 'Voltar'}
        </motion.button>

        {step > 0 && (
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            onClick={handleCancelOperation} 
            className="bg-white text-slate-500 border border-slate-200 rounded-full px-8 py-3 xl:px-10 xl:py-4 text-lg xl:text-xl font-bold shadow-sm hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center gap-2"
          >
            Cancelar Operação
          </motion.button>
        )}
      </footer>

      {/* RENDERIZAÇÃO DOS MODAIS */}
      <AnimatePresence>
        {showCityModal && renderCityModal()}
      </AnimatePresence>

      {showLeadModal && (
        <LeadCaptureModal onConfirm={submitQuoteFlow} onCancel={() => setShowLeadModal(false)} />
      )}
      
      {isProcessing && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-50/90 backdrop-blur-sm z-50 flex items-center justify-center flex-col"
        >
          <div className="w-20 h-20 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin shadow-md"></div>
          <p className="text-2xl font-bold text-slate-800 mt-8 tracking-tight">Calculando Materiais...</p>
          <p className="text-slate-500 mt-2">Isso levará apenas alguns segundos</p>
        </motion.div>
      )}
    </div>
  );
};

export default LSFFlow;