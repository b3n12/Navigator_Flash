/* ===================== TOPICAL MEMORY SYSTEM — APP ===================== */
const { useState: useS, useEffect: useE, useRef: useR, useCallback: useCB } = React;

/* ---------- storage ---------- */
const KEY = "tms.progress.v1";
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
}
function saveProgress(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }

function dayStr(d) {
  /* local date, not UTC — streaks should roll over at the user's midnight */
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function todayStr() { return dayStr(new Date()); }
function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return dayStr(d); }

/* ---------- flatten the corpus ---------- */
const PACKS = window.TMS.packs;
function deckForPack(pack) {
  const out = [];
  pack.topics.forEach((t) => t.verses.forEach((v) =>
    out.push({ key: v.ref, ref: v.ref, text: v.text, topic: t.topic, packId: pack.id, packTitle: pack.title })));
  return out;
}
const ALL_CARDS = PACKS.flatMap(deckForPack);

/* Fisher–Yates, non-mutating */
function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ===================== STREAK CHIP ===================== */
function StreakChip({ streak, today }) {
  return (
    <div className="streak">
      <div className="streak-cell">
        <span className={"streak-num" + (streak > 0 ? " lit" : "")}>{streak}</span>
        <span className="streak-lbl">Day streak</span>
      </div>
      <div className="streak-cell">
        <span className="streak-num">{today}</span>
        <span className="streak-lbl">Today</span>
      </div>
    </div>
  );
}

