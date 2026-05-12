import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const StandbyScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div 
      // CORREÇÃO AQUI: Alterado de '/menu' para '/' (rota raiz onde fica o MainMenu)
      onClick={() => navigate('/')} 
      className="h-screen w-screen relative overflow-hidden bg-slate-900 cursor-pointer select-none"
    >
      {/* Vídeo em Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      >
        <source src="/assets/standby-video.mp4" type="video/mp4" />
        Seu navegador não suporta a tag de vídeo.
      </video>

      {/* Camada de Overlay Escura */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900/80"></div>

      {/* Conteúdo Centralizado */}
      <div className="absolute inset-0 flex flex-col items-center justify-between py-24 xl:py-32 z-10">
        
        {/* Cabeçalho / Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <h1 className="text-6xl xl:text-8xl font-black tracking-tight text-white uppercase drop-shadow-2xl">
            Aulevi
          </h1>
          <p className="text-2xl xl:text-4xl text-slate-200 font-medium tracking-wide drop-shadow-lg">
            Engenharia Civil e Estruturas Metálicas
          </p>
          <div className="h-2 w-48 bg-emerald-500 rounded-full mt-4 shadow-lg shadow-emerald-500/50"></div>
        </motion.div>

        {/* Instrução de Ação (Call to Action Pulsante) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex flex-col items-center"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-12 py-6 shadow-2xl animate-pulse">
            <span className="text-3xl xl:text-5xl font-black text-white uppercase tracking-widest">
              Toque na tela para iniciar
            </span>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default StandbyScreen;