import React, { useState } from "react";
import { motion } from "framer-motion";

interface LeadCaptureModalProps {
  onConfirm: (name: string, phone: string) => void;
  onCancel: () => void;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  onConfirm,
  onCancel,
}) => {
  const [inputName, setInputName] = useState<string>("");
  const [inputPhone, setInputPhone] = useState<string>("");
  const [activeInput, setActiveInput] = useState<"name" | "phone">("name");
  const [lgpdConsent, setLgpdConsent] = useState<boolean>(false);
  const [isUpperCase, setIsUpperCase] = useState<boolean>(false);

  const handleKeyPress = (key: string) => {
    if (key === "APAGAR") {
      if (activeInput === "name") setInputName((prev) => prev.slice(0, -1));
      if (activeInput === "phone") setInputPhone((prev) => prev.slice(0, -1));
      return;
    }

    if (key === "ESPAÇO") {
      if (activeInput === "name") setInputName((prev) => prev + " ");
      return;
    }

    if (key === "MAIÚSCULA") {
      setIsUpperCase(!isUpperCase);
      return;
    }

    const finalKey = isUpperCase ? key.toUpperCase() : key;

    if (activeInput === "name") {
      if (inputName.length < 50) setInputName((prev) => prev + finalKey);
    } else {
      // Trava de segurança extra (back-end do componente)
      if (/[0-9]/.test(finalKey) && inputPhone.length < 15) {
        setInputPhone((prev) => prev + finalKey);
      }
    }
  };

  const handleSubmit = () => {
    if (
      inputName.length > 2 &&
      inputPhone.length >= 10 &&
      lgpdConsent === true
    ) {
      onConfirm(inputName, inputPhone);
    } else {
      alert(
        "ATENÇÃO: Preencha todos os campos corretamente e aceite os termos de uso.",
      );
    }
  };

  const keyboardLayout = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "APAGAR"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
    [
      "MAIÚSCULA",
      "z",
      "x",
      "c",
      "v",
      "b",
      "n",
      "m",
      ",",
      ".",
      "/",
      "MAIÚSCULA",
    ],
  ];

  const renderKey = (key: string) => {
    const displayKey =
      isUpperCase && key.length === 1 && /[a-z]/.test(key)
        ? key.toUpperCase()
        : key;

    let flexClass = "flex-1";
    if (key === "APAGAR" || key === "MAIÚSCULA") {
      flexClass = "flex-[1.5]";
    }

    // LÓGICA DA TRAVA: Se for telefone e a tecla não for número nem APAGAR, desabilita
    const isPhoneField = activeInput === "phone";
    const isAllowedInPhone = /^[0-9]$/.test(key) || key === "APAGAR";
    const isDisabled = isPhoneField && !isAllowedInPhone;

    return (
      <motion.button
        key={key}
        whileTap={
          isDisabled
            ? {}
            : { scale: 0.95, backgroundColor: "#000", color: "#FFF" }
        }
        onClick={() => !isDisabled && handleKeyPress(key)}
        disabled={isDisabled}
        className={`${flexClass} flex items-center justify-center border-4 border-black py-3 xl:py-5 text-sm xl:text-2xl font-black uppercase transition-colors
          ${
            isDisabled
              ? "bg-gray-200 text-gray-400 opacity-40 cursor-not-allowed"
              : "bg-white text-black hover:bg-gray-100"
          }
        `}
      >
        {displayKey}
      </motion.button>
    );
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col p-6 xl:p-12 select-none border-16 border-black overflow-hidden">
      {/* Cabeçalho */}
      <header className="mb-6 xl:mb-12 flex-none">
        <h2 className="text-4xl xl:text-5xl font-black tracking-tighter uppercase border-b-8 border-black pb-4">
          Identificação Necessária
        </h2>
        <p className="text-xl xl:text-2xl mt-4 font-bold">
          Informe seus dados para gerar o orçamento detalhado.
        </p>
      </header>

      {/* Inputs Falsos (Kiosk Safe) e LGPD */}
      <div className="flex flex-col gap-4 xl:gap-8 w-full max-w-5xl mx-auto flex-none">
        <div
          onClick={() => setActiveInput("name")}
          className="flex flex-col gap-2 cursor-pointer"
        >
          <label className="text-xl xl:text-2xl font-black uppercase text-gray-500">
            Nome Completo
          </label>
          <div
            className={`border-8 p-4 xl:p-6 text-2xl xl:text-3xl font-black transition-colors min-h-[80px] flex items-center ${activeInput === "name" ? "border-black bg-gray-100" : "border-gray-300 bg-white"}`}
          >
            {inputName || (
              <span className="text-gray-300">TOQUE PARA DIGITAR</span>
            )}
          </div>
        </div>

        <div
          onClick={() => setActiveInput("phone")}
          className="flex flex-col gap-2 cursor-pointer"
        >
          <label className="text-xl xl:text-2xl font-black uppercase text-gray-500">
            WhatsApp (apenas números)
          </label>
          <div
            className={`border-8 p-4 xl:p-6 text-2xl xl:text-3xl font-black transition-colors min-h-[80px] flex items-center ${activeInput === "phone" ? "border-black bg-gray-100" : "border-gray-300 bg-white"}`}
          >
            {inputPhone || (
              <span className="text-gray-300">TOQUE PARA DIGITAR</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2 mb-2">
          <input
            type="checkbox"
            id="lgpd"
            checked={lgpdConsent}
            onChange={(e) => setLgpdConsent(e.target.checked)}
            className="w-10 h-10 border-4 border-black accent-black cursor-pointer"
          />
          <label
            htmlFor="lgpd"
            className="text-lg xl:text-xl font-bold uppercase cursor-pointer"
          >
            Autorizo o armazenamento dos meus dados para contato comercial
            (LGPD).
          </label>
        </div>
      </div>

      {/* Teclado Responsivo Flexível */}
      <div className="flex-grow flex flex-col justify-end gap-1 sm:gap-2 overflow-hidden w-full max-w-6xl mx-auto mt-4 min-h-0">
        {keyboardLayout.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center gap-1 sm:gap-2 w-full"
          >
            {row.map((key) => renderKey(key))}
          </div>
        ))}
        {/* Linha do Espaço com Trava embutida */}
        <div className="flex justify-center gap-1 sm:gap-2 w-full mt-1">
          <motion.button
            whileTap={
              activeInput === "phone"
                ? {}
                : { scale: 0.98, backgroundColor: "#000", color: "#FFF" }
            }
            onClick={() => activeInput !== "phone" && handleKeyPress("ESPAÇO")}
            disabled={activeInput === "phone"}
            className={`w-full flex items-center justify-center border-4 border-black py-4 xl:py-6 text-xl xl:text-3xl font-black uppercase transition-colors
                ${
                  activeInput === "phone"
                    ? "bg-gray-200 text-gray-400 opacity-40 cursor-not-allowed"
                    : "bg-white text-black"
                }
              `}
          >
            ESPAÇO
          </motion.button>
        </div>
      </div>

      {/* Rodapé de Ações */}
      <div className="flex justify-between mt-6 border-t-8 border-black pt-6 xl:pt-8 flex-none">
        <button
          onClick={onCancel}
          className="bg-white text-black border-8 border-black px-8 xl:px-12 py-4 xl:py-6 text-2xl xl:text-3xl font-black uppercase hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={lgpdConsent === false}
          className={`px-8 xl:px-12 py-4 xl:py-6 text-2xl xl:text-3xl font-black uppercase border-8 border-black transition-colors ${
            lgpdConsent === true
              ? "bg-black text-white hover:opacity-90"
              : "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400"
          }`}
        >
          Confirmar e Gerar
        </button>
      </div>
    </div>
  );
};
