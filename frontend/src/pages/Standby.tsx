import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MousePointerClick } from 'lucide-react';

const Standby: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="h-screen w-screen bg-black text-white flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={() => navigate('/')}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-8xl font-black tracking-tighter mb-8 uppercase border-8 border-white p-12">
          Aulevi Steel Frame
        </h1>
        
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-6 mt-20"
        >
          <MousePointerClick size={80} />
          <p className="text-5xl font-bold uppercase">Toque na tela para iniciar</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Standby;