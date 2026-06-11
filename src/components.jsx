/* ===================== SHARED COMPONENTS & ICONS ===================== */
const { useState, useEffect, useRef, useCallback } = React;

/* --- tiny line icons (kept simple: strokes only) --- */
function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12.5l4.5 4.5L19 6.5" />
    </svg>
  );
}
function IconArrow({ dir = "right", ...p }) {
  const d = dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7";
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d={d} />
    </svg>
  );
}
/* A quiet open-book crest mark */
function Crest(props) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 11c-3-2.4-7-2.8-11-1.6v18c4-1.2 8-0.8 11 1.6 3-2.4 7-2.8 11-1.6v-18c-4-1.2-8-0.8-11 1.6z" />
      <path d="M20 11v18" />
      <path d="M20 4l1.6 2.4L24 6.7l-1.4 2.3L24 11l-2.6-0.3L20 13l-1.4-2.3L16 11l1.4-2L16 6.7l2.4 0.3z"
            fill="currentColor" stroke="none" opacity="0.85" />
    </svg>
  );
}

/* --- circular progress ring --- */
function ProgressRing({ value, size = 46, stroke = 3 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value);
  return (
    <svg width={size} height={size} style={{ display: "block", transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke="var(--paper-2)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke="var(--gold-deep)" strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={off}
              style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.2,.7,.2,1)" }} />
    </svg>
  );
}

/* --- a verse chip (reference) used in pack detail --- */
function VerseChip({ reference: vref, done, onClick }) {
  return (
    <button className={"vchip" + (done ? " done" : "")} onClick={onClick}>
      <span className="tick">{done && <IconCheck />}</span>
      {vref}
    </button>
  );
}

/* --- the flip flashcard --- */
function Flashcard({ card, flipped, onFlip }) {
  return (
    <div className="scene">
      <div className={"flipper" + (flipped ? " flipped" : "")} onClick={onFlip}
           role="button" aria-label="Flip card">
        <div className="face face-front">
          <div className="topic-label label">{card.topic}</div>
          <div className="front-flourish" />
          <div className="front-ref">{card.ref}</div>
          <div className="front-pack">Pack {card.packId} · {card.packTitle}</div>
          <div className="flip-hint">Tap to reveal</div>
        </div>
        <div className="face face-back">
          <div className="topic-label label">{card.topic}</div>
          <div className="verse-text">{card.text}</div>
          <div className="verse-ref">{card.ref} <span style={{opacity:0.6, fontStyle:"italic", fontSize:"0.8em", marginLeft:"auto"}}>NIV</span></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { IconCheck, IconArrow, Crest, ProgressRing, VerseChip, Flashcard });
