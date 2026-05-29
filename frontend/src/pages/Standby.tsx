import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const StandbyScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate('/?origem=totem')} 
      className="min-h-screen lg:h-screen lg:min-h-0 w-screen relative overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-slate-900 cursor-pointer select-none"
    >
      {/* Vídeo em Background */}
      <video
        autoPlay
        loop
        muted
        playsInline // Crucial para o vídeo não abrir em tela cheia no iPhone
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      >
        <source src="/assets/standby-video2.mp4" type="video/mp4" />
        Seu navegador não suporta a tag de vídeo.
      </video>

      {/* Camada de Overlay Escura */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 md:from-slate-900/40 via-slate-900/20 md:via-transparent to-slate-900/90 md:to-slate-900/80"></div>

      {/* Conteúdo Centralizado */}
      <div className="absolute inset-0 flex flex-col items-center justify-between py-16 md:py-24 lg:py-24 z-10">
        
        {/* Cabeçalho / Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center gap-2 md:gap-4 px-4 text-center"
        >
          <h1 className="text-5xl md:text-6xl lg:text-[clamp(4rem,7vw,6.5rem)] font-black tracking-tight text-white uppercase drop-shadow-2xl">
            Aulevi
          </h1>
          <p className="text-lg md:text-2xl lg:text-[clamp(1.75rem,3vw,3rem)] text-slate-200 font-medium tracking-wide drop-shadow-lg leading-tight">
            Engenharia Civil e Estruturas Metálicas
          </p>
          <div className="h-1.5 md:h-2 w-24 md:w-48 bg-orange-500 rounded-full mt-2 md:mt-4 shadow-lg shadow-orange-500/50"></div>
        </motion.div>

        {/* Instrução de Ação (Call to Action Pulsante) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex flex-col items-center px-4 w-full"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-4 md:px-12 md:py-6 shadow-2xl animate-pulse text-center w-[90%] md:w-auto">
            <span className="text-xl md:text-3xl lg:text-[clamp(2rem,4vw,4rem)] font-black text-white uppercase tracking-widest leading-tight">
              Toque na tela<br className="md:hidden" /> para iniciar
            </span>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default StandbyScreen;
