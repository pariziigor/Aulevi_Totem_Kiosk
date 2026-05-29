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
    <main className="h-screen w-screen overflow-hidden bg-zinc-950 text-white flex flex-col items-center justify-center px-6 py-8 text-center select-none">
      <section className="flex flex-col items-center justify-center gap-8 md:gap-10 w-full max-w-7xl">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black uppercase tracking-tight leading-none">
            ORÇAMENTO ENVIADO
          </h1>
          <p className="text-lg md:text-2xl lg:text-3xl text-zinc-300 font-bold">
            O PDF foi entregue no WhatsApp informado.
          </p>
        </div>

        <div className="text-9xl md:text-[14rem] lg:text-[18rem] font-black leading-none tabular-nums">
          {counter}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-5xl">
          <button
            type="button"
            onClick={() => navigate("/?origem=totem")}
            className="bg-white text-black border-4 border-white rounded-2xl px-8 py-6 md:py-8 text-2xl md:text-3xl font-black uppercase tracking-tight active:scale-95 transition-transform"
          >
            Ver Outros Modelos
          </button>
          <button
            type="button"
            onClick={() => navigate("/standby")}
            className="bg-transparent text-white border-4 border-white rounded-2xl px-8 py-6 md:py-8 text-2xl md:text-3xl font-black uppercase tracking-tight active:scale-95 transition-transform"
          >
            Encerrar Agora
          </button>
        </div>
      </section>
    </main>
  );
};

export default SuccessPage;
