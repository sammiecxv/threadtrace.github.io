"use client";

import { useState } from "react";
import { useRecord } from "../RecordContext";
import { TrustRegister } from "../honesty/TrustRegister";
import { HonestyMark } from "../honesty/HonestyMark";
import { markFor } from "@/data/resolve";
import type { TimelineNode } from "@/data/types";

const FACET_VARS: Record<string, string> = {
  woad: "var(--woad)", madder: "var(--madder)", weld: "var(--weld)",
  walnut: "var(--walnut)", logwood: "var(--logwood)",
  eucalyptus: "var(--eucalyptus)", saffron: "var(--saffron)",
};

function Node({ node }: { node: TimelineNode }) {
  const [open, setOpen] = useState(false);
  const notyet = markFor(node.claim.evidence) === "not_yet";
  const accent = node.claim.facet ? FACET_VARS[node.claim.facet] : "var(--indigo)";
  return (
    <li className={`tl-node${notyet ? " notyet" : ""}`}>
      <button
        type="button"
        className="tt-card tt-tap"
        style={{ width: "100%", textAlign: "left", padding: 14, borderLeft: `4px solid ${accent}` }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
          <div>
            <div className="tl-tier">Tier {node.tier} · {node.place}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, margin: "2px 0" }}>
              {node.title}
            </div>
          </div>
          <HonestyMark evidence={node.claim.evidence} chainAnchored={node.claim.chainAnchored} />
        </div>
        {open && (
          <p style={{ margin: "10px 0 0", color: "var(--ink-soft)", fontSize: 15.5 }}>
            {node.body}
          </p>
        )}
      </button>
    </li>
  );
}

export function StoryBook() {
  const { record } = useRecord();
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <>
      {/* Maker narrative — a distinct, unmistakably brand-voice register */}
      <TrustRegister register="narrative">
        <p style={{ margin: 0 }}>“{record.narrative.body}”</p>
        <p style={{ marginTop: 10, fontStyle: "normal", fontSize: 14, color: "var(--mocha)" }}>
          — {record.narrative.by}
        </p>

        {/* Heritage audio anchor with transcript fallback */}
        <div className="tt-card" style={{ marginTop: 14, background: "var(--paper)" }}>
          <p className="tt-eyebrow">Heritage audio · weaver’s voice</p>
          {record.narrative.audioSrc ? (
            <audio controls preload="none" style={{ width: "100%", marginTop: 8 }}>
              <source src={record.narrative.audioSrc} />
              Your browser does not support audio playback.
            </audio>
          ) : (
            <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: "8px 0" }}>
              Audio recording pending upload. The transcript below carries the
              same words in the meantime.
            </p>
          )}
          <button
            type="button"
            className="btn btn--ghost tt-tap"
            style={{ paddingLeft: 0 }}
            aria-expanded={showTranscript}
            onClick={() => setShowTranscript((v) => !v)}
          >
            {showTranscript ? "Hide transcript" : "Read transcript"}
          </button>
          {showTranscript && (
            <p style={{ fontSize: 15, color: "var(--ink-soft)", marginTop: 6 }}>
              {record.narrative.transcript}
            </p>
          )}
        </div>
      </TrustRegister>

      {/* The supply-chain timeline — verified-fact provenance, tier 4 -> 1 */}
      <div style={{ marginTop: 8 }}>
        <h3 style={{ fontSize: 19, margin: "8px 0 4px" }}>
          From field to finished shirt
        </h3>
        <p style={{ color: "var(--ink-soft)", fontSize: 14.5, margin: "0 0 14px" }}>
          Tier 4 (raw fibre) up to Tier 1 (final construction). Tap a stage. An
          unfilled stage stays visible as a “Not yet”.
        </p>
        <ol className="timeline" style={{ listStyle: "none", padding: "0 0 0 26px", margin: 0 }}>
          {[...record.timeline].sort((a, b) => b.tier - a.tier).map((n) => (
            <Node key={n.id} node={n} />
          ))}
        </ol>
      </div>
    </>
  );
}
