export default function Loading() {
  return (
    <main
      aria-busy="true"
      style={{
        minHeight: "calc(100vh - 80px)",
        background: "var(--bg)",
        color: "var(--fg)",
        padding: "72px 24px 96px",
      }}
    >
      <div style={shellStyle}>
        <div style={{ ...barStyle, width: "120px", marginBottom: 16, height: 10 }} />
        <div style={{ ...barStyle, width: "48%", marginBottom: 18, height: 48 }} />
        <div style={{ ...barStyle, width: "72%", marginBottom: 40, height: 18 }} />
        <div style={cardGridStyle}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} style={cardStyle}>
              <div style={{ ...barStyle, width: "38%", marginBottom: 14 }} />
              <div style={{ ...barStyle, width: "100%", marginBottom: 10 }} />
              <div style={{ ...barStyle, width: "86%", marginBottom: 10 }} />
              <div style={{ ...barStyle, width: "74%" }} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const shellStyle: React.CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
};

const cardGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid var(--hairline)",
  borderRadius: 10,
  background: "var(--surface)",
  padding: 24,
};

const barStyle: React.CSSProperties = {
  height: 14,
  borderRadius: 999,
  background:
    "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%)",
};
