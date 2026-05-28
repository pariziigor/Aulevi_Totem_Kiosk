import React from "react";
import type { EditingDim } from "./types";

interface TelhadoSVGProps {
  dimA: string;
  dimB: string;
  activeDim: EditingDim;
}

export const TelhadoSVG: React.FC<TelhadoSVGProps> = ({
  dimA,
  dimB,
  activeDim,
}) => {
  const labelA = dimA ? `${dimA} m` : "? m";
  const labelB = dimB ? `${dimB} m` : "? m";
  const activeA = activeDim === "A";
  const activeB = activeDim === "B";

  return (
    <svg
      width="100%"
      viewBox="0 0 520 310"
      role="img"
      aria-label="Diagrama isométrico do telhado com dimensões A e B"
      className="w-full max-w-[280px] md:max-w-sm xl:max-w-md"
    >
      <defs>
        <marker id="arrOrange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
        <marker id="arrOrangeActive" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>

      <polygon points="80,240 80,162 130,135 130,213" fill="#6b7280" stroke="#4b5563" strokeWidth="0.8" />
      <polygon points="130,213 130,135 400,135 400,213" fill="#9ca3af" stroke="#6b7280" strokeWidth="0.8" />
      <polygon points="400,213 400,135 407,131 407,210" fill="#4b5563" stroke="#374151" strokeWidth="0.8" />

      <polygon points="80,157 130,130 400,130 350,157" fill="#d97706" stroke="#b45309" strokeWidth="0.8" opacity="0.35" />
      <polygon points="80,157 350,157 400,130 130,130" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
      <line x1="80" y1="157" x2="350" y2="157" stroke="#b45309" strokeWidth="2" />
      <line x1="130" y1="130" x2="400" y2="130" stroke="#b45309" strokeWidth="1.5" />
      <line x1="98" y1="149" x2="368" y2="149" stroke="#d97706" strokeWidth="0.6" strokeDasharray="5,5" opacity="0.5" />
      <line x1="113" y1="141" x2="383" y2="141" stroke="#d97706" strokeWidth="0.6" strokeDasharray="5,5" opacity="0.5" />

      <line x1="80" y1="268" x2="80" y2="222" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3,3" />
      <line x1="350" y1="268" x2="350" y2="222" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3,3" />
      <line
        x1="89"
        y1="220"
        x2="341"
        y2="220"
        stroke={activeA ? "#ea580c" : "#f97316"}
        strokeWidth={activeA ? 2.6 : 2}
        markerStart={activeA ? "url(#arrOrangeActive)" : "url(#arrOrange)"}
        markerEnd={activeA ? "url(#arrOrangeActive)" : "url(#arrOrange)"}
      />
      <rect x="177" y="206" width="58" height="22" rx="5" fill={activeA ? "#fff7ed" : "#f8fafc"} stroke={activeA ? "#ea580c" : "#f97316"} strokeWidth={activeA ? 1.8 : 1.2} />
      <text x="206" y="222" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight={activeA ? "700" : "600"} fill={activeA ? "#ea580c" : "#f97316"}>
        A - larg.
      </text>
      <text x="206" y="252" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="600" fill={activeA ? "#ea580c" : "#94a3b8"}>
        {labelA}
      </text>

      <line x1="38" y1="157" x2="80" y2="180" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3,3" />
      <line x1="54" y1="135" x2="80" y2="148" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3,3" />
      <line
        x1="44"
        y1="154"
        x2="59"
        y2="138"
        stroke={activeB ? "#ea580c" : "#f97316"}
        strokeWidth={activeB ? 2.6 : 2}
        markerStart={activeB ? "url(#arrOrangeActive)" : "url(#arrOrange)"}
        markerEnd={activeB ? "url(#arrOrangeActive)" : "url(#arrOrange)"}
      />
      <rect x="18" y="132" width="32" height="22" rx="5" fill={activeB ? "#fff7ed" : "#f8fafc"} stroke={activeB ? "#ea580c" : "#f97316"} strokeWidth={activeB ? 1.8 : 1.2} />
      <text x="34" y="148" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight={activeB ? "700" : "600"} fill={activeB ? "#ea580c" : "#f97316"}>
        B
      </text>
      <text x="34" y="175" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="600" fill={activeB ? "#ea580c" : "#94a3b8"}>
        {labelB}
      </text>
    </svg>
  );
};
