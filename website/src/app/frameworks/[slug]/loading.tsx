export default function FrameworkDetailLoading() {
  return (
    <main
      aria-busy="true"
      style={{
        background: "var(--bg)",
        color: "var(--fg)",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @keyframes framework-detail-pulse {
          0%,
          100% {
            opacity: 0.45;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "64px 24px 128px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
          }}
        >
          The council is loading
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginTop: "48px",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              border: "2px solid var(--hairline)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.08), transparent), var(--surface)",
              animation: "framework-detail-pulse 1.6s ease-in-out infinite",
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              aria-hidden="true"
              style={{
                width: "min(280px, 74%)",
                height: "clamp(24px, 4vw, 36px)",
                borderRadius: "4px",
                background: "var(--surface)",
                animation: "framework-detail-pulse 1.6s ease-in-out infinite",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                width: "min(180px, 52%)",
                height: "12px",
                borderRadius: "4px",
                background: "var(--surface)",
                marginTop: "10px",
                animation: "framework-detail-pulse 1.6s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        <section style={{ marginTop: "72px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              marginBottom: "20px",
            }}
          >
            How They See the World
          </div>
          <div
            aria-hidden="true"
            style={{
              width: "100%",
              maxWidth: "62ch",
              height: "96px",
              borderRadius: "6px",
              background: "var(--surface)",
              animation: "framework-detail-pulse 1.6s ease-in-out infinite",
            }}
          />
        </section>

        <section style={{ marginTop: "72px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              marginBottom: "20px",
            }}
          >
            Framework Depth
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "16px",
            }}
          >
            {[1, 2, 3].map((slot) => (
              <div
                key={slot}
                aria-hidden="true"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  padding: "20px",
                  minHeight: "96px",
                  animation: "framework-detail-pulse 1.6s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
