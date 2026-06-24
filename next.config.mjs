"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { knownShortcodes, resolveShortcode } from "@/data/resolve";

type Phase = "idle" | "scanning" | "locked" | "error";

export function Gateway() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [code, setCode] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const nudgeTimer = useRef<number | null>(null);

  // Demo scan: simulate optical capture resolving the demo garment, and model
  // the real-world failure where capture stalls on warped fabric — after a few
  // seconds we nudge toward manual entry (Nielsen #3: an alternative route).
  function startScan() {
    setPhase("scanning");
    if (nudgeTimer.current) window.clearTimeout(nudgeTimer.current);
    window.setTimeout(() => {
      setPhase("locked");
      window.setTimeout(() => router.push("/g/L01/"), 650);
    }, 1700);
    nudgeTimer.current = window.setTimeout(() => {
      setPhase((p) => (p === "scanning" ? "error" : p));
      setDrawerOpen(true);
    }, 6000);
  }

  useEffect(() => () => {
    if (nudgeTimer.current) window.clearTimeout(nudgeTimer.current);
  }, []);

  function submitManual(e: React.FormEvent) {
    e.preventDefault();
    const raw = code.trim();
    if (!raw) return;
    // Accept a bare shortcode (L01), a /g/L01 path, or the full tag URL.
    const sc = raw.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/?g\//i, "").replace(/\/+$/, "");
    const rec = resolveShortcode(sc) ?? resolveShortcode(raw);
    if (rec) {
      router.push(`/g/${rec.shortcode}/`);
    } else {
      setManualError(
        `No passport resolves from “${raw}”. Try the demo code ${knownShortcodes()[0]}.`
      );
    }
  }

  return (
    <main className="tt-shell" style={{ paddingTop: 26, maxWidth: 560 }}>
      <p className="tt-eyebrow">ThreadTrace · scan to open the passport</p>
      <h1 style={{ fontSize: 32, margin: "6px 0 4px" }}>
        Point at the tag on the garment
      </h1>
      <p style={{ color: "var(--ink-soft)", margin: "0 0 18px" }}>
        The honesty record is bound to the cloth. Scan the stitched code, or type
        it in if the fabric is creased or the light is low.
      </p>

      {/* Camera viewport with edge-tracking targeting box */}
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          background:
            "repeating-linear-gradient(135deg, #2b2620, #2b2620 9px, #312b24 9px, #312b24 18px)",
          border: "1px solid var(--driftwood-line)",
        }}
        aria-label="Camera viewport"
      >
        {/* simulated warped-fabric texture sheen */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 40% at 30% 30%, rgba(255,255,255,0.08), transparent), radial-gradient(50% 50% at 75% 70%, rgba(255,255,255,0.05), transparent)",
          }}
        />
        <TargetingBox phase={phase} />

        <div
          aria-live="polite"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "10px 14px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.55))",
            color: "#f4efe6",
            fontSize: 14,
          }}
        >
          {phase === "idle" && "Camera ready"}
          {phase === "scanning" && "Tracking the code on the fabric…"}
          {phase === "locked" && "Locked — opening passport"}
          {phase === "error" && "Couldn’t lock onto the tag. Try typing the code below."}
        </div>
      </div>

      <button
        type="button"
        className="btn btn--wide tt-tap"
        style={{ marginTop: 14 }}
        onClick={startScan}
        disabled={phase === "scanning" || phase === "locked"}
      >
        {phase === "scanning" ? "Scanning…" : "Start scan (demo)"}
      </button>

      {/* Progressive-disclosure manual-entry drawer */}
      <details
        className="expander tt-card"
        style={{ marginTop: 14 }}
        open={drawerOpen}
        onToggle={(e) => setDrawerOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary>
          <span className="chev" aria-hidden>›</span>
          Type product / blockchain code manually
        </summary>
        <form onSubmit={submitManual} style={{ paddingTop: 8 }}>
          <div className="field field--lg">
            <label htmlFor="code">Garment or blockchain code</label>
            <input
              id="code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setManualError(null);
              }}
              placeholder="e.g. L01"
              autoComplete="off"
              inputMode="text"
            />
          </div>
          {manualError && (
            <p style={{ color: "var(--mark-alert)", fontSize: 14, margin: "0 0 10px" }}>
              {manualError}
            </p>
          )}
          <button type="submit" className="btn tt-tap">
            Open passport
          </button>
        </form>
      </details>

      <p style={{ fontSize: 13, color: "var(--mocha)", marginTop: 18 }}>
        Demo tag encodes the stable path <code>/g/L01</code>. That path survives
        any future redesign — the tag never needs reprinting.
      </p>
    </main>
  );
}

function TargetingBox({ phase }: { phase: Phase }) {
  const locked = phase === "locked";
  const active = phase === "scanning" || locked;
  const color = locked ? "var(--mark-checked)" : "var(--paper)";
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: locked ? "44%" : active ? "48%" : "56%",
          aspectRatio: "1",
          transition: "width .35s cubic-bezier(.2,.8,.2,1), transform .35s ease",
          transform: active ? "translate(2%, -1%)" : "none", // edge-tracking drift
        }}
      >
        {[
          { top: 0, left: 0, b: "top", s: "left" },
          { top: 0, right: 0, b: "top", s: "right" },
          { bottom: 0, left: 0, b: "bottom", s: "left" },
          { bottom: 0, right: 0, b: "bottom", s: "right" },
        ].map((c, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              width: 26,
              height: 26,
              [c.b as "top" | "bottom"]: -2,
              [c.s as "left" | "right"]: -2,
              [`border${cap(c.b)}`]: `3px solid ${color}`,
              [`border${cap(c.s)}`]: `3px solid ${color}`,
              borderRadius: 3,
              transition: "border-color .3s ease",
            } as React.CSSProperties}
          />
        ))}
        {active && !locked && (
          <span
            style={{
              position: "absolute",
              left: 4,
              right: 4,
              top: "50%",
              height: 2,
              background: "var(--paper)",
              boxShadow: "0 0 10px rgba(255,255,255,0.7)",
              animation: "ttsweep 1.4s ease-in-out infinite",
            }}
          />
        )}
      </div>
      <style>{`@keyframes ttsweep{0%{top:8%}50%{top:92%}100%{top:8%}}`}</style>
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
