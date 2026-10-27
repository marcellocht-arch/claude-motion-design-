import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../theme";

/*
 * Décors et accessoires dessinés en code, dans la charte ELV8co (bleu nuit, cuivre, ivoire).
 * Pour la vidéo 2 « Le parcours de Sophie », réutilisables ailleurs.
 */

const IV = C.ivory;
const INK = C.deep;

// ─── Sophie ────────────────────────────────────────────────────────────────

export type Mood = "worried" | "neutral" | "happy" | "think";

export const Sophie: React.FC<{ size?: number; mood?: Mood; phone?: boolean; style?: React.CSSProperties }> = ({ size = 360, mood = "neutral", phone, style }) => {
  const frame = useCurrentFrame();
  const blink = (frame + 40) % 110 < 4 ? 0.15 : 1;
  const bob = Math.sin(frame / 14) * 3;
  const mouth =
    mood === "happy" ? "M86 132 Q100 146 114 132" : mood === "worried" ? "M88 140 Q100 130 112 140" : mood === "think" ? "M90 136 L110 134" : "M88 136 Q100 141 112 136";
  const brow = mood === "worried" ? [["M70 92 L88 86"], ["M112 86 L130 92"]] : mood === "think" ? [["M70 88 L88 86"], ["M112 82 L130 88"]] : [["M70 88 Q79 84 88 88"], ["M112 88 Q121 84 130 88"]];
  return (
    <svg viewBox="0 0 200 300" width={size} height={size * 1.5} style={{ overflow: "visible", ...style }}>
      <g transform={`translate(0 ${bob})`}>
        {/* corps */}
        <path d="M40 300 C40 230 60 200 100 200 C140 200 160 230 160 300 Z" fill={C.copper} />
        <path d="M84 200 L100 226 L116 200 Z" fill={IV} />
        {/* cou + tête */}
        <rect x={90} y={176} width={20} height={28} rx={8} fill="#C98D63" />
        <circle cx={100} cy={118} r={62} fill="#D9A37A" />
        {/* cheveux (chignon) */}
        <path d="M38 118 C36 70 64 50 100 50 C136 50 164 70 162 118 C150 96 128 84 100 84 C72 84 50 96 38 118 Z" fill="#3A2416" />
        <circle cx={100} cy={46} r={22} fill="#3A2416" />
        {/* yeux */}
        {[80, 120].map((x) => (
          <ellipse key={x} cx={x} cy={110} rx={6} ry={8 * blink} fill={INK} />
        ))}
        {brow.map(([d], i) => (
          <path key={i} d={d} stroke="#3A2416" strokeWidth={4} fill="none" strokeLinecap="round" />
        ))}
        <path d={mouth} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        <circle cx={70} cy={128} r={8} fill="#E07B5A" opacity={0.35} />
        <circle cx={130} cy={128} r={8} fill="#E07B5A" opacity={0.35} />
        {/* téléphone en main */}
        {phone ? (
          <g transform="translate(118 222) rotate(-12)">
            <rect x={0} y={0} width={34} height={58} rx={6} fill={INK} stroke={IV} strokeWidth={3} />
            <rect x={5} y={7} width={24} height={40} rx={2} fill={C.copperLight} opacity={0.6 + 0.4 * Math.abs(Math.sin(frame / 9))} />
            <circle cx={8} cy={70} r={12} fill="#D9A37A" />
          </g>
        ) : null}
      </g>
    </svg>
  );
};

// ─── Chaudière en panne ────────────────────────────────────────────────────

export const Boiler: React.FC<{ size?: number; broken?: boolean; style?: React.CSSProperties }> = ({ size = 320, broken = true, style }) => {
  const frame = useCurrentFrame();
  const blink = broken && Math.floor(frame / 12) % 2 === 0;
  const drip = (frame % 40) / 40;
  return (
    <svg viewBox="0 0 200 280" width={size} height={size * 1.4} style={{ overflow: "visible", ...style }}>
      <rect x={30} y={10} width={140} height={200} rx={16} fill={IV} stroke={INK} strokeWidth={4} />
      <rect x={50} y={34} width={100} height={46} rx={8} fill={INK} />
      <text x={100} y={67} textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize={26} fill={blink ? "#FF6B5E" : "#5A2A26"}>
        {broken ? "E1" : "60°"}
      </text>
      {[70, 100, 130].map((x) => (
        <circle key={x} cx={x} cy={110} r={9} fill="none" stroke={INK} strokeWidth={4} />
      ))}
      <circle cx={100} cy={160} r={22} fill={broken ? "#2A3B50" : C.copperLight} stroke={INK} strokeWidth={4} />
      {/* tuyaux */}
      {[60, 90, 110, 140].map((x, i) => (
        <path key={x} d={`M${x} 210 L${x} 262`} stroke={i % 2 ? C.copper : C.steel} strokeWidth={9} strokeLinecap="round" />
      ))}
      {broken ? <ellipse cx={90} cy={262 + drip * 40} rx={5} ry={7} fill="#7CC3EA" opacity={1 - drip} /> : null}
    </svg>
  );
};

