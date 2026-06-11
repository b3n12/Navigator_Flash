/* ===== bundled: tweaks-panel + components + app ===== */
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', { detail: edits }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({ title = 'Tweaks', children }) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({ x: 16, y: 16 });
  const PAD = 16;

  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);

  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);

  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);
      else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  };

  const onDragStart = (e) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (!open) return null;
  return (
    <>
      <style>{__TWEAKS_STYLE}</style>
      <div ref={dragRef} className="twk-panel" data-omelette-chrome=""
           style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}>
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>{title}</b>
          <button className="twk-x" aria-label="Close tweaks"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={dismiss}>✕</button>
        </div>
        <div className="twk-body">
          {children}
        </div>
      </div>
    </>
  );
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({ label, children }) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

function TweakRow({ label, value, children, inline = false }) {
  return (
    <div className={inline ? 'twk-row twk-row-h' : 'twk-row'}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }) {
  return (
    <TweakRow label={label} value={`${value}${unit}`}>
      <input type="range" className="twk-slider" min={min} max={max} step={step}
             value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </TweakRow>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? '1' : '0'}
              role="switch" aria-checked={!!value}
              onClick={() => onChange(!value)}><i /></button>
    </div>
  );
}

function TweakRadio({ label, value, options, onChange }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = (o) => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({ 2: 16, 3: 10 }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = (s) => {
      const m = options.find((o) => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return <TweakSelect label={label} value={value} options={options}
                        onChange={(s) => onChange(resolve(s))} />;
  }
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;

  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor(((clientX - r.left - 2) / inner) * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };

  const onPointerDown = (e) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <TweakRow label={label}>
      <div ref={trackRef} role="radiogroup" onPointerDown={onPointerDown}
           className={dragging ? 'twk-seg dragging' : 'twk-seg'}>
        <div className="twk-seg-thumb"
             style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
                      width: `calc((100% - 4px) / ${n})` }} />
        {opts.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

function TweakSelect({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === 'object' ? o.value : o;
          const l = typeof o === 'object' ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </TweakRow>
  );
}

function TweakText({ label, value, placeholder, onChange }) {
  return (
    <TweakRow label={label}>
      <input className="twk-field" type="text" value={value} placeholder={placeholder}
             onChange={(e) => onChange(e.target.value)} />
    </TweakRow>
  );
}

function TweakNumber({ label, value, min, max, step = 1, unit = '', onChange }) {
  const clamp = (n) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({ x: 0, val: 0 });
  const onScrubStart = (e) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, val: value };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div className="twk-num">
      <span className="twk-num-lbl" onPointerDown={onScrubStart}>{label}</span>
      <input type="number" value={value} min={min} max={max} step={step}
             onChange={(e) => onChange(clamp(Number(e.target.value)))} />
      {unit && <span className="twk-num-unit">{unit}</span>}
    </div>
  );
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}

const __TwkCheck = ({ light }) => (
  <svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          stroke={light ? 'rgba(0,0,0,.78)' : '#fff'} />
  </svg>
);

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({ label, value, options, onChange }) {
  if (!options || !options.length) {
    return (
      <div className="twk-row twk-row-h">
        <div className="twk-lbl"><span>{label}</span></div>
        <input type="color" className="twk-swatch" value={value}
               onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = (o) => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return (
    <TweakRow label={label}>
      <div className="twk-chips" role="radiogroup">
        {options.map((o, i) => {
          const colors = Array.isArray(o) ? o : [o];
          const [hero, ...rest] = colors;
          const sup = rest.slice(0, 4);
          const on = key(o) === cur;
          return (
            <button key={i} type="button" className="twk-chip" role="radio"
                    aria-checked={on} data-on={on ? '1' : '0'}
                    aria-label={colors.join(', ')} title={colors.join(' · ')}
                    style={{ background: hero }}
                    onClick={() => onChange(o)}>
              {sup.length > 0 && (
                <span>
                  {sup.map((c, j) => <i key={j} style={{ background: c }} />)}
                </span>
              )}
              {on && <__TwkCheck light={__twkIsLight(hero)} />}
            </button>
          );
        })}
      </div>
    </TweakRow>
  );
}

function TweakButton({ label, onClick, secondary = false }) {
  return (
    <button type="button" className={secondary ? 'twk-btn secondary' : 'twk-btn'}
            onClick={onClick}>{label}</button>
  );
}

Object.assign(window, {
  useTweaks, TweaksPanel, TweakSection, TweakRow,
  TweakSlider, TweakToggle, TweakRadio, TweakSelect,
  TweakText, TweakNumber, TweakColor, TweakButton,
});


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

/* --- first letters of each word: the classic TMS recall aid --- */
function firstLetters(text) {
  return text.split(/\s+/).map((w) => {
    const m = w.match(/[A-Za-z0-9]/);
    if (!m) return w; /* pure punctuation (em-dashes etc.) stays */
    const head = w.slice(0, w.indexOf(m[0]) + 1); /* keeps leading quotes */
    const tail = (w.match(/[.,;:!?…”’"']+$/) || [""])[0];
    return head + tail;
  }).join(" ");
}

/* --- the flip flashcard --- */
function Flashcard({ card, flipped, onFlip, hint, onHint }) {
  return (
    <div className="scene">
      <div className={"flipper" + (flipped ? " flipped" : "")} onClick={onFlip}
           role="button" aria-label="Flip card">
        <div className="face face-front">
          <div className="topic-label label">{card.topic}</div>
          <div className="front-flourish" />
          <div className="front-ref">{card.ref}</div>
          {hint
            ? <div className="hint-text">{firstLetters(card.text)}</div>
            : <div className="front-pack">Pack {card.packId} · {card.packTitle}</div>}
          {onHint && (
            <button className="hint-btn" onClick={(e) => { e.stopPropagation(); onHint(); }}>
              {hint ? "Hide first letters" : "First letters"}
            </button>
          )}
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

Object.assign(window, { IconCheck, IconArrow, Crest, ProgressRing, VerseChip, Flashcard, firstLetters });


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
function Library({ progress, onOpenPack, onStudyAll }) {
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
          onStudyAll={(deck, title) => openStudy(deck, 0, title)} />
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
