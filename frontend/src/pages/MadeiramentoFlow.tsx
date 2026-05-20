import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useKioskStore } from "../store/useKioskStore";
import { LeadCaptureModal } from "../components/LeadCaptureModal";
import { KioskService } from "../services/api";
import { ChevronLeft, Check, MapPin, Search, X, Layers } from "lucide-react";

// ---------------------------------------------------------------------------
// Tipos locais
// ---------------------------------------------------------------------------

interface IBGEMunicipio {
  nome: string;
  microrregiao?: { mesorregiao?: { UF?: { sigla: string } } };
}

type TipoLaje = "SEM_LAJE" | "COM_LAJE";

const TIPOS_TELHA = [
  "Cerâmico",
  "Concreto",
  "Fibrocimento",
  "Aço galvanizado",
  "Termoacustico",
  "Shingle",
] as const;

const PERFIS_VIGA = [
  "Ripa 0,65",
  "Ripa 0,80",
  "Caibro Aberto 0,80",
  "Caibro Aberto 0,95",
  "Caibro Fechado 0,65",
  "Caibro Fechado 0,80",
  "Caibro Fechado 0,95",
  "Terça 0,80",
  "Terça 0,95",
  "Terça 1,25",
  "Viga 1,25",
  "Viga 1,50",
] as const;

// ---------------------------------------------------------------------------
// Helpers de formatação
// ---------------------------------------------------------------------------

const formatTitleCase = (text: string) =>
  text.replace(/(?:^|\s)\S/g, (m) => m.toUpperCase());

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

