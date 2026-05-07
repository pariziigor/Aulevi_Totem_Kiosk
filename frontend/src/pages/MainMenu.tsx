import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Factory, Trees, Warehouse } from 'lucide-react';

const MainMenu: React.FC = () => {
  const navigate = useNavigate();

  const options = [
    { id: 'LSF', label: 'LIGHT STEEL FRAME', icon: <Home size={90} strokeWidth={1.5} />, path: '/fluxo/LSF' },
    { id: 'MM', label: 'MADEIRAMENTO METÁLICO', icon: <Trees size={90} strokeWidth={1.5} />, path: '/fluxo/MM' },
    { id: 'CHALE', label: 'CHALÉS', icon: <Warehouse size={90} strokeWidth={1.5} />, path: '/fluxo/CHALE' },
    { id: 'BARRACAO', label: 'GALPÃO', icon: <Factory size={90} strokeWidth={1.5} />, path: '/fluxo/BARRACAO' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="h-screen w-screen bg-white text-black flex flex-col p-8 select-none overflow-hidden"
    >
      {/* Cabeçalho Proporcional */}
      <header className="border-b-8 border-black pb-4 mb-6 flex justify-between items-end flex-none">
        <h1 className="text-6xl font-black tracking-tighter uppercase">Sistema Aulevi</h1>
        <p className="text-3xl font-bold uppercase">Selecione a opção desejada</p>
      </header>

      {/* Grid com min-h-0 forçando o respeito às bordas da tela */}
      <motion.div 
        variants={containerVariants} initial="hidden" animate="show"
        className="grid grid-cols-2 grid-rows-2 gap-8 flex-grow min-h-0"
      >
        {options.map((opt) => (
          <motion.button
            key={opt.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95, backgroundColor: "#000", color: "#FFF" }}
            onClick={() => navigate(opt.path)}
            className="border-8 border-black bg-white flex flex-col items-center justify-center gap-6 p-6 transition-colors duration-200 w-full h-full"
          >
            {opt.icon}
            <span className="text-4xl font-black uppercase text-center leading-none">{opt.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Rodapé Protegido */}
      <footer className="mt-6 flex justify-start flex-none">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/standby')}
          className="bg-black text-white border-8 border-black px-10 py-4 text-2xl font-black uppercase hover:bg-gray-800 transition-colors"
        >
          ← Encerrar
        </motion.button>
      </footer>
    </motion.div>
  );
};

export default MainMenu;