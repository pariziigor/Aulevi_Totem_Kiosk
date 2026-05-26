import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();

  const options = [
    {
      id: "MM",
      label: "Madeiramento Metálico",
      subtitle: "Estruturas metálicas para telhados",
      image: "/assets/menu/mm.png",
      path: "/fluxo/MM",
      hoverColorHex: "#eff6ff",
    },
    {
      id: "LSF",
      label: "Light Steel Frame",
      subtitle: "Sistema construtivo em aço leve",
      image: "/assets/menu/lsf.png",
      path: "/fluxo/LSF",
      hoverColorHex: "#ecfdf5",
    },
    {
      id: "BARRACAO",
      label: "Galpão",
      subtitle: "Galpões industriais e comerciais",
      image: "/assets/menu/galpao.png",
      path: "/fluxo/BARRACAO",
      hoverColorHex: "#fff7ed",
    },
    {
      id: "CHALE",
      label: "Chalés",
      subtitle: "Construções residenciais em aço",
      image: "/assets/menu/chale.png",
      path: "/fluxo/CHALE",
      hoverColorHex: "#faf5ff",
    },
  ];

  const cardVariants = {
    rest: { backgroundColor: "#ffffff" },
    hover: (color: string) => ({
      backgroundColor: color,
      transition: { duration: 0.3, ease: "easeOut" as const },
    }),
    tap: { scale: 0.98 },
  };

  const contentVariants = {
    rest: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { type: "spring" as const, stiffness: 300, damping: 20 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // min-h-screen permite rolar a tela no mobile. Removido overflow-hidden rígido.
      className="min-h-screen w-full bg-slate-50 text-slate-800 flex flex-col p-4 md:p-6 xl:p-12 select-none"
    >
      {/* Cabeçalho */}
      <header className="flex flex-col items-center justify-center mb-6 md:mb-8 xl:mb-12 flex-none pt-4 md:pt-0">
        <h1 className="text-3xl md:text-4xl xl:text-6xl font-black tracking-tight text-slate-900 mb-1 md:mb-2 xl:mb-4 uppercase text-center">
          Aulevi
        </h1>
        <p className="text-lg md:text-xl xl:text-3xl text-slate-500 font-medium mb-3 md:mb-4 xl:mb-6 text-center px-4">
          Engenharia Civil e Estruturas Metálicas
        </p>
        <div className="h-1 md:h-1.5 w-40 md:w-64 bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-400 rounded-full"></div>
      </header>

      {/* Grid de Opções Expandido */}
      {/* grid-cols-1 no mobile, grid-cols-2 apenas em telas médias (md) ou maiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 xl:gap-10 flex-grow w-full">
        {options.map((opt) => (
          <motion.button
            key={opt.id}
            onClick={() => navigate(opt.path)}
            custom={opt.hoverColorHex}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            variants={cardVariants}
            className="rounded-[1.5rem] md:rounded-[2rem] xl:rounded-[3rem] shadow-sm border border-slate-200 flex flex-col items-center justify-center p-6 xl:p-10 transition-shadow hover:shadow-xl w-full h-full relative overflow-hidden"
          >
            <motion.div
              variants={contentVariants}
              className="flex flex-col items-center gap-3 md:gap-4 xl:gap-8 w-full"
            >
              {/* Contêiner da Imagem Personalizada (Tamanhos ajustados para não vazar a tela no mobile) */}
              <div className="w-24 h-24 md:w-32 md:h-32 xl:w-48 xl:h-48 flex items-center justify-center drop-shadow-md">
                <img
                  src={opt.image}
                  alt={`Ícone ${opt.label}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjYmQ1ZTEiIHN0cm9rZS13aWR0aD0iMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHJlY3Qgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiB4PSIzIiB5PSIzIiByeD0iMiIvPjxjaXJjbGUgY3g9IjkiIGN5PSI5IiByPSIyIi8+PHBhdGggZD0ibTIxIDE1LTMuMDgtMy4wOGExLjIgMS4yIDAgMDAtMS42Ni4xMWwtMi44OCAzLjU1YTEuMiAxLjIgMCAwMS0xLjY3LjExbC0xLjItMS4wOGExLjIgMS4yIDAgMDAtMS42Ni4xMUwzIDE2Ii8+PC9zdmc+";
                  }}
                />
              </div>

              {/* Textos Escalonáveis */}
              <div className="flex flex-col items-center gap-1 xl:gap-2 px-2 text-center">
                <h2 className="text-xl md:text-2xl xl:text-5xl font-bold text-slate-800 tracking-tight leading-none mt-2 md:mt-0">
                  {opt.label}
                </h2>
                <p className="text-sm md:text-base xl:text-2xl text-slate-500 font-medium mt-1 md:mt-2">
                  {opt.subtitle}
                </p>
              </div>
            </motion.div>
          </motion.button>
        ))}
      </div>

      {/* Rodapé Dinâmico */}
      {/* flex-col no mobile, flex-row em telas grandes */}
      <footer className="mt-8 mb-4 md:mb-0 flex flex-col md:flex-row items-center justify-center flex-none w-full relative gap-6 md:gap-0 h-auto md:h-16 xl:h-24">
        {/* Texto de Instrução Pulsante */}
        <span className="text-slate-400 font-bold text-sm md:text-lg xl:text-2xl tracking-widest uppercase animate-pulse text-center px-4">
          Toque em uma opção para continuar
        </span>

        {/* Botão Encerrar (Fica centralizado abaixo do texto no mobile e à direita no desktop) */}
        <div className="relative md:absolute md:right-0 w-full md:w-auto px-4 md:px-0">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/standby")}
            className="w-full md:w-auto bg-slate-800 text-white rounded-full px-6 py-3 xl:px-10 xl:py-5 hover:bg-slate-900 transition-colors shadow-md flex items-center justify-center gap-3 xl:gap-4"
          >
            <LogOut className="w-5 h-5 md:w-6 md:h-6 xl:w-8 xl:h-8" strokeWidth={2} />
            <span className="text-base md:text-lg xl:text-2xl font-bold uppercase tracking-wide">
              Encerrar
            </span>
          </motion.button>
        </div>
      </footer>
    </motion.div>
  );
};

export default MainMenu;