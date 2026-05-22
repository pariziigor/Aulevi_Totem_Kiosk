import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useKioskStore } from '../store/useKioskStore';
import { LeadCaptureModal } from '../components/LeadCaptureModal';
import { KioskService } from '../services/api';
import { ChevronLeft, Check, MapPin, Search, X, Layers } from 'lucide-react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface IBGEMunicipio {
  nome: string;
  microrregiao?: { mesorregiao?: { UF?: { sigla: string } } };
}

type TipoLaje = 'SEM_LAJE' | 'COM_LAJE';

const TIPOS_TELHA = [
  'Cerâmico',
  'Concreto',
  'Fibrocimento',
  'Aço galvanizado',
  'Termoacustico',
  'Shingle',
] as const;

const TELHA_ICONS: Record<typeof TIPOS_TELHA[number], string> = {
  'Cerâmico':        '/assets/telhas/ceramica.png',
  'Concreto':        '/assets/telhas/concreto.png',
  'Fibrocimento':    '/assets/telhas/fibrocimento.png',
  'Aço galvanizado': '/assets/telhas/acogalvo.png',
  'Termoacustico':   '/assets/telhas/termoacustico.png',
  'Shingle':         '/assets/telhas/shingle.png',
};

const formatTitleCase = (text: string) =>
  text.replace(/(?:^|\s)\S/g, (m) => m.toUpperCase());

// ---------------------------------------------------------------------------
// SVG isométrico do telhado com labels A e B dinâmicos
// ---------------------------------------------------------------------------

