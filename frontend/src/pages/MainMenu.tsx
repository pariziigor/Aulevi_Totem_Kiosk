import React from 'react';
import { useNavigate } from 'react-router-dom';

export const MainMenu: React.FC = () => {
  const navigate = useNavigate();

  const options = [
    { id: 'LSF', label: 'LIGHT STEEL FRAME' },
    { id: 'MM', label: 'MADEIRA MASSIVA' },
    { id: 'CHALE', label: 'CHALÉS' },
    { id: 'BARRACAO', label: 'BARRACÃO' },
  ];

  return (
    <div className="h-screen w-screen bg-white flex flex-col p-12 select-none">
      <header className="border-b-8 border-black pb-4 mb-12">
        <h1 className="text-6xl font-black tracking-tighter">SISTEMA AULEVI</h1>
      </header>

      <div className="grid grid-cols-2 gap-8 flex-grow">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => navigate(`/fluxo/${opt.id}`)}
            className="border-8 border-black hover:bg-black hover:text-white transition-all 
                       duration-100 flex items-center justify-center text-4xl font-black p-8"
          >
            {opt.label}
          </button>
        ))}
      </div>

      <footer className="mt-12">
        <button 
          onClick={() => navigate('/')}
          className="bg-black text-white px-12 py-6 text-2xl font-bold hover:opacity-90"
        >
          ← CANCELAR OPERAÇÃO
        </button>
      </footer>
    </div>
  );
};