const MadeiramentoFlow: React.FC = () => {
  const navigate = useNavigate();
  const { quoteData, setQuoteData, resetSession } = useKioskStore();

  const [step, setStep] = useState(0);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Campos específicos deste flow
  const [tipoLaje, setTipoLaje] = useState<TipoLaje>("SEM_LAJE");
  const [tipoTelha, setTipoTelha] = useState("");
  const [temPlaca, setTemPlaca] = useState(false);
  const [vaoMaximo, setVaoMaximo] = useState("1");
  const [dimA, setDimA] = useState("");
  const [dimB, setDimB] = useState("");
  const [perfilViga, setPerfilViga] = useState("Terça 0,95");
  const [pontaletesPorLinha, setPontaletesPorLinha] = useState("4");
  const [alturaPontaletes, setAlturaPontaletes] = useState("1");
  const [editingDim, setEditingDim] = useState<"A" | "B">("A");

  // Modal cidade
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [allCities, setAllCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Total de steps: depende do tipoLaje
  // SEM LAJE : 0-TipoLaje | 1-Dimensões | 2-Telha | 3-PerfilViga | 4-Detalhes | 5-Resumo
  // COM LAJE : 0-TipoLaje | 1-Dimensões | 2-Telha | 3-Pontaletes  | 4-Detalhes | 5-Resumo
  const TOTAL_STEPS = 6;

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const res = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?ordenacao=nome",
        );
        if (!res.ok) throw new Error();
        const data: IBGEMunicipio[] = await res.json();
        setAllCities(
          data.map((m) => {
            const uf = m.microrregiao?.mesorregiao?.UF?.sigla;
            return uf ? `${m.nome} - ${uf}` : m.nome;
          }),
        );
      } catch {
        setAllCities([
          "São Paulo - SP",
          "Rio de Janeiro - RJ",
          "Curitiba - PR",
        ]);
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => (step > 0 ? setStep((s) => s - 1) : navigate("/"));
  const handleCancel = () => {
    resetSession();
    navigate("/");
  };

  const submitQuote = async (name: string, phone: string) => {
    setIsProcessing(true);
    try {
      const payload = {
        module: "MADEIRAMENTO",
        lead_name: name,
        lead_phone: phone,
        tipo_laje: tipoLaje,
        tipo_telha: tipoTelha,
        tem_placa: temPlaca,
        vao_maximo: parseFloat(vaoMaximo) || 1,
        dim_a: parseFloat(dimA),
        dim_b: parseFloat(dimB),
        // SEM LAJE
        perfil_viga: tipoLaje === "SEM_LAJE" ? perfilViga : undefined,
        // COM LAJE
        pontaletes_por_linha:
          tipoLaje === "COM_LAJE" ? parseInt(pontaletesPorLinha) : undefined,
        altura_pontaletes:
          tipoLaje === "COM_LAJE" ? parseFloat(alturaPontaletes) : undefined,
        // compartilhados
        city: quoteData.city || "Não informado",
      };

      const result = await KioskService.submitQuote(payload);

      alert(
        `ORÇAMENTO GERADO COM SUCESSO!\nNº do Pedido: ${result.quote_number}\nValor Total: R$ ${result.total_value.toFixed(2)}`,
      );
      resetSession();
      navigate("/");
    } catch (err) {
      console.error("Falha na API:", err);
      alert("ERRO: Falha ao processar orçamento. Tente novamente.");
      setIsProcessing(false);
    }
  };

  // ─── Sub-componentes reutilizáveis ────────────────────────────────────────

  // Teclado numérico para medidas (permite decimais)
  const NumpadMedida = ({
    value,
    onChange,
    maxLen = 5,
  }: {
    value: string;
    onChange: (v: string) => void;
    maxLen?: number;
  }) => {
    const keys = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      ",",
      "0",
      "APAGAR",
    ];
    const handle = (k: string) => {
      if (k === "APAGAR") {
        onChange(value.slice(0, -1));
        return;
      }
      if (k === "," && value.includes(",")) return;
      if (value.length >= maxLen) return;
      onChange(value + k);
    };
    return (
      <div className="grid grid-cols-3 gap-3 xl:gap-4 w-full max-w-md mx-auto mt-4">
        {keys.map((k) => (
          <motion.button
            key={k}
            whileTap={{ scale: 0.95 }}
            onClick={() => handle(k)}
            className={`
              bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center h-14 xl:h-18 transition-all hover:shadow-md hover:border-orange-300
              ${k === "0" ? "col-span-1" : ""}
              ${k === "APAGAR" ? "text-base xl:text-lg font-bold text-rose-500 bg-rose-50/50 hover:bg-rose-100 border-rose-100" : "text-2xl xl:text-3xl font-bold text-slate-700"}
            `}
          >
            {k}
          </motion.button>
        ))}
      </div>
    );
  };

  const Toggle = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: boolean;
    onChange: () => void;
  }) => (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col items-center justify-center gap-4 shadow-sm">
      <span className="text-base xl:text-lg font-bold text-slate-700 text-center uppercase tracking-tight">
        {label}
      </span>
      <div className="flex items-center gap-4">
        <span
          className={`text-lg font-black transition-colors ${!value ? "text-slate-800" : "text-slate-300"}`}
        >
          NÃO
        </span>
        <div
          onClick={onChange}
          className={`w-20 xl:w-24 h-10 xl:h-12 rounded-full p-1.5 flex items-center cursor-pointer transition-colors duration-300 shadow-inner ${value ? "bg-orange-500 justify-end" : "bg-slate-300 justify-start"}`}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 700, damping: 30 }}
            className="w-7 h-7 xl:w-9 xl:h-9 bg-white rounded-full shadow-md"
          />
        </div>
        <span
          className={`text-lg font-black transition-colors ${value ? "text-orange-600" : "text-slate-300"}`}
        >
          SIM
        </span>
      </div>
    </div>
  );

  // ─── Modal Cidade ─────────────────────────────────────────────────────────

  const renderCityModal = () => {
    const normalize = (t: string) =>
      t
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const filtered = allCities.filter((c) =>
      normalize(c).includes(normalize(citySearch)),
    );
    const keyboard = [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ç"],
      ["z", "x", "c", "v", "b", "n", "m", "-", "APAGAR"],
    ];
    const handleKey = (k: string) => {
      if (k === "APAGAR") {
        setCitySearch((p) => p.slice(0, -1));
        return;
      }
      setCitySearch((p) => formatTitleCase(p + k.toLowerCase()));
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 xl:p-8 select-none"
      >
        <div className="bg-slate-50 w-full max-w-5xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden max-h-[1000px]">
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-slate-800 uppercase flex items-center gap-2">
              <Search className="text-orange-500" /> Buscar Cidade
            </h3>
            <button
              onClick={() => setShowCityModal(false)}
              className="bg-slate-100 text-slate-600 p-3 rounded-full hover:bg-slate-200"
            >
              <X size={28} />
            </button>
          </header>
          <div className="p-6 bg-white border-b border-slate-100">
            <div className="w-full bg-slate-50 border-2 border-orange-500 ring-4 ring-orange-50 rounded-2xl h-16 xl:h-20 flex items-center px-6 shadow-inner">
              <span className="text-2xl xl:text-3xl font-bold text-slate-800">
                {citySearch || (
                  <span className="text-slate-400 font-medium">
                    Toque nas teclas abaixo...
                  </span>
                )}
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
                    onClick={() => {
                      setQuoteData({ city });
                      setCitySearch(city);
                      setShowCityModal(false);
                    }}
                    className="w-full text-left bg-white px-6 py-4 rounded-xl border border-slate-200 text-xl font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all shadow-sm flex items-center gap-3"
                  >
                    <MapPin size={24} className="text-slate-400" /> {city}
                  </button>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-xl text-slate-400">
                  Nenhuma cidade encontrada...
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-xl text-slate-400">
                Comece a digitar para ver os resultados
              </div>
            )}
          </div>
          <div className="flex-grow bg-white p-6 flex flex-col justify-center gap-2 xl:gap-3">
            {keyboard.map((row, ri) => (
              <div
                key={ri}
                className="flex justify-center gap-2 xl:gap-3 w-full"
              >
                {row.map((key) => (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKey(key)}
                    className={`flex items-center justify-center border border-slate-200 rounded-xl h-14 xl:h-16 text-lg xl:text-xl font-bold uppercase shadow-sm transition-colors hover:border-orange-300
                      ${key === "APAGAR" ? "flex-[1.5] bg-slate-200 text-slate-700 hover:bg-slate-300" : "flex-1 bg-white text-slate-700"}
                    `}
                  >
                    {key}
                  </motion.button>
                ))}
              </div>
            ))}
            <div className="flex justify-center w-full mt-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setCitySearch((p) => p + " ")}
                className="w-full border border-slate-200 rounded-xl h-14 xl:h-16 text-lg xl:text-xl font-bold uppercase shadow-sm bg-white text-slate-700 hover:border-orange-300 transition-colors"
              >
                ESPAÇO
              </motion.button>
            </div>
            <div className="mt-4 flex justify-end">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setQuoteData({ city: citySearch });
                  setShowCityModal(false);
                }}
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
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  const renderStep = () => {
    switch (step) {
      // ── Step 0: Tipo de laje ──────────────────────────────────────────────
      case 0:
        return (
          <motion.div
            key="s0"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
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
                {
                  val: "SEM_LAJE" as TipoLaje,
                  label: "Sem Laje",
                  sub: "Telhado apoiado em estrutura própria",
                  icon: <Layers size={64} className="text-orange-400" />,
                },
                {
                  val: "COM_LAJE" as TipoLaje,
                  label: "Com Laje",
                  sub: "Telhado sobre laje existente com pontaletes",
                  icon: <Layers size={64} className="text-blue-400" />,
                },
              ].map((opt) => (
                <motion.button
                  key={opt.val}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setTipoLaje(opt.val);
                    handleNext();
                  }}
                  className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-10 xl:p-14 flex flex-col items-center justify-center gap-6 h-72 xl:h-96 transition-all hover:shadow-xl hover:border-orange-400 group"
                >
                  {opt.icon}
                  <div className="text-center">
                    <span className="text-2xl xl:text-4xl font-bold text-slate-700 block">
                      {opt.label}
                    </span>
                    <span className="text-base xl:text-lg text-slate-400 mt-2 block">
                      {opt.sub}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      // ── Step 1: Dimensões A e B ───────────────────────────────────────────
      case 1: {
        const currentVal = editingDim === "A" ? dimA : dimB;
        const setCurrentVal = (v: string) =>
          editingDim === "A" ? setDimA(v) : setDimB(v);
        const canAdvance = parseFloat(dimA) > 0 && parseFloat(dimB) > 0;

        return (
          <motion.div
            key="s1"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center w-full"
          >
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-2">
              Dimensões do Telhado
            </h2>
            <p className="text-slate-500 text-lg xl:text-xl mb-6">
              <strong>A</strong> = largura (eixo das vigas) · <strong>B</strong>{" "}
              = profundidade (eixo das terças)
            </p>

            {/* Seletor A / B */}
            <div className="flex gap-6 mb-4">
              {(["A", "B"] as const).map((dim) => {
                const val = dim === "A" ? dimA : dimB;
                const active = editingDim === dim;
                return (
                  <button
                    key={dim}
                    onClick={() => setEditingDim(dim)}
                    className={`flex flex-col items-center justify-center w-48 xl:w-56 h-28 xl:h-36 rounded-3xl border-2 transition-all shadow-sm
                      ${active ? "border-orange-500 bg-orange-50 shadow-orange-100" : "border-slate-200 bg-white hover:border-slate-300"}
                    `}
                  >
                    <span
                      className={`text-base font-bold uppercase tracking-widest mb-1 ${active ? "text-orange-500" : "text-slate-400"}`}
                    >
                      Dimensão {dim}
                    </span>
                    <span
                      className={`text-4xl xl:text-5xl font-black tracking-tight ${active ? "text-orange-600" : "text-slate-700"}`}
                    >
                      {val || <span className="text-slate-300">–</span>}
                    </span>
                    <span className="text-sm text-slate-400 mt-1">metros</span>
                  </button>
                );
              })}
            </div>

            <NumpadMedida value={currentVal} onChange={setCurrentVal} />

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={!canAdvance}
              className="mt-8 bg-orange-600 text-white rounded-full px-12 py-4 xl:py-5 text-xl xl:text-2xl font-bold disabled:opacity-40 disabled:bg-slate-300 shadow-md hover:bg-orange-700 transition-all flex items-center gap-2"
            >
              Avançar <Check size={24} />
            </motion.button>
          </motion.div>
        );
      }

      // ── Step 2: Tipo de telha + vão máximo + placa ────────────────────────
      case 2:
        return (
          <motion.div
            key="s2"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center w-full"
          >
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-8">
              Tipo de Telha
            </h2>
            <div className="grid grid-cols-3 gap-4 xl:gap-6 w-full max-w-5xl mb-6">
              {TIPOS_TELHA.map((t) => (
                <motion.button
                  key={t}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setTipoTelha(t)}
                  className={`rounded-2xl border-2 px-4 py-5 xl:py-7 text-lg xl:text-xl font-bold transition-all shadow-sm
                    ${tipoTelha === t ? "border-orange-500 bg-orange-50 text-orange-700 shadow-orange-100" : "border-slate-200 bg-white text-slate-700 hover:border-orange-300"}
                  `}
                >
                  {t}
                </motion.button>
              ))}
            </div>

            {/* Placa fotovoltaica */}
            <div className="w-full max-w-5xl mb-6">
              <Toggle
                label="Tem placa fotovoltaica?"
                value={temPlaca}
                onChange={() => setTemPlaca((p) => !p)}
              />
            </div>

            {/* Vão máximo */}
            <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
              <div>
                <p className="text-base font-bold text-slate-400 uppercase tracking-widest">
                  Vão máximo entre apoios
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Cerâmica: use 1 m · demais: 1–2 m
                </p>
              </div>
              <div className="flex items-center gap-3">
                {["1", "1.2", "1.5", "2"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setVaoMaximo(v)}
                    className={`w-16 xl:w-20 h-12 xl:h-14 rounded-xl border-2 text-lg xl:text-xl font-bold transition-all
                      ${vaoMaximo === v ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-600 hover:border-orange-300"}
                    `}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={!tipoTelha}
              className="mt-8 bg-orange-600 text-white rounded-full px-12 py-4 xl:py-5 text-xl xl:text-2xl font-bold disabled:opacity-40 disabled:bg-slate-300 shadow-md hover:bg-orange-700 transition-all flex items-center gap-2"
            >
              Avançar <Check size={24} />
            </motion.button>
          </motion.div>
        );

      // ── Step 3: Perfil da viga (SEM LAJE) ou Pontaletes (COM LAJE) ────────
      case 3:
        if (tipoLaje === "SEM_LAJE") {
          return (
            <motion.div
              key="s3sl"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center w-full"
            >
              <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-3">
                Perfil da Viga
              </h2>
              <p className="text-slate-500 text-lg xl:text-xl mb-8">
                Selecione o perfil estrutural conforme projeto
              </p>
              <div className="grid grid-cols-3 gap-4 xl:gap-6 w-full max-w-5xl">
                {PERFIS_VIGA.map((p) => (
                  <motion.button
                    key={p}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPerfilViga(p)}
                    className={`rounded-2xl border-2 px-4 py-5 xl:py-6 text-base xl:text-lg font-bold transition-all shadow-sm
                      ${perfilViga === p ? "border-orange-500 bg-orange-50 text-orange-700 shadow-orange-100" : "border-slate-200 bg-white text-slate-700 hover:border-orange-300"}
                    `}
                  >
                    {p}
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="mt-10 bg-orange-600 text-white rounded-full px-12 py-4 xl:py-5 text-xl xl:text-2xl font-bold shadow-md hover:bg-orange-700 transition-all flex items-center gap-2"
              >
                Avançar <Check size={24} />
              </motion.button>
            </motion.div>
          );
        } else {
          // COM LAJE: configurar pontaletes
          return (
            <motion.div
              key="s3cl"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center w-full"
            >
              <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-3">
                Configuração dos Pontaletes
              </h2>
              <p className="text-slate-500 text-lg xl:text-xl mb-8">
                Defina os apoios intermediários sobre a laje
              </p>

              <div className="flex flex-col gap-6 w-full max-w-3xl">
                {/* Pontaletes por linha */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <p className="text-base font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Pontaletes por linha
                  </p>
                  <div className="flex gap-4 flex-wrap">
                    {["2", "3", "4", "5", "6"].map((v) => (
                      <button
                        key={v}
                        onClick={() => setPontaletesPorLinha(v)}
                        className={`w-16 xl:w-20 h-14 xl:h-16 rounded-xl border-2 text-2xl font-bold transition-all
                          ${pontaletesPorLinha === v ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-600 hover:border-orange-300"}
                        `}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Altura dos pontaletes */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <p className="text-base font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Altura média dos pontaletes (m)
                  </p>
                  <div className="flex items-center gap-3 justify-between">
                    <div className="text-5xl font-black text-orange-600 w-32 text-center">
                      {alturaPontaletes || (
                        <span className="text-slate-200">–</span>
                      )}
                    </div>
                    <NumpadMedida
                      value={alturaPontaletes}
                      onChange={setAlturaPontaletes}
                      maxLen={4}
                    />
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={
                  !pontaletesPorLinha || parseFloat(alturaPontaletes) <= 0
                }
                className="mt-10 bg-orange-600 text-white rounded-full px-12 py-4 xl:py-5 text-xl xl:text-2xl font-bold disabled:opacity-40 disabled:bg-slate-300 shadow-md hover:bg-orange-700 transition-all flex items-center gap-2"
              >
                Avançar <Check size={24} />
              </motion.button>
            </motion.div>
          );
        }

      // ── Step 4: Cidade ────────────────────────────────────────────────────
      case 4:
        return (
          <motion.div
            key="s4"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center w-full"
          >
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-3">
              Local da Obra
            </h2>
            <p className="text-slate-500 text-lg xl:text-xl mb-10">
              Informe a cidade onde será instalado o telhado
            </p>

            <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <label className="text-sm xl:text-base font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-orange-500" /> Cidade
              </label>
              <button
                type="button"
                onClick={() => {
                  setCitySearch(
                    quoteData.city && quoteData.city !== "Não informado"
                      ? quoteData.city
                      : "",
                  );
                  setShowCityModal(true);
                }}
                className="w-full text-left pl-6 pr-4 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xl xl:text-2xl font-bold text-slate-800 cursor-pointer hover:border-orange-400 hover:shadow-md transition-all flex items-center justify-between outline-none"
              >
                <span
                  className={
                    quoteData.city ? "text-slate-800" : "text-slate-400"
                  }
                >
                  {quoteData.city ||
                    (isLoadingCities
                      ? "Carregando cidades..."
                      : "Toque para buscar a cidade...")}
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

      // ── Step 5: Resumo ────────────────────────────────────────────────────
      case 5:
        return (
          <motion.div
            key="s5"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center w-full"
          >
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-8">
              Resumo do Pedido
            </h2>

            <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-[2rem] p-8 xl:p-10 shadow-md flex flex-col gap-4 mb-8 text-lg xl:text-xl">
              {[
                {
                  label: "Tipo de Telhado",
                  value: tipoLaje === "SEM_LAJE" ? "Sem Laje" : "Com Laje",
                },
                { label: "Dimensões", value: `A = ${dimA} m · B = ${dimB} m` },
                {
                  label: "Tipo de Telha",
                  value: `${tipoTelha}${temPlaca ? " + Placa Fotovoltaica" : ""}`,
                },
                { label: "Vão Máximo", value: `${vaoMaximo} m` },
                ...(tipoLaje === "SEM_LAJE"
                  ? [{ label: "Perfil da Viga", value: perfilViga }]
                  : [
                      {
                        label: "Pontaletes / linha",
                        value: pontaletesPorLinha + " un",
                      },
                      {
                        label: "Altura Pontaletes",
                        value: alturaPontaletes + " m",
                      },
                    ]),
                {
                  label: "Local da Obra",
                  value: quoteData.city || "Não informado",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between border-b border-slate-100 pb-3"
                >
                  <span className="text-slate-400 uppercase font-bold text-sm xl:text-base">
                    {label}
                  </span>
                  <span className="font-bold text-slate-800">{value}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLeadModal(true)}
              className="bg-orange-600 text-white rounded-full px-10 py-5 xl:py-6 text-2xl xl:text-3xl font-bold w-full max-w-4xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all flex justify-center items-center gap-3"
            >
              <Check size={32} /> Confirmar e Gerar Orçamento
            </motion.button>
          </motion.div>
        );

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
            Etapa <span className="text-orange-600">{step + 1}</span> de{" "}
            {TOTAL_STEPS}
          </span>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center relative w-full h-full min-h-0">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      <footer className="mt-8 flex justify-between items-center flex-none w-full">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="bg-white text-slate-600 border border-slate-200 rounded-full px-8 py-3 xl:px-10 xl:py-4 text-lg xl:text-xl font-bold shadow-sm hover:bg-slate-100 transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={24} /> {step === 0 ? "Cancelar" : "Voltar"}
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

      <AnimatePresence>{showCityModal && renderCityModal()}</AnimatePresence>

      {showLeadModal && (
        <LeadCaptureModal
          onConfirm={submitQuote}
          onCancel={() => setShowLeadModal(false)}
        />
      )}

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-50/90 backdrop-blur-sm z-50 flex items-center justify-center flex-col"
        >
          <div className="w-20 h-20 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin shadow-md" />
          <p className="text-2xl font-bold text-slate-800 mt-8 tracking-tight">
            Calculando Materiais...
          </p>
          <p className="text-slate-500 mt-2">
            Isso levará apenas alguns segundos
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default MadeiramentoFlow;