// ─── Radiateur ─────────────────────────────────────────────────────────────

export const Radiator: React.FC<{ size?: number; warm?: number; style?: React.CSSProperties }> = ({ size = 420, warm = 0, style }) => {
  const frame = useCurrentFrame();
  return (
    <svg viewBox="0 0 300 200" width={size} height={size * 0.67} style={{ overflow: "visible", ...style }}>
      {warm > 0
        ? [0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M${90 + i * 60} ${30 - ((frame + i * 10) % 40)} q10 -12 0 -24 q-10 -12 0 -24`}
              stroke={C.copperLight}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              opacity={warm * (1 - ((frame + i * 10) % 40) / 40)}
            />
          ))
        : null}
      {new Array(9).fill(0).map((_, i) => (
        <rect key={i} x={30 + i * 27} y={40} width={22} height={140} rx={11} fill={IV} stroke={INK} strokeWidth={3} />
      ))}
      <rect x={24} y={60} width={252} height={10} fill={C.steel} />
      <rect x={24} y={150} width={252} height={10} fill={C.steel} />
      <path d="M276 165 L292 165 L292 196" stroke={C.copper} strokeWidth={8} fill="none" />
      <circle cx={292} cy={150} r={10} fill={C.copper} />
    </svg>
  );
};

// ─── Camionnette d'artisan ─────────────────────────────────────────────────

export const Van: React.FC<{ size?: number; label?: string; style?: React.CSSProperties }> = ({ size = 520, label = "CHAUFFAGE", style }) => {
  const frame = useCurrentFrame();
  const spin = frame * 8;
  return (
    <svg viewBox="0 0 400 200" width={size} height={size * 0.5} style={{ overflow: "visible", ...style }}>
      <path d="M20 160 L20 50 Q20 30 40 30 L260 30 L330 80 L380 96 Q392 100 392 114 L392 160 Z" fill={IV} stroke={INK} strokeWidth={4} />
      <path d="M262 40 L318 84 L262 84 Z" fill="#9CC7E3" stroke={INK} strokeWidth={3} />
      <rect x={20} y={104} width={372} height={18} fill={C.copper} />
      <text x={140} y={84} textAnchor="middle" fontFamily={F.grotesk} fontWeight={900} fontSize={30} fill={INK} letterSpacing={2}>
        {label}
      </text>
      {[90, 320].map((x) => (
        <g key={x} transform={`translate(${x} 162) rotate(${spin})`}>
          <circle r={28} fill={INK} />
          <circle r={12} fill={C.steel} />
          <path d="M-12 0 L12 0 M0 -12 L0 12" stroke={IV} strokeWidth={3} />
        </g>
      ))}
    </svg>
  );
};

// ─── Rue de maisons mitoyennes (façon liégeoise, générique) ────────────────

const HOUSES = [
  { w: 120, h: 300, c: "#8E3E2C", roof: "gable" },
  { w: 100, h: 360, c: "#B5543A", roof: "flat" },
  { w: 130, h: 280, c: "#6E4B3A", roof: "gable" },
  { w: 110, h: 340, c: "#9A5B3A", roof: "step" },
  { w: 120, h: 300, c: "#7A3A2A", roof: "gable" },
  { w: 100, h: 320, c: "#A8644A", roof: "flat" },
  { w: 140, h: 290, c: "#84402E", roof: "gable" },
];

export const Street: React.FC<{ width?: number; shopIndex?: number; style?: React.CSSProperties }> = ({ width = 1080, shopIndex = 3, style }) => {
  let x = 0;
  return (
    <svg viewBox="0 0 820 420" width={width} height={width * 0.512} style={{ overflow: "visible", ...style }}>
      {HOUSES.map((h, i) => {
        const x0 = x;
        x += h.w;
        const top = 400 - h.h;
        return (
          <g key={i}>
            <rect x={x0} y={top} width={h.w} height={h.h} fill={h.c} stroke={INK} strokeWidth={3} />
            {h.roof === "gable" ? <path d={`M${x0} ${top} L${x0 + h.w / 2} ${top - 50} L${x0 + h.w} ${top} Z`} fill="#3B2B26" stroke={INK} strokeWidth={3} /> : null}
            {h.roof === "step"
              ? [0, 1, 2].map((s) => <rect key={s} x={x0 + s * 18} y={top - 18 * (s + 1)} width={h.w - s * 36} height={18} fill={h.c} stroke={INK} strokeWidth={2} />)
              : null}
            {/* fenêtres */}
            {[0, 1].map((r) =>
              [0, 1].map((cIdx) => (
                <rect key={`${r}${cIdx}`} x={x0 + 18 + cIdx * (h.w / 2 - 4)} y={top + 30 + r * 80} width={h.w / 2 - 32} height={52} rx={4} fill="#F3D9A4" opacity={0.85} stroke={INK} strokeWidth={2} />
              )),
            )}
            {/* rez-de-chaussée : vitrine pour la maison choisie */}
            {i === shopIndex ? (
              <>
                <rect x={x0 + 8} y={300} width={h.w - 16} height={100} fill="#9CC7E3" stroke={INK} strokeWidth={3} />
                <rect x={x0 + 4} y={284} width={h.w - 8} height={18} fill={C.copper} />
              </>
            ) : (
              <rect x={x0 + h.w / 2 - 18} y={330} width={36} height={70} rx={4} fill="#3B2B26" stroke={INK} strokeWidth={2} />
            )}
          </g>
        );
      })}
      <rect x={0} y={400} width={820} height={20} fill={C.steel} />
    </svg>
  );
};

// ─── Écrans de téléphone ───────────────────────────────────────────────────

export const PhoneFrame: React.FC<{ w?: number; h?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ w = 420, h = 840, children, style }) => (
  <div style={{ position: "relative", width: w, height: h, borderRadius: 56, border: `6px solid ${IV}`, background: "#F7F4EF", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.45)", ...style }}>
    <div style={{ position: "absolute", left: w / 2 - 60, top: 12, width: 120, height: 28, borderRadius: 14, background: "#111", zIndex: 5 }} />
    {children}
  </div>
);

const Stars: React.FC<{ n: number; size?: number }> = ({ n, size = 22 }) => (
  <span style={{ color: "#E8A33D", fontSize: size, letterSpacing: 1 }}>
    {"★★★★★".slice(0, Math.round(n))}
    <span style={{ color: "#C9C2B8" }}>{"★★★★★".slice(Math.round(n))}</span>
  </span>
);

/** Carte + résultats, façon appli de cartes (générique, aucune marque). `reveal` 0 → 1 fait apparaître les résultats. */
export const PhoneMaps: React.FC<{ query?: string; reveal?: number; highlight?: number }> = ({ query = "chauffagiste liège", reveal = 1, highlight = -1 }) => {
  const res = [
    { n: "Chauffagiste A", r: 4.8, a: "126 avis · Ouvert 24h/24" },
    { n: "Chauffagiste B", r: 3.9, a: "14 avis · Horaires non indiqués" },
    { n: "Chauffagiste C", r: 4.6, a: "58 avis · Répond aux avis" },
  ];
  return (
    <PhoneFrame>
      <div style={{ position: "absolute", inset: 0, background: "#E8E4DC" }}>
        {new Array(8).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 60 + i * 52, height: 10, background: "#FFFFFF", transform: `rotate(${i % 2 ? -8 : 5}deg)` }} />
        ))}
        {[
          [110, 170],
          [260, 240],
          [190, 330],
        ].map(([x, y], i) => (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 34, height: 34, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", background: i === highlight ? C.copper : "#D9534F", border: "3px solid #fff" }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 18, right: 18, top: 54, height: 58, borderRadius: 29, background: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", padding: "0 22px", fontFamily: F.grotesk, fontSize: 24, color: "#333" }}>{query}</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 440 * reveal, background: "#fff", borderRadius: "28px 28px 0 0", padding: "22px 22px", overflow: "hidden" }}>
        <div style={{ width: 60, height: 6, borderRadius: 3, background: "#ccc", margin: "0 auto 16px" }} />
        {res.map((r, i) => (
          <div key={r.n} style={{ padding: "14px 12px", borderRadius: 16, marginBottom: 10, background: i === highlight ? "#FBEBDD" : "transparent", border: i === highlight ? `2px solid ${C.copper}` : "2px solid transparent" }}>
            <div style={{ fontFamily: F.grotesk, fontWeight: 800, fontSize: 26, color: "#202124" }}>{r.n}</div>
            <div style={{ fontFamily: F.grotesk, fontSize: 20, color: "#5F6368", marginTop: 4 }}>
              {r.r.toFixed(1).replace(".", ",")} <Stars n={r.r} /> · {r.a}
            </div>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
};

/** Page de réseau social abandonnée. */
export const PhoneDeadPage: React.FC = () => (
  <PhoneFrame>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 210, background: "#B9B3AA" }} />
    <div style={{ position: "absolute", left: 30, top: 150, width: 120, height: 120, borderRadius: 60, background: "#D5CEC4", border: "6px solid #F7F4EF" }} />
    <div style={{ position: "absolute", left: 30, top: 290, fontFamily: F.grotesk, fontWeight: 900, fontSize: 32, color: "#202124" }}>Chauffagiste B</div>
    <div style={{ position: "absolute", left: 30, top: 336, fontFamily: F.grotesk, fontSize: 22, color: "#65676B" }}>Chauffagiste · 212 abonnés</div>
    <div style={{ position: "absolute", left: 20, right: 20, top: 400, borderRadius: 18, background: "#fff", padding: 20 }}>
      <div style={{ fontFamily: F.grotesk, fontSize: 20, color: "#65676B" }}>Dernière publication · il y a 2 ans</div>
      <div style={{ marginTop: 14, height: 200, borderRadius: 12, background: "#E4E0D8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.grotesk, fontSize: 22, color: "#9A948B" }}>« Joyeuses fêtes ! »</div>
    </div>
  </PhoneFrame>
);

/** Vidéo verticale d'un artisan qui explique (lecteur générique). */
export const PhoneVideo: React.FC<{ caption?: string; progress?: number }> = ({ caption = "Purger un radiateur en 30 s", progress = 0.4 }) => {
  const frame = useCurrentFrame();
  return (
    <PhoneFrame style={{ background: "#13202E" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 35%, #2B4560, #0D1B2A)" }} />
      {/* l'artisan */}
      <svg viewBox="0 0 200 260" width={300} height={390} style={{ position: "absolute", left: 60, top: 170 }}>
        <path d="M30 260 C30 190 60 160 100 160 C140 160 170 190 170 260 Z" fill="#2F5D8C" />
        <rect x={64} y={196} width={72} height={64} fill="#24496E" />
        <circle cx={100} cy={100} r={56} fill="#C98D63" />
        <path d="M44 96 C44 56 70 40 100 40 C130 40 156 56 156 96 C140 76 120 70 100 70 C80 70 60 76 44 96 Z" fill="#2A2A2A" />
        {[80, 120].map((x) => (
          <circle key={x} cx={x} cy={96} r={6} fill={INK} />
        ))}
        <path d={Math.floor(frame / 6) % 2 ? "M84 124 Q100 138 116 124" : "M86 126 Q100 130 114 126"} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: 24, right: 24, bottom: 120, padding: "12px 16px", borderRadius: 14, background: "rgba(255,255,255,0.92)", fontFamily: F.grotesk, fontWeight: 800, fontSize: 26, color: INK, textAlign: "center" }}>{caption}</div>
      <div style={{ position: "absolute", left: 24, right: 24, bottom: 80, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.3)" }}>
        <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 3, background: "#fff" }} />
      </div>
      <div style={{ position: "absolute", right: 22, bottom: 200, display: "flex", flexDirection: "column", gap: 22, alignItems: "center", fontFamily: F.grotesk, fontSize: 18, color: "#fff" }}>
        <div style={{ fontSize: 40 }}>♥</div>
        <div>1,2 k</div>
      </div>
    </PhoneFrame>
  );
};

/** Échange avec une IA (générique). */
export const PhoneChat: React.FC<{ question?: string; reveal?: number; names?: string[] }> = ({ question = "Quel chauffagiste de confiance près de chez moi ?", reveal = 1, names = ["Chauffagiste A", "Chauffagiste C", "Chauffagiste B"] }) => (
  <PhoneFrame>
    <div style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center", fontFamily: F.grotesk, fontWeight: 700, fontSize: 22, color: "#555" }}>Assistant IA</div>
    <div style={{ position: "absolute", right: 20, top: 110, maxWidth: 320, padding: "16px 20px", borderRadius: "22px 22px 6px 22px", background: C.copper, color: "#fff", fontFamily: F.grotesk, fontSize: 24, lineHeight: 1.25 }}>{question}</div>
    <div style={{ position: "absolute", left: 20, top: 280, maxWidth: 340, padding: "18px 20px", borderRadius: "22px 22px 22px 6px", background: "#fff", fontFamily: F.grotesk, fontSize: 22, color: "#222", lineHeight: 1.35, opacity: reveal }}>
      Voici quelques chauffagistes bien notés :
      {names.slice(0, 2).map((n, i) => (
        <div key={n} style={{ marginTop: 10, fontWeight: 800 }}>
          {i + 1}. {n}
        </div>
      ))}
      <div style={{ marginTop: 10, fontSize: 18, color: "#888" }}>Sources : fiches, avis, sites</div>
    </div>
  </PhoneFrame>
);

/**
 * Fiche d'établissement d'exemple (chauffagiste fictif), mise en page inspirée des fiches de cartes,
 * sans logo ni marque. `step` 0 → 4 fait apparaître : catégorie, horaires, photos, services, avis + réponse.
 */
export const PhoneFiche: React.FC<{ name?: string; step?: number }> = ({ name = "Chauffagiste C", step = 4 }) => {
  const on = (k: number) => ({ opacity: step >= k ? 1 : 0.12, transition: "none" });
  const BTN = ["Itinéraire", "Appeler", "Site web", "Partager"];
  return (
    <PhoneFrame>
      <div style={{ position: "absolute", inset: 0, background: "#FFFFFF" }} />
      {/* bandeau photo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 210, background: "#E8E1D6", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 30, top: 50, transform: "scale(0.7)", transformOrigin: "0 0" }}>
          <Van size={340} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 224 }}>
        <div style={{ fontFamily: F.grotesk, fontWeight: 900, fontSize: 32, color: "#202124" }}>{name}</div>
        <div style={{ fontFamily: F.grotesk, fontSize: 21, color: "#5F6368", marginTop: 6 }}>
          4,6 <Stars n={4.6} size={20} /> (58)
        </div>
        <div style={{ fontFamily: F.grotesk, fontSize: 21, color: "#5F6368", marginTop: 4, ...on(1) }}>Chauffagiste · Liège</div>
        <div style={{ fontFamily: F.grotesk, fontSize: 21, marginTop: 4, ...on(2) }}>
          <span style={{ color: "#188038", fontWeight: 700 }}>Ouvert</span> <span style={{ color: "#5F6368" }}>· Ferme à 18:00 · Dépannage 7j/7</span>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {BTN.map((b) => (
            <div key={b} style={{ flex: 1, padding: "8px 0", borderRadius: 18, border: "2px solid #DADCE0", textAlign: "center", fontFamily: F.grotesk, fontWeight: 700, fontSize: 16, color: "#1A73E8" }}>
              {b}
            </div>
          ))}
        </div>
        {/* photos */}
        <div style={{ display: "flex", gap: 8, marginTop: 14, ...on(3) }}>
          <div style={{ width: 118, height: 84, borderRadius: 10, background: "#F1ECE4", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Boiler size={50} broken={false} />
          </div>
          <div style={{ width: 118, height: 84, borderRadius: 10, background: "#F1ECE4", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Radiator size={100} warm={1} />
          </div>
          <div style={{ width: 118, height: 84, borderRadius: 10, background: "#E8E1D6", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Van size={110} />
          </div>
        </div>
        {/* services */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16, ...on(4) }}>
          {["Entretien chaudière", "Dépannage", "Pompe à chaleur", "Devis gratuit"].map((s) => (
            <div key={s} style={{ padding: "6px 14px", borderRadius: 14, background: "#F1F3F4", fontFamily: F.grotesk, fontSize: 17, color: "#3C4043" }}>
              {s}
            </div>
          ))}
        </div>
        {/* avis + réponse du propriétaire */}
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #E8EAED", ...on(4) }}>
          <div style={{ fontFamily: F.grotesk, fontSize: 19, color: "#202124" }}>
            <Stars n={5} size={18} /> « Venu un dimanche soir, travail propre. »
          </div>
          <div style={{ marginTop: 8, marginLeft: 16, padding: "8px 12px", borderLeft: `3px solid ${C.copper}`, fontFamily: F.grotesk, fontSize: 17, color: "#5F6368" }}>
            Réponse du propriétaire : Merci Sophie, à votre service !
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", right: 16, top: 16, padding: "4px 12px", borderRadius: 10, background: "rgba(13,27,42,0.75)", fontFamily: F.mono, fontSize: 14, letterSpacing: "0.15em", color: IV, zIndex: 6 }}>EXEMPLE</div>
    </PhoneFrame>
  );
};
