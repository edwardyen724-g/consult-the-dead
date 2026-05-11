"use client";

import { useState } from "react";

export interface ConstructExplorerConstruct {
  construct: string;
  positive_pole: string;
  negative_pole: string;
  behavioral_implication: string;
}

export interface ConstructExplorerPrediction {
  situation_type: string;
  conventional_response?: string;
  ordinary_response?: string;
  framework_response: string;
  because?: string;
  confidence?: number | string;
}

export interface ConstructExplorerSnapshot {
  selectedIndex: number;
  position: number;
  orientation: "negative" | "balanced" | "positive";
  orientationLabel: string;
  selectedConstruct: ConstructExplorerConstruct | null;
  selectedPrediction: ConstructExplorerPrediction | null;
}

export interface FrameworkConstructExplorerProps {
  person: string;
  color: string;
  constructs: ConstructExplorerConstruct[];
  predictions: ConstructExplorerPrediction[];
}

interface ConstructPredictionPair {
  construct: ConstructExplorerConstruct;
  prediction: ConstructExplorerPrediction | null;
}

export interface FrameworkConstructExplorerCardProps {
  color: string;
  index: number;
  pair: ConstructPredictionPair;
  position: number;
  total: number;
  onPositionChange: (index: number, position: number) => void;
}

function clampIndex(index: number, length: number): number {
  if (length === 0) return 0;
  if (index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
}

function getPredictionFallback(
  predictions: ConstructExplorerPrediction[],
): ConstructExplorerPrediction | null {
  return predictions[predictions.length - 1] ?? null;
}

export function pairConstructsWithPredictions(
  constructs: ConstructExplorerConstruct[],
  predictions: ConstructExplorerPrediction[],
): ConstructPredictionPair[] {
  const fallbackPrediction = getPredictionFallback(predictions);

  return constructs.map((construct, index) => ({
    construct,
    prediction: predictions[index] ?? fallbackPrediction,
  }));
}

export function getConstructExplorerSnapshot(
  constructs: ConstructExplorerConstruct[],
  predictions: ConstructExplorerPrediction[],
  selectedIndex: number,
  position: number,
): ConstructExplorerSnapshot {
  const pairs = pairConstructsWithPredictions(constructs, predictions);
  const safeIndex = clampIndex(selectedIndex, pairs.length);
  const selectedPair = pairs[safeIndex] ?? null;
  const selectedConstruct = selectedPair?.construct ?? null;
  const selectedPrediction = selectedPair?.prediction ?? null;

  let orientation: ConstructExplorerSnapshot["orientation"] = "balanced";
  let orientationLabel = "balanced between the poles";

  if (selectedConstruct) {
    if (position <= 35) {
      orientation = "negative";
      orientationLabel = `leaning toward ${selectedConstruct.negative_pole}`;
    } else if (position >= 65) {
      orientation = "positive";
      orientationLabel = `leaning toward ${selectedConstruct.positive_pole}`;
    }
  }

  return {
    selectedIndex: safeIndex,
    position,
    orientation,
    orientationLabel,
    selectedConstruct,
    selectedPrediction,
  };
}

function formatConfidence(confidence: number | string | undefined): string | null {
  if (confidence === undefined || confidence === null) {
    return null;
  }

  const numericConfidence =
    typeof confidence === "number" ? confidence : Number(confidence);

  if (!Number.isFinite(numericConfidence)) {
    return null;
  }

  return `${Math.round(numericConfidence * 100)}% confidence`;
}

function makePreviewSnapshot(
  pair: ConstructPredictionPair,
  position: number,
): ConstructExplorerSnapshot {
  return getConstructExplorerSnapshot(
    [pair.construct],
    pair.prediction ? [pair.prediction] : [],
    0,
    position,
  );
}

export function FrameworkConstructExplorerCard({
  color,
  index,
  pair,
  position,
  total,
  onPositionChange,
}: FrameworkConstructExplorerCardProps) {
  const snapshot = makePreviewSnapshot(pair, position);
  const confidenceLabel = formatConfidence(pair.prediction?.confidence);
  const orientationAccent =
    snapshot.orientation === "positive"
      ? "var(--fg)"
      : snapshot.orientation === "negative"
        ? "var(--fg-dim)"
        : "var(--fg-faint)";

  return (
    <article
      style={{
        border: "1px solid var(--hairline)",
        borderRadius: "12px",
        padding: "20px",
        background: "rgba(255, 255, 255, 0.35)",
        display: "grid",
        gap: "18px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
          }}
        >
          Construct {index + 1} of {total}
        </div>
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.2rem",
            fontWeight: 400,
            lineHeight: 1.4,
            margin: 0,
            color,
          }}
        >
          {pair.construct.construct}
        </h3>
      </div>

      <div
        style={{
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        <div
          style={{
            border: "1px solid var(--hairline)",
            borderRadius: "10px",
            padding: "18px",
            background: "rgba(255, 255, 255, 0.45)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.95rem",
                lineHeight: 1.5,
                color: "var(--fg)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginBottom: "6px",
                }}
              >
                Toward positive
              </div>
              {pair.construct.positive_pole}
            </div>
            <div
              aria-hidden="true"
              style={{
                width: "20px",
                height: "1px",
                background: color,
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.95rem",
                lineHeight: 1.5,
                color: "var(--fg)",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginBottom: "6px",
                }}
              >
                Toward negative
              </div>
              {pair.construct.negative_pole}
            </div>
          </div>

          <div style={{ marginTop: "18px" }}>
            <input
              aria-label={`Move along ${pair.construct.construct}`}
              aria-valuetext={snapshot.orientationLabel}
              type="range"
              min={0}
              max={100}
              step={1}
              value={position}
              onChange={(event) => {
                onPositionChange(index, Number(event.target.value));
              }}
              style={{
                width: "100%",
                accentColor: color,
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
                marginTop: "8px",
              }}
            >
              <span>Negative pole</span>
              <span>Positive pole</span>
            </div>
          </div>

          <p
            style={{
              margin: "16px 0 0",
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: orientationAccent,
            }}
          >
            Current orientation: {snapshot.orientationLabel}
          </p>
        </div>

        <aside
          style={{
            border: "1px solid var(--hairline)",
            borderRadius: "10px",
            padding: "18px",
            background: "rgba(255, 255, 255, 0.45)",
            display: "grid",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
            }}
          >
            Behavioral prediction
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: orientationAccent,
            }}
          >
            {snapshot.orientationLabel}
          </p>
          <h4
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.05rem",
              fontWeight: 400,
              lineHeight: 1.4,
              margin: 0,
              color: "var(--fg)",
            }}
          >
            {snapshot.selectedPrediction?.situation_type ?? "No prediction available"}
          </h4>

          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-serif)",
              fontSize: "0.96rem",
              lineHeight: 1.6,
              color: "var(--fg-dim)",
            }}
          >
            <strong style={{ color: "var(--fg)" }}>Conventional:</strong>{" "}
            {snapshot.selectedPrediction?.conventional_response ??
              snapshot.selectedPrediction?.ordinary_response ??
              "Not provided in the framework data."}
          </p>

          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-serif)",
              fontSize: "0.98rem",
              lineHeight: 1.6,
              color: "var(--fg)",
            }}
          >
            <strong style={{ color }}>Prediction:</strong>{" "}
            {snapshot.selectedPrediction?.framework_response ??
              "No prediction was recorded for this construct."}
          </p>

          {pair.construct.behavioral_implication && (
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-serif)",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                color: "var(--fg-dim)",
              }}
            >
              <strong style={{ color: "var(--fg)" }}>In practice:</strong>{" "}
              {pair.construct.behavioral_implication}
            </p>
          )}

          {snapshot.selectedPrediction?.because && (
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-serif)",
                fontSize: "0.94rem",
                lineHeight: 1.6,
                color: "var(--fg-dim)",
              }}
            >
              <strong style={{ color: "var(--fg)" }}>Why:</strong>{" "}
              {snapshot.selectedPrediction.because}
            </p>
          )}

          {confidenceLabel && (
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
              }}
            >
              {confidenceLabel}
            </p>
          )}
        </aside>
      </div>
    </article>
  );
}

