export default function Loading() {
  return (
    <main
      aria-busy="true"
      style={{
        background: "var(--bg)",
        color: "var(--fg)",
        minHeight: "100vh",
      }}
    >
      <div style={shellStyle}>
        <div style={{ ...barStyle, width: "160px", marginBottom: 20, height: 10 }} />
        <div style={{ ...barStyle, width: "56%", marginBottom: 24, height: 18 }} />
        <div style={{ ...barStyle, width: "72%", marginBottom: 48, height: 18 }} />
        <div style={gridStyle}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} style={cardStyle}>
              <div style={{ ...barStyle, width: "44%", marginBottom: 12 }} />
              <div style={{ ...barStyle, width: "100%", marginBottom: 8 }} />
              <div style={{ ...barStyle, width: "92%", marginBottom: 8 }} />
              <div style={{ ...barStyle, width: "68%" }} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const shellStyle: React.CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  padding: "64px 24px 120px",
};

const barStyle: React.CSSProperties = {
  height: 12,
  borderRadius: 999,
  background:
    "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%)",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 16,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid var(--hairline)",
  borderRadius: 10,
  background: "var(--surface)",
  padding: 20,
};
