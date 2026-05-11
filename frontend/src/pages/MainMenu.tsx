import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Factory, Trees, Warehouse, LogOut } from 'lucide-react';

const MainMenu: React.FC = () => {
  const navigate = useNavigate();

  const options = [
    { 
      id: 'MM', 
      label: 'Madeiramento Metálico', 
      subtitle: 'Estruturas metálicas para telhados',
      icon: <Trees className="w-16 h-16 xl:w-24 xl:h-24 text-white" strokeWidth={1.5} />, 
      path: '/fluxo/MM',
      iconBg: 'bg-blue-600',
      hoverColorHex: '#eff6ff'
    },
    { 
      id: 'LSF', 
      label: 'Light Steel Frame', 
      subtitle: 'Sistema construtivo em aço leve',
      icon: <Home className="w-16 h-16 xl:w-24 xl:h-24 text-white" strokeWidth={1.5} />, 
      path: '/fluxo/LSF',
      iconBg: 'bg-emerald-600',
      hoverColorHex: '#ecfdf5'
    },
    { 
      id: 'BARRACAO', 
      label: 'Galpão', 
      subtitle: 'Galpões industriais e comerciais',
      icon: <Factory className="w-16 h-16 xl:w-24 xl:h-24 text-white" strokeWidth={1.5} />, 
      path: '/fluxo/BARRACAO',
      iconBg: 'bg-orange-600',
      hoverColorHex: '#fff7ed'
    },
    { 
      id: 'CHALE', 
      label: 'Chalés', 
      subtitle: 'Construções residenciais em aço',
      icon: <Warehouse className="w-16 h-16 xl:w-24 xl:h-24 text-white" strokeWidth={1.5} />, 
      path: '/fluxo/CHALE',
      iconBg: 'bg-purple-600',
      hoverColorHex: '#faf5ff'
    },
  ];

  const cardVariants = {
    rest: { backgroundColor: "#ffffff" },
    hover: (color: string) => ({ 
      backgroundColor: color,
      // CORREÇÃO: 'as const' adicionado aqui para tipagem estrita do Framer Motion
      transition: { duration: 0.3, ease: "easeOut" as const }
    }),
    tap: { scale: 0.98 }
  };

  const contentVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { type: "spring" as const, stiffness: 300, damping: 20 }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="h-screen w-screen bg-slate-50 text-slate-800 flex flex-col p-6 xl:p-12 select-none overflow-hidden"
    >
      {/* Cabeçalho */}
      <header className="flex flex-col items-center justify-center mb-8 xl:mb-12 flex-none">
        <h1 className="text-4xl xl:text-6xl font-black tracking-tight text-slate-900 mb-2 xl:mb-4 uppercase">
          Aulevi
        </h1>
        <p className="text-xl xl:text-3xl text-slate-500 font-medium mb-4 xl:mb-6">
          Engenharia Civil e Estruturas Metálicas
        </p>
        <div className="h-1.5 w-64 bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-400 rounded-full"></div>
      </header>

      {/* Grid de Opções Expandido */}
      <div className="grid grid-cols-2 grid-rows-2 gap-6 xl:gap-10 flex-grow min-h-0 w-full">
        {options.map((opt) => (
          <motion.button
            key={opt.id}
            onClick={() => navigate(opt.path)}
            custom={opt.hoverColorHex}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            variants={cardVariants}
            className="rounded-[2rem] xl:rounded-[3rem] shadow-sm border border-slate-200 flex flex-col items-center justify-center p-6 xl:p-10 transition-shadow hover:shadow-xl w-full h-full relative overflow-hidden"
          >
            <motion.div 
              variants={contentVariants}
              className="flex flex-col items-center gap-4 xl:gap-8 w-full"
            >
              {/* Ícone Escalonável */}
              <div className={`w-24 h-24 xl:w-40 xl:h-40 rounded-2xl xl:rounded-3xl flex items-center justify-center shadow-md ${opt.iconBg}`}>
                {opt.icon}
              </div>
              
              {/* Textos Escalonáveis */}
              <div className="flex flex-col items-center gap-1 xl:gap-2 px-4 text-center">
                <h2 className="text-2xl xl:text-5xl font-bold text-slate-800 tracking-tight leading-none">
                  {opt.label}
                </h2>
                <p className="text-sm xl:text-2xl text-slate-500 font-medium mt-2">
                  {opt.subtitle}
                </p>
              </div>
            </motion.div>
          </motion.button>
        ))}
      </div>

      {/* Rodapé com Instrução Centralizada e Botão à Direita */}
      <footer className="mt-6 xl:mt-8 flex items-center justify-center flex-none w-full relative h-16 xl:h-24">
        
        {/* Texto de Instrução Pulsante */}
        <span className="text-slate-400 font-bold text-lg xl:text-2xl tracking-widest uppercase animate-pulse text-center">
          Toque em uma opção para continuar
        </span>

        {/* Botão Encerrar Posicionado Absolutamente à Direita */}
        <div className="absolute right-0">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/standby')}
            className="bg-slate-800 text-white rounded-full px-6 py-3 xl:px-10 xl:py-5 hover:bg-slate-900 transition-colors shadow-md flex items-center justify-center gap-3 xl:gap-4"
          >
            <LogOut className="w-6 h-6 xl:w-8 xl:h-8" strokeWidth={2} />
            <span className="text-lg xl:text-2xl font-bold uppercase tracking-wide">Encerrar</span>
          </motion.button>
        </div>
        
      </footer>
    </motion.div>
  );
};

export default MainMenu;