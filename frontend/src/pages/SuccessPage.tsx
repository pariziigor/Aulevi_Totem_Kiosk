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
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [counter, navigate]);

  return (
    <main className="min-h-screen w-full overflow-hidden bg-slate-50 flex flex-col items-center justify-center px-6 py-8 text-center select-none">
      <section className="flex flex-col items-center justify-center gap-8 md:gap-10 w-full max-w-5xl">
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-800">
            Orçamento Enviado!
          </h1>
          <p className="text-lg md:text-2xl text-slate-600 font-medium">
            O PDF detalhado foi entregue no WhatsApp informado.
          </p>
        </div>

        {/* Cronômetro com a cor de destaque oficial do sistema (Laranja Aulevi) */}
        <div className="text-8xl md:text-[12rem] lg:text-[14rem] font-bold leading-none tabular-nums text-orange-600">
          {counter}
        </div>

        {/* Botões com bordas arredondadas e feedback tátil (scale-95) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-3xl mt-4">
          <button
            type="button"
            onClick={() => navigate("/?origem=totem")}
            className="bg-orange-600 text-white rounded-full px-8 py-5 md:py-6 text-xl md:text-2xl font-semibold shadow-md hover:bg-orange-700 active:scale-95 transition-all"
          >
            Ver Outros Modelos
          </button>
          
          <button
            type="button"
            onClick={() => navigate("/standby")}
            className="bg-white text-slate-800 border-2 border-slate-200 rounded-full px-8 py-5 md:py-6 text-xl md:text-2xl font-semibold shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
          >
            Encerrar Agora
          </button>
        </div>

      </section>
    </main>
  );
};

export default SuccessPage;