/* ===================== LIBRARY ===================== */
function Library({ progress, onOpenPack, onStudyAll, onSummary }) {
  const unlearned = ALL_CARDS.filter((c) => !(progress.memorized && progress.memorized[c.key]));
  return (
    <div>
      <div className="section-head">
        <h2>The Five Packs</h2>
        <span className="label">A — E · 60 verses</span>
      </div>
      <div className="deck-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => onStudyAll(ALL_CARDS, "All packs")}>Review all sixty</button>
        <button className="btn btn-ghost btn-sm" onClick={() => onStudyAll(shuffled(ALL_CARDS), "All packs · shuffled")}>Shuffle &amp; review</button>
        <button className="btn btn-ghost btn-sm" disabled={unlearned.length === 0}
          onClick={() => onStudyAll(shuffled(unlearned), "Still learning")}>
          Still learning · {unlearned.length}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onSummary}>Summary</button>
      </div>
      <div className="packs">
        {PACKS.map((pack) => {
          const cards = deckForPack(pack);
          const done = cards.filter((c) => progress.memorized && progress.memorized[c.key]).length;
          const frac = done / cards.length;
          return (
            <button key={pack.id} className="pack" onClick={() => onOpenPack(pack.id)}>
              <span className="pack-letter">{pack.id}</span>
              <div className="pack-kicker">
                <span className="pack-badge">{pack.id}</span>
                <span className="label">Pack {pack.id}</span>
              </div>
              <h3>{pack.title}</h3>
              <p className="epi">{pack.epigraph}</p>
              <div className="pack-foot">
                <div className="pack-meter">
                  <div className="meter-track"><div className="meter-fill" style={{ width: (frac * 100) + "%" }} /></div>
                </div>
                <span className="pack-count">{done} / {cards.length} learned</span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="colophon">
        The Topical Memory System is a classic Scripture-memory course by The Navigators, arranged in five
        topical packs of twelve verses each. This is an independent study aid. Scripture quotations are from
        the Holy Bible, New International Version (NIV). Verse text should be proofread against an official
        edition before printing.
      </p>
    </div>
  );
}

/* ===================== SUMMARY — ALL VERSES ON ONE PAGE ===================== */
function Summary({ progress, onBack }) {
  return (
    <div>
      <button className="backlink" onClick={onBack}><IconArrow dir="left" style={{ width: 15, height: 15 }} /> All packs</button>
      <div className="section-head">
        <h2>All Sixty Verses</h2>
        <span className="label">Packs A — E · one page</span>
      </div>
      <div className="summary">
        {PACKS.map((pack) => (
          <section className="sum-pack" key={pack.id}>
            <div className="sum-pack-head">
              <span className="pack-badge">{pack.id}</span>
              <h3>{pack.title}</h3>
              <span className="label" style={{ marginLeft: "auto" }}>Pack {pack.id}</span>
            </div>
            {pack.topics.map((t) => (
              <div className="sum-topic" key={t.topic}>
                <div className="sum-topic-name label">{t.topic}</div>
                {t.verses.map((v) => {
                  const done = !!(progress.memorized && progress.memorized[v.ref]);
                  return (
                    <div className={"sum-verse" + (done ? " done" : "")} key={v.ref}>
                      <div className="sum-ref">
                        <span className="tick">{done && <IconCheck />}</span>
                        {v.ref}
                      </div>
                      <p className="sum-text">{v.text}</p>
                    </div>
                  );
                })}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

/* ===================== PACK DETAIL ===================== */
function PackDetail({ packId, progress, onBack, onStudy, onStudyOne }) {
  const pack = PACKS.find((p) => p.id === packId);
  const cards = deckForPack(pack);
  const done = cards.filter((c) => progress.memorized && progress.memorized[c.key]).length;
  const frac = done / cards.length;
  return (
    <div>
      <button className="backlink" onClick={onBack}><IconArrow dir="left" style={{ width: 15, height: 15 }} /> All packs</button>
      <div className="pack-hero">
        <div>
          <span className="label">Pack {pack.id}</span>
          <h2>{pack.title}</h2>
          <p className="epi">{pack.epigraph}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ProgressRing value={frac} size={54} stroke={3.5} />
          <button className="btn btn-ghost" onClick={() => onStudy(shuffled(cards), true)}>Shuffle</button>
          <button className="btn btn-gold" onClick={() => onStudy(cards)}>Begin review</button>
        </div>
      </div>
      <div className="topics">
        {pack.topics.map((t, i) => (
          <div className="topic-row" key={t.topic}>
            <span className="topic-no">{i + 1}</span>
            <div>
              <div className="topic-name">{t.topic}</div>
              <div className="topic-verses">
                {t.verses.map((v) => (
                  <VerseChip key={v.ref} reference={v.ref}
                    done={!!(progress.memorized && progress.memorized[v.ref])}
                    onClick={() => onStudyOne(cards, v.ref)} />
                ))}
              </div>
            </div>
            <span className="pack-count">
              {t.verses.filter((v) => progress.memorized && progress.memorized[v.ref]).length} / {t.verses.length}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== STUDY SESSION ===================== */
function Study({ deck, startIndex, progress, onMark, onReview, onClose, title }) {
  const [i, setI] = useS(startIndex || 0);
  const [flipped, setFlipped] = useS(false);
  const [hint, setHint] = useS(false);
  const [finished, setFinished] = useS(false);
  const reviewed = useR(new Set());
  const card = deck[i];

  const doFlip = useCB(() => {
    setFlipped((f) => {
      const nf = !f;
      if (nf && card && !reviewed.current.has(card.key)) {
        reviewed.current.add(card.key);
        onReview();
      }
      return nf;
    });
  }, [card, onReview]);

  const go = useCB((dir) => {
    setFlipped(false);
    setHint(false);
    setTimeout(() => {
      setI((prev) => {
        const next = prev + dir;
        if (next >= deck.length) { setFinished(true); return prev; }
        if (next < 0) return prev;
        return next;
      });
    }, flipped ? 180 : 0);
  }, [deck.length, flipped]);

  useE(() => {
    const onKey = (e) => {
      if (finished) return;
      if (e.code === "Space") { e.preventDefault(); doFlip(); }
      else if (e.code === "ArrowRight") go(1);
      else if (e.code === "ArrowLeft") go(-1);
      else if (e.key === "Escape") onClose();
      else if (e.key.toLowerCase() === "m" && card) onMark(card.key);
      else if (e.key.toLowerCase() === "h") setHint((h) => !h);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doFlip, go, finished, card, onMark, onClose]);

  if (finished) {
    const learned = deck.filter((c) => progress.memorized && progress.memorized[c.key]).length;
    return (
      <div className="study">
        <div className="study-top">
          <button className="study-close" onClick={onClose}>Close</button>
          <div className="study-ctx"><span className="label">{title}</span></div>
          <span style={{ width: 60 }} />
        </div>
        <div className="scene-wrap">
          <div className="finish">
            <Crest style={{ width: 46, height: 46, color: "var(--gold-deep)" }} />
            <h2>Well done.</h2>
            <p>You moved through {deck.length} {deck.length === 1 ? "verse" : "verses"}. {learned} marked as hidden in your heart.</p>
            <div className="finish-actions">
              <button className="btn btn-ghost" onClick={() => { setI(startIndex || 0); setFinished(false); setFlipped(false); reviewed.current = new Set(); }}>Review again</button>
              <button className="btn" onClick={onClose}>Done</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDone = !!(progress.memorized && progress.memorized[card.key]);
  const prog = (i + (flipped ? 0.5 : 0)) / deck.length;

  return (
    <div className="study">
      <div className="study-top">
        <button className="study-close" onClick={onClose}>Close</button>
        <div className="study-ctx">
          <span className="label">{title}</span>
          <span className="pos">{i + 1} of {deck.length}</span>
        </div>
        <span style={{ width: 60 }} />
      </div>
      <div className="study-progress"><div style={{ width: (prog * 100) + "%" }} /></div>

      <div className="scene-wrap">
        <Flashcard card={card} flipped={flipped} onFlip={doFlip}
          hint={hint} onHint={() => setHint((h) => !h)} />
      </div>

      <div className="study-controls">
        <button className="nav-btn" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous">
          <IconArrow dir="left" />
        </button>
        <button className={"mark-btn" + (isDone ? " on" : "")} onClick={() => onMark(card.key)}>
          <span className="tick">{isDone && <IconCheck />}</span>
          {isDone ? "Memorized" : "Mark as memorized"}
        </button>
        <button className="nav-btn" onClick={() => go(1)} aria-label="Next">
          <IconArrow dir="right" />
        </button>
      </div>
      <p className="kbd-hints label">Space — flip · ← → — move · M — memorized · H — first letters · Esc — close</p>
    </div>
  );
}

/* ===================== ROOT APP ===================== */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "parchment",
  "verseface": "spectral"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useS({ name: "library" });
  const [progress, setProgress] = useS(loadProgress);

  /* apply theme + verse font to <html> */
  useE(() => {
    document.documentElement.setAttribute("data-theme", t.theme || "parchment");
    document.documentElement.setAttribute("data-verseface", t.verseface || "spectral");
  }, [t.theme, t.verseface]);

  const persist = useCB((next) => { setProgress(next); saveProgress(next); }, []);

  const toggleMark = useCB((key) => {
    setProgress((prev) => {
      const mem = { ...(prev.memorized || {}) };
      if (mem[key]) delete mem[key]; else mem[key] = todayStr();
      const next = { ...prev, memorized: mem };
      saveProgress(next);
      return next;
    });
  }, []);

  const recordReview = useCB(() => {
    setProgress((prev) => {
      const today = todayStr();
      const counts = { ...(prev.counts || {}) };
      counts[today] = (counts[today] || 0) + 1;
      let streak = prev.streak || 0;
      let lastDay = prev.lastDay;
      if (lastDay !== today) {
        streak = (lastDay === yesterdayStr()) ? streak + 1 : 1;
        lastDay = today;
      }
      const next = { ...prev, counts, streak, lastDay };
      saveProgress(next);
      return next;
    });
  }, []);

  const todayCount = (progress.counts && progress.counts[todayStr()]) || 0;
  const streakLive = (progress.lastDay === todayStr() || progress.lastDay === yesterdayStr()) ? (progress.streak || 0) : 0;

  const openStudy = (deck, idx, title, origin) =>
    setView({ name: "study", deck, idx: idx || 0, title, origin: origin || { name: "library" } });

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead-id">
          <div className="crest">
            <Crest className="crest-mark" />
            <span className="label">The Navigators · Scripture Memory</span>
          </div>
          <h1>Topical Memory System</h1>
          <p className="sub">Sixty verses to hide in your heart.</p>
        </div>
        <StreakChip streak={streakLive} today={todayCount} />
      </header>
      <hr className="rule-gold" />

      {view.name === "library" && (
        <Library progress={progress}
          onOpenPack={(id) => setView({ name: "pack", packId: id })}
          onStudyAll={(deck, title) => openStudy(deck, 0, title)}
          onSummary={() => setView({ name: "summary" })} />
      )}

      {view.name === "summary" && (
        <Summary progress={progress} onBack={() => setView({ name: "library" })} />
      )}

      {view.name === "pack" && (
        <PackDetail
          packId={view.packId}
          progress={progress}
          onBack={() => setView({ name: "library" })}
          onStudy={(deck, shuf) => openStudy(deck, 0, "Pack " + view.packId + (shuf ? " · shuffled" : ""), { name: "pack", packId: view.packId })}
          onStudyOne={(deck, ref) => openStudy(deck, deck.findIndex((c) => c.key === ref), "Pack " + view.packId, { name: "pack", packId: view.packId })}
        />
      )}

      {view.name === "study" && (
        <Study
          deck={view.deck}
          startIndex={view.idx}
          title={view.title}
          progress={progress}
          onMark={toggleMark}
          onReview={recordReview}
          onClose={() => setView(view.origin || { name: "library" })}
        />
      )}

      <TweaksPanel>
        <TweakSection label="Visual direction" />
        <TweakRadio label="Theme" value={t.theme}
          options={["parchment", "quiet", "gilded"]}
          onChange={(v) => setTweak("theme", v)} />
        <TweakSection label="Typography" />
        <TweakRadio label="Verse face" value={t.verseface}
          options={["spectral", "cormorant", "ebgaramond"]}
          onChange={(v) => setTweak("verseface", v)} />
        <TweakButton label="Reset progress" onClick={() => persist({})} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