export function FrameworkConstructExplorer({
  person,
  color,
  constructs,
  predictions,
}: FrameworkConstructExplorerProps) {
  const pairs = pairConstructsWithPredictions(constructs, predictions);
  const [positions, setPositions] = useState<number[]>(
    () => pairs.map(() => 50),
  );

  if (pairs.length === 0) {
    return null;
  }

  function handlePositionChange(index: number, nextPosition: number) {
    setPositions((current) => {
      const next = current.slice();
      next[index] = nextPosition;
      return next;
    });
  }

  return (
    <section
      aria-labelledby="construct-explorer-heading"
      style={{
        marginTop: "72px",
        border: "1px solid var(--hairline)",
        borderRadius: "12px",
        background: "var(--surface)",
        padding: "28px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            margin: 0,
          }}
        >
          How This Mind Thinks
        </p>
        <h2
          id="construct-explorer-heading"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.35rem, 3vw, 2rem)",
            fontWeight: 400,
            lineHeight: 1.2,
            margin: 0,
            color: "var(--fg)",
          }}
        >
          Move along each bipolar construct and see how {person} would respond.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1rem",
            lineHeight: 1.6,
            color: "var(--fg-dim)",
            margin: 0,
            maxWidth: "64ch",
          }}
        >
          Pick any construct, then drag the slider toward either pole. The matching
          behavioral prediction stays attached to that construct so the page works
          cleanly on desktop and touch devices.
        </p>
      </div>

      <div style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
        {pairs.map((pair, index) => {
          return (
            <FrameworkConstructExplorerCard
              key={pair.construct.construct}
              color={color}
              index={index}
              pair={pair}
              position={positions[index] ?? 50}
              total={pairs.length}
              onPositionChange={handlePositionChange}
            />
          );
        })}
      </div>
    </section>
  );
}
