"use client";

import { useRecord } from "../RecordContext";
import { TrustRegister } from "../honesty/TrustRegister";

// Plain, accessible glyphs, each paired with a text label (never colour/icon alone).
const GLYPH: Record<string, string> = {
  wash: "≋",
  dry: "☁",
  iron: "△",
  bleach: "⊘",
};

const LIFECYCLE_LABEL: Record<string, string> = {
  owner: "Owner note",
  repair: "Repair log",
  resale: "Resale",
};

export function CircularityPortal() {
  const { record } = useRecord();
  return (
    <>
      {/* Care — verified-fact register */}
      <TrustRegister register="verified">
        <h3 style={{ fontSize: 19, marginBottom: 10 }}>Keeping it alive</h3>
        <div className="care-grid">
          {record.care.map((c) => (
            <div className="care-card" key={c.id}>
              <div className="glyph" aria-hidden>
                {GLYPH[c.kind]}
              </div>
              <div className="label">{c.label}</div>
              <div className="tip">{c.tip}</div>
            </div>
          ))}
        </div>
      </TrustRegister>

      {/* Disassembly blueprint drawers */}
      <div className="tt-card" style={{ marginTop: 14 }}>
        <h3 style={{ fontSize: 19, marginBottom: 4 }}>
          Disassembly blueprint
        </h3>
        <p style={{ color: "var(--ink-soft)", fontSize: 14.5, margin: "0 0 8px" }}>
          Where the hardware is and how to remove it — for real repair and clean
          end-of-life separation.
        </p>
        {record.disassembly.map((d) => (
          <details className="expander" key={d.id} style={{ borderTop: "1px solid var(--driftwood-line)" }}>
            <summary>
              <span className="chev" aria-hidden>›</span>
              {d.hardware}
              <span className="lozenge" style={{ marginLeft: "auto" }}>{d.location}</span>
            </summary>
            <p style={{ fontSize: 15, color: "var(--ink-soft)", margin: "4px 0 10px" }}>
              {d.pathway}
            </p>
          </details>
        ))}
      </div>

      {/* Context-aware outbound partner links */}
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {record.partners.map((p) => (
          <a
            key={p.id}
            className="btn btn--quiet tt-tap"
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {p.label}
            <span aria-hidden>↗</span>
            <span className="tt-sr">(opens an external partner site in a new tab)</span>
          </a>
        ))}
      </div>

      {/* Lifecycle / ownership — community-voice register, kept distinct */}
      <TrustRegister register="community">
        <h3 style={{ fontSize: 19, marginBottom: 4 }}>
          Lives this garment has had
        </h3>
        <p style={{ fontSize: 14, color: "var(--mocha)", margin: "0 0 12px" }}>
          Owners, menders and resale partners — community voice, not verified
          fact. Read it as exactly that.
        </p>
        {record.lifecycle.map((l) => (
          <div key={l.id} style={{ padding: "10px 0", borderBottom: "1px dashed var(--driftwood)" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="lozenge">{LIFECYCLE_LABEL[l.kind]}</span>
              <span style={{ fontSize: 13, color: "var(--mocha)" }}>{l.date} · {l.by}</span>
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 15.5 }}>{l.body}</p>
          </div>
        ))}
      </TrustRegister>
    </>
  );
}
