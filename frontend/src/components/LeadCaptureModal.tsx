import React, { useState, useRef } from 'react';
import KeyboardModule from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

// Interoperabilidade: Garante a extração correta do componente no Vite
const KeyboardComponent = typeof KeyboardModule === 'function' ? KeyboardModule : (KeyboardModule as any).default;

interface LeadCaptureModalProps {
  onConfirm: (name: string, phone: string) => void;
  onCancel: () => void;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ onConfirm, onCancel }) => {
  const [inputName, setInputName] = useState<string>('');
  const [inputPhone, setInputPhone] = useState<string>('');
  const [layoutName, setLayoutName] = useState<string>('default');
  const [activeInput, setActiveInput] = useState<'name' | 'phone'>('name');
  const [lgpdConsent, setLgpdConsent] = useState<boolean>(false);
  
  const keyboardRef = useRef<any>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (activeInput === 'name') setInputName(value);
    if (activeInput === 'phone') setInputPhone(value);
    keyboardRef.current?.setInput(value);
  };

  const handleKeyboardInput = (input: string) => {
    if (activeInput === 'name') setInputName(input);
    if (activeInput === 'phone') setInputPhone(input);
  };

  const handleShift = () => {
    setLayoutName(layoutName === 'default' ? 'shift' : 'default');
  };

  const handleSubmit = () => {
    if (inputName.length > 2 && inputPhone.length >= 10 && lgpdConsent === true) {
      onConfirm(inputName, inputPhone);
    } else {
      alert("ATENÇÃO: Preencha todos os campos corretamente e aceite os termos de uso.");
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col p-12 select-none border-16 border-black">
      <header className="mb-12">
        <h2 className="text-5xl font-black tracking-tighter uppercase border-b-8 border-black pb-4">
          Identificação Necessária
        </h2>
        <p className="text-2xl mt-4 font-bold">Informe seus dados para gerar o orçamento detalhado.</p>
      </header>

      <div className="flex-grow flex flex-col gap-8 w-full max-w-4xl mx-auto">
        <div className="flex flex-col gap-2">
          <label className="text-2xl font-black uppercase">Nome Completo</label>
          <input
            type="text"
            value={inputName}
            onFocus={() => { setActiveInput('name'); keyboardRef.current?.setInput(inputName); }}
            onChange={handleInputChange}
            className="border-8 border-black p-6 text-3xl focus:outline-none focus:bg-gray-100 transition-colors"
            placeholder="TOQUE PARA DIGITAR"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-2xl font-black uppercase">WhatsApp (com DDD)</label>
          <input
            type="text"
            value={inputPhone}
            onFocus={() => { setActiveInput('phone'); keyboardRef.current?.setInput(inputPhone); }}
            onChange={handleInputChange}
            className="border-8 border-black p-6 text-3xl focus:outline-none focus:bg-gray-100 transition-colors"
            placeholder="EX: 11999999999"
          />
        </div>

        <div className="flex items-center gap-4 mt-4">
          <input 
            type="checkbox" 
            id="lgpd" 
            checked={lgpdConsent}
            onChange={(e) => setLgpdConsent(e.target.checked)}
            className="w-10 h-10 border-4 border-black accent-black"
          />
          <label htmlFor="lgpd" className="text-xl font-bold uppercase cursor-pointer">
            Autorizo o armazenamento dos meus dados para contato comercial (LGPD).
          </label>
        </div>
      </div>

      <div className="w-full mt-auto mb-8">
        <KeyboardComponent
          keyboardRef={(r: any) => (keyboardRef.current = r)}
          layoutName={layoutName}
          onChange={handleKeyboardInput}
          onKeyPress={(button: string) => button === "{shift}" || button === "{lock}" ? handleShift() : null}
          theme={"hg-theme-default my-custom-keyboard-theme"}
          layout={{
            default: [
              "1 2 3 4 5 6 7 8 9 0 - = {bksp}",
              "q w e r t y u i o p [ ] \\",
              "a s d f g h j k l ; '",
              "{shift} z x c v b n m , . / {shift}",
              "{space}"
            ],
            shift: [
              "! @ # $ % & * ( ) _ + {bksp}",
              "Q W E R T Y U I O P { } |",
              "A S D F G H J K L : \"",
              "{shift} Z X C V B N M < > ? {shift}",
              "{space}"
            ]
          }}
          display={{
            "{bksp}": "APAGAR",
            "{space}": "ESPAÇO",
            "{shift}": "MAIÚSCULA",
            "{lock}": "TRAVAR M"
          }}
        />
      </div>

      <div className="flex justify-between mt-8 border-t-8 border-black pt-8">
        <button 
          onClick={onCancel}
          className="bg-white text-black border-8 border-black px-12 py-6 text-3xl font-black uppercase hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button 
          onClick={handleSubmit}
          disabled={lgpdConsent === false}
          className={`px-12 py-6 text-3xl font-black uppercase border-8 border-black transition-colors ${
            lgpdConsent === true ? 'bg-black text-white hover:opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'
          }`}
        >
          Confirmar e Gerar
        </button>
      </div>
    </div>
  );
};