const TelhadoSVG: React.FC<{ dimA: string; dimB: string; activeDim: 'A' | 'B' }> = ({
  dimA,
  dimB,
  activeDim,
}) => {
  const labelA = dimA ? `${dimA} m` : '? m';
  const labelB = dimB ? `${dimB} m` : '? m';
  const activeA = activeDim === 'A';
  const activeB = activeDim === 'B';

  return (
    <svg
      width="100%"
      viewBox="0 0 520 340"
      role="img"
      aria-label="Diagrama isométrico do telhado com dimensões A e B"
      className="w-full max-w-sm xl:max-w-md"
    >
      <defs>
        <marker id="arrOrange" viewBox="0 0 10 10" refX="8" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#f97316"
            stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </marker>
        <marker id="arrOrangeActive" viewBox="0 0 10 10" refX="8" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#ea580c"
            stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </marker>
      </defs>

      {/* ── Paredes ── */}
      {/* Face esquerda */}
      <polygon points="110,265 110,158 210,100 210,210"
        fill="#6b7280" stroke="#4b5563" strokeWidth="0.8"/>
      {/* Face frontal */}
      <polygon points="210,210 210,100 390,100 390,210"
        fill="#9ca3af" stroke="#6b7280" strokeWidth="0.8"/>
      {/* Lateral direita (sombra) */}
      <polygon points="390,210 390,100 398,95 398,207"
        fill="#4b5563" stroke="#374151" strokeWidth="0.8"/>

      {/* ── Telhado ── */}
      {/* Sombra inferior */}
      <polygon points="110,152 210,95 390,95 290,152"
        fill="#d97706" stroke="#b45309" strokeWidth="0.8" opacity="0.4"/>
      {/* Face principal */}
      <polygon points="110,152 290,152 390,95 210,95"
        fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
      {/* Beiral frontal */}
      <line x1="110" y1="152" x2="290" y2="152"
        stroke="#b45309" strokeWidth="2"/>
      {/* Cumeeira */}
      <line x1="210" y1="95" x2="390" y2="95"
        stroke="#b45309" strokeWidth="1.5"/>
      {/* Linhas de terças (decorativas) */}
      {[138, 124, 109].map((y, i) => (
        <line key={i}
          x1={110 + (152 - y) * 0.55} y1={y}
          x2={290 + (152 - y) * 0.55} y2={y}
          stroke="#d97706" strokeWidth="0.6" strokeDasharray="4,4" opacity="0.5"/>
      ))}

      {/* ── Seta A (largura — eixo horizontal frontal) ── */}
      <line x1="110" y1="285" x2="110" y2="210"
        stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3,3"/>
      <line x1="290" y1="285" x2="290" y2="210"
        stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3,3"/>
      <line x1="118" y1="207" x2="282" y2="207"
        stroke={activeA ? '#ea580c' : '#f97316'}
        strokeWidth={activeA ? 2.8 : 2}
        markerStart={activeA ? 'url(#arrOrangeActive)' : 'url(#arrOrange)'}
        markerEnd={activeA ? 'url(#arrOrangeActive)' : 'url(#arrOrange)'}/>
      {/* Label A */}
      <rect x="175" y="192" width="50" height="24" rx="5"
        fill={activeA ? '#fff7ed' : '#f8fafc'}
        stroke={activeA ? '#ea580c' : '#f97316'}
        strokeWidth={activeA ? 1.8 : 1.2}/>
      <text x="200" y="209" textAnchor="middle"
        fontFamily="sans-serif" fontSize="12"
        fontWeight={activeA ? '700' : '600'}
        fill={activeA ? '#ea580c' : '#f97316'}>
        A
      </text>

      {/* Label valor A — abaixo da seta */}
      <text x="200" y="240" textAnchor="middle"
        fontFamily="sans-serif" fontSize="13"
        fontWeight="600"
        fill={activeA ? '#ea580c' : '#94a3b8'}>
        {labelA}
      </text>

      {/* ── Seta B (profundidade — eixo diagonal esquerdo) ── */}
      <line x1="60" y1="152" x2="110" y2="180"
        stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3,3"/>
      <line x1="82" y1="112" x2="110" y2="127"
        stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3,3"/>
      <line x1="68" y1="149" x2="89" y2="116"
        stroke={activeB ? '#ea580c' : '#f97316'}
        strokeWidth={activeB ? 2.8 : 2}
        markerStart={activeB ? 'url(#arrOrangeActive)' : 'url(#arrOrange)'}
        markerEnd={activeB ? 'url(#arrOrangeActive)' : 'url(#arrOrange)'}/>
      {/* Label B */}
      <rect x="50" y="120" width="32" height="24" rx="5"
        fill={activeB ? '#fff7ed' : '#f8fafc'}
        stroke={activeB ? '#ea580c' : '#f97316'}
        strokeWidth={activeB ? 1.8 : 1.2}/>
      <text x="66" y="137" textAnchor="middle"
        fontFamily="sans-serif" fontSize="12"
        fontWeight={activeB ? '700' : '600'}
        fill={activeB ? '#ea580c' : '#f97316'}>
        B
      </text>

      {/* Label valor B — à esquerda da seta */}
      <text x="28" y="175" textAnchor="middle"
        fontFamily="sans-serif" fontSize="13"
        fontWeight="600"
        fill={activeB ? '#ea580c' : '#94a3b8'}>
        {labelB}
      </text>
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 5;

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

const MadeiramentoFlow: React.FC = () => {
  const navigate = useNavigate();
  const { quoteData, setQuoteData, resetSession } = useKioskStore();

  const [step, setStep]                         = useState(0);
  const [showLeadModal, setShowLeadModal]       = useState(false);
  const [isProcessing, setIsProcessing]         = useState(false);

  const [tipoLaje, setTipoLaje]   = useState<TipoLaje>('SEM_LAJE');
  const [dimA, setDimA]           = useState('');
  const [dimB, setDimB]           = useState('');
  const [editingDim, setEditingDim] = useState<'A' | 'B'>('A');
  const [tipoTelha, setTipoTelha] = useState('');
  const [temPlaca, setTemPlaca]   = useState(false);

  const [showCityModal, setShowCityModal]       = useState(false);
  const [citySearch, setCitySearch]             = useState('');
  const [allCities, setAllCities]               = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities]   = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const res = await fetch(
          'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?ordenacao=nome'
        );
        if (!res.ok) throw new Error();
        const data: IBGEMunicipio[] = await res.json();
        setAllCities(
          data.map((m) => {
            const uf = m.microrregiao?.mesorregiao?.UF?.sigla;
            return uf ? `${m.nome} - ${uf}` : m.nome;
          })
        );
      } catch {
        setAllCities(['São Paulo - SP', 'Rio de Janeiro - RJ', 'Curitiba - PR']);
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  const handleNext   = () => setStep((s) => s + 1);
  const handleBack   = () => (step > 0 ? setStep((s) => s - 1) : navigate('/'));
  const handleCancel = () => { resetSession(); navigate('/'); };

  const submitQuote = async (name: string, phone: string) => {
    setIsProcessing(true);
    try {
      const payload = {
        module: 'MADEIRAMENTO',
        lead_name: name,
        lead_phone: phone,
        tipo_laje: tipoLaje,
        tipo_telha: tipoTelha,
        tem_placa: temPlaca,
        dim_a: parseFloat(dimA.replace(',', '.')),
        dim_b: parseFloat(dimB.replace(',', '.')),
        city: quoteData.city || 'Não informado',
      };
      const result = await KioskService.submitQuote(payload);
      alert(
        `ORÇAMENTO GERADO COM SUCESSO!\nNº do Pedido: ${result.quote_number}\nValor Total: R$ ${result.total_value.toFixed(2)}`
      );
      resetSession();
      navigate('/');
    } catch (err) {
      console.error('Falha na API:', err);
      alert('ERRO: Falha ao processar orçamento. Tente novamente.');
      setIsProcessing(false);
    }
  };

  // ─── NumpadMedida ─────────────────────────────────────────────────────────

  const NumpadMedida = ({
    value,
    onChange,
    maxLen = 5,
  }: {
    value: string;
    onChange: (v: string) => void;
    maxLen?: number;
  }) => {
    const keys = ['1','2','3','4','5','6','7','8','9',',','0','APAGAR'];
    const handle = (k: string) => {
      if (k === 'APAGAR')                    { onChange(value.slice(0, -1)); return; }
      if (k === ',' && value.includes(','))  return;
      if (value.length >= maxLen)            return;
      onChange(value + k);
    };
    return (
      <div className="grid grid-cols-3 gap-2 xl:gap-3 w-full">
        {keys.map((k) => (
          <motion.button
            key={k}
            whileTap={{ scale: 0.95 }}
            onClick={() => handle(k)}
            className={`
              border shadow-sm rounded-2xl flex items-center justify-center h-12 xl:h-14 transition-all
              hover:shadow-md hover:border-orange-300
              ${k === 'APAGAR'
                ? 'text-sm font-bold text-rose-500 bg-rose-50 border-rose-100 hover:bg-rose-100'
                : 'text-xl xl:text-2xl font-bold text-slate-700 bg-white border-slate-200'}
            `}
          >
            {k}
          </motion.button>
        ))}
      </div>
    );
  };

  // ─── Toggle ───────────────────────────────────────────────────────────────

  const Toggle = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: boolean;
    onChange: () => void;
  }) => (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between gap-6 shadow-sm">
      <span className="text-lg xl:text-xl font-bold text-slate-700 uppercase tracking-tight">{label}</span>
      <div className="flex items-center gap-4 shrink-0">
        <span className={`text-lg font-black transition-colors ${!value ? 'text-slate-800' : 'text-slate-300'}`}>NÃO</span>
        <div
          onClick={onChange}
          className={`w-20 xl:w-24 h-10 xl:h-12 rounded-full p-1.5 flex items-center cursor-pointer transition-colors duration-300 shadow-inner ${value ? 'bg-orange-500 justify-end' : 'bg-slate-300 justify-start'}`}
        >
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 700, damping: 30 }}
            className="w-7 h-7 xl:w-9 xl:h-9 bg-white rounded-full shadow-md"
          />
        </div>
        <span className={`text-lg font-black transition-colors ${value ? 'text-orange-600' : 'text-slate-300'}`}>SIM</span>
      </div>
    </div>
  );

  // ─── Modal cidade ──────────────────────────────────────────────────────────

  const renderCityModal = () => {
    const normalize = (t: string) =>
      t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const filtered = allCities.filter((c) =>
      normalize(c).includes(normalize(citySearch))
    );
    const keyboard = [
      ['q','w','e','r','t','y','u','i','o','p'],
      ['a','s','d','f','g','h','j','k','l','ç'],
      ['z','x','c','v','b','n','m','-','APAGAR'],
    ];
    const handleKey = (k: string) => {
      if (k === 'APAGAR') { setCitySearch((p) => p.slice(0, -1)); return; }
      setCitySearch((p) => formatTitleCase(p + k.toLowerCase()));
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 xl:p-8 select-none"
      >
        <div className="bg-slate-50 w-full max-w-5xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden max-h-[1000px]">
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-slate-800 uppercase flex items-center gap-2">
              <Search className="text-orange-500" /> Buscar Cidade
            </h3>
            <button onClick={() => setShowCityModal(false)} className="bg-slate-100 text-slate-600 p-3 rounded-full hover:bg-slate-200">
              <X size={28} />
            </button>
          </header>
          <div className="p-6 bg-white border-b border-slate-100">
            <div className="w-full bg-slate-50 border-2 border-orange-500 ring-4 ring-orange-50 rounded-2xl h-16 xl:h-20 flex items-center px-6 shadow-inner">
              <span className="text-2xl xl:text-3xl font-bold text-slate-800">
                {citySearch || <span className="text-slate-400 font-medium">Toque nas teclas abaixo...</span>}
              </span>
              <span className="ml-1 w-1 h-8 xl:h-10 bg-orange-500 animate-pulse" />
            </div>
          </div>
          <div className="h-48 xl:h-64 overflow-y-auto bg-slate-100 p-4 flex flex-col gap-2">
            {citySearch.length > 0 ? (
              filtered.length > 0 ? (
                filtered.slice(0, 10).map((city, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuoteData({ city }); setCitySearch(city); setShowCityModal(false); }}
                    className="w-full text-left bg-white px-6 py-4 rounded-xl border border-slate-200 text-xl font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all shadow-sm flex items-center gap-3"
                  >
                    <MapPin size={24} className="text-slate-400" /> {city}
                  </button>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-xl text-slate-400">Nenhuma cidade encontrada...</div>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-xl text-slate-400">Comece a digitar para ver os resultados</div>
            )}
          </div>
          <div className="flex-grow bg-white p-6 flex flex-col justify-center gap-2 xl:gap-3">
            {keyboard.map((row, ri) => (
              <div key={ri} className="flex justify-center gap-2 xl:gap-3 w-full">
                {row.map((key) => (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKey(key)}
                    className={`flex items-center justify-center border border-slate-200 rounded-xl h-14 xl:h-16 text-lg xl:text-xl font-bold uppercase shadow-sm transition-colors hover:border-orange-300
                      ${key === 'APAGAR' ? 'flex-[1.5] bg-slate-200 text-slate-700 hover:bg-slate-300' : 'flex-1 bg-white text-slate-700'}`}
                  >
                    {key}
                  </motion.button>
                ))}
              </div>
            ))}
            <div className="flex justify-center w-full mt-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setCitySearch((p) => p + ' ')}
                className="w-full border border-slate-200 rounded-xl h-14 xl:h-16 text-lg xl:text-xl font-bold uppercase shadow-sm bg-white text-slate-700 hover:border-orange-300 transition-colors"
              >
                ESPAÇO
              </motion.button>
            </div>
            <div className="mt-4 flex justify-end">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setQuoteData({ city: citySearch }); setShowCityModal(false); }}
                className="bg-slate-800 text-white px-8 py-4 rounded-xl text-lg font-bold uppercase shadow-md hover:bg-slate-900 flex items-center gap-2"
              >
                <Check size={24} /> Confirmar Nome Digitado
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // ─── Steps ────────────────────────────────────────────────────────────────

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
    exit:    { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  const renderStep = () => {
    switch (step) {

      // ── Step 0: Tipo de laje ──────────────────────────────────────────────
      case 0:
        return (
          <motion.div key="s0" variants={variants} initial="initial" animate="animate" exit="exit"
            className="flex flex-col items-center w-full"
          >
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-3">
              Tipo de Telhado
            </h2>
            <p className="text-slate-500 text-lg xl:text-xl mb-10">
              O telhado será apoiado sobre laje existente?
            </p>
            <div className="grid grid-cols-2 gap-8 xl:gap-12 w-full max-w-4xl">
              {[
                { val: 'SEM_LAJE' as TipoLaje, label: 'Sem Laje',  sub: 'Telhado com estrutura própria',              color: 'text-orange-400' },
                { val: 'COM_LAJE' as TipoLaje, label: 'Com Laje',  sub: 'Telhado apoiado sobre laje com pontaletes',  color: 'text-blue-400'   },
              ].map((opt) => (
                <motion.button
                  key={opt.val}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setTipoLaje(opt.val); handleNext(); }}
                  className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-10 xl:p-14 flex flex-col items-center justify-center gap-6 h-72 xl:h-96 transition-all hover:shadow-xl hover:border-orange-400 group"
                >
                  <Layers size={72} className={opt.color} />
                  <div className="text-center">
                    <span className="text-2xl xl:text-4xl font-bold text-slate-700 block">{opt.label}</span>
                    <span className="text-base xl:text-lg text-slate-400 mt-2 block">{opt.sub}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      // ── Step 1: Dimensões A e B ───────────────────────────────────────────
      case 1: {
        const currentVal    = editingDim === 'A' ? dimA : dimB;
        const setCurrentVal = (v: string) => editingDim === 'A' ? setDimA(v) : setDimB(v);
        const canAdvance    = parseFloat(dimA.replace(',', '.')) > 0 && parseFloat(dimB.replace(',', '.')) > 0;

        return (
          <motion.div key="s1" variants={variants} initial="initial" animate="animate" exit="exit"
            className="flex items-center justify-center gap-8 xl:gap-14 w-full"
          >
            {/* ── Coluna esquerda: SVG ── */}
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              <TelhadoSVG dimA={dimA} dimB={dimB} activeDim={editingDim} />
              <p className="text-sm xl:text-base text-slate-400 text-center leading-relaxed max-w-xs">
                Toque em <strong className="text-orange-500">A</strong> ou <strong className="text-orange-500">B</strong> ao lado
                para digitar cada dimensão
              </p>
            </div>

            {/* ── Coluna direita: seletores + numpad + botão ── */}
            <div className="flex flex-col items-center gap-4 xl:gap-5 w-full max-w-xs xl:max-w-sm">
              <h2 className="text-2xl xl:text-3xl font-bold text-slate-800 tracking-tight self-start">
                Dimensões do Telhado
              </h2>

              {/* Seletores A / B */}
              <div className="flex gap-4 w-full">
                {(['A', 'B'] as const).map((dim) => {
                  const val    = dim === 'A' ? dimA : dimB;
                  const active = editingDim === dim;
                  return (
                    <button
                      key={dim}
                      onClick={() => setEditingDim(dim)}
                      className={`flex flex-col items-center justify-center flex-1 h-24 xl:h-28 rounded-2xl border-2 transition-all shadow-sm
                        ${active
                          ? 'border-orange-500 bg-orange-50 shadow-orange-100'
                          : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <span className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${active ? 'text-orange-500' : 'text-slate-400'}`}>
                        Dim. {dim}
                      </span>
                      <span className={`text-3xl xl:text-4xl font-black tracking-tight ${active ? 'text-orange-600' : 'text-slate-700'}`}>
                        {val || <span className="text-slate-300">–</span>}
                      </span>
                      <span className="text-xs text-slate-400 mt-0.5">metros</span>
                    </button>
                  );
                })}
              </div>

              {/* Numpad */}
              <NumpadMedida value={currentVal} onChange={setCurrentVal} />

              {/* Botão avançar */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={!canAdvance}
                className="w-full mt-1 bg-orange-600 text-white rounded-full py-4 xl:py-5 text-xl xl:text-2xl font-bold disabled:opacity-40 disabled:bg-slate-300 disabled:scale-100 shadow-md hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
              >
                Avançar <Check size={22} />
              </motion.button>
            </div>
          </motion.div>
        );
      }

      // ── Step 2: Tipo de telha + placa fotovoltaica ────────────────────────
      case 2:
        return (
          <motion.div key="s2" variants={variants} initial="initial" animate="animate" exit="exit"
            className="flex flex-col items-center w-full"
          >
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-8">
              Tipo de Telha
            </h2>
            <div className="grid grid-cols-3 gap-4 xl:gap-6 w-full max-w-4xl mb-6">
              {TIPOS_TELHA.map((t) => (
                <motion.button
                  key={t}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setTipoTelha(t)}
                  className={`rounded-2xl border-2 px-4 py-6 xl:py-8 transition-all shadow-sm flex flex-col items-center justify-center gap-3
                    ${tipoTelha === t
                      ? 'border-orange-500 bg-orange-50 shadow-orange-100'
                      : 'border-slate-200 bg-white hover:border-orange-300'}`}
                >
                  <img
                    src={TELHA_ICONS[t]}
                    alt={t}
                    className="w-20 xl:w-28 h-20 xl:h-28 object-contain"
                  />
                  <span className={`text-lg xl:text-xl font-bold text-center ${tipoTelha === t ? 'text-orange-700' : 'text-slate-700'}`}>
                    {t}
                  </span>
                </motion.button>
              ))}
            </div>
            <div className="w-full max-w-4xl">
              <Toggle
                label="Possui placa fotovoltaica?"
                value={temPlaca}
                onChange={() => setTemPlaca((p) => !p)}
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={!tipoTelha}
              className="mt-8 bg-orange-600 text-white rounded-full px-12 py-4 xl:py-5 text-xl xl:text-2xl font-bold disabled:opacity-40 disabled:bg-slate-300 disabled:scale-100 shadow-md hover:bg-orange-700 transition-all flex items-center gap-2"
            >
              Avançar <Check size={24} />
            </motion.button>
          </motion.div>
        );

      // ── Step 3: Local da obra ─────────────────────────────────────────────
      case 3:
        return (
          <motion.div key="s3" variants={variants} initial="initial" animate="animate" exit="exit"
            className="flex flex-col items-center w-full"
          >
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-3">
              Local da Obra
            </h2>
            <p className="text-slate-500 text-lg xl:text-xl mb-10">
              Informe a cidade onde o telhado será instalado
            </p>
            <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <label className="text-sm xl:text-base font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-orange-500" /> Cidade
              </label>
              <button
                type="button"
                onClick={() => {
                  setCitySearch(quoteData.city && quoteData.city !== 'Não informado' ? quoteData.city : '');
                  setShowCityModal(true);
                }}
                className="w-full text-left pl-6 pr-4 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xl xl:text-2xl font-bold cursor-pointer hover:border-orange-400 hover:shadow-md transition-all flex items-center justify-between outline-none"
              >
                <span className={quoteData.city ? 'text-slate-800' : 'text-slate-400'}>
                  {quoteData.city || (isLoadingCities ? 'Carregando cidades...' : 'Toque para buscar a cidade...')}
                </span>
                <Search className="text-slate-400" />
              </button>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="mt-12 bg-slate-800 text-white rounded-full px-12 py-4 xl:py-5 text-xl xl:text-2xl font-bold shadow-md hover:bg-slate-900 transition-all flex items-center gap-2"
            >
              Ver Resumo <ChevronLeft className="rotate-180" size={24} />
            </motion.button>
          </motion.div>
        );

      // ── Step 4: Resumo ────────────────────────────────────────────────────
      case 4: {
        const vaoAuto = tipoTelha === 'Cerâmico' || tipoTelha === 'Concreto' ? '1,0 m' : '1,5 m';
        const linhas = [
          { label: 'Tipo de Telhado',       value: tipoLaje === 'SEM_LAJE' ? 'Sem Laje' : 'Com Laje' },
          { label: 'Dimensão A (largura)',   value: `${dimA} m` },
          { label: 'Dimensão B (profund.)',  value: `${dimB} m` },
          { label: 'Tipo de Telha',          value: tipoTelha },
          { label: 'Placa Fotovoltaica',     value: temPlaca ? 'Sim (+0,25 kN/m²)' : 'Não' },
          { label: 'Vão entre apoios',       value: `${vaoAuto} (automático)` },
          { label: 'Local da Obra',          value: quoteData.city || 'Não informado' },
        ];

        return (
          <motion.div key="s4" variants={variants} initial="initial" animate="animate" exit="exit"
            className="flex flex-col items-center w-full"
          >
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-8">
              Resumo do Pedido
            </h2>
            <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-[2rem] p-8 xl:p-10 shadow-md flex flex-col gap-3 xl:gap-4 mb-8">
              {linhas.map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <span className="text-slate-400 uppercase font-bold text-sm xl:text-base">{label}</span>
                  <span className="font-bold text-slate-800 text-base xl:text-lg text-right">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm xl:text-base text-center max-w-2xl mb-6 leading-relaxed">
              Os perfis estruturais, pontaletes e demais quantitativos serão calculados
              automaticamente pelo sistema com base nas informações acima.
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLeadModal(true)}
              className="bg-orange-600 text-white rounded-full px-10 py-5 xl:py-6 text-2xl xl:text-3xl font-bold w-full max-w-4xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all flex justify-center items-center gap-3"
            >
              <Check size={32} /> Confirmar e Gerar Orçamento
            </motion.button>
          </motion.div>
        );
      }

      default:
        return null;
    }
  };

  // ─── Layout principal ─────────────────────────────────────────────────────

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-800 flex flex-col p-6 xl:p-12 select-none overflow-hidden font-sans">
      <header className="flex justify-between items-center mb-8 flex-none w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-slate-900 uppercase">
            Madeiramento
          </h1>
          <div className="h-1 w-24 bg-orange-500 rounded-full" />
        </div>
        <div className="bg-white border border-slate-200 px-6 py-2 rounded-full shadow-sm">
          <span className="text-lg xl:text-xl font-bold text-slate-500">
            Etapa <span className="text-orange-600">{step + 1}</span> de {TOTAL_STEPS}
          </span>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center relative w-full h-full min-h-0">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      <footer className="mt-8 flex justify-between items-center flex-none w-full">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="bg-white text-slate-600 border border-slate-200 rounded-full px-8 py-3 xl:px-10 xl:py-4 text-lg xl:text-xl font-bold shadow-sm hover:bg-slate-100 transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={24} /> {step === 0 ? 'Cancelar' : 'Voltar'}
        </motion.button>
        {step > 0 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCancel}
            className="bg-white text-slate-500 border border-slate-200 rounded-full px-8 py-3 xl:px-10 xl:py-4 text-lg xl:text-xl font-bold shadow-sm hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center gap-2"
          >
            Cancelar Operação
          </motion.button>
        )}
      </footer>

      <AnimatePresence>
        {showCityModal && renderCityModal()}
      </AnimatePresence>

      {showLeadModal && (
        <LeadCaptureModal onConfirm={submitQuote} onCancel={() => setShowLeadModal(false)} />
      )}

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-50/90 backdrop-blur-sm z-50 flex items-center justify-center flex-col"
        >
          <div className="w-20 h-20 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin shadow-md" />
          <p className="text-2xl font-bold text-slate-800 mt-8 tracking-tight">Calculando Materiais...</p>
          <p className="text-slate-500 mt-2">Isso levará apenas alguns segundos</p>
        </motion.div>
      )}
    </div>
  );
};

export default MadeiramentoFlow;