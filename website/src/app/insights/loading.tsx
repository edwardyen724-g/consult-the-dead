export default function Loading() {
  return (
    <main
      aria-busy="true"
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "80px 24px",
        background: "var(--bg)",
        color: "var(--fg)",
      }}
    >
      <div style={{ ...barStyle, width: "120px", marginBottom: 16, height: 10 }} />
      <div style={{ ...barStyle, width: "86%", marginBottom: 18, height: 48 }} />
      <div style={{ ...barStyle, width: "94%", marginBottom: 10, height: 20 }} />
      <div style={{ ...barStyle, width: "74%", marginBottom: 40, height: 20 }} />

      <div style={{ display: "grid", gap: 18 }}>
        <div style={cardStyle}>
          <div style={{ ...barStyle, width: "64%", marginBottom: 10 }} />
          <div style={{ ...barStyle, width: "100%", marginBottom: 10 }} />
          <div style={{ ...barStyle, width: "90%" }} />
        </div>
        <div style={cardStyle}>
          <div style={{ ...barStyle, width: "58%", marginBottom: 10 }} />
          <div style={{ ...barStyle, width: "96%", marginBottom: 10 }} />
          <div style={{ ...barStyle, width: "84%" }} />
        </div>
      </div>
    </main>
  );
}

const barStyle: React.CSSProperties = {
  height: 14,
  borderRadius: 999,
  background:
    "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%)",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid var(--hairline)",
  borderRadius: 10,
  background: "var(--surface)",
  padding: 24,
};
