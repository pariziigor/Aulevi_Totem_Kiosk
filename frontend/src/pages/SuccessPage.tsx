import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const navigate = useNavigate();
  const [counter, setCounter] = useState(10);

  useEffect(() => {
    if (counter <= 0) {
      navigate("/standby");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCounter((currentCounter) => currentCounter - 1);
    }, 1100);

    return () => window.clearTimeout(timeoutId);
  }, [counter, navigate]);

  return (
    // O segredo está aqui: flex-col e justify-between empurram os itens para as pontas
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between p-6 select-none">
      
      {/* 1. VÍDEO DE FUNDO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/assets/sucesso - video.mp4" type="video/mp4" />
      </video>

      {/* 2. OVERLAY SUAVE */}
      {/* Reduzimos a escuridão geral já que os cartões têm o próprio fundo */}
      <div className="absolute inset-0 bg-slate-900/10 z-0"></div>

      {/* 3. HEADER (Título e Subtítulo no Topo) */}
      <header className="relative z-10 w-full max-w-2xl mx-auto mt-8 flex flex-col items-center justify-center gap-2 bg-white/50 backdrop-blur-2xl shadow-xl rounded-3xl p-8 text-center border-2 border-white/60">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 drop-shadow-sm">
          Orçamento Enviado!
        </h1>
        <p className="text-lg md:text-xl text-slate-800 font-semibold px-2 drop-shadow-sm">
          O PDF detalhado foi entregue no WhatsApp informado.
        </p>
      </header>

      {/* 4. ÁREA CENTRAL LIVRE */}
      {/* O justify-between do main já garante o espaço, mas este flex-grow garante que o vídeo fique 100% livre no meio */}
      <div className="flex-grow z-10 pointer-events-none"></div>

      {/* 5. FOOTER (Cronômetro e Botões na Base) */}
      <footer className="relative z-10 w-full max-w-2xl mx-auto mb-8 flex flex-col items-center gap-8 bg-white/50 backdrop-blur-2xl shadow-2xl rounded-[3rem] p-8 border-2 border-white/60">
        
        {/* Cronômetro */}
        <div className="text-7xl md:text-8xl font-bold leading-none tabular-nums text-orange-600 drop-shadow-md">
          {counter}
        </div>

        {/* Botões empilhados para melhor ergonomia no touch */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            type="button"
            onClick={() => navigate("/?origem=totem")}
            className="w-full bg-orange-600 text-white rounded-full py-5 text-xl font-semibold shadow-lg hover:bg-orange-700 active:scale-95 transition-all"
          >
            Voltar ao menu
          </button>
          
          <button
            type="button"
            onClick={() => navigate("/standby")}
            className="w-full bg-white/60 backdrop-blur-md text-slate-900 border-2 border-white/80 rounded-full py-5 text-xl font-semibold shadow-sm hover:bg-white active:scale-95 transition-all"
          >
            Encerrar Agora
          </button>
        </div>
        
      </footer>
    </main>
  );
};

export default SuccessPage;