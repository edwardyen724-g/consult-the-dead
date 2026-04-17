import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0B",
          borderRadius: "6px",
        }}
      >
        {/* Skull silhouette built from shapes */}
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cranium */}
          <ellipse cx="13" cy="11" rx="9" ry="10" fill="#EDEDEC" />
          {/* Left eye socket */}
          <ellipse cx="9.5" cy="10.5" rx="2.8" ry="3" fill="#0A0A0B" />
          {/* Right eye socket */}
          <ellipse cx="16.5" cy="10.5" rx="2.8" ry="3" fill="#0A0A0B" />
          {/* Nose */}
          <path
            d="M12 15.5 L13 14 L14 15.5"
            stroke="#0A0A0B"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Jaw / teeth area */}
          <rect x="8" y="18" width="10" height="4" rx="1.5" fill="#EDEDEC" />
          {/* Tooth lines */}
          <line x1="10.5" y1="18" x2="10.5" y2="22" stroke="#0A0A0B" strokeWidth="0.8" />
          <line x1="13" y1="18" x2="13" y2="22" stroke="#0A0A0B" strokeWidth="0.8" />
          <line x1="15.5" y1="18" x2="15.5" y2="22" stroke="#0A0A0B" strokeWidth="0.8